// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Combat Logic
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    G.hitstopTimer = 0;

    // Pending parry counter-attacks (replaces risky setTimeout)
    var pendingCounters = [];

    G.resetHitstop = function () {
        G.hitstopTimer = 0;
        pendingCounters.length = 0;
    };

    // ─── Invincibility Check ──────────────────────────────────
    function isInvincible(player) {
        return player.phalanxInvincible ||
               player.ghostMode ||
               (player.weapon && player.weapon.id === 'shield' && player.shieldDashing && player.attackPhase === 'active');
    }

    function scaledDamage(attacker, baseDamage) {
        if (typeof G.getDamageAmount === 'function') return G.getDamageAmount(attacker, baseDamage);
        return baseDamage;
    }

    G.checkCombat = function (p1, p2, dt) {
        // Process pending parry counters
        for (var i = pendingCounters.length - 1; i >= 0; i--) {
            var pc = pendingCounters[i];
            pc.timer -= dt;
            if (pc.timer <= 0) {
                if (pc.target.hp > 0 && !isInvincible(pc.target)) {
                    pc.target.takeDamage(scaledDamage(pc.source, G.PARRY_COUNTER_DAMAGE), pc.attackerX);
                }
                pendingCounters.splice(i, 1);
            }
        }

        // Sword reflects bullets
        checkSwordReflect(p1, p2);
        checkSwordReflect(p2, p1);

        // Bullet-bullet collision
        checkBulletCollision(p1, p2);

        checkHit(p1, p2);
        checkHit(p2, p1);

        // Shield dash collision
        checkShieldDash(p1, p2);
        checkShieldDash(p2, p1);

        // Hammer spread wave
        checkHammerSpread(p1, p2);
        checkHammerSpread(p2, p1);

        // Melee hits vs clones
        checkMeleeVsClone(p1, p2);
        checkMeleeVsClone(p2, p1);

        // Melee hits vs wolves
        checkMeleeVsWolves(p1, p2);
        checkMeleeVsWolves(p2, p1);

        // Projectile collision
        checkProjectileHits(p1, p2);
        checkProjectileHits(p2, p1);

        // Projectiles vs clones
        checkProjectileVsClone(p1, p2);
        checkProjectileVsClone(p2, p1);

        // Projectiles vs wolves
        checkProjectileVsWolves(p1, p2);
        checkProjectileVsWolves(p2, p1);
    };

    // Melee attack can reflect enemy bullets — generous zone in front of player
    function checkSwordReflect(swordPlayer, gunPlayer) {
        // Reflect during any attack phase (windup, active, recovery)
        if (!swordPlayer.attackPhase) return;
        // Only selected melee weapons can reflect (Strong Shield never reflects bullets)
        if (swordPlayer.weapon &&
            (swordPlayer.weapon.id === 'gun' ||
             swordPlayer.weapon.id === 'sniper' ||
             swordPlayer.weapon.id === 'shield' ||
             swordPlayer.weapon.id === 'black')) return;

        // Large reflect zone in front of the player
        var zoneW = 55;
        var zoneH = swordPlayer.currentH + 10;
        var zoneX = swordPlayer.facing === 1 ? swordPlayer.x : swordPlayer.x - zoneW;
        var zoneY = swordPlayer.y - swordPlayer.currentH - 5;

        for (var i = gunPlayer.projectiles.length - 1; i >= 0; i--) {
            var b = gunPlayer.projectiles[i];
            if (
                b.x > zoneX &&
                b.x < zoneX + zoneW &&
                b.y > zoneY &&
                b.y < zoneY + zoneH
            ) {
                // Reflect! Reverse direction, give ownership to swordPlayer
                b.vx = -b.vx;
                swordPlayer.projectiles.push(b);
                gunPlayer.projectiles.splice(i, 1);
                G.playClang();
                G.spawnParticles(b.x, b.y, '#ffdd44', 10, 5);
                G.fxTriggerShake(4, 150);
            }
        }
    }

    // Opposing bullets destroy each other
    function checkBulletCollision(p1, p2) {
        for (var i = p1.projectiles.length - 1; i >= 0; i--) {
            var a = p1.projectiles[i];
            for (var j = p2.projectiles.length - 1; j >= 0; j--) {
                var b = p2.projectiles[j];
                var dx = a.x - b.x;
                var dy = a.y - b.y;
                if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
                    // Collision — both destroyed
                    var mx = (a.x + b.x) / 2;
                    var my = (a.y + b.y) / 2;
                    G.playClang();
                    G.spawnParticles(mx, my, '#ffaa33', 8, 4);
                    G.spawnParticles(mx, my, '#fff', 4, 2);
                    p1.projectiles.splice(i, 1);
                    p2.projectiles.splice(j, 1);
                    break; // bullet i is gone, move to next
                }
            }
        }
    }

    function applyFrostEffects(target) {
        target.slowTimer = Math.max(target.slowTimer, 800);
        target.frostCounter = Math.min(4, target.frostCounter + 1);
        target.frostCounterTimer = 3000;
        G.playFrostHit();
        G.spawnParticles(target.x, target.y - target.currentH / 2, '#88ddff', 6, 3);
        if (target.frostCounter >= 4) {
            target.frozenTimer = 1000;
            target.frostCounter = 0;
            target.frostCounterTimer = 0;
            G.playFreeze();
            G.spawnParticles(target.x, target.y - target.currentH / 2, '#aaeeff', 15, 5);
            G.spawnParticles(target.x, target.y - target.currentH / 2, '#ffffff', 8, 4);
            G.fxTriggerShake(5, 200);
        }
    }

    function checkProjectileHits(shooter, target) {
        if (isInvincible(target)) {
            return;
        }
        var hurt = target.hurtbox;
        for (var i = shooter.projectiles.length - 1; i >= 0; i--) {
            var b = shooter.projectiles[i];
            if (
                b.x > hurt.x &&
                b.x < hurt.x + hurt.w &&
                b.y > hurt.y &&
                b.y < hurt.y + hurt.h
            ) {
                // Crouch dodge — non-sniper bullets fly high enough to miss crouchers
                if (target.crouching && !b.isSniper) {
                    continue; // bullet sails overhead
                }

                target.takeDamage(scaledDamage(shooter, b.damage), shooter.x);
                G.playProjectileImpact(b, shooter.weapon ? shooter.weapon.id : null);
                if (b.isFrost) {
                    applyFrostEffects(target);
                }
                G.onPlayerHit(shooter, target);
                G.spawnParticles(b.x, b.y, b.isSniper ? '#ff4444' : '#ffcc33', 6, 3);
                G.hitstopTimer = b.isSniper ? G.HITSTOP_DURATION * 1.5 : G.HITSTOP_DURATION * 0.5;
                shooter.projectiles.splice(i, 1);
            }
        }
    }

    // Melee attacks can hit opponent's clone
    function checkMeleeVsClone(attacker, cloneOwner) {
        if (attacker.attackPhase !== 'active' || attacker.hasHit) return;
        var c = cloneOwner.clone;
        if (!c || c.hp <= 0) return;
        var sword = attacker.getSwordHitbox();
        if (!sword) return;
        var cx = c.x - 18, cy = c.y - 56, cw = 36, ch = 56;
        if (sword.x < cx + cw && sword.x + sword.w > cx &&
            sword.y < cy + ch && sword.y + sword.h > cy) {
            G.damageClone(cloneOwner, attacker.weaponDamage);
            attacker.hasHit = true;
            G.spawnParticles(c.x, c.y - 28, '#88ccff', 8, 4);
        }
    }

    // Projectiles can hit opponent's clone
    function checkProjectileVsClone(shooter, cloneOwner) {
        var c = cloneOwner.clone;
        if (!c || c.hp <= 0) return;
        var cx = c.x - 18, cy = c.y - 56, cw = 36, ch = 56;
        for (var i = shooter.projectiles.length - 1; i >= 0; i--) {
            var b = shooter.projectiles[i];
            if (b.x > cx && b.x < cx + cw && b.y > cy && b.y < cy + ch) {
                G.damageClone(cloneOwner, b.damage);
                G.spawnParticles(b.x, b.y, '#88ccff', 6, 3);
                shooter.projectiles.splice(i, 1);
            }
        }
    }

    // ─── Shield Dash Hit Detection ──────────────────────────
    function checkShieldDash(dasher, target) {
        if (!dasher.weapon || dasher.weapon.id !== 'shield') return;
        if (dasher.attackPhase !== 'active' || dasher.hasHit || !dasher.shieldDashing) return;
        if (isInvincible(target)) return;
            var dh = dasher.hurtbox;
            var th = target.hurtbox;
            if (dh.x < th.x + th.w && dh.x + dh.w > th.x && dh.y < th.y + th.h && dh.y + dh.h > th.y) {
                dasher.hasHit = true;
                target.takeDamage(scaledDamage(dasher, 1), dasher.x);
                G.playShieldBash();
                G.onPlayerHit(dasher, target);
                G.hitstopTimer = G.HITSTOP_DURATION;
                G.spawnParticles((dasher.x + target.x) / 2, target.y - target.currentH / 2, '#aabbcc', 10, 5);
                G.fxTriggerShake(6, 200);
        }
    }

    // ─── Hammer Spread Shockwave ───────────────────────────────
    function checkHammerSpread(attacker, defender) {
        if (!attacker.weapon || attacker.weapon.id !== 'hammer') return;
        if (!attacker.hammerWavePending || attacker.attackPhase !== 'active') return;
        attacker.hammerWavePending = false;
        if (!attacker.onGround) return;

        var spreadRadius = 170;
        var dist = Math.abs(attacker.x - defender.x);

        // Ground crack visual regardless of hit.
        G.spawnParticles(attacker.x - 36, attacker.y, 'rgba(150,130,100,0.6)', 8, 3);
        G.spawnParticles(attacker.x + 36, attacker.y, 'rgba(150,130,100,0.6)', 8, 3);
        G.spawnParticles(attacker.x, attacker.y, '#888', 10, 4);
        G.fxTriggerShake(8, 260);
        G.playHammerImpact();
        G.playHammerSpreadCast();

        if (dist > spreadRadius || isInvincible(defender) || attacker.hasHit) return;

        var falloff = 1 - (dist / spreadRadius);
        var kbX = (defender.x - attacker.x) > 0 ? (7.6 + falloff * 9.6) : (-7.6 - falloff * 9.6);
        var kbY = -6.2 - falloff * 5.8;
        defender.applyKnockback(kbX, kbY, 320);
        G.playHammerWaveHit();
        G.playHammerSpreadDamage();
        G.spawnParticles(defender.x, defender.y - defender.currentH * 0.35, '#aa8866', 12, 5);
    }

    // ─── Melee vs Wolves ──────────────────────────────────────
    function checkMeleeVsWolves(attacker, wolfOwner) {
        if (attacker.attackPhase !== 'active' || attacker.hasHit) return;
        if (!wolfOwner.wolves || wolfOwner.wolves.length === 0) return;
        var sword = attacker.getSwordHitbox();
        if (!sword) return;
        for (var i = wolfOwner.wolves.length - 1; i >= 0; i--) {
            var w = wolfOwner.wolves[i];
            var wx = w.x - 12, wy = w.y - 20, ww = 24, wh = 20;
            if (sword.x < wx + ww && sword.x + sword.w > wx &&
                sword.y < wy + wh && sword.y + sword.h > wy) {
                w.hp -= attacker.weaponDamage;
                attacker.hasHit = true;
                G.spawnParticles(w.x, w.y - 10, '#aa8844', 8, 4);
                G.playHit();
                if (w.hp <= 0) {
                    wolfOwner.wolves.splice(i, 1);
                }
                break;
            }
        }
    }

    // ─── Projectiles vs Wolves ────────────────────────────────
    function checkProjectileVsWolves(shooter, wolfOwner) {
        if (!wolfOwner.wolves || wolfOwner.wolves.length === 0) return;
        for (var i = wolfOwner.wolves.length - 1; i >= 0; i--) {
            var w = wolfOwner.wolves[i];
            var wx = w.x - 12, wy = w.y - 20, ww = 24, wh = 20;
            for (var j = shooter.projectiles.length - 1; j >= 0; j--) {
                var b = shooter.projectiles[j];
                if (b.x > wx && b.x < wx + ww && b.y > wy && b.y < wy + wh) {
                    w.hp -= b.damage;
                    G.spawnParticles(w.x, w.y - 10, '#aa8844', 6, 3);
                    shooter.projectiles.splice(j, 1);
                    if (w.hp <= 0) {
                        wolfOwner.wolves.splice(i, 1);
                    }
                    break;
                }
            }
        }
    }

    function checkHit(attacker, defender) {
        if (attacker.attackPhase !== 'active') return;
        if (attacker.hasHit) return;

        var sword = attacker.getSwordHitbox();
        if (!sword) return;

        // Invincibility check
        if (isInvincible(defender)) return;

        var hurt = defender.hurtbox;

        if (
            sword.x < hurt.x + hurt.w &&
            sword.x + sword.w > hurt.x &&
            sword.y < hurt.y + hurt.h &&
            sword.y + sword.h > hurt.y
        ) {
            attacker.hasHit = true;

            // Shield frontal block
            if (defender.weapon && defender.weapon.id === 'shield' && !defender.attackPhase) {
                var attackFromFront = (attacker.x > defender.x && defender.facing === 1) ||
                                     (attacker.x < defender.x && defender.facing === -1);
                if (attackFromFront) {
                    G.playClang();
                    G.spawnParticles((attacker.x + defender.x) / 2, defender.y - defender.currentH / 2, '#aabbcc', 10, 4);
                    attacker.startStagger();
                    G.fxTriggerShake(4, 150);
                    return;
                }
            }

            // Parry check
            var bladeActiveParry = defender.weapon && defender.weapon.id === 'blade' && defender.attackPhase === 'active';
            if (defender.parryWindowTimer > 0 && (defender.attackPhase === 'windup' || bladeActiveParry)) {
                defender.attackPhase = null;
                defender.state = 'parry_success';
                defender.parrySuccessTimer = 300; // 300ms freeze then back to idle
                defender.parryWindowTimer = 0;

                attacker.startStagger();
                G.fxTriggerParryFlash();
                G.fxTriggerShake(8, 250);
                G.playClang();
                G.playParry();
                G.spawnParticles(
                    (attacker.x + defender.x) / 2,
                    (attacker.y + defender.y) / 2 - 30,
                    '#ffdd44', 15, 6
                );
                G.spawnBloodBurst(
                    attacker.x + (attacker.facing * 10),
                    attacker.y - attacker.currentH * 0.5,
                    24
                );

                // Queue counter damage (200ms delay, handled in game loop)
                pendingCounters.push({
                    target: attacker,
                    attackerX: defender.x,
                    source: defender,
                    timer: 200
                });

                G.hitstopTimer = G.HITSTOP_DURATION;
                return;
            }

            // Crouch dodge
            if (defender.crouching && attacker.attackType === 'ground') {
                G.spawnParticles(defender.x, defender.y - defender.currentH, 'rgba(255,255,255,0.5)', 4, 2);
                return;
            }

            // Blade one-shot super
            if (attacker.bladeOneShot && attacker.superActive) {
                var defenderMaxHp = typeof G.getPlayerMaxHP === 'function' ? G.getPlayerMaxHP(defender) : G.HP_PER_ROUND;
                defender.takeDamage(defenderMaxHp, attacker.x);
                G.spawnParticles(defender.x, defender.y - defender.currentH / 2, '#ff2222', 20, 7);
                G.spawnParticles(defender.x, defender.y - defender.currentH / 2, '#fff', 10, 5);
                G.fxTriggerShake(10, 300);
                G.onBladeAttackEnd(attacker, true);
            } else {
                // Normal hit
                defender.takeDamage(scaledDamage(attacker, attacker.weaponDamage), attacker.x);
                G.playMeleeImpact(attacker.weapon ? attacker.weapon.id : 'sword', attacker.superActive);

                // Frost dagger effects
                if (attacker.weapon && attacker.weapon.id === 'frostdaggers') {
                    applyFrostEffects(defender);
                }
            }
            G.onPlayerHit(attacker, defender);
            G.hitstopTimer = G.HITSTOP_DURATION;
        }
    }
})(window.Game);
