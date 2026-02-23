// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — AI Opponent System (Multi-Instance)
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    G.aiEnabled = false;

    // ─── Per-Fighter AI State (WeakMap keyed by fighter ref) ────
    var aiStates = new WeakMap();

    function getAI(fighter) {
        var s = aiStates.get(fighter);
        if (!s) {
            s = makeState();
            aiStates.set(fighter, s);
        }
        return s;
    }

    function makeState() {
        return {
            decisionTimer: 0,
            moveDir: 0,
            holdCrouch: false,
            fireJump: false,
            fireAttack: false,
            fireSuper: false,
            fireDrop: false,
            holdUp: false,
            parryAttemptCd: 0,
            aggroBias: rand(-0.25, 0.25),
            reactionMult: rand(0.8, 1.3),
            mistakeRate: rand(0.03, 0.1),
            // Black weapon: remember target charge time so we don't re-roll each tick
            targetChargeTime: 0,
        };
    }

    function rand(lo, hi) { return lo + Math.random() * (hi - lo); }

    // ─── Reset AI each round ─────────────────────────────────────
    G.resetAI = function () {
        // WeakMap entries are GC'd automatically, but we reinitialize
        // known fighter refs if they exist
        if (G._p2Ref) aiStates.set(G._p2Ref, makeState());
        if (G._p3Ref) aiStates.set(G._p3Ref, makeState());
        if (G._p4Ref) aiStates.set(G._p4Ref, makeState());
    };

    // ─── Pick closest alive enemy from array ─────────────────────
    function pickTarget(me, enemies) {
        if (!enemies || enemies.length === 0) return null;
        if (enemies.length === 1) return enemies[0];
        var best = null;
        var bestDist = Infinity;
        for (var i = 0; i < enemies.length; i++) {
            var e = enemies[i];
            if (e.hp <= 0) continue;
            var d = Math.abs(e.x - me.x) + Math.abs(e.y - me.y);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        // Occasional random switch for unpredictability
        if (best && enemies.length > 1 && Math.random() < 0.08) {
            var alive = [];
            for (var j = 0; j < enemies.length; j++) {
                if (enemies[j].hp > 0) alive.push(enemies[j]);
            }
            if (alive.length > 1) {
                best = alive[Math.floor(Math.random() * alive.length)];
            }
        }
        return best;
    }

    // ─── Weapon Profiles ─────────────────────────────────────────
    var P = {
        sword:        { ideal: 65,  aggr: 0.55, parry: 0.35, ranged: false, atkRange: 65  },
        blade:        { ideal: 50,  aggr: 0.75, parry: 0.40, ranged: false, atkRange: 50  },
        spear:        { ideal: 90,  aggr: 0.45, parry: 0.30, ranged: false, atkRange: 90  },
        gun:          { ideal: 250, aggr: 0.30, parry: 0.10, ranged: true,  atkRange: 400 },
        sniper:       { ideal: 350, aggr: 0.15, parry: 0.05, ranged: true,  atkRange: 500 },
        hammer:       { ideal: 70,  aggr: 0.60, parry: 0.20, ranged: false, atkRange: 75  },
        frostdaggers: { ideal: 100, aggr: 0.50, parry: 0.25, ranged: true,  atkRange: 200 },
        shield:       { ideal: 55,  aggr: 0.65, parry: 0.05, ranged: false, atkRange: 70  },
        black:        { ideal: 200, aggr: 0.25, parry: 0.10, ranged: true,  atkRange: 300 },
        derun:        { ideal: 70,  aggr: 0.55, parry: 0.30, ranged: false, atkRange: 60  },
    };

    function prof(wid) { return P[wid] || P.sword; }

    function getMapPlatforms(map) {
        var out = [];
        if (!map) return out;
        if (map.platforms) {
            for (var i = 0; i < map.platforms.length; i++) out.push(map.platforms[i]);
        }
        if (typeof G.getSolidObstaclePlatforms === 'function') {
            var solids = G.getSolidObstaclePlatforms();
            if (solids && solids.length) {
                for (var j = 0; j < solids.length; j++) out.push(solids[j]);
            }
        }
        return out;
    }

    function lavaAtX(map, x, inset) {
        if (!map || !map.obstacles) return null;
        var pad = typeof inset === 'number' ? inset : 4;
        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o.type !== 'lava') continue;
            if (x > o.x + pad && x < o.x + o.w - pad) return o;
        }
        return null;
    }

    function lavaAhead(map, me, dir, lookahead) {
        if (!map || !map.obstacles || !dir) return null;
        var probe = typeof lookahead === 'number' ? lookahead : 90;
        var sx = me.x + dir * (me.w * 0.5 + 2);
        var ex = me.x + dir * probe;
        var minX = Math.min(sx, ex);
        var maxX = Math.max(sx, ex);
        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o.type !== 'lava') continue;
            if (Math.abs(me.y - o.y) > 28) continue;
            if (maxX > o.x + 4 && minX < o.x + o.w - 4) return o;
        }
        return null;
    }

    function lavaBelow(map, x, fromY, maxDrop) {
        if (!map || !map.obstacles) return null;
        var limit = typeof maxDrop === 'number' ? maxDrop : 150;
        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o.type !== 'lava') continue;
            if (x <= o.x + 4 || x >= o.x + o.w - 4) continue;
            var dy = o.y - fromY;
            if (dy >= -2 && dy <= limit) return o;
        }
        return null;
    }

    function platformBelow(map, x, fromY, maxDrop) {
        var limit = typeof maxDrop === 'number' ? maxDrop : 120;
        var plats = getMapPlatforms(map);
        for (var i = 0; i < plats.length; i++) {
            var p = plats[i];
            if (x <= p.x + 4 || x >= p.x + p.w - 4) continue;
            var dy = p.y - fromY;
            if (dy >= -2 && dy <= limit) return true;
        }
        var groundDy = G.GROUND_Y - fromY;
        if (groundDy >= -2 && groundDy <= limit && !lavaAtX(map, x, 4)) return true;
        return false;
    }

    function supportSurface(me, map) {
        if (!me || !me.onGround) return null;
        if (Math.abs(me.y - G.GROUND_Y) <= 4) {
            return { left: G.WALL_LEFT, right: G.WALL_RIGHT, y: G.GROUND_Y };
        }
        var plats = getMapPlatforms(map);
        for (var i = 0; i < plats.length; i++) {
            var p = plats[i];
            if (Math.abs(me.y - p.y) > 4) continue;
            if (me.x + me.w / 2 <= p.x + 4) continue;
            if (me.x - me.w / 2 >= p.x + p.w - 4) continue;
            return { left: p.x, right: p.x + p.w, y: p.y };
        }
        return null;
    }

    function edgeDanger(map, me, dir) {
        if (!map || !me || !me.onGround || !dir) return false;
        var surf = supportSurface(me, map);
        if (!surf) return false;
        var frontFoot = dir > 0 ? (me.x + me.w / 2) : (me.x - me.w / 2);
        var toEdge = dir > 0 ? (surf.right - frontFoot) : (frontFoot - surf.left);
        if (toEdge > 18) return false;
        var probeX = dir > 0 ? (surf.right + 10) : (surf.left - 10);
        if (probeX <= G.WALL_LEFT + 2 || probeX >= G.WALL_RIGHT - 2) return true;
        if (lavaAtX(map, probeX, 4)) return true;
        if (!platformBelow(map, probeX, me.y - 2, 120)) return true;
        return false;
    }

    function safeDistanceFromLava(map, x, dir) {
        for (var step = 0; step <= 320; step += 16) {
            var px = x + dir * step;
            if (px <= G.WALL_LEFT + 4 || px >= G.WALL_RIGHT - 4) break;
            if (!lavaAtX(map, px, 4)) return step;
        }
        return 999;
    }

    // ─── Situation Assessment ─────────────────────────────────────
    function scan(me, opp) {
        var dx = opp.x - me.x;
        var dy = opp.y - me.y;
        var dist = Math.abs(dx);
        var wid = me.weapon ? me.weapon.id : 'sword';
        var p = prof(wid);

        // Incoming projectile check
        var bullet = null;
        for (var i = 0; i < opp.projectiles.length; i++) {
            var b = opp.projectiles[i];
            var bdx = b.x - me.x;
            var heading = (b.vx > 0 && bdx < 0) || (b.vx < 0 && bdx > 0);
            if (heading && Math.abs(bdx) < 220 && Math.abs(b.y - (me.y - me.currentH * 0.5)) < 45) {
                bullet = b;
                break;
            }
        }

        // Nearby black hole
        var bhole = null;
        if (G.blackHoles) {
            for (var i = 0; i < G.blackHoles.length; i++) {
                var bh = G.blackHoles[i];
                var bd = Math.sqrt(Math.pow(bh.x - me.x, 2) + Math.pow(bh.y - me.y, 2));
                if (bd < bh.pullRadius * 0.85) { bhole = bh; break; }
            }
        }

        // Nearby hazards
        var hazard = null;
        var map = G.getCurrentMap();
        if (map && map.obstacles) {
            for (var i = 0; i < map.obstacles.length; i++) {
                var o = map.obstacles[i];
                if ((o.type === 'lava' || o.type === 'gear') &&
                    Math.abs(o.x + (o.w || 0) / 2 - me.x) < (o.w || 40) / 2 + 35 &&
                    Math.abs(o.y + (o.h || 0) / 2 - me.y) < (o.h || 20) / 2 + 25) {
                    hazard = o;
                    break;
                }
            }
        }

        // Platform above for vertical movement
        var platAbove = null;
        if (map && map.platforms) {
            for (var i = 0; i < map.platforms.length; i++) {
                var pl = map.platforms[i];
                if (pl.y < me.y - 15 && pl.y > me.y - 150 &&
                    Math.abs(pl.x + pl.w / 2 - me.x) < pl.w / 2 + 50) {
                    if (!platAbove || pl.y > platAbove.y) platAbove = pl;
                }
            }
        }

        // Nearby ladder
        var nearbyLadder = null;
        if (map && map.obstacles) {
            var bestLadderDist = 9999;
            for (var i = 0; i < map.obstacles.length; i++) {
                var lo = map.obstacles[i];
                if (lo.type === 'ladder') {
                    var ladderCx = lo.x + lo.w / 2;
                    var ladderDist = Math.abs(ladderCx - me.x);
                    if (ladderDist < bestLadderDist && ladderDist < 200) {
                        bestLadderDist = ladderDist;
                        nearbyLadder = lo;
                    }
                }
            }
        }

        // Platform under opponent (for approach targeting)
        var oppPlatform = null;
        if (map && map.platforms) {
            for (var i = 0; i < map.platforms.length; i++) {
                var pl = map.platforms[i];
                if (opp.x > pl.x && opp.x < pl.x + pl.w &&
                    opp.y >= pl.y - 5 && opp.y <= pl.y + 10) {
                    oppPlatform = pl;
                    break;
                }
            }
        }

        var myMaxHp = typeof G.getPlayerMaxHP === 'function' ? G.getPlayerMaxHP(me) : G.HP_PER_ROUND;

        // Heart pickup
        var heart = null;
        if (me.hp < myMaxHp && G.hearts) {
            var bestHd = 9999;
            for (var i = 0; i < G.hearts.length; i++) {
                var h = G.hearts[i];
                if (h) {
                    var hd = Math.abs(h.x - me.x) + Math.abs(h.y - me.y);
                    if (hd < bestHd) { bestHd = hd; heart = h; }
                }
            }
        }

        var oppInvincible = opp.ghostMode ||
            opp.phalanxInvincible ||
            (opp.weapon && opp.weapon.id === 'shield' && opp.shieldDashing && opp.attackPhase === 'active');

        return {
            dx: dx, dy: dy, dist: dist,
            wid: wid, p: p,
            bullet: bullet,
            bhole: bhole,
            hazard: hazard,
            platAbove: platAbove,
            nearbyLadder: nearbyLadder,
            oppPlatform: oppPlatform,
            heart: heart,
            oppWindup: opp.attackPhase === 'windup',
            oppActive: opp.attackPhase === 'active',
            oppBusy: opp.attackPhase === 'recovery' || opp.staggerTimer > 0 || opp.frozenTimer > 0 || opp.stunTimer > 0,
            oppBladeKill: opp.bladeOneShot && opp.superActive,
            oppSuper: opp.superActive,
            oppInvincible: oppInvincible,
            myGround: me.onGround,
            oppGround: opp.onGround,
            oppCrouch: opp.crouching,
            myLow: me.hp <= 1,
            oppLow: opp.hp <= 1,
            myMaxHp: myMaxHp,
            superReady: me.superMax && !me.superActive && !me.superCharging,
            meAttacking: !!me.attackPhase,
            onLadder: !!me.onLadder,
        };
    }

    // ─── Core Decision Logic ──────────────────────────────────────
    function decide(me, opp, ai) {
        var s = scan(me, opp);
        var aggr = Math.max(0.1, Math.min(0.9, s.p.aggr + ai.aggroBias));

        // Reset one-shots
        ai.fireJump = false;
        ai.fireAttack = false;
        ai.fireSuper = false;
        ai.fireDrop = false;
        ai.holdCrouch = false;
        ai.holdUp = false;
        ai.moveDir = 0;

        // Don't make new decisions while mid-attack
        if (s.meAttacking && Math.random() < 0.7) return;

        // ═══ LADDER NAVIGATION ═══
        if (s.onLadder) {
            if (s.dy < -20) {
                // Opponent above — climb up (hold UP, do NOT jump)
                ai.holdUp = true;
            } else if (s.dy > 20) {
                // Opponent below — climb down
                ai.holdCrouch = true;
            } else {
                // At desired height — move sideways off ladder
                ai.moveDir = s.dx > 0 ? 1 : -1;
            }
            return;
        }

        // ═══ EMERGENCY: dodge bullet ═══
        if (s.bullet && Math.random() > ai.mistakeRate) {
            if (!s.bullet.isSniper && s.myGround) {
                ai.holdCrouch = true; // duck under gun bullets
            } else {
                ai.fireJump = true;
                ai.moveDir = s.dx > 0 ? -1 : 1;
            }
            return;
        }

        // ═══ EMERGENCY: flee black hole ═══
        if (s.bhole) {
            ai.moveDir = me.x < s.bhole.x ? -1 : 1;
            if (s.myGround) ai.fireJump = true;
            return;
        }

        // ═══ EMERGENCY: avoid hazard ═══
        if (s.hazard) {
            var hx = s.hazard.x + (s.hazard.w || 0) / 2;
            ai.moveDir = me.x < hx ? -1 : 1;
            if (s.hazard.type === 'lava' && s.myGround) ai.fireJump = true;
            return;
        }

        // ═══ EMERGENCY: blade one-shot danger ═══
        if (s.oppBladeKill && s.dist < 130) {
            ai.moveDir = s.dx > 0 ? -1 : 1;
            if (Math.random() < 0.3 && s.myGround) ai.holdCrouch = true;
            return;
        }

        // Black charge lock: while charging, evade and check for release.
        // Directly controls state — bypasses input/justPressed to avoid double-trigger.
        if (s.wid === 'black' && me.blackHoleCharging) {
            ai.moveDir = s.dx > 0 ? -1 : 1; // run away while charging
            if (s.myGround && s.dist < 150 && Math.random() < 0.25) ai.fireJump = true;
            if (s.myGround && Math.random() < 0.15) ai.holdCrouch = true;
            // Pick target charge time if not set yet
            if (ai.targetChargeTime <= 0) {
                ai.targetChargeTime = rand(500, 4000);
            }
            // Release when charge reaches target
            if (me.blackHoleChargeTime >= ai.targetChargeTime) {
                G.spawnBlackHole(me, opp, me.blackHoleChargeTime);
                me.blackHoleCharging = false;
                me.blackHoleChargeTime = 0;
                ai.targetChargeTime = 0;
            }
            return;
        }

        // ═══ PARRY ATTEMPT ═══
        if (s.oppWindup && s.dist < 85 && !s.p.ranged && ai.parryAttemptCd <= 0) {
            if (Math.random() < s.p.parry) {
                ai.fireAttack = true;
                ai.parryAttemptCd = rand(600, 1200);
                return;
            }
        }

        // ═══ USE SUPER ═══
        if (s.superReady) {
            var useIt = false;
            if (s.wid === 'blade')             useIt = s.oppLow || (s.dist < 80 && Math.random() < 0.4);
            else if (s.wid === 'sniper')        useIt = s.myLow; // Emergency Repair when low HP
            else if (s.wid === 'frostdaggers') useIt = s.dist < 260 && Math.random() < 0.65;
            else if (s.wid === 'shield')       useIt = s.myLow || (s.dist < 110 && Math.random() < 0.5);
            else if (s.wid === 'black')        useIt = false; // black AI focuses on hole spawning
            else if (s.wid === 'gun')          useIt = s.dist < 320 && Math.random() < 0.5;
            else if (s.wid === 'hammer')       useIt = s.dist < 200 && Math.random() < 0.5;
            else if (s.wid === 'derun')        useIt = s.dist < 260 && Math.random() < 0.45;
            else                               useIt = s.dist < 160 && Math.random() < 0.45;
            if (useIt) {
                ai.fireSuper = true;
                return;
            }
        }

        // ═══ GRAB HEART ═══
        if (s.heart && me.hp < s.myMaxHp && Math.random() < 0.55) {
            ai.moveDir = s.heart.x > me.x ? 1 : s.heart.x < me.x ? -1 : 0;
            if (s.heart.y < me.y - 35 && s.myGround) ai.fireJump = true;
            return;
        }

        // Low HP survival behavior: disengage if we're one hit from death.
        if (s.myLow && !s.oppLow && !s.heart && s.dist < 150) {
            ai.moveDir = s.dx > 0 ? -1 : 1;
            if (s.myGround && Math.random() < 0.25) ai.fireJump = true;
            return;
        }

        // ═══ PUNISH OPENING ═══
        if (s.oppBusy && s.dist < 160 && !s.oppInvincible && s.wid !== 'black') {
            ai.moveDir = s.dx > 0 ? 1 : -1;
            if (s.dist < s.p.atkRange * me.weaponRangeMult) {
                ai.fireAttack = true;
                if (s.oppCrouch && s.myGround) ai.holdCrouch = true; // crouch attack
            }
            return;
        }

        // ═══ BLACK WEAPON: charge holes ═══
        // Bypass the input/justPressed system entirely to avoid double-trigger bug
        // that cancels charges immediately. Directly control charging state instead.
        if (s.wid === 'black' && !me.ghostMode && !me.superActive) {
            // Evasive default: run and dodge while preparing black hole.
            ai.moveDir = s.dx > 0 ? -1 : 1;
            if (s.myGround && s.dist < 170 && Math.random() < 0.3) ai.fireJump = true;
            if (s.myGround && Math.random() < 0.12) ai.holdCrouch = true;

            if (me.blackHoleCharging) {
                // Use stored target charge time — don't re-roll each tick
                if (ai.targetChargeTime <= 0) {
                    ai.targetChargeTime = rand(500, 4000);
                }
                if (me.blackHoleChargeTime >= ai.targetChargeTime) {
                    // Release: spawn black hole directly (bypass input)
                    G.spawnBlackHole(me, opp, me.blackHoleChargeTime);
                    me.blackHoleCharging = false;
                    me.blackHoleChargeTime = 0;
                    ai.targetChargeTime = 0;
                }
                return;
            }
            // Not charging yet: start charge directly (bypass input)
            me.blackHoleCharging = true;
            me.blackHoleChargeTime = 0;
            ai.targetChargeTime = rand(500, 4000);
            return;
        }

        // ═══ GHOST MODE: strategic repositioning ═══
        if (me.ghostMode) {
            if (s.myLow && s.heart) {
                // If hurt, fly toward hearts
                ai.moveDir = s.heart.x > me.x ? 1 : -1;
                if (s.heart.y < me.y - 20) ai.fireJump = true;
            } else {
                // Fly toward opponent to reposition behind them
                var behindX = opp.x - opp.facing * 80;
                ai.moveDir = behindX > me.x ? 1 : -1;
                if (opp.y < me.y - 30) ai.fireJump = true;
                // Fly up/down to match opponent height
                if (me.y > opp.y + 20) ai.fireJump = true;
            }
            return;
        }

        // ═══ STEPHENGUN: fire wolves ═══
        if (me.stephengunActive && me.stephengunCooldown <= 0 && s.dist > 60) {
            ai.moveDir = s.dx > 0 ? 1 : -1;
            ai.fireAttack = true;
            return;
        }

        // ═══ SHIELD: face opponent when idle ═══
        if (s.wid === 'shield' && !s.meAttacking && s.dist > s.p.atkRange * me.weaponRangeMult) {
            // Move toward opponent to ensure frontal block faces them
            ai.moveDir = s.dx > 0 ? 1 : -1;
        }

        // ═══ RANGED WEAPONS ═══
        if (s.p.ranged && !me.stephengunActive) {
            var tooClose = s.dist < s.p.ideal * 0.5;
            var inRange = s.dist >= s.p.ideal * 0.4 && s.dist <= s.p.ideal * 1.6;

            if (tooClose || s.oppInvincible) {
                ai.moveDir = s.dx > 0 ? -1 : 1; // retreat
                if (s.myGround && Math.random() < 0.25) ai.fireJump = true;
            } else if (inRange) {
                var canShoot = true;
                if (s.wid === 'frostdaggers') {
                    // Fire frost shards more aggressively at mid-range
                    canShoot = true;
                } else if (s.wid === 'black') {
                    canShoot = false; // black weapon uses charge, not normal shots here
                } else {
                    canShoot = me.gunCooldown <= 0;
                }
                if (canShoot && Math.random() < (s.wid === 'frostdaggers' ? 0.8 : 0.7)) {
                    ai.fireAttack = true;
                }
                if (Math.random() < 0.25) ai.moveDir = Math.random() < 0.5 ? -1 : 1;
            } else {
                ai.moveDir = s.dx > 0 ? 1 : -1;
            }
            // Sniper: seek high ground
            if (s.wid === 'sniper' && s.myGround && s.platAbove && Math.random() < 0.2) {
                ai.fireJump = true;
            }
            return;
        }

        // ═══ MELEE WEAPONS ═══
        var meleeRange = s.p.atkRange * me.weaponRangeMult;

        if (s.dist < meleeRange) {
            if (s.oppInvincible) {
                ai.moveDir = s.dx > 0 ? -1 : 1;
                return;
            }
            // In range — decide action
            var roll = Math.random();
            if (roll < aggr) {
                ai.fireAttack = true;
                if (s.oppCrouch && s.myGround) ai.holdCrouch = true;
            } else if (roll < aggr + 0.2) {
                ai.moveDir = s.dx > 0 ? -1 : 1; // space out
            } else {
                if (Math.random() < 0.15) ai.holdCrouch = true;
            }
        } else {
            // Approach
            // If opponent is on a platform, move toward platform X first
            if (s.oppPlatform && opp.y < me.y - 30) {
                var platCx = s.oppPlatform.x + s.oppPlatform.w / 2;
                var dxToPlat = platCx - me.x;
                if (Math.abs(dxToPlat) > 30) {
                    ai.moveDir = dxToPlat > 0 ? 1 : -1;
                } else {
                    ai.moveDir = s.dx > 0 ? 1 : -1;
                }
            } else {
                ai.moveDir = s.dx > 0 ? 1 : -1;
            }

            // Vertical movement
            if (s.myGround) {
                if (opp.y < me.y - 40) {
                    // Opponent above — check for nearby ladder first
                    if (s.nearbyLadder) {
                        var ladderCx = s.nearbyLadder.x + s.nearbyLadder.w / 2;
                        ai.moveDir = ladderCx > me.x ? 1 : ladderCx < me.x ? -1 : 0;
                    } else if (Math.random() < 0.45) {
                        ai.fireJump = true;
                    }
                } else if (Math.random() < 0.1) {
                    ai.fireJump = true; // random jump for unpredictability
                }
            }

            // Drop through if opponent below
            if (s.myGround && opp.y > me.y + 35 && Math.random() < 0.35) {
                ai.fireDrop = true;
                ai.holdCrouch = true; // down key
            }
        }
    }

    function enforceSafety(me, opp, ai) {
        if (!me || me.ghostMode || me.deathGhost) return;
        var map = G.getCurrentMap();
        if (!map || !map.obstacles) return;

        // Panic escape when currently on top of lava.
        var hot = lavaAtX(map, me.x, 4);
        if (hot && Math.abs(me.y - hot.y) < 30) {
            ai.moveDir = me.x < hot.x + hot.w / 2 ? -1 : 1;
            ai.fireAttack = false;
            ai.fireSuper = false;
            ai.fireDrop = false;
            ai.holdCrouch = false;
            if (me.onGround) ai.fireJump = true;
            return;
        }

        // Midair correction: steer away if falling toward lava.
        if (!me.onGround && me.vy > 0.45) {
            var fallingToLava = lavaBelow(map, me.x, me.y, 170);
            if (fallingToLava) {
                var leftSafe = safeDistanceFromLava(map, me.x, -1);
                var rightSafe = safeDistanceFromLava(map, me.x, 1);
                ai.moveDir = leftSafe <= rightSafe ? -1 : 1;
                ai.fireAttack = false;
                ai.fireDrop = false;
                ai.holdCrouch = false;
            }
        }

        if (!me.onGround) return;

        // Never drop through if lava is directly below intended drop point.
        if (ai.fireDrop) {
            var dropDir = ai.moveDir || (opp && opp.x > me.x ? 1 : -1);
            var dropProbeX = me.x + dropDir * 16;
            if (lavaBelow(map, dropProbeX, me.y, 170)) {
                ai.fireDrop = false;
                ai.holdCrouch = false;
            }
        }

        // Prevent running into lava or stepping off dangerous edges.
        if (ai.moveDir < 0 && (lavaAhead(map, me, -1, 92) || edgeDanger(map, me, -1))) {
            var rightBlocked = lavaAhead(map, me, 1, 70) || edgeDanger(map, me, 1);
            ai.moveDir = rightBlocked ? 0 : 1;
            ai.fireDrop = false;
            ai.holdCrouch = false;
        } else if (ai.moveDir > 0 && (lavaAhead(map, me, 1, 92) || edgeDanger(map, me, 1))) {
            var leftBlocked = lavaAhead(map, me, -1, 70) || edgeDanger(map, me, -1);
            ai.moveDir = leftBlocked ? 0 : -1;
            ai.fireDrop = false;
            ai.holdCrouch = false;
        }

        // Cancel reckless jumps that appear to land in lava with no platform safety.
        if (ai.fireJump) {
            var jumpDir = ai.moveDir || me.facing || 1;
            var landingX = me.x + jumpDir * 58;
            var lavaLanding = lavaBelow(map, landingX, me.y, 125);
            if (lavaLanding && !platformBelow(map, landingX, me.y, 95)) {
                ai.fireJump = false;
            }
        }
    }

    // ─── Apply AI state to keyboard inputs ────────────────────────
    function writeInputs(me, ai) {
        var k = G.keys;
        var j = G.justPressed;
        var c = me.controls;

        // Clear controls for this fighter
        k[c.left]   = false;
        k[c.right]  = false;
        k[c.up]     = false;
        k[c.down]   = false;
        k[c.attack] = false;

        // Determine super key based on player ref
        var superKey = 'o'; // default for p2
        if (me === G._p3Ref) superKey = '_3super';
        else if (me === G._p4Ref) superKey = '_4super';
        k[superKey] = false;

        // Movement (held)
        if (ai.moveDir < 0) k[c.left]  = true;
        if (ai.moveDir > 0) k[c.right] = true;

        // Crouch (held)
        if (ai.holdCrouch) k[c.down] = true;

        // Ladder climb up (held, NOT jump)
        if (ai.holdUp) {
            k[c.up] = true;
        }

        // One-shots: set both keys and justPressed
        if (ai.fireJump) {
            k[c.up] = true;
            j[c.up] = true;
        }
        if (ai.fireAttack) {
            k[c.attack] = true;
            j[c.attack] = true;
        }
        if (ai.fireSuper) {
            k[superKey] = true;
            j[superKey] = true;
        }
        if (ai.fireDrop) {
            k[c.down] = true;
            j[c.down] = true;
        }
    }

    // ─── Main AI Update ──────────────────────────────────────────
    // opponents can be a single fighter or an array (for 2v2)
    G.updateAI = function (me, opponents, dt) {
        if (!G.aiEnabled) return;

        var ai = getAI(me);

        // Pick target from opponents
        var opp;
        if (Array.isArray(opponents)) {
            opp = pickTarget(me, opponents);
            if (!opp) return; // all enemies dead
        } else {
            opp = opponents;
        }

        if (ai.parryAttemptCd > 0) ai.parryAttemptCd -= dt;

        ai.decisionTimer -= dt;

        if (ai.decisionTimer <= 0) {
            // Occasional complete mistake
            if (Math.random() < ai.mistakeRate * 0.5) {
                ai.moveDir = Math.random() < 0.33 ? -1 : Math.random() < 0.5 ? 0 : 1;
                ai.fireAttack = Math.random() < 0.25;
                ai.fireJump = Math.random() < 0.15;
                ai.holdCrouch = Math.random() < 0.1;
                ai.holdUp = false;
                ai.fireSuper = false;
                ai.fireDrop = false;
            } else {
                decide(me, opp, ai);
            }
            // Next decision interval with jitter
            ai.decisionTimer = rand(100, 260) * ai.reactionMult;
        } else {
            // Between decisions: clear one-shot flags so they don't repeat
            ai.fireJump = false;
            ai.fireAttack = false;
            ai.fireSuper = false;
            ai.fireDrop = false;
            ai.holdUp = false;
        }

        // Safety net: never send fireAttack through input system while Black is charging.
        // The AI manages Black charging/release directly to avoid justPressed double-trigger.
        if (me.weapon && me.weapon.id === 'black' && me.blackHoleCharging) {
            ai.fireAttack = false;
        }

        enforceSafety(me, opp, ai);

        writeInputs(me, ai);
    };

})(window.Game);
