// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Super Ability System
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var ctx = G.ctx;
    var CHARGE_TIME = 500; // 0.5 seconds to charge up
    var SUPER_READY_FLASH_MS = 1100;

    function getSuperTitle(wid) {
        if (wid === 'sword') return 'SUMMON CLONE!';
        if (wid === 'blade') return "ASSASSIN'S STRIKE!";
        if (wid === 'spear') return 'EXTENDED RANGE!';
        if (wid === 'gun') return 'RAPID FIRE!';
        if (wid === 'sniper') return 'EMERGENCY REPAIR!';
        if (wid === 'hammer') return 'IRON CHAIN!';
        if (wid === 'frostdaggers') return 'BLIZZARD!';
        if (wid === 'shield') return 'PHALANX!';
        if (wid === 'black') return 'GHOST!';
        if (wid === 'derun') return 'STEPHENGUN!';
        return 'SUPER!';
    }

    function scaledDamage(owner, baseDamage) {
        if (typeof G.getDamageAmount === 'function') return G.getDamageAmount(owner, baseDamage);
        return baseDamage;
    }

    function markSuperReady(player) {
        if (!player || player.superMax) return;
        player.superMax = true;
        player.superReadyFlashTimer = SUPER_READY_FLASH_MS;
        G.spawnParticles(player.x, player.y - player.currentH, '#fff6c4', 24, 7);
        G.spawnParticles(player.x, player.y - player.currentH * 0.6, '#ffdd44', 28, 8);
        G.spawnParticles(player.x, player.y - player.currentH * 0.35, '#ffaa00', 18, 7);
        if (G.fxTriggerShake) G.fxTriggerShake(4, 170);
        if (G.playSuperReady) G.playSuperReady();
    }

    // ─── Super Charge Tracking (called from combat.js) ─────────
    G.onPlayerHit = function (attacker, defender) {
        // Black weapon charges passively every 5s, not from hits.
        if (attacker.weapon && attacker.weapon.id === 'black') return;
        // Attacker gains charge (total hits landed, unless already maxed)
        if (!attacker.superMax) {
            attacker.superCharge = Math.min(3, attacker.superCharge + 1);
            if (attacker.superCharge >= 3) {
                markSuperReady(attacker);
            }
        }
    };

    // ─── Main Super Update ──────────────────────────────────────
    G.updateSuper = function (player, opponent, dt) {
        if (!player || player.hp <= 0 || player.deathGhost) return;

        var superKey = 'o';
        if (player === G._p1Ref) superKey = 'e';
        else if (player === G._p2Ref) superKey = 'o';
        else if (player === G._p3Ref) superKey = '_3super';
        else if (player === G._p4Ref) superKey = '_4super';
        var weaponId = player.weapon ? player.weapon.id : null;

        // Sniper passive: auto-charge 1 gold every 5 seconds
        if (weaponId === 'sniper' && !player.superMax) {
            player.sniperPassiveTimer += dt;
            if (player.sniperPassiveTimer >= 5000) {
                player.sniperPassiveTimer -= 5000;
                player.superCharge = Math.min(3, player.superCharge + 1);
                // Gold pulse effect
                G.spawnParticles(player.x, player.y - player.currentH / 2, '#ffdd44', 6, 3);
                if (player.superCharge >= 3) {
                    markSuperReady(player);
                }
            }
        }

        // Black passive: auto-charge like sniper (1 icon every 5s)
        if (weaponId === 'black' && !player.superMax && !player.superActive) {
            player.sniperPassiveTimer += dt;
            if (player.sniperPassiveTimer >= 5000) {
                player.sniperPassiveTimer -= 5000;
                player.superCharge = Math.min(3, player.superCharge + 1);
                G.spawnParticles(player.x, player.y - player.currentH / 2, '#aa44ff', 6, 3);
                if (player.superCharge >= 3) {
                    markSuperReady(player);
                }
            }
        }

        // Sniper auto-use: when maxed, immediately regenerate 1 heart
        if (weaponId === 'sniper' && player.superMax && !player.superActive) {
            var maxHp = typeof G.getPlayerMaxHP === 'function' ? G.getPlayerMaxHP(player) : G.HP_PER_ROUND;
            player.hp = Math.min(maxHp, player.hp + 1);
            player.superCharge = 0;
            player.superMax = false;
            player.sniperPassiveTimer = 0;
            G.triggerSuperPause(player, getSuperTitle('sniper'));
            G.spawnParticles(player.x, player.y - player.currentH / 2, '#44ff88', 15, 5);
            G.spawnParticles(player.x, player.y - player.currentH, '#ffdd44', 10, 4);
            G.playPickup();
            return;
        }

        // Charge-up animation
        if (player.superCharging) {
            player.superChargingTimer += dt;
            // Charging particles — spiral inward, weapon-colored
            var chWid = player.weapon ? player.weapon.id : 'sword';
            var chColor;
            if (chWid === 'sword') chColor = '#66bbff';
            else if (chWid === 'blade') chColor = '#ff4444';
            else if (chWid === 'spear') chColor = '#4488ff';
            else if (chWid === 'gun') chColor = '#ffcc33';
            else if (chWid === 'hammer') chColor = '#aaaaaa';
            else if (chWid === 'frostdaggers') chColor = '#88ddff';
            else if (chWid === 'shield') chColor = '#ffdd44';
            else if (chWid === 'black') chColor = '#7733cc';
            else if (chWid === 'derun') chColor = '#ddaa44';
            else chColor = '#ffdd44';

            if (Math.random() < 0.5) {
                var angle = (player.superChargingTimer * 0.02) + Math.random() * Math.PI * 2;
                var dist = 35 - (player.superChargingTimer / CHARGE_TIME) * 25;
                G.spawnParticles(
                    player.x + Math.cos(angle) * dist,
                    player.y - player.currentH / 2 + Math.sin(angle) * dist,
                    chColor, 1, 1
                );
            }
            if (player.superChargingTimer >= CHARGE_TIME) {
                player.superCharging = false;
                player.superChargingTimer = 0;
                activateSuper(player, opponent);
            }
            return;
        }

        // Activation input (E for P1, O for P2)
        if (G.justPressed[superKey] && player.superMax && !player.superActive && !player.superCharging) {
            if (weaponId === 'sniper') return; // sniper auto-uses
            if (typeof G.isPlayerActionBlocked === 'function' && G.isPlayerActionBlocked(player)) {
                G.initAudio();
                if (typeof G.playGunDryClick === 'function') G.playGunDryClick();
                return;
            }
            player.superCharging = true;
            player.superChargingTimer = 0;
        }

        // Update active super
        if (player.superActive) {
            player.superTimer -= dt;

            // Per-weapon super logic
            var wid = player.weapon ? player.weapon.id : 'sword';

            // Active aura particles — weapon-colored
            var auraColor;
            if (wid === 'sword') auraColor = '#66bbff';
            else if (wid === 'blade') auraColor = '#ff4444';
            else if (wid === 'spear') auraColor = '#4488ff';
            else if (wid === 'gun') auraColor = '#ffcc33';
            else if (wid === 'hammer') auraColor = '#aaaaaa';
            else if (wid === 'frostdaggers') auraColor = '#88ddff';
            else if (wid === 'shield') auraColor = '#ffdd44';
            else if (wid === 'black') auraColor = '#7733cc';
            else if (wid === 'derun') auraColor = '#ddaa44';
            else auraColor = '#ffdd44';

            if (Math.random() < 0.25) {
                G.spawnParticles(
                    player.x + (Math.random() - 0.5) * 20,
                    player.y - Math.random() * player.currentH,
                    auraColor, 1, 1.5
                );
            }

            if (wid === 'sword') {
                updateClone(player, opponent, dt);
            } else if (wid === 'gun') {
                // Gun: fire rate is handled in fighter.js via gunCooldown check
            } else if (wid === 'spear') {
                // Spear: range is applied dynamically via weaponRangeMult
            } else if (wid === 'hammer') {
                updateIronChains(player, opponent, dt);
            } else if (wid === 'derun') {
                updateWolves(player, opponent, dt);
                if (player.stephengunCooldown > 0) player.stephengunCooldown -= dt;
            }

            // Timer expiry
            if (player.superTimer <= 0) {
                deactivateSuper(player);
            }
        }

        // Blade one-shot: if player attacks and misses (recovery phase ends with no hit)
        if (player.bladeOneShot && !player.superActive) {
            // Already handled — blade one-shot removed on deactivate
        }
    };

    // ─── Activate Super ─────────────────────────────────────────
    function activateSuper(player, opponent) {
        player.superActive = true;
        player.superCharge = 0;
        player.superMax = false;

        var wid = player.weapon ? player.weapon.id : 'sword';
        G.triggerSuperPause(player, getSuperTitle(wid));
        var px = player.x;
        var cy = player.y - player.currentH / 2;
        var topY = player.y - player.currentH;

        // Weapon-specific activation burst
        if (wid === 'sword') {
            // Ghostly blue explosion — spirits unleashed
            G.spawnParticles(px, cy, '#66bbff', 20, 7);
            G.spawnParticles(px, topY, '#aaddff', 12, 5);
            G.spawnParticles(px, cy, '#ffffff', 8, 4);
            G.fxTriggerShake(6, 250);
        } else if (wid === 'blade') {
            // Crimson shockwave — blood red + white flash
            G.spawnParticles(px, cy, '#ff2222', 25, 8);
            G.spawnParticles(px, cy, '#ff6666', 15, 6);
            G.spawnParticles(px, cy, '#ffffff', 10, 5);
            G.fxTriggerShake(8, 300);
        } else if (wid === 'spear') {
            // Electric blue nova — energy ripple
            G.spawnParticles(px, cy, '#4488ff', 20, 7);
            G.spawnParticles(px, topY, '#88ccff', 12, 5);
            G.spawnParticles(px + player.facing * 30, cy, '#ffffff', 8, 4);
            G.fxTriggerShake(6, 250);
        } else if (wid === 'gun') {
            // Golden shell storm — rapid fire celebration
            G.spawnParticles(px, cy, '#ffcc33', 25, 7);
            G.spawnParticles(px, cy, '#ffaa00', 15, 6);
            G.spawnParticles(px + player.facing * 20, cy, '#fff', 8, 4);
            G.fxTriggerShake(5, 200);
        } else {
            G.spawnParticles(px, cy, '#ffdd44', 20, 6);
            G.fxTriggerShake(5, 200);
        }

        if (wid === 'sword') {
            player.superTimer = 4000;
            // Spawn clone
            player.clone = {
                x: player.x + player.facing * 40,
                y: player.y,
                vx: 0,
                vy: 0,
                hp: 0.5,
                facing: player.facing,
                timer: 4000,
                attackTimer: 0,
                attackPhase: null,
                attackActiveTimer: 0,
                flashTimer: 0,
            };
        } else if (wid === 'blade') {
            player.superTimer = 15000; // Long timer — expires if you don't use it
            player.bladeOneShot = true;
        } else if (wid === 'spear') {
            player.superTimer = 4000;
            // Double range
            player.weaponRangeMult = player.weapon.rangeMult * 2;
        } else if (wid === 'gun') {
            player.superTimer = 4000;
            // 2x fire rate handled by checking superActive in fighter update
        } else if (wid === 'hammer') {
            player.superTimer = 6000;
            player.ironChains = [];
            for (var i = 0; i < 3; i++) {
                var cx = G.WALL_LEFT + 80 + Math.random() * (G.WALL_RIGHT - G.WALL_LEFT - 160);
                player.ironChains.push({
                    x: cx, y: 0, angle: (Math.random() - 0.5) * 0.4,
                    swingSpeed: 0.002 + Math.random() * 0.002,
                    swingDir: Math.random() > 0.5 ? 1 : -1,
                    length: 0, maxLength: G.GROUND_Y,
                    growSpeed: 0.12, hitCooldown: 0,
                    fading: false, fade: 1,
                });
            }
            G.spawnParticles(px, cy, '#888', 20, 7);
            G.fxTriggerShake(8, 300);
        } else if (wid === 'frostdaggers') {
            player.superTimer = 4000;
            player._superOpponent = opponent;
            opponent.blizzardTimer = 4000;
            opponent.blizzardNoJump = true;
            opponent.frozenTimer = 500; // brief initial freeze
            G.spawnParticles(opponent.x, opponent.y - opponent.currentH / 2, '#88ddff', 25, 7);
            G.spawnParticles(opponent.x, opponent.y - opponent.currentH / 2, '#ffffff', 12, 5);
            G.playFreeze();
            G.fxTriggerShake(7, 250);
        } else if (wid === 'shield') {
            player.superTimer = 3000;
            player.phalanxInvincible = true;
            G.spawnParticles(px, cy, '#ffdd44', 25, 8);
            G.spawnParticles(px, cy, '#ffffff', 12, 5);
            G.fxTriggerShake(6, 250);
        } else if (wid === 'black') {
            player.superTimer = 4000;
            player.ghostMode = true;
            player.sniperPassiveTimer = 0;
            player.blackHoleCharging = false;
            player.blackHoleChargeTime = 0;
            G.playGhostActivate();
            G.spawnParticles(px, cy, '#6633aa', 20, 7);
            G.spawnParticles(px, cy, '#220044', 12, 5);
            G.fxTriggerShake(6, 250);
        } else if (wid === 'derun') {
            player.superTimer = 10000;
            player.stephengunActive = true;
            player.stephengunCooldown = 0;
            player.wolves = [];
            G.spawnParticles(px, cy, '#ddaa44', 20, 7);
            G.spawnParticles(px, cy, '#ffcc66', 12, 5);
            G.fxTriggerShake(6, 250);
        }
    }

    // ─── Deactivate Super ───────────────────────────────────────
    function deactivateSuper(player) {
        player.superActive = false;
        player.superTimer = 0;

        var wid = player.weapon ? player.weapon.id : 'sword';

        if (wid === 'spear') {
            player.weaponRangeMult = player.weapon.rangeMult;
        }
        if (wid === 'blade') {
            player.bladeOneShot = false;
        }
        if (wid === 'sword') {
            player.clone = null;
        }
        if (wid === 'hammer') {
            player.ironChains = null;
        }
        if (wid === 'frostdaggers') {
            if (player._superOpponent) {
                player._superOpponent.blizzardTimer = 0;
                player._superOpponent.blizzardNoJump = false;
            }
            player._superOpponent = null;
        }
        if (wid === 'shield') {
            player.phalanxInvincible = false;
        }
        if (wid === 'black') {
            if (!player.deathGhost) {
                player.ghostMode = false;
                player.onGround = false; // will fall due to gravity
            }
        }
        if (wid === 'derun') {
            player.stephengunActive = false;
            player.wolves = [];
        }
    }

    // Called from combat when blade one-shot lands or misses
    G.onBladeAttackEnd = function (player, didHit) {
        if (player.bladeOneShot && player.superActive) {
            deactivateSuper(player);
        }
    };

    // ─── Clone AI ───────────────────────────────────────────────
    function updateClone(player, opponent, dt) {
        var c = player.clone;
        var cloneHitCooldown = 700;
        var cloneHitDamage = 0.5;
        if (!c || c.hp <= 0) {
            player.clone = null;
            return;
        }

        c.timer -= dt;
        if (c.timer <= 0) {
            player.clone = null;
            return;
        }

        // Simple AI: move toward opponent
        var dx = opponent.x - c.x;
        c.facing = dx > 0 ? 1 : -1;

        if (Math.abs(dx) > 50) {
            c.vx += c.facing * G.WALK_SPEED * 0.25;
        } else {
            c.vx *= 0.8;
        }
        c.vx *= G.FRICTION;
        c.vx = Math.max(-G.WALK_SPEED, Math.min(G.WALK_SPEED, c.vx));
        c.x += c.vx;

        // Gravity
        if (c.y < G.GROUND_Y) {
            c.vy += G.GRAVITY;
        }
        c.y += c.vy;
        if (c.y >= G.GROUND_Y) {
            c.y = G.GROUND_Y;
            c.vy = 0;
        }

        // Walls
        if (c.x < G.WALL_LEFT + 18) c.x = G.WALL_LEFT + 18;
        if (c.x > G.WALL_RIGHT - 18) c.x = G.WALL_RIGHT - 18;

        // Attack every ~700ms
        c.attackTimer -= dt;
        if (c.attackTimer <= 0 && Math.abs(dx) < 60) {
            c.attackTimer = cloneHitCooldown;
            c.attackPhase = 'active';
            c.attackActiveTimer = 100;
            G.playWhoosh();

            // Check hit on opponent
            var swordLen = 44;
            var hitX = c.facing === 1 ? c.x + 10 : c.x - 10 - swordLen;
            var hitY = c.y - 40;
            var hurt = opponent.hurtbox;
            if (hitX < hurt.x + hurt.w && hitX + swordLen > hurt.x &&
                hitY < hurt.y + hurt.h && hitY + 10 > hurt.y) {
                opponent.takeDamage(scaledDamage(player, cloneHitDamage), c.x);
                G.onPlayerHit(player, opponent);
            }
        }

        if (c.attackPhase === 'active') {
            c.attackActiveTimer -= dt;
            if (c.attackActiveTimer <= 0) {
                c.attackPhase = null;
            }
        }

        // Flash timer
        if (c.flashTimer > 0) c.flashTimer -= dt;

        // Ghost particles
        if (Math.random() < 0.15) {
            G.spawnParticles(c.x + (Math.random() - 0.5) * 10, c.y - 20, 'rgba(100,180,255,0.5)', 1, 1);
        }
    }

    // Clone takes damage (called from combat)
    G.damageClone = function (player, amount) {
        if (!player.clone) return false;
        player.clone.hp -= amount;
        player.clone.flashTimer = 100;
        if (player.clone.hp <= 0) {
            G.spawnParticles(player.clone.x, player.clone.y - 20, 'rgba(100,180,255,0.6)', 12, 4);
            player.clone = null;
        }
        return true;
    };

    // ─── Gun Super: Modified Cooldown ───────────────────────────
    G.getGunCooldown = function (player) {
        if (player.superActive && player.weapon && player.weapon.id === 'gun') {
            return 212; // ~15% faster than previous super rate
        }
        return 425; // ~15% faster than previous base rate
    };

    // ─── Draw Clone ─────────────────────────────────────────────
    G.drawClone = function (player) {
        var c = player.clone;
        if (!c || c.hp <= 0) return;

        ctx.save();
        ctx.globalAlpha = 0.55;

        var bx = c.x - 18;
        var by = c.y - 56;
        var bw = 36;
        var bh = 56;

        // Ghost tint
        var bodyColor = '#6699cc';
        var lightColor = '#88bbee';
        var darkColor = '#4477aa';

        // Flashing if hit
        if (c.flashTimer > 0 && Math.floor(c.flashTimer / 30) % 2 === 0) {
            ctx.globalAlpha = 0.3;
            bodyColor = '#fff';
            lightColor = '#eee';
            darkColor = '#ccc';
        }

        // Shadow
        ctx.fillStyle = 'rgba(100,150,255,0.2)';
        ctx.fillRect(c.x - 12, G.GROUND_Y - 2, 24, 4);

        // Legs
        ctx.fillStyle = darkColor;
        ctx.fillRect(bx + 6, by + bh - 18, 9, 18);
        ctx.fillRect(bx + bw - 15, by + bh - 18, 9, 18);

        // Torso
        ctx.fillStyle = bodyColor;
        ctx.fillRect(bx + 2, by + 14, bw - 4, bh - 32);
        ctx.fillStyle = lightColor;
        ctx.fillRect(bx + 4, by + 16, bw - 12, 4);

        // Head
        ctx.fillStyle = bodyColor;
        ctx.fillRect(bx + 6, by, bw - 12, 16);
        ctx.fillStyle = '#88ccff';
        var visorX = c.facing === 1 ? bx + bw - 14 : bx + 6;
        ctx.fillRect(visorX, by + 6, 8, 4);

        // Sword when attacking
        if (c.attackPhase === 'active') {
            var swordLen = 30;
            var swordX = c.facing === 1 ? c.x + 10 : c.x - 10 - swordLen;
            ctx.fillStyle = '#aaddff';
            ctx.fillRect(swordX, by + 28, swordLen, 5);
            ctx.fillStyle = '#ddeeff';
            ctx.fillRect(swordX + 2, by + 29, swordLen - 4, 3);
            // Swing arc
            ctx.strokeStyle = 'rgba(150,200,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(c.x, by + 30, swordLen * 1.2, c.facing === 1 ? -0.3 : Math.PI - 0.3, c.facing === 1 ? 0.3 : Math.PI + 0.3);
            ctx.stroke();
        }

        ctx.restore();
    };

    // ─── Draw Super Effects (aura, weapon glow) ─────────────────
    G.drawSuperEffects = function (player) {
        if (!player.superActive && !player.superCharging) return;

        var wid = player.weapon ? player.weapon.id : 'sword';
        var t = Date.now();
        var px = player.x;
        var cy = player.y - player.currentH / 2;
        var topY = player.y - player.currentH;

        ctx.save();

        // ── CHARGING (0.5s wind-up) — unique per weapon ──────────
        if (player.superCharging) {
            var prog = player.superChargingTimer / CHARGE_TIME;

            if (wid === 'sword') {
                // Ghostly blue vortex — spirits spiraling in
                for (var i = 0; i < 6; i++) {
                    var a = prog * Math.PI * 4 + i * Math.PI / 3;
                    var r = (1 - prog) * 50 + 8;
                    var sx = px + Math.cos(a) * r;
                    var sy = cy + Math.sin(a) * r * 0.6;
                    ctx.globalAlpha = prog * 0.6;
                    ctx.fillStyle = '#66bbff';
                    ctx.beginPath(); ctx.arc(sx, sy, 3 + prog * 2, 0, Math.PI * 2); ctx.fill();
                    // Trail
                    ctx.globalAlpha = prog * 0.2;
                    ctx.strokeStyle = '#88ddff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(px, cy, r, a - 0.5, a);
                    ctx.stroke();
                }
                // Central ghost glow
                ctx.globalAlpha = prog * 0.35;
                ctx.fillStyle = '#4488cc';
                ctx.beginPath(); ctx.arc(px, cy, 20 + prog * 15, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'blade') {
                // Red lightning crackling — jagged energy lines
                ctx.globalAlpha = prog * 0.7;
                for (var i = 0; i < 4; i++) {
                    var a = t * 0.015 + i * Math.PI / 2;
                    var r1 = 15 + prog * 20;
                    ctx.strokeStyle = i % 2 === 0 ? '#ff2222' : '#ff8888';
                    ctx.lineWidth = 1 + prog * 2;
                    ctx.beginPath();
                    ctx.moveTo(px + Math.cos(a) * r1, cy + Math.sin(a) * r1);
                    // Jagged zigzag to center
                    for (var j = 0; j < 3; j++) {
                        var frac = (j + 1) / 4;
                        var jx = px + Math.cos(a) * r1 * (1 - frac) + (Math.random() - 0.5) * 12;
                        var jy = cy + Math.sin(a) * r1 * (1 - frac) + (Math.random() - 0.5) * 12;
                        ctx.lineTo(jx, jy);
                    }
                    ctx.lineTo(px, cy);
                    ctx.stroke();
                }
                // Central crimson flare
                ctx.globalAlpha = prog * 0.4;
                ctx.fillStyle = '#ff0000';
                ctx.beginPath(); ctx.arc(px, cy, 12 + prog * 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(px, cy, 4 + prog * 4, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'spear') {
                // Electric blue rings expanding upward from feet
                for (var i = 0; i < 3; i++) {
                    var ringProg = ((prog * 3 + i) % 1);
                    var ringY = player.y - ringProg * player.currentH * 1.3;
                    var ringR = 8 + ringProg * 12;
                    ctx.globalAlpha = (1 - ringProg) * prog * 0.5;
                    ctx.strokeStyle = '#44aaff';
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(px, ringY, ringR, ringR * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
                }
                // Spear tip glow
                var tipX = px + player.facing * 30;
                ctx.globalAlpha = prog * 0.6;
                ctx.fillStyle = '#88ccff';
                ctx.beginPath(); ctx.arc(tipX, cy - 10, 6 + prog * 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(tipX, cy - 10, 3 + prog * 3, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'gun') {
                // Golden shell casings flying out + barrel heat
                ctx.globalAlpha = prog * 0.5;
                // Rotating golden sparks
                for (var i = 0; i < 5; i++) {
                    var a = prog * Math.PI * 6 + i * Math.PI * 2 / 5;
                    var r = 10 + prog * 25;
                    ctx.fillStyle = i % 2 === 0 ? '#ffdd44' : '#ffaa00';
                    ctx.fillRect(px + Math.cos(a) * r - 2, cy + Math.sin(a) * r - 1, 4, 2);
                }
                // Central golden flare
                ctx.globalAlpha = prog * 0.3;
                ctx.fillStyle = '#ffcc00';
                ctx.beginPath(); ctx.arc(px, cy, 18 + prog * 10, 0, Math.PI * 2); ctx.fill();
                // Ammo belt lines
                ctx.strokeStyle = 'rgba(255,200,50,' + prog * 0.6 + ')';
                ctx.lineWidth = 1;
                for (var i = 0; i < 3; i++) {
                    var ly = cy - 15 + i * 15;
                    ctx.beginPath();
                    ctx.moveTo(px - 20, ly); ctx.lineTo(px + 20, ly);
                    ctx.stroke();
                }

            } else if (wid === 'hammer') {
                // Ground tremor lines + brown dust rising
                for (var i = 0; i < 4; i++) {
                    var shake = (Math.random() - 0.5) * prog * 8;
                    ctx.globalAlpha = prog * 0.5;
                    ctx.strokeStyle = '#aa7744';
                    ctx.lineWidth = 2 + prog * 2;
                    ctx.beginPath();
                    ctx.moveTo(px - 25 + shake, player.y - i * 12);
                    ctx.lineTo(px + 25 + shake, player.y - i * 12);
                    ctx.stroke();
                }
                // Rising dust particles
                for (var i = 0; i < 3; i++) {
                    var dy = ((prog * 2 + i * 0.33) % 1);
                    var dustY = player.y - dy * player.currentH * 1.2;
                    var dustX = px + (i - 1) * 15 + Math.sin(t * 0.01 + i) * 5;
                    ctx.globalAlpha = (1 - dy) * prog * 0.4;
                    ctx.fillStyle = '#cc9955';
                    ctx.beginPath(); ctx.arc(dustX, dustY, 3 + prog * 2, 0, Math.PI * 2); ctx.fill();
                }
                // Central iron glow
                ctx.globalAlpha = prog * 0.3;
                ctx.fillStyle = '#886633';
                ctx.beginPath(); ctx.arc(px, cy, 16 + prog * 12, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'frostdaggers') {
                // Ice crystals spiraling inward + frost mist
                for (var i = 0; i < 8; i++) {
                    var a = prog * Math.PI * 5 + i * Math.PI / 4;
                    var r = (1 - prog) * 40 + 5;
                    var ix = px + Math.cos(a) * r;
                    var iy = cy + Math.sin(a) * r;
                    ctx.globalAlpha = prog * 0.6;
                    ctx.fillStyle = i % 2 === 0 ? '#88ddff' : '#ffffff';
                    // Diamond shape
                    ctx.save();
                    ctx.translate(ix, iy);
                    ctx.rotate(a);
                    ctx.beginPath();
                    ctx.moveTo(0, -3); ctx.lineTo(2, 0); ctx.lineTo(0, 3); ctx.lineTo(-2, 0);
                    ctx.closePath(); ctx.fill();
                    ctx.restore();
                }
                // Frost mist ring
                ctx.globalAlpha = prog * 0.25;
                ctx.fillStyle = '#aaeeff';
                ctx.beginPath(); ctx.arc(px, cy, 20 + prog * 10, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'shield') {
                // Golden shield energy converging + protective rings
                for (var i = 0; i < 3; i++) {
                    var ringR = Math.max(1, (1 - prog) * 45 + 15 - i * 8);
                    ctx.globalAlpha = prog * 0.4;
                    ctx.strokeStyle = i === 0 ? '#ffdd66' : '#ddaa33';
                    ctx.lineWidth = 2 + prog;
                    ctx.beginPath(); ctx.arc(px, cy, ringR, 0, Math.PI * 2); ctx.stroke();
                }
                // Cross pattern forming
                ctx.globalAlpha = prog * 0.5;
                ctx.strokeStyle = '#ffcc44';
                ctx.lineWidth = 2 + prog * 2;
                var cLen = 10 + prog * 10;
                ctx.beginPath(); ctx.moveTo(px, cy - cLen); ctx.lineTo(px, cy + cLen); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(px - cLen, cy); ctx.lineTo(px + cLen, cy); ctx.stroke();

            } else if (wid === 'black') {
                // Dark vortex — purple/black spiral pulling inward
                for (var i = 0; i < 6; i++) {
                    var a = prog * Math.PI * -3 + i * Math.PI / 3;
                    var r = (1 - prog) * 50 + 8;
                    var sx = px + Math.cos(a) * r;
                    var sy = cy + Math.sin(a) * r;
                    ctx.globalAlpha = prog * 0.5;
                    ctx.fillStyle = i % 2 === 0 ? '#8833cc' : '#220044';
                    ctx.beginPath(); ctx.arc(sx, sy, 3 + prog * 3, 0, Math.PI * 2); ctx.fill();
                }
                // Central dark mass growing
                ctx.globalAlpha = prog * 0.5;
                ctx.fillStyle = '#110022';
                ctx.beginPath(); ctx.arc(px, cy, 8 + prog * 14, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = prog * 0.3;
                ctx.fillStyle = '#6622aa';
                ctx.beginPath(); ctx.arc(px, cy, 14 + prog * 18, 0, Math.PI * 2); ctx.fill();

            } else if (wid === 'derun') {
                // Golden blade energy + wolf spirit silhouette
                for (var i = 0; i < 5; i++) {
                    var a = prog * Math.PI * 4 + i * Math.PI * 2 / 5;
                    var r = (1 - prog) * 35 + 10;
                    ctx.globalAlpha = prog * 0.5;
                    ctx.fillStyle = '#ffcc33';
                    ctx.beginPath(); ctx.arc(px + Math.cos(a) * r, cy + Math.sin(a) * r, 2 + prog * 2, 0, Math.PI * 2); ctx.fill();
                }
                // Wolf eyes flashing
                ctx.globalAlpha = prog * prog * 0.8;
                ctx.fillStyle = '#ff4444';
                ctx.beginPath(); ctx.arc(px - 5, cy - 3, 2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(px + 5, cy - 3, 2, 0, Math.PI * 2); ctx.fill();
                // Golden core
                ctx.globalAlpha = prog * 0.35;
                ctx.fillStyle = '#ddaa22';
                ctx.beginPath(); ctx.arc(px, cy, 15 + prog * 10, 0, Math.PI * 2); ctx.fill();
            }

            ctx.restore();
            return;
        }

        // ── ACTIVE EFFECTS — persistent aura per weapon ──────────
        var pulse = Math.sin(t * 0.008) * 0.12 + 0.18;
        var fastPulse = Math.sin(t * 0.02);

        if (wid === 'sword') {
            // Ethereal spectral ring + ghost wisps
            ctx.globalAlpha = pulse + 0.05;
            ctx.strokeStyle = '#66bbff';
            ctx.lineWidth = 2;
            var ringR = 28 + fastPulse * 4;
            ctx.beginPath(); ctx.arc(px, cy, ringR, t * 0.003, t * 0.003 + Math.PI * 1.5); ctx.stroke();
            // Inner glow
            ctx.globalAlpha = pulse * 0.6;
            ctx.fillStyle = 'rgba(80,160,255,0.15)';
            ctx.beginPath(); ctx.arc(px, cy, 22, 0, Math.PI * 2); ctx.fill();
            // Ghost wisps rising
            for (var i = 0; i < 2; i++) {
                var wy = cy + ((t * 0.04 + i * 40) % 60) - 30;
                var wx = px + Math.sin(t * 0.005 + i * 3) * 10;
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#aaddff';
                ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI * 2); ctx.fill();
            }

        } else if (wid === 'blade') {
            // Crimson danger aura — pulsing red rings + white-hot center
            ctx.globalAlpha = pulse + 0.15;
            ctx.fillStyle = '#ff2222';
            ctx.beginPath(); ctx.arc(px, cy, 22 + fastPulse * 5, 0, Math.PI * 2); ctx.fill();
            // White-hot inner core
            ctx.globalAlpha = 0.2 + fastPulse * 0.1;
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(px, cy, 10, 0, Math.PI * 2); ctx.fill();
            // Danger lines radiating outward
            ctx.strokeStyle = 'rgba(255,50,50,' + (pulse + 0.1) + ')';
            ctx.lineWidth = 1.5;
            for (var i = 0; i < 6; i++) {
                var a = t * 0.004 + i * Math.PI / 3;
                ctx.beginPath();
                ctx.moveTo(px + Math.cos(a) * 14, cy + Math.sin(a) * 14);
                ctx.lineTo(px + Math.cos(a) * (28 + fastPulse * 6), cy + Math.sin(a) * (28 + fastPulse * 6));
                ctx.stroke();
            }
            // Weapon afterimage streaks on player's attack side
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(px + player.facing * 5 - 3, topY + 10, 6, player.currentH - 20);

        } else if (wid === 'spear') {
            // Blue energy field + electric arcs along extended reach
            ctx.globalAlpha = pulse;
            ctx.fillStyle = 'rgba(50,120,255,0.12)';
            ctx.beginPath(); ctx.arc(px, cy, 30, 0, Math.PI * 2); ctx.fill();
            // Electric arcs along weapon line
            var reachEnd = px + player.facing * 60;
            ctx.strokeStyle = 'rgba(100,180,255,' + (0.3 + fastPulse * 0.2) + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + player.facing * 15, cy);
            for (var i = 1; i <= 4; i++) {
                var fx = px + player.facing * (15 + i * 11);
                var fy = cy + (Math.random() - 0.5) * 14;
                ctx.lineTo(fx, fy);
            }
            ctx.stroke();
            // Pulsing range indicator rings
            var rr = 20 + ((t * 0.03) % 40);
            ctx.globalAlpha = Math.max(0, 0.2 - rr * 0.004);
            ctx.strokeStyle = '#4488ff';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(px, cy, rr, 0, Math.PI * 2); ctx.stroke();

        } else if (wid === 'gun') {
            // Golden rapid-fire aura — spinning shell ring + speed lines
            ctx.globalAlpha = pulse;
            ctx.fillStyle = 'rgba(255,180,30,0.12)';
            ctx.beginPath(); ctx.arc(px, cy, 24, 0, Math.PI * 2); ctx.fill();
            // Rotating shell casings
            for (var i = 0; i < 4; i++) {
                var a = t * 0.01 + i * Math.PI / 2;
                var sr = 18 + fastPulse * 3;
                var sx = px + Math.cos(a) * sr;
                var sy = cy + Math.sin(a) * sr;
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = '#ffcc33';
                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(a);
                ctx.fillRect(-3, -1, 6, 2);
                ctx.fillStyle = '#fff';
                ctx.fillRect(-2, -0.5, 2, 1);
                ctx.restore();
            }
            // Speed lines behind player
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = '#ffaa33';
            ctx.lineWidth = 1;
            for (var i = 0; i < 3; i++) {
                var ly = topY + 10 + i * 18;
                ctx.beginPath();
                ctx.moveTo(px - player.facing * 10, ly);
                ctx.lineTo(px - player.facing * (25 + Math.random() * 15), ly);
                ctx.stroke();
            }

        } else if (wid === 'hammer') {
            // Iron tremor aura — ground cracks + heavy brown pulsing
            ctx.globalAlpha = pulse + 0.1;
            ctx.fillStyle = 'rgba(140,90,40,0.15)';
            ctx.beginPath(); ctx.arc(px, cy, 26 + fastPulse * 5, 0, Math.PI * 2); ctx.fill();
            // Tremor cracks at feet
            ctx.strokeStyle = 'rgba(120,80,30,' + (pulse + 0.15) + ')';
            ctx.lineWidth = 1.5;
            for (var i = 0; i < 3; i++) {
                var cx2 = px + (i - 1) * 16;
                ctx.beginPath();
                ctx.moveTo(cx2, player.y);
                ctx.lineTo(cx2 + (Math.random() - 0.5) * 8, player.y + 6);
                ctx.lineTo(cx2 + (Math.random() - 0.5) * 12, player.y + 12);
                ctx.stroke();
            }
            // Chain link particles floating
            for (var i = 0; i < 2; i++) {
                var fy = cy + ((t * 0.03 + i * 30) % 50) - 25;
                var fx = px + Math.sin(t * 0.006 + i * 4) * 12;
                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.ellipse(fx, fy, 3, 5, 0, 0, Math.PI * 2); ctx.stroke();
            }

        } else if (wid === 'frostdaggers') {
            // Blizzard frost aura — icy blue mist + snowflakes
            ctx.globalAlpha = pulse + 0.05;
            ctx.fillStyle = 'rgba(100,200,255,0.12)';
            ctx.beginPath(); ctx.arc(px, cy, 28 + fastPulse * 4, 0, Math.PI * 2); ctx.fill();
            // Snowflake particles drifting
            for (var i = 0; i < 4; i++) {
                var sx = px + Math.sin(t * 0.004 + i * 2.5) * 18;
                var sy = cy + ((t * 0.025 + i * 15) % 50) - 25;
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
                // Tiny cross for snowflake
                ctx.strokeStyle = '#ccf0ff';
                ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(sx - 3, sy); ctx.lineTo(sx + 3, sy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3); ctx.stroke();
            }
            // Frost ring
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = '#88ddff';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(px, cy, 22 + fastPulse * 3, t * 0.005, t * 0.005 + Math.PI * 1.6); ctx.stroke();

        } else if (wid === 'shield') {
            // Phalanx golden shield aura — impenetrable barrier glow
            ctx.globalAlpha = pulse + 0.15;
            ctx.fillStyle = 'rgba(255,210,80,0.15)';
            ctx.beginPath(); ctx.arc(px, cy, 30 + fastPulse * 5, 0, Math.PI * 2); ctx.fill();
            // Shield cross emblem
            ctx.globalAlpha = 0.3 + fastPulse * 0.1;
            ctx.strokeStyle = '#ffcc44';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px, cy - 14); ctx.lineTo(px, cy + 14); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px - 10, cy); ctx.lineTo(px + 10, cy); ctx.stroke();
            // Protective barrier ring
            ctx.globalAlpha = 0.25;
            ctx.strokeStyle = '#ffdd66';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(px, cy, 26, -Math.PI * 0.7, Math.PI * 0.7);
            ctx.stroke();

        } else if (wid === 'black') {
            // Ghost mode — eerie purple void aura
            ctx.globalAlpha = pulse + 0.05;
            ctx.fillStyle = 'rgba(80,20,140,0.15)';
            ctx.beginPath(); ctx.arc(px, cy, 30 + fastPulse * 6, 0, Math.PI * 2); ctx.fill();
            // Void wisps
            for (var i = 0; i < 3; i++) {
                var wy = cy + ((t * 0.03 + i * 25) % 55) - 27;
                var wx = px + Math.sin(t * 0.007 + i * 2.5) * 14;
                ctx.globalAlpha = 0.18;
                ctx.fillStyle = '#aa55ff';
                ctx.beginPath(); ctx.arc(wx, wy, 3 + Math.sin(t * 0.01 + i) * 1.5, 0, Math.PI * 2); ctx.fill();
            }
            // Dark center core
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#220044';
            ctx.beginPath(); ctx.arc(px, cy, 16, 0, Math.PI * 2); ctx.fill();

        } else if (wid === 'derun') {
            // Stephengun wolf aura — golden + red wolf spirit
            ctx.globalAlpha = pulse + 0.05;
            ctx.fillStyle = 'rgba(220,170,40,0.12)';
            ctx.beginPath(); ctx.arc(px, cy, 26 + fastPulse * 4, 0, Math.PI * 2); ctx.fill();
            // Wolf eyes glowing beside player
            var eyeX = px + player.facing * 20;
            var eyeAlpha = 0.3 + Math.sin(t * 0.01) * 0.15;
            ctx.globalAlpha = eyeAlpha;
            ctx.fillStyle = '#ff3333';
            ctx.beginPath(); ctx.arc(eyeX - 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(eyeX + 4, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
            // Golden energy trail
            ctx.globalAlpha = 0.15;
            ctx.strokeStyle = '#ffcc33';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px - player.facing * 8, cy);
            for (var i = 1; i <= 3; i++) {
                ctx.lineTo(px - player.facing * (8 + i * 10), cy + Math.sin(t * 0.008 + i * 2) * 8);
            }
            ctx.stroke();
        }

        ctx.restore();
    };

    // ─── Draw Super Timer Above Player (world space) ─────────────
    G.drawSuperTimer = function (player) {
        if (!player.superActive && !player.superCharging) return;

        var wid = player.weapon ? player.weapon.id : 'sword';
        var t = Date.now();
        var px = player.x;
        var aboveY = player.y - player.currentH - 22;

        ctx.save();

        // ── Charging progress ring ──
        if (player.superCharging) {
            var prog = player.superChargingTimer / CHARGE_TIME;
            var ringR = 12;
            // Background ring
            ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(px, aboveY, ringR, 0, Math.PI * 2); ctx.stroke();
            // Progress ring — golden
            ctx.strokeStyle = '#ffdd44';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(px, aboveY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
            // Center flash
            ctx.globalAlpha = 0.4 + prog * 0.4;
            ctx.fillStyle = '#ffdd44';
            ctx.beginPath(); ctx.arc(px, aboveY, 4 + prog * 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            return;
        }

        // ── Active timer display ──
        if (!player.superActive) { ctx.restore(); return; }

        // Color per weapon
        var color, bgColor, label;
        if (wid === 'sword') { color = '#66bbff'; bgColor = 'rgba(60,140,255,'; }
        else if (wid === 'blade') { color = '#ff4444'; bgColor = 'rgba(255,50,50,'; }
        else if (wid === 'spear') { color = '#4488ff'; bgColor = 'rgba(50,120,255,'; }
        else if (wid === 'gun') { color = '#ffcc33'; bgColor = 'rgba(255,200,50,'; }
        else if (wid === 'hammer') { color = '#aaaaaa'; bgColor = 'rgba(170,170,170,'; }
        else if (wid === 'frostdaggers') { color = '#88ddff'; bgColor = 'rgba(136,221,255,'; }
        else if (wid === 'shield') { color = '#ffdd44'; bgColor = 'rgba(255,220,50,'; }
        else if (wid === 'black') { color = '#aa44ff'; bgColor = 'rgba(170,68,255,'; }
        else if (wid === 'derun') { color = '#ddaa44'; bgColor = 'rgba(221,170,68,'; }
        else { color = '#ffdd44'; bgColor = 'rgba(255,220,50,'; }

        // Blade: shows a danger icon instead of seconds (it's "next hit")
        if (wid === 'blade') {
            var blink = Math.sin(t * 0.012) > 0 ? 1 : 0.4;
            ctx.globalAlpha = blink;
            // Skull / X mark
            ctx.fillStyle = '#ff2222';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('X', px, aboveY);
            // Outer ring pulsing
            var pr = 10 + Math.sin(t * 0.01) * 3;
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(px, aboveY, pr, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
            return;
        }

        // Sniper has no active timer (passive)
        if (wid === 'sniper') { ctx.restore(); return; }

        // Timed supers: circular countdown ring + seconds
        var maxTime;
        if (wid === 'sword') maxTime = 4000;
        else if (wid === 'spear') maxTime = 4000;
        else if (wid === 'gun') maxTime = 4000;
        else if (wid === 'hammer') maxTime = 6000;
        else if (wid === 'frostdaggers') maxTime = 4000;
        else if (wid === 'shield') maxTime = 3000;
        else if (wid === 'black') maxTime = 4000;
        else if (wid === 'derun') maxTime = 10000;
        else maxTime = 4000;

        var pct = Math.max(0, player.superTimer / maxTime);
        var secs = Math.ceil(player.superTimer / 1000);
        var ringR = 13;

        // Glow behind
        ctx.globalAlpha = 0.15 + pct * 0.1;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(px, aboveY, ringR + 5, 0, Math.PI * 2); ctx.fill();

        // Background ring
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(px, aboveY, ringR, 0, Math.PI * 2); ctx.stroke();

        // Countdown arc
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, aboveY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); ctx.stroke();

        // Seconds number in center
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(secs, px + 1, aboveY + 1);
        ctx.fillStyle = color;
        ctx.fillText(secs, px, aboveY);

        // Warning flash when < 1.5s
        if (player.superTimer < 1500 && Math.sin(t * 0.015) > 0) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(px, aboveY, ringR + 3, 0, Math.PI * 2); ctx.stroke();
        }

        ctx.restore();
    };

    // ─── Draw Super UI (3 golden icons below hearts) ────────────
    G.drawSuperUI = function (x, y, player) {
        var charge = player.superMax ? 3 : player.superCharge;

        for (var i = 0; i < 3; i++) {
            var ix = x + i * 22 + 6;
            var iy = y;

            if (i < charge) {
                // Filled golden lightning bolt
                var pulse = player.superMax ? Math.sin(Date.now() * 0.006 + i * 0.5) * 0.15 + 0.85 : 1;

                // Glow
                if (player.superMax) {
                    ctx.fillStyle = 'rgba(255,220,50,' + (0.2 + Math.sin(Date.now() * 0.005 + i) * 0.1) + ')';
                    ctx.beginPath();
                    ctx.arc(ix, iy + 6, 10, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = pulse;
                ctx.fillStyle = '#ffdd44';
                drawLightningBolt(ctx, ix, iy, 7);
                ctx.fillStyle = '#fff';
                drawLightningBolt(ctx, ix - 0.5, iy - 0.5, 3);
                ctx.globalAlpha = 1;
            } else {
                // Empty — dark bolt
                ctx.fillStyle = '#333';
                drawLightningBolt(ctx, ix, iy, 7);
            }
        }

        // "SUPER" label when maxed and blinking
        if (player.superMax && Math.sin(Date.now() * 0.008) > 0) {
            ctx.font = '6px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffdd44';
            ctx.fillText('SUPER!', x, y + 22);
        }

        // Charging bar
        if (player.superCharging) {
            var prog = player.superChargingTimer / CHARGE_TIME;
            var barW = 60;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y + 24, barW, 5);
            ctx.fillStyle = '#ffdd44';
            ctx.fillRect(x, y + 24, barW * prog, 5);
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y + 24, barW, 5);
        }

    };

    function drawLightningBolt(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, cy - size);
        ctx.lineTo(cx + size * 0.5, cy - size);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.1);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.1);
        ctx.lineTo(cx - size * 0.15, cy + size);
        ctx.lineTo(cx + size * 0.1, cy + size * 0.15);
        ctx.lineTo(cx - size * 0.35, cy + size * 0.15);
        ctx.closePath();
        ctx.fill();
    }

    // ─── Super Pause Trigger (for all weapon supers) ────────────
    G._superPauseRequest = null;
    G.triggerSuperPause = function (player, superName) {
        if (G.playSuperTrigger) {
            var wid = player && player.weapon ? player.weapon.id : null;
            G.playSuperTrigger(wid);
        }
        var color = '#ff5b5b';
        if (player === G._p1Ref) color = '#5b9aff';
        else if (player === G._p2Ref) color = '#ff5b5b';
        else if (player === G._p3Ref) color = '#66cc66';
        else if (player === G._p4Ref) color = '#cc66cc';
        G._superPauseRequest = {
            player: player,
            name: superName,
            color: color,
        };
    };

    // ─── Black Holes ──────────────────────────────────────────
    G.blackHoles = [];

    G.spawnBlackHole = function (owner, opponent, chargeTime) {
        if (!owner || !opponent) return;
        var cappedCharge = Math.max(500, Math.min(chargeTime || 500, 4000));
        var sizeT = Math.min(1, (cappedCharge - 500) / 3500);
        var radius = 20 + sizeT * 60;
        var pullStrength = 0.25 + sizeT * 1.25;
        var pullRadius = radius * 3;
        var minY = Math.max(180, G.GROUND_Y - 180);
        var maxY = G.GROUND_Y - 35;
        var oppCx = opponent.x;
        var oppCy = opponent.y - opponent.currentH * 0.45;
        var moveDir = 0;
        if (Math.abs(opponent.vx) > 0.2) moveDir = opponent.vx > 0 ? 1 : -1;
        else moveDir = opponent.facing || 1;
        var leadFrames = 14 + sizeT * 12;
        var targetX = oppCx + opponent.vx * leadFrames;
        var targetY = oppCy + opponent.vy * 8;
        targetY = Math.max(minY, Math.min(maxY, targetY));
        targetX = Math.max(G.WALL_LEFT + 40, Math.min(G.WALL_RIGHT - 40, targetX));

        var minSpawnDist = Math.max(88, radius * 1.12);
        var maxSpawnDist = Math.min(260, minSpawnDist + 130 + sizeT * 30);
        var preferredAngle = moveDir >= 0 ? 0 : Math.PI;
        var bx = targetX;
        var by = targetY;
        var attempts = 0;
        while (attempts < 20) {
            attempts++;
            var angle = preferredAngle + (Math.random() - 0.5) * 2.5;
            var dist = minSpawnDist + Math.random() * Math.max(8, maxSpawnDist - minSpawnDist);
            bx = targetX + Math.cos(angle) * dist;
            by = targetY + Math.sin(angle) * (dist * 0.62);
            bx = Math.max(G.WALL_LEFT + 25, Math.min(G.WALL_RIGHT - 25, bx));
            by = Math.max(minY, Math.min(maxY, by));
            var dx = bx - oppCx;
            var dy = by - oppCy;
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d >= minSpawnDist && d <= maxSpawnDist + 25) break;
        }
        // Safety clamp: never spawn directly on top of the opponent.
        var sdx = bx - oppCx;
        var sdy = by - oppCy;
        var sdist = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
        if (sdist < minSpawnDist) {
            bx = oppCx + (sdx / sdist) * minSpawnDist;
            by = oppCy + (sdy / sdist) * minSpawnDist;
            bx = Math.max(G.WALL_LEFT + 25, Math.min(G.WALL_RIGHT - 25, bx));
            by = Math.max(minY, Math.min(maxY, by));
        }
        G.blackHoles.push({
            x: bx, y: by, radius: radius, pullStrength: pullStrength,
            pullRadius: pullRadius, owner: owner,
            lifetime: 5000 + sizeT * 3000,
            sizeT: sizeT,
        });
        G.playBlackHoleSpawn();
        G.spawnParticles(bx, by, '#440066', 12, 5);
        G.spawnParticles(bx, by, '#220033', 8, 3);
    };

    // fighters: array of all fighters OR two positional args (p1, p2) for backwards compat
    G.updateBlackHoles = function (p1OrFighters, p2OrDt, dtOrUndef) {
        var fighters, dt;
        if (Array.isArray(p1OrFighters)) {
            fighters = p1OrFighters;
            dt = p2OrDt;
        } else {
            fighters = [p1OrFighters, p2OrDt];
            dt = dtOrUndef;
        }
        for (var i = G.blackHoles.length - 1; i >= 0; i--) {
            var bh = G.blackHoles[i];
            bh.lifetime -= dt;
            if (bh.lifetime <= 0) {
                G.spawnParticles(bh.x, bh.y, '#330055', 10, 4);
                G.blackHoles.splice(i, 1);
                continue;
            }
            var consumed = false;
            for (var fi = 0; fi < fighters.length; fi++) {
                var target = fighters[fi];
                if (target === bh.owner) continue;
                if (target.hp <= 0) continue;
                if (target.ghostMode || target.phalanxInvincible) continue;
                var dx = bh.x - target.x;
                var dy = bh.y - target.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bh.pullRadius && dist > 5) {
                    var force = bh.pullStrength * (1 - dist / bh.pullRadius);
                    target.vx += (dx / dist) * force;
                    target.vy += (dy / dist) * force * 0.5;
                }
                if (dist < bh.radius) {
                    target.takeDamage(scaledDamage(bh.owner, 2), bh.x);
                    G.playBlackHoleConsume();
                    G.spawnParticles(bh.x, bh.y, '#440066', 25, 8);
                    G.spawnParticles(bh.x, bh.y, '#ffffff', 10, 5);
                    G.fxTriggerShake(10, 300);
                    G.blackHoles.splice(i, 1);
                    consumed = true;
                    break;
                }
            }
            if (consumed) continue;
            // Ambient particles
            if (Math.random() < 0.2) {
                var pa = Math.random() * Math.PI * 2;
                G.spawnParticles(bh.x + Math.cos(pa) * bh.radius, bh.y + Math.sin(pa) * bh.radius, 'rgba(80,0,150,0.6)', 1, 1);
            }
        }
    };

    G.drawBlackHoles = function () {
        for (var i = 0; i < G.blackHoles.length; i++) {
            var bh = G.blackHoles[i];
            var t = Date.now();
            var pulse = Math.sin(t * 0.006 + i * 0.9) * 0.5 + 0.5;
            var coreR = Math.max(4, bh.radius);
            ctx.save();
            // Pull range indicator
            ctx.strokeStyle = 'rgba(80,0,120,0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(bh.x, bh.y, bh.pullRadius, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
            // Outer lensing ripple
            ctx.strokeStyle = 'rgba(160,80,220,' + (0.12 + pulse * 0.1) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bh.x, bh.y, bh.pullRadius * (0.86 + pulse * 0.08), 0, Math.PI * 2);
            ctx.stroke();
            // Swirling dark layers
            for (var r = coreR; r > 3; r -= 4) {
                var alpha = (1 - r / coreR) * 0.85;
                ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
                ctx.beginPath(); ctx.arc(bh.x, bh.y, r, 0, Math.PI * 2); ctx.fill();
            }
            // Spiral arms
            for (var s = 0; s < 3; s++) {
                var baseA = t * 0.002 + s * (Math.PI * 2 / 3);
                ctx.strokeStyle = 'rgba(120,40,190,' + (0.24 + pulse * 0.2) + ')';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                for (var p = 0; p <= 1.0; p += 0.12) {
                    var a = baseA + p * 2.6;
                    var rr = coreR * (0.28 + p * 0.82);
                    var sx = bh.x + Math.cos(a) * rr;
                    var sy = bh.y + Math.sin(a) * rr;
                    if (p === 0) ctx.moveTo(sx, sy);
                    else ctx.lineTo(sx, sy);
                }
                ctx.stroke();
            }
            // Purple accretion ring
            ctx.strokeStyle = 'rgba(150,50,200,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(bh.x, bh.y, coreR, t * 0.005, t * 0.005 + Math.PI * 1.5); ctx.stroke();
            // Second ring counter-rotating
            ctx.strokeStyle = 'rgba(100,0,180,0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(bh.x, bh.y, coreR * 0.7, -t * 0.003, -t * 0.003 + Math.PI); ctx.stroke();
            // White-hot center
            ctx.fillStyle = 'rgba(200,150,255,' + (0.45 + pulse * 0.3) + ')';
            ctx.beginPath(); ctx.arc(bh.x, bh.y, 2.5 + pulse * 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    };

    // ─── Wolf Entities ─────────────────────────────────────────
    var WOLF_SPEED = 2.4;
    var WOLF_JUMP_MULT = 0.65;

    G.spawnWolf = function (owner, opponent) {
        owner.wolves.push({
            x: owner.x + owner.facing * 20,
            y: owner.y,
            vx: owner.facing * WOLF_SPEED,
            vy: 0,
            hp: 0.5,
            lifetime: 1000,
            onGround: false,
            facing: owner.facing,
            hasHit: false,
            animTimer: 0,
        });
    };

    function updateWolves(player, opponent, dt) {
        if (!player.wolves) return;
        for (var i = player.wolves.length - 1; i >= 0; i--) {
            var w = player.wolves[i];
            w.lifetime -= dt;
            w.animTimer += dt;
            if (w.lifetime <= 0 || w.hp <= 0) {
                G.spawnParticles(w.x, w.y - 10, '#aa8844', 8, 3);
                player.wolves.splice(i, 1);
                continue;
            }
            // Move toward opponent
            w.facing = opponent.x > w.x ? 1 : -1;
            w.vx = w.facing * WOLF_SPEED;
            // Gravity
            w.vy += G.GRAVITY;
            w.x += w.vx;
            w.y += w.vy;
            // Ground
            if (w.y >= G.GROUND_Y) {
                w.y = G.GROUND_Y;
                w.vy = 0;
                w.onGround = true;
            }
            // Platform collision + jumping
            var platforms = G.getCurrentMap().platforms;
            for (var pi = 0; pi < platforms.length; pi++) {
                var p = platforms[pi];
                // Land on platform
                if (w.vy >= 0 && w.y >= p.y && w.y - w.vy < p.y + 3 &&
                    w.x > p.x && w.x < p.x + p.w) {
                    w.y = p.y;
                    w.vy = 0;
                    w.onGround = true;
                }
            }
            // Jump if opponent is above
            if (w.onGround && opponent.y < w.y - 40) {
                w.vy = G.JUMP_FORCE * WOLF_JUMP_MULT;
                w.onGround = false;
            }
            // Walls
            if (w.x < G.WALL_LEFT + 10) w.x = G.WALL_LEFT + 10;
            if (w.x > G.WALL_RIGHT - 10) w.x = G.WALL_RIGHT - 10;
            // Hit opponent
            if (!w.hasHit) {
                var hurt = opponent.hurtbox;
                if (w.x > hurt.x - 6 && w.x < hurt.x + hurt.w + 6 &&
                    w.y > hurt.y && w.y < hurt.y + hurt.h + 6) {
                    if (!opponent.ghostMode && !opponent.phalanxInvincible &&
                        !(opponent.weapon && opponent.weapon.id === 'shield' && opponent.shieldDashing && opponent.attackPhase === 'active')) {
                        w.hasHit = true;
                        opponent.takeDamage(scaledDamage(player, 0.5), w.x);
                        G.playWolfBite();
                        G.onPlayerHit(player, opponent);
                        G.spawnParticles(w.x, w.y - 10, '#ffaa33', 8, 4);
                        player.wolves.splice(i, 1);
                    }
                }
            }
        }
    }

    G.drawWolves = function (player) {
        if (!player.wolves) return;
        for (var i = 0; i < player.wolves.length; i++) {
            var w = player.wolves[i];
            var t = w.animTimer;
            var legOff = Math.sin(t * 0.02) * 3;
            ctx.save();
            // Body
            ctx.fillStyle = '#886633';
            ctx.fillRect(w.x - 12, w.y - 16, 24, 12);
            // Darker back
            ctx.fillStyle = '#664422';
            ctx.fillRect(w.x - 10, w.y - 16, 20, 4);
            // Head
            ctx.fillStyle = '#aa8844';
            var headX = w.facing === 1 ? w.x + 10 : w.x - 18;
            ctx.fillRect(headX, w.y - 20, 8, 10);
            // Ear
            ctx.fillStyle = '#886633';
            ctx.fillRect(headX + 1, w.y - 24, 3, 5);
            ctx.fillRect(headX + 4, w.y - 23, 3, 4);
            // Eye
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(w.facing === 1 ? headX + 5 : headX + 1, w.y - 18, 2, 2);
            // Legs
            ctx.fillStyle = '#664422';
            ctx.fillRect(w.x - 8, w.y - 4 + legOff, 4, 4 - legOff);
            ctx.fillRect(w.x + 4, w.y - 4 - legOff, 4, 4 + legOff);
            // Tail
            ctx.fillStyle = '#886633';
            var tailX = w.facing === 1 ? w.x - 14 : w.x + 12;
            ctx.fillRect(tailX, w.y - 18, 4, 3);
            ctx.restore();
        }
    };

    // ─── Iron Chain Entities ───────────────────────────────────
    function updateIronChains(player, opponent, dt) {
        if (!player.ironChains) return;
        for (var i = player.ironChains.length - 1; i >= 0; i--) {
            var ch = player.ironChains[i];
            if (typeof ch.fade !== 'number') ch.fade = 1;

            // Grow chain
            if (!ch.fading && ch.length < ch.maxLength) {
                ch.length += ch.growSpeed * dt;
                if (ch.length > ch.maxLength) ch.length = ch.maxLength;
            }
            // Swing
            if (!ch.fading) {
                ch.angle = Math.sin(Date.now() * ch.swingSpeed) * 0.6 * ch.swingDir;
            }
            // Chain tip position
            var tipX = ch.x + Math.sin(ch.angle) * ch.length;
            var tipY = Math.min(ch.length, G.GROUND_Y);
            // Hit opponent (not user)
            if (!ch.fading && (!ch.hitCooldown || ch.hitCooldown <= 0)) {
                var dx = tipX - opponent.x;
                var dy = tipY - (opponent.y - opponent.currentH / 2);
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 25 && !opponent.ghostMode && !opponent.phalanxInvincible) {
                    opponent.takeDamage(scaledDamage(player, 0.5), tipX);
                    opponent.applyKnockback((opponent.x - tipX) > 0 ? 5 : -5, -4, 200);
                    ch.hitCooldown = 450;
                    G.playChainClank();
                    G.spawnParticles(tipX, tipY, '#aaa', 8, 4);
                }
            }
            if (ch.hitCooldown > 0) ch.hitCooldown -= dt;
        }
    }

    G.drawIronChains = function (player) {
        if (!player.ironChains) return;
        for (var i = 0; i < player.ironChains.length; i++) {
            var ch = player.ironChains[i];
            var links = Math.floor(ch.length / 12);
            ctx.save();
            ctx.globalAlpha = Math.max(0, typeof ch.fade === 'number' ? ch.fade : 1);
            for (var li = 0; li <= links; li++) {
                var frac = li / Math.max(1, links);
                var lx = ch.x + Math.sin(ch.angle * frac) * (frac * ch.length);
                var ly = frac * ch.length;
                if (ly > G.GROUND_Y) ly = G.GROUND_Y;
                // Alternate chain link orientation
                ctx.fillStyle = li % 2 === 0 ? '#888' : '#666';
                if (li % 2 === 0) {
                    ctx.fillRect(lx - 4, ly - 2, 8, 4);
                    ctx.fillStyle = '#aaa';
                    ctx.fillRect(lx - 3, ly - 1, 6, 2);
                } else {
                    ctx.fillRect(lx - 2, ly - 4, 4, 8);
                    ctx.fillStyle = '#999';
                    ctx.fillRect(lx - 1, ly - 3, 2, 6);
                }
            }
            // Spiked weight at tip
            var tipX = ch.x + Math.sin(ch.angle) * ch.length;
            var tipY = Math.min(ch.length, G.GROUND_Y);
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#777';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
            ctx.fill();
            // Spikes
            ctx.fillStyle = '#999';
            for (var s = 0; s < 4; s++) {
                var sa = s * Math.PI / 2;
                ctx.fillRect(tipX + Math.cos(sa) * 8 - 1, tipY + Math.sin(sa) * 8 - 1, 3, 3);
            }
            ctx.restore();
        }
    };

    // ─── Draw Fantasy Entities (called from main.js) ──────────
    G.drawFantasyEntities = function (player) {
        G.drawIronChains(player);
        G.drawWolves(player);
    };

    // ─── Draw Frost Counter above player ──────────────────────
    G.drawFrostCounter = function (player) {
        if (player.frostCounter <= 0) return;
        var px = player.x;
        var aboveY = player.y - player.currentH - 18;
        var alpha = Math.min(1, player.frostCounterTimer / 500);
        ctx.save();
        ctx.globalAlpha = alpha;
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(px - 14, aboveY - 6, 28, 12);
        // Counter text
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#88ddff';
        ctx.fillText(player.frostCounter + '/4', px, aboveY);
        // Ice crystal decorations
        ctx.fillStyle = 'rgba(136,221,255,0.6)';
        ctx.fillRect(px - 16, aboveY - 2, 2, 4);
        ctx.fillRect(px + 14, aboveY - 2, 2, 4);
        ctx.restore();
    };

    // ─── Draw Frozen Ice Effect ────────────────────────────────
    G.drawFrozenEffect = function (player) {
        if (player.frozenTimer <= 0 && player.blizzardTimer <= 0) return;
        var px = player.x;
        var py = player.y;
        var ch = player.currentH;
        ctx.save();
        ctx.globalAlpha = 0.3;
        // Ice block outline
        ctx.strokeStyle = '#88ddff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 22, py - ch - 4, 44, ch + 8);
        // Ice crystals at corners
        ctx.fillStyle = '#aaeeff';
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.008) * 0.2;
        var cSize = 4;
        // Top-left
        ctx.fillRect(px - 22, py - ch - 4, cSize, cSize);
        // Top-right
        ctx.fillRect(px + 18, py - ch - 4, cSize, cSize);
        // Bottom-left
        ctx.fillRect(px - 22, py, cSize, cSize);
        // Bottom-right
        ctx.fillRect(px + 18, py, cSize, cSize);
        // Snowflake particles
        if (Math.random() < 0.2) {
            G.spawnParticles(px + (Math.random() - 0.5) * 30, py - Math.random() * ch, 'rgba(180,230,255,0.7)', 1, 0.5);
        }
        ctx.restore();
    };

    // ─── Draw Black Hole Stopwatch ─────────────────────────────
    G.drawBlackHoleStopwatch = function (player) {
        if (!player.blackHoleCharging) return;
        var rawSecs = player.blackHoleChargeTime / 1000;
        var label = rawSecs < 1 ? rawSecs.toFixed(1) + 's' : Math.floor(rawSecs) + 's';
        var px = player.x;
        var aboveY = player.y - player.currentH - 20;
        var prog = Math.min(1, player.blackHoleChargeTime / 4000);
        ctx.save();
        // Stopwatch ring
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, aboveY, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#aa44ff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px, aboveY, 11, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
        // Seconds text
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#aa44ff';
        ctx.fillText(label, px, aboveY);
        // Ready indicator (>= 0.5s)
        if (rawSecs >= 0.5) {
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.fillStyle = '#aa44ff';
            ctx.beginPath(); ctx.arc(px, aboveY, 14, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };

    // ─── Sniper Passive Indicator ───────────────────────────────
    G.drawSniperPassiveTimer = function (player, x, y) {
        if (!player.weapon) return;
        var wid = player.weapon.id;
        if (wid !== 'sniper' && wid !== 'black') return;
        if (player.superMax) return;
        // Show small progress arc for next auto-charge
        var pct = player.sniperPassiveTimer / 5000;
        if (pct > 0) {
            ctx.strokeStyle = wid === 'black' ? 'rgba(170,68,255,0.45)' : 'rgba(255,220,50,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x + 6, y + 6, 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
            ctx.stroke();
        }
    };
})(window.Game);
