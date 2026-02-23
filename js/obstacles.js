// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Map Obstacles (Jump Boost, Teleport, Lava, Cage, Ladder, Cloud, Gear, Regen, Crumbling)
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var ctx = G.ctx;
    var animTimer = 0;

    function clearObstacleRuntimeState(o) {
        if (typeof o._initialX !== 'number') o._initialX = o.x;
        if (typeof o._initialY !== 'number') o._initialY = o.y;
        o.x = o._initialX;
        o.y = o._initialY;

        delete o._cooldown;
        delete o._flashTimer;
        delete o._cageCd;
        delete o._gearCd;
        delete o._dmgAccum;
        delete o._lavaIn;
        delete o._raindrops;
        delete o._rainTimer;
        delete o._cloudDir;
        delete o._startX;
        delete o._healAccum;
        delete o._crumbleState;
        delete o._crumbleTimer;
        delete o._crumbleShakeX;
    }

    G.resetObstacles = function (mapIndex, opts) {
        var idx = typeof mapIndex === 'number' ? mapIndex : G.currentMapIndex;
        var options = opts || {};
        if (options.rerollLayout && typeof G.randomizeMapObstaclesLayout === 'function') {
            G.randomizeMapObstaclesLayout(idx);
        }
        var map = G.MAPS[idx];
        if (map && map.obstacles) {
            for (var i = 0; i < map.obstacles.length; i++) {
                clearObstacleRuntimeState(map.obstacles[i]);
            }
        }
        if (typeof G.resetMapRuntime === 'function') {
            G.resetMapRuntime(idx);
        }
    };

    // Obstacle surfaces that behave like temporary platforms
    G.getSolidObstaclePlatforms = function () {
        var map = G.getCurrentMap();
        if (!map || !map.obstacles) return [];
        var solids = [];
        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o.type === 'crumbling' && o._crumbleState !== 'gone') {
                solids.push(o);
            }
        }
        return solids;
    };

    // ─── Obstacle Checking ───────────────────────────────────────
    G.checkObstacles = function (player, dt) {
        var map = G.getCurrentMap();
        if (!map.obstacles) return;

        var pid = 2;
        if (player === G._p1Ref) pid = 1;
        else if (player === G._p2Ref) pid = 2;
        else if (player === G._p3Ref) pid = 3;
        else if (player === G._p4Ref) pid = 4;
        var obs = map.obstacles;

        // Reset per-frame flags
        player.onLadder = false;

        // Reset tracking for effects player is NOT currently interacting with
        for (var li = 0; li < obs.length; li++) {
            var lo = obs[li];
            if (lo.type === 'lava' && lo._lavaIn && lo._lavaIn[pid] && !playerTouching(player, lo)) {
                lo._lavaIn[pid] = false;
                if (lo._dmgAccum) lo._dmgAccum[pid] = 0;
            } else if (lo.type === 'regen' && lo._healAccum && lo._healAccum[pid] && !playerStandingOnTop(player, lo)) {
                lo._healAccum[pid] = 0;
            }
        }

        for (var i = 0; i < obs.length; i++) {
            var o = obs[i];
            if (o.type === 'crumbling' && o._crumbleState === 'gone') continue;
            var standingOnTop = playerStandingOnTop(player, o);
            var touching = playerTouching(player, o);
            if (!touching && !(o.type === 'regen' && standingOnTop) && !(o.type === 'crumbling' && standingOnTop)) continue;

            if (o.type === 'jumpboost') {
                // Only trigger on ground contact
                if (player.onGround || player.vy >= 0) {
                    player.vy = G.JUMP_FORCE * 0.9;
                    player.onGround = false;
                    G.spawnParticles(player.x, player.y, '#44ff88', 8, 4);
                    G.spawnParticles(player.x, player.y, '#88ffbb', 5, 3);
                    o._flashTimer = 300;
                    G.initAudio();
                    G.playJumpBoost();
                }
            } else if (o.type === 'teleport' && o.target) {
                if (!o._cooldown || o._cooldown <= 0) {
                    player.x = o.target.x + o.target.w / 2;
                    player.y = o.target.y;
                    o._cooldown = 3000;
                    o.target._cooldown = 3000;
                    G.spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#bb66ff', 12, 5);
                    G.spawnParticles(player.x, player.y, '#dd88ff', 12, 5);
                    o._flashTimer = 300;
                    o.target._flashTimer = 300;
                    G.initAudio();
                    G.playTeleport();
                }
            } else if (o.type === 'lava') {
                // Invincible players ignore lava
                if (player.phalanxInvincible || player.ghostMode || (typeof G.isLavaImmune === 'function' && G.isLavaImmune(player))) continue;
                // Lava damage: instant 0.5 on first touch, then 0.5 every 0.5s
                if (!o._dmgAccum) o._dmgAccum = {};
                if (!o._lavaIn) o._lavaIn = {};
                if (!o._lavaIn[pid]) {
                    o._lavaIn[pid] = true;
                    o._dmgAccum[pid] = 0;
                    player.hp -= 0.5;
                    if (player.hp < 0) player.hp = 0;
                    player.flashTimer = 100;
                    G.spawnParticles(player.x, player.y - 10, '#ff4422', 8, 4);
                    G.fxTriggerShake(4, 120);
                    G.initAudio();
                    G.playLavaBurn();
                }
                if (!o._dmgAccum[pid]) o._dmgAccum[pid] = 0;
                o._dmgAccum[pid] += dt;
                if (o._dmgAccum[pid] >= 500) {
                    o._dmgAccum[pid] -= 500;
                    player.hp -= 0.5;
                    if (player.hp < 0) player.hp = 0;
                    player.flashTimer = 100;
                    G.spawnParticles(player.x, player.y - 10, '#ff4422', 6, 3);
                    G.fxTriggerShake(3, 100);
                }
                if (Math.random() < 0.15) {
                    G.spawnParticles(
                        player.x + (Math.random() - 0.5) * 16,
                        player.y - 4,
                        '#ff6622', 2, 2
                    );
                }
            } else if (o.type === 'cage') {
                if (player.phalanxInvincible || player.ghostMode) continue;
                // Knockback on contact
                if (!o._cageCd) o._cageCd = {};
                if (!o._cageCd[pid] || o._cageCd[pid] <= 0) {
                    var dir = player.x < o.x + o.w / 2 ? -1 : 1;
                    var knockX = o.knockbackX || 50;
                    var knockY = o.knockbackY || -8;
                    var knockDur = o.knockbackDur || 340;
                    if (typeof player.applyKnockback === 'function') {
                        player.applyKnockback(dir * knockX, knockY, knockDur);
                    } else {
                        player.vx = dir * knockX;
                        player.vy = knockY;
                        player.onGround = false;
                    }
                    player.staggerTimer = Math.max(player.staggerTimer || 0, 240);
                    player.state = 'stagger';
                    player.attackPhase = null;
                    o._cageCd[pid] = 400;
                    G.spawnParticles(player.x, player.y - player.currentH / 2, '#aaaaaa', 6, 3);
                    G.spawnParticles(player.x, player.y - player.currentH / 2, '#dddddd', 4, 2);
                    G.fxTriggerShake(5, 150);
                    G.playImpactHeavy();
                    o._flashTimer = 200;
                }
            } else if (o.type === 'ladder') {
                player.onLadder = true;
            } else if (o.type === 'gear') {
                if (player.phalanxInvincible || player.ghostMode) continue;
                // Spinning gear deals damage + knockback
                if (!o._gearCd) o._gearCd = {};
                if (!o._gearCd[pid] || o._gearCd[pid] <= 0) {
                    player.hp -= 0.5;
                    if (player.hp < 0) player.hp = 0;
                    player.flashTimer = 100;
                    var dir = player.x < o.x + o.w / 2 ? -1 : 1;
                    if (typeof player.applyKnockback === 'function') {
                        player.applyKnockback(dir * 8, -4, 180);
                    } else {
                        player.vx = dir * 8;
                        player.vy = -4;
                        player.onGround = false;
                    }
                    o._gearCd[pid] = 800;
                    G.spawnParticles(player.x, player.y - player.currentH / 2, '#ff8844', 8, 4);
                    G.spawnParticles(player.x, player.y - player.currentH / 2, '#ffaa66', 5, 3);
                    G.fxTriggerShake(4, 150);
                }
            } else if (o.type === 'regen') {
                if (!standingOnTop) continue;
                if (!o._healAccum) o._healAccum = {};
                var maxHp = typeof G.getPlayerMaxHP === 'function' ? G.getPlayerMaxHP(player) : G.HP_PER_ROUND;
                if (player.hp >= maxHp) {
                    o._healAccum[pid] = 0;
                    continue;
                }

                o._healAccum[pid] = (o._healAccum[pid] || 0) + dt;
                var healPerSecond = typeof o.healPerSecond === 'number' ? o.healPerSecond : 0.5;
                if (o._healAccum[pid] >= 1000) {
                    var ticks = Math.floor(o._healAccum[pid] / 1000);
                    o._healAccum[pid] -= ticks * 1000;
                    player.hp = Math.min(maxHp, player.hp + healPerSecond * ticks);
                    G.spawnParticles(player.x, player.y - player.currentH * 0.7, '#66ffee', 4, 2);
                    G.spawnParticles(player.x, player.y - player.currentH * 0.7, '#aaffff', 3, 1.5);
                    G.initAudio();
                    G.playHealSpring();
                } else if (Math.random() < 0.05) {
                    G.spawnParticles(
                        o.x + 6 + Math.random() * (o.w - 12),
                        o.y + 2,
                        '#44ffee',
                        1,
                        1
                    );
                }
            } else if (o.type === 'crumbling') {
                if (o._crumbleState && o._crumbleState !== 'stable') continue;
                if (standingOnTop) {
                    o._crumbleState = 'shaking';
                    o._crumbleTimer = o.shakeDuration || 450;
                    G.spawnParticles(o.x + o.w / 2, o.y + 2, '#bbbbbb', 6, 2);
                }
            }
        }

        // Check rain drops from clouds
        for (var ri = 0; ri < obs.length; ri++) {
            var cloud = obs[ri];
            if (cloud.type !== 'cloud' || !cloud._raindrops) continue;
            var px = player.x - player.w / 2;
            var py = player.y - player.currentH;
            var pw = player.w;
            var ph = player.currentH;
            for (var rj = cloud._raindrops.length - 1; rj >= 0; rj--) {
                var drop = cloud._raindrops[rj];
                if (drop.x > px && drop.x < px + pw && drop.y > py && drop.y < py + ph) {
                    player.slowTimer = 1000; // 1s slow
                    cloud._raindrops.splice(rj, 1);
                    // Splash effect on player
                    G.spawnParticles(drop.x, drop.y, '#6688cc', 4, 2);
                    G.spawnParticles(drop.x, drop.y, '#88aaff', 2, 1);
                    if (Math.random() < 0.45) G.playRain();
                }
            }
        }
    };

    // Update obstacles each frame
    G.updateObstacles = function (dt) {
        var map = G.getCurrentMap();
        if (!map.obstacles) return;
        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o._cooldown && o._cooldown > 0) o._cooldown -= dt;
            if (o._flashTimer && o._flashTimer > 0) o._flashTimer -= dt;

            // Cage knockback cooldowns
            if (o.type === 'cage' && o._cageCd) {
                for (var k in o._cageCd) {
                    if (o._cageCd[k] > 0) o._cageCd[k] -= dt;
                }
            }

            // Gear damage cooldowns
            if (o.type === 'gear' && o._gearCd) {
                for (var k in o._gearCd) {
                    if (o._gearCd[k] > 0) o._gearCd[k] -= dt;
                }
            }

            if (o.type === 'crumbling') {
                if (!o._crumbleState) o._crumbleState = 'stable';

                if (o._crumbleState === 'shaking') {
                    o._crumbleTimer -= dt;
                    o._crumbleShakeX = (Math.random() - 0.5) * 3;
                    if (o._crumbleTimer <= 0) {
                        o._crumbleState = 'gone';
                        o._crumbleTimer = 3000;
                        o._crumbleShakeX = 0;
                        G.spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#999999', 7, 2.5);
                        G.spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#666666', 5, 2);
                    }
                } else if (o._crumbleState === 'gone') {
                    o._crumbleTimer -= dt;
                    if (o._crumbleTimer <= 0) {
                        o._crumbleState = 'stable';
                        o._crumbleTimer = 0;
                        G.spawnParticles(o.x + o.w / 2, o.y + o.h / 2, '#aaccff', 5, 2);
                    }
                }
            }

            // Cloud movement + rain spawning
            if (o.type === 'cloud') {
                if (o._startX === undefined) o._startX = o.x;
                if (!o._cloudDir) o._cloudDir = 1;
                o.x += o._cloudDir * 0.4;
                var range = o.moveRange || 200;
                if (o.x >= o._startX + range) o._cloudDir = -1;
                if (o.x <= o._startX) o._cloudDir = 1;

                if (!o._raindrops) o._raindrops = [];
                if (!o._rainTimer) o._rainTimer = 0;
                o._rainTimer += dt;
                if (o._rainTimer >= 200) {
                    o._rainTimer -= 200;
                    o._raindrops.push({
                        x: o.x + Math.random() * o.w,
                        y: o.y + o.h,
                        vy: 3 + Math.random() * 1.5
                    });
                }
                for (var j = o._raindrops.length - 1; j >= 0; j--) {
                    var drop = o._raindrops[j];
                    var prevY = drop.y;
                    drop.y += drop.vy;

                    var hitPlatform = false;
                    for (var pi = 0; pi < map.platforms.length; pi++) {
                        var p = map.platforms[pi];
                        var xInside = drop.x >= p.x && drop.x <= p.x + p.w;
                        if (!xInside) continue;
                        if ((prevY <= p.y && drop.y >= p.y) || (drop.y >= p.y && drop.y <= p.y + p.h)) {
                            G.spawnParticles(drop.x, p.y, '#6f91db', 2, 1.2);
                            hitPlatform = true;
                            break;
                        }
                    }

                    if (hitPlatform || drop.y > G.GROUND_Y) {
                        o._raindrops.splice(j, 1);
                    }
                }
            }
        }
    };

    function playerTouching(player, obs) {
        var px = player.x - player.w / 2;
        var py = player.y - player.currentH;
        var pw = player.w;
        var ph = player.currentH;
        return px < obs.x + obs.w &&
            px + pw > obs.x &&
            py < obs.y + obs.h &&
            py + ph > obs.y;
    }

    function playerStandingOnTop(player, obs) {
        if (!player.onGround) return false;
        if (Math.abs(player.y - obs.y) > 3) return false;
        return player.x + player.w / 2 > obs.x + 4 &&
            player.x - player.w / 2 < obs.x + obs.w - 4;
    }

    // ─── Drawing ─────────────────────────────────────────────────
    G.drawObstacles = function () {
        var map = G.getCurrentMap();
        if (!map.obstacles) return;
        animTimer += 16.67;

        for (var i = 0; i < map.obstacles.length; i++) {
            var o = map.obstacles[i];
            if (o.type === 'jumpboost') drawJumpBoost(o);
            else if (o.type === 'teleport') drawTeleport(o);
            else if (o.type === 'lava') drawLava(o);
            else if (o.type === 'cage') drawCage(o);
            else if (o.type === 'ladder') drawLadder(o);
            else if (o.type === 'cloud') drawCloud(o);
            else if (o.type === 'gear') drawGear(o);
            else if (o.type === 'regen') drawRegenPlatform(o);
            else if (o.type === 'crumbling') drawCrumblingBlock(o);
        }
    };

    // Preview icons for MAP_PREVIEW screen
    G.getObstacleLabel = function (type) {
        if (type === 'jumpboost') return { name: 'JUMP BOOST', color: '#44ff88' };
        if (type === 'teleport') return { name: 'TELEPORT', color: '#bb66ff' };
        if (type === 'lava') return { name: 'LAVA', color: '#ff4422' };
        if (type === 'cage') return { name: 'CAGE', color: '#aaaaaa' };
        if (type === 'ladder') return { name: 'LADDER', color: '#A07818' };
        if (type === 'cloud') return { name: 'RAIN CLOUD', color: '#6688cc' };
        if (type === 'gear') return { name: 'GEAR', color: '#ff8844' };
        if (type === 'regen') return { name: 'REGEN PLATFORM', color: '#44ffee' };
        if (type === 'crumbling') return { name: 'CRUMBLING BLOCK', color: '#bbbbbb' };
        if (type === 'wind') return { name: 'WIND', color: '#9cc9ff' };
        if (type === 'tunnel') return { name: 'TUNNEL BLACKOUT', color: '#77839a' };
        if (type === 'books') return { name: 'FLYING BOOKS', color: '#d9aa71' };
        if (type === 'silence') return { name: 'SHHHHH', color: '#f3ddaa' };
        return { name: '???', color: '#999' };
    };

    // ── Jump Boost Pad ───────────────────────────────────────────
    function drawJumpBoost(o) {
        var flash = o._flashTimer && o._flashTimer > 0 ? 1 : 0;
        var pulse = Math.sin(animTimer * 0.006) * 0.3 + 0.7;

        // Glow
        ctx.fillStyle = 'rgba(68,255,136,' + (0.08 + pulse * 0.06 + flash * 0.15) + ')';
        ctx.beginPath();
        ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Base pad
        ctx.fillStyle = '#226644';
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = '#33aa66';
        ctx.fillRect(o.x + 2, o.y + 1, o.w - 4, o.h - 3);

        // Surface highlight
        ctx.fillStyle = 'rgba(68,255,136,' + (0.4 + pulse * 0.3) + ')';
        ctx.fillRect(o.x + 4, o.y + 1, o.w - 8, 3);

        // Up arrows
        ctx.fillStyle = 'rgba(68,255,136,' + (0.5 + pulse * 0.4) + ')';
        var cx = o.x + o.w / 2;
        var arrowY = o.y - 6 - Math.sin(animTimer * 0.008) * 4;
        ctx.beginPath();
        ctx.moveTo(cx - 6, arrowY + 6);
        ctx.lineTo(cx, arrowY);
        ctx.lineTo(cx + 6, arrowY + 6);
        ctx.closePath();
        ctx.fill();
    }

    // ── Teleport Portal ──────────────────────────────────────────
    function drawTeleport(o) {
        var flash = o._flashTimer && o._flashTimer > 0 ? 1 : 0;
        var pulse = Math.sin(animTimer * 0.005 + o.x * 0.1) * 0.3 + 0.7;
        var cx = o.x + o.w / 2;
        var cy = o.y + o.h / 2;
        var r = Math.min(o.w, o.h) / 2;

        // Outer glow
        ctx.fillStyle = 'rgba(187,102,255,' + (0.06 + pulse * 0.06 + flash * 0.12) + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
        ctx.fill();

        // Spinning ring
        ctx.strokeStyle = 'rgba(187,102,255,' + (0.5 + pulse * 0.3) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, animTimer * 0.01, animTimer * 0.01 + Math.PI * 1.5);
        ctx.stroke();

        // Inner portal fill
        ctx.fillStyle = 'rgba(100,30,180,' + (0.4 + pulse * 0.2) + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Center sparkle
        ctx.fillStyle = 'rgba(220,180,255,' + (0.3 + pulse * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cooldown visual — arc + seconds remaining
        if (o._cooldown && o._cooldown > 0) {
            var cdPct = o._cooldown / 3000;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath();
            ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,100,100,0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, r + 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cdPct);
            ctx.stroke();
            var secs = Math.ceil(o._cooldown / 1000);
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ff6666';
            ctx.fillText(secs + 's', cx, cy);
            ctx.textAlign = 'start';
            ctx.textBaseline = 'alphabetic';
        }
    }

    // ── Lava Zone ────────────────────────────────────────────────
    function drawLava(o) {
        ctx.fillStyle = '#441100';
        ctx.fillRect(o.x, o.y, o.w, o.h);

        var grad = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y + o.h);
        var shift = Math.sin(animTimer * 0.003) * 0.3;
        grad.addColorStop(0, '#cc3300');
        grad.addColorStop(0.3 + shift * 0.2, '#ff6600');
        grad.addColorStop(0.6, '#ff4400');
        grad.addColorStop(1, '#cc2200');
        ctx.fillStyle = grad;
        ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);

        var hotPulse = Math.sin(animTimer * 0.007) * 0.3 + 0.5;
        ctx.fillStyle = 'rgba(255,200,50,' + hotPulse + ')';
        ctx.fillRect(o.x + o.w * 0.2, o.y + 2, o.w * 0.15, o.h * 0.5);
        ctx.fillRect(o.x + o.w * 0.6, o.y + 3, o.w * 0.2, o.h * 0.4);

        for (var i = 0; i < 3; i++) {
            var bx = o.x + 8 + ((animTimer * 0.02 + i * 37) % (o.w - 16));
            var by = o.y + 2 + Math.sin(animTimer * 0.008 + i * 2.5) * 3;
            var bs = 2 + Math.sin(animTimer * 0.01 + i * 1.7) * 1;
            ctx.fillStyle = 'rgba(255,150,30,0.6)';
            ctx.beginPath();
            ctx.arc(bx, by, bs, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,100,20,0.15)';
        ctx.fillRect(o.x - 3, o.y - 3, o.w + 6, o.h + 6);

        ctx.fillStyle = 'rgba(255,220,50,0.4)';
        ctx.fillRect(o.x, o.y, o.w, 2);
    }

    // ── Cage ─────────────────────────────────────────────────────
    function drawCage(o) {
        var pulse = Math.sin(animTimer * 0.004) * 0.15 + 0.85;
        var flash = o._flashTimer && o._flashTimer > 0 ? 1 : 0;

        // Flash glow on hit
        if (flash) {
            ctx.fillStyle = 'rgba(200,200,200,0.2)';
            ctx.beginPath();
            ctx.arc(o.x + o.w / 2, o.y + o.h / 2, o.w * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        // Base frame (dark iron)
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(o.x, o.y, o.w, 4);               // Top bar
        ctx.fillRect(o.x, o.y + o.h - 4, o.w, 4);     // Bottom bar
        ctx.fillRect(o.x, o.y, 4, o.h);                // Left bar
        ctx.fillRect(o.x + o.w - 4, o.y, 4, o.h);     // Right bar

        // Corner rivets
        ctx.fillStyle = '#666';
        ctx.fillRect(o.x + 1, o.y + 1, 3, 3);
        ctx.fillRect(o.x + o.w - 4, o.y + 1, 3, 3);
        ctx.fillRect(o.x + 1, o.y + o.h - 4, 3, 3);
        ctx.fillRect(o.x + o.w - 4, o.y + o.h - 4, 3, 3);

        // Vertical bars
        ctx.strokeStyle = 'rgba(160,165,175,' + pulse + ')';
        ctx.lineWidth = 2;
        var barCount = Math.floor(o.w / 10);
        for (var i = 1; i < barCount; i++) {
            var bx = o.x + i * (o.w / barCount);
            ctx.beginPath();
            ctx.moveTo(bx, o.y + 4);
            ctx.lineTo(bx, o.y + o.h - 4);
            ctx.stroke();
        }

        // Metallic highlight on top bar
        ctx.fillStyle = 'rgba(200,205,215,' + (0.25 + pulse * 0.15) + ')';
        ctx.fillRect(o.x + 5, o.y + 1, o.w - 10, 1);

        // Warning: knockback arrows pointing outward
        var cx = o.x + o.w / 2;
        var cy = o.y + o.h / 2;
        ctx.fillStyle = 'rgba(255,180,50,' + (0.3 + Math.sin(animTimer * 0.008) * 0.2) + ')';
        // Left arrow
        ctx.beginPath();
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx - 3, cy - 5);
        ctx.lineTo(cx - 3, cy + 5);
        ctx.fill();
        // Right arrow
        ctx.beginPath();
        ctx.moveTo(cx + 8, cy);
        ctx.lineTo(cx + 3, cy - 5);
        ctx.lineTo(cx + 3, cy + 5);
        ctx.fill();
    }

    // ── Ladder ───────────────────────────────────────────────────
    function drawLadder(o) {
        // Side rails
        ctx.fillStyle = '#6B4E1B';
        ctx.fillRect(o.x, o.y, 5, o.h);
        ctx.fillRect(o.x + o.w - 5, o.y, 5, o.h);

        // Rail inner edge
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(o.x + 1, o.y, 2, o.h);
        ctx.fillRect(o.x + o.w - 3, o.y, 2, o.h);

        // Rungs
        var rungSpacing = 18;
        var rungCount = Math.floor(o.h / rungSpacing);
        for (var i = 0; i < rungCount; i++) {
            var ry = o.y + 8 + i * rungSpacing;
            ctx.fillStyle = '#A07818';
            ctx.fillRect(o.x + 5, ry, o.w - 10, 4);
            // Rung highlight
            ctx.fillStyle = 'rgba(200,170,80,0.3)';
            ctx.fillRect(o.x + 6, ry, o.w - 12, 1);
        }

        // Nail dots on rungs
        ctx.fillStyle = '#555';
        for (var i = 0; i < rungCount; i++) {
            var ry = o.y + 9 + i * rungSpacing;
            ctx.fillRect(o.x + 5, ry, 2, 2);
            ctx.fillRect(o.x + o.w - 7, ry, 2, 2);
        }

        // Climb indicator arrows (subtle)
        var arrowAlpha = Math.sin(animTimer * 0.006) * 0.15 + 0.2;
        ctx.fillStyle = 'rgba(200,180,100,' + arrowAlpha + ')';
        var acx = o.x + o.w / 2;
        var arrowY = o.y - 4 - Math.sin(animTimer * 0.008) * 3;
        ctx.beginPath();
        ctx.moveTo(acx - 5, arrowY + 5);
        ctx.lineTo(acx, arrowY);
        ctx.lineTo(acx + 5, arrowY + 5);
        ctx.closePath();
        ctx.fill();
    }

    // ── Regeneration Platform ───────────────────────────────────
    function drawRegenPlatform(o) {
        var pulse = Math.sin(animTimer * 0.007 + o.x * 0.03) * 0.5 + 0.5;
        var glowA = 0.08 + pulse * 0.15;

        // Aura
        ctx.fillStyle = 'rgba(68,255,238,' + glowA + ')';
        ctx.fillRect(o.x - 6, o.y - 6, o.w + 12, o.h + 12);

        // Platform body
        ctx.fillStyle = '#1f3c4a';
        ctx.fillRect(o.x, o.y, o.w, o.h);
        var rg = ctx.createLinearGradient(o.x, o.y, o.x + o.w, o.y);
        rg.addColorStop(0, 'rgba(55,250,255,0.28)');
        rg.addColorStop(0.5, 'rgba(110,255,240,0.45)');
        rg.addColorStop(1, 'rgba(55,250,255,0.28)');
        ctx.fillStyle = rg;
        ctx.fillRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);

        // Animated scan lines
        var scanX = o.x + ((animTimer * 0.18) % (o.w + 18)) - 12;
        ctx.fillStyle = 'rgba(210,255,255,0.22)';
        ctx.fillRect(scanX, o.y + 1, 12, o.h - 2);

        // Plus symbol
        var cx = o.x + o.w / 2;
        var cy = o.y + o.h / 2;
        ctx.fillStyle = 'rgba(230,255,255,' + (0.5 + pulse * 0.4) + ')';
        ctx.fillRect(cx - 8, cy - 1, 16, 2);
        ctx.fillRect(cx - 1, cy - 8, 2, 16);
    }

    // ── Crumbling Block ─────────────────────────────────────────
    function drawCrumblingBlock(o) {
        if (o._crumbleState === 'gone') {
            // Faint respawn shimmer while inactive
            var respawnPct = 1 - Math.max(0, o._crumbleTimer || 0) / 3000;
            ctx.strokeStyle = 'rgba(160,190,230,' + (0.08 + respawnPct * 0.25) + ')';
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(o.x + 0.5, o.y + 0.5, o.w - 1, o.h - 1);
            ctx.setLineDash([]);
            return;
        }

        var shakeX = o._crumbleState === 'shaking' ? (o._crumbleShakeX || 0) : 0;
        var x = o.x + shakeX;
        var pulse = Math.sin(animTimer * 0.01 + o.x * 0.02) * 0.5 + 0.5;

        ctx.fillStyle = '#4e4e55';
        ctx.fillRect(x, o.y, o.w, o.h);
        ctx.fillStyle = '#676771';
        ctx.fillRect(x + 1, o.y + 1, o.w - 2, o.h - 2);

        // Cracks
        ctx.strokeStyle = 'rgba(35,35,40,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 8, o.y + 2);
        ctx.lineTo(x + 14, o.y + o.h - 3);
        ctx.lineTo(x + 22, o.y + 4);
        ctx.moveTo(x + o.w * 0.55, o.y + 1);
        ctx.lineTo(x + o.w * 0.48, o.y + o.h - 2);
        ctx.lineTo(x + o.w * 0.66, o.y + o.h - 4);
        ctx.moveTo(x + o.w - 12, o.y + 2);
        ctx.lineTo(x + o.w - 20, o.y + o.h - 3);
        ctx.stroke();

        if (o._crumbleState === 'shaking') {
            ctx.fillStyle = 'rgba(255, 180, 80, ' + (0.12 + pulse * 0.18) + ')';
            ctx.fillRect(x - 2, o.y - 2, o.w + 4, o.h + 4);
        }
    }

    // ── Rain Cloud ───────────────────────────────────────────────
    function drawCloud(o) {
        var cx = o.x + o.w / 2;
        var cy = o.y + o.h / 2;
        var pulse = Math.sin(animTimer * 0.003) * 0.05 + 0.95;

        // Cloud shadow below
        ctx.fillStyle = 'rgba(50,60,80,0.08)';
        ctx.beginPath();
        ctx.ellipse(cx, G.GROUND_Y - 2, o.w * 0.6, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main cloud body — overlapping circles
        ctx.fillStyle = 'rgba(140,150,170,' + (0.5 * pulse) + ')';
        ctx.beginPath();
        ctx.arc(cx - o.w * 0.25, cy + 2, o.h * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + o.w * 0.25, cy + 2, o.h * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(160,170,190,' + (0.55 * pulse) + ')';
        ctx.beginPath();
        ctx.arc(cx, cy - o.h * 0.15, o.h * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - o.w * 0.12, cy - o.h * 0.05, o.h * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + o.w * 0.12, cy + o.h * 0.05, o.h * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Dark underside
        ctx.fillStyle = 'rgba(80,90,120,' + (0.35 * pulse) + ')';
        ctx.beginPath();
        ctx.arc(cx - o.w * 0.15, cy + o.h * 0.2, o.h * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + o.w * 0.15, cy + o.h * 0.25, o.h * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Rain drops
        if (o._raindrops) {
            for (var i = 0; i < o._raindrops.length; i++) {
                var d = o._raindrops[i];
                var dropAlpha = 0.4 + Math.sin(d.y * 0.05) * 0.2;
                ctx.fillStyle = 'rgba(100,140,220,' + dropAlpha + ')';
                ctx.fillRect(d.x, d.y, 1.5, 7);
                // Tiny highlight
                ctx.fillStyle = 'rgba(150,180,255,' + (dropAlpha * 0.5) + ')';
                ctx.fillRect(d.x, d.y, 1, 3);
            }
        }
    }

    // ── Spinning Gear ────────────────────────────────────────────
    function drawGear(o) {
        var cx = o.x + o.w / 2;
        var cy = o.y + o.h / 2;
        var r = Math.min(o.w, o.h) / 2;
        var rotation = animTimer * 0.004;

        // Danger glow
        var glowPulse = Math.sin(animTimer * 0.005) * 0.08 + 0.12;
        ctx.fillStyle = 'rgba(255,100,30,' + glowPulse + ')';
        ctx.beginPath();
        ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Gear teeth
        var teeth = 8;
        ctx.fillStyle = '#606060';
        for (var i = 0; i < teeth; i++) {
            var angle = (i / teeth) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            ctx.fillRect(-4, r - 5, 8, 10);
            ctx.restore();
        }

        // Outer ring
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r - 1, 0, Math.PI * 2);
        ctx.stroke();

        // Main body
        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
        ctx.fill();

        // Inner groove ring
        ctx.strokeStyle = '#3a3a3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        // Spokes
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        for (var i = 0; i < 4; i++) {
            var sa = (i / 4) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(sa) * r * 0.25, Math.sin(sa) * r * 0.25);
            ctx.lineTo(Math.cos(sa) * r * 0.55, Math.sin(sa) * r * 0.55);
            ctx.stroke();
        }

        // Center axle
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Metallic highlight
        ctx.fillStyle = 'rgba(200,200,200,0.12)';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Spark particles near teeth (decorative)
        if (Math.random() < 0.04) {
            var sparkAngle = Math.random() * Math.PI * 2;
            G.spawnParticles(
                cx + Math.cos(sparkAngle) * (r + 3),
                cy + Math.sin(sparkAngle) * (r + 3),
                '#ffaa44', 1, 1.5
            );
        }
    }
})(window.Game);
