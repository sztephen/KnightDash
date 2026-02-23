// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Fighter Class
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var ctx = G.ctx;
    var SUPER_READY_FLASH_TOTAL = 1100;
    var SUPER_READY_POP_MS = 340;

    function drawSuperReadyBurst(player, drawY, bh, readyPulse, readyElapsed, readyLife) {
        var popT = Math.min(1, readyElapsed / SUPER_READY_POP_MS);
        var popBoost = (1 - popT) * 18;
        var auraPulse = 0.45 + readyPulse * 0.55;
        var centerY = drawY + bh * 0.45;
        var outerR = 36 + auraPulse * 22 + popBoost;
        var innerR = outerR - 14;
        var spin = Date.now() * 0.007;

        ctx.save();

        ctx.globalAlpha = 0.14 + auraPulse * 0.18 + readyLife * 0.15;
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(player.x, centerY, outerR, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.2 + auraPulse * 0.18 + readyLife * 0.18;
        ctx.fillStyle = '#fff4b0';
        ctx.beginPath();
        ctx.arc(player.x, centerY, innerR, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.22 + readyLife * 0.35;
        ctx.strokeStyle = '#ffe89f';
        ctx.lineWidth = 2;
        for (var i = 0; i < 10; i++) {
            var ang = spin + i * (Math.PI * 2 / 10);
            var startR = innerR - 6;
            var endR = outerR + 8 + ((i % 2) ? readyPulse * 12 : 0);
            ctx.beginPath();
            ctx.moveTo(player.x + Math.cos(ang) * startR, centerY + Math.sin(ang) * startR);
            ctx.lineTo(player.x + Math.cos(ang) * endR, centerY + Math.sin(ang) * endR);
            ctx.stroke();
        }

        ctx.globalAlpha = 0.55 + readyPulse * 0.18;
        ctx.strokeStyle = '#fff8d9';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(player.x, centerY, outerR + 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }

    function drawSuperReadyShine(player, bx, drawY, bw, bh, readyPulse, readyLife) {
        var sheen = 0.14 + readyPulse * 0.2 + readyLife * 0.18;
        var sparkX = player.x + player.facing * 4;
        var sparkY = drawY + 10;
        var spark = 3 + readyPulse * 4;

        ctx.save();
        ctx.globalAlpha = Math.min(0.55, sheen);
        ctx.fillStyle = '#fff9d8';
        ctx.fillRect(bx + 3, drawY + 8, bw - 6, bh - 18);

        ctx.globalAlpha = 0.14 + readyLife * 0.16;
        ctx.fillStyle = '#ffd569';
        ctx.fillRect(bx + 2, drawY + 14, bw - 4, bh - 30);

        ctx.globalAlpha = 0.72 + readyPulse * 0.2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sparkX - spark * 0.5, sparkY - 1, spark, 2);
        ctx.fillRect(sparkX - 1, sparkY - spark * 0.5, 2, spark);
        ctx.restore();
    }

    function drawSuperReadyLabel(player, drawY, readyPulse, readyElapsed) {
        var popT = Math.min(1, readyElapsed / SUPER_READY_POP_MS);
        var scale = 1 + (1 - popT) * 0.45;
        var labelY = drawY - 16 - readyPulse * 6 - (1 - popT) * 8;
        ctx.save();
        ctx.translate(player.x, labelY);
        ctx.scale(scale, scale);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(95,55,0,0.95)';
        ctx.fillStyle = '#fff5c2';
        ctx.globalAlpha = 0.92;
        ctx.strokeText('SUPER READY!', 0, 0);
        ctx.fillText('SUPER READY!', 0, 0);
        ctx.restore();
    }

    function Fighter(x, facing, color, colorLight, colorDark, controls) {
        this.spawnX = x;
        this.x = x;
        this.y = G.GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.color = color;
        this.colorLight = colorLight;
        this.colorDark = colorDark;
        this.controls = controls;

        this.w = 36;
        this.h = 56;
        this.crouchH = 34;

        this.maxHP = G.HP_PER_ROUND;
        this.hp = this.maxHP;
        this.damageBonus = 0;
        this.lavaImmune = false;
        this.roundWins = 0;

        this.state = 'idle';
        this.onGround = false;
        this.crouching = false;
        this.dropThrough = false;
        this.dropThroughTimer = 0;
        this.coyoteTimer = 0;

        this.projectiles = [];
        this.gunCooldown = 0;
        this.rangedFlashTimer = 0;

        this.attackTimer = 0;
        this.attackPhase = null;
        this.attackType = 'ground';
        this.hasHit = false;

        this.parryWindowTimer = 0;
        this.staggerTimer = 0;
        this.stunTimer = 0;
        this.flashTimer = 0;
        this.swordTrail = [];
        this.parrySuccessTimer = 0;

        this.animFrame = 0;
        this.animTimer = 0;
        this.breatheOffset = 0;
        this.breatheTimer = 0;
        this.wasOnGround = true;
        this.walkDustTimer = 0;

        // Weapon
        this.weapon = G.WEAPONS[0]; // Default sword
        this.weaponDamage = G.NORMAL_DAMAGE;
        this.weaponWindup = G.ATTACK_WINDUP;
        this.weaponActive = G.ATTACK_ACTIVE;
        this.weaponRecovery = G.ATTACK_RECOVERY;
        this.weaponSpeedMult = 1;
        this.weaponRangeMult = 1;

        // Super system
        this.superCharge = 0;         // 0-3 total landed hits
        this.superMax = false;        // locked at 3, can't be removed
        this.superActive = false;     // ability currently active
        this.superCharging = false;   // 0.5s charge-up animation
        this.superChargingTimer = 0;
        this.superTimer = 0;          // duration of active super
        this.superReadyFlashTimer = 0; // one-shot yellow flash when super reaches max
        this.bladeOneShot = false;    // blade super: next hit kills
        this.clone = null;            // sword clone AI
        this.sniperPassiveTimer = 0;  // sniper auto-charge timer
        this.knockbackTimer = 0;      // temporary velocity cap override

        this.slowTimer = 0;           // rain slow debuff
        this.onLadder = false;        // on a ladder this frame

        // Fantasy weapon state
        this.frostCounter = 0;        // frost dagger hits received (0-4)
        this.frostCounterTimer = 0;   // 3s decay timer for frost counter
        this.frozenTimer = 0;         // frozen from 4/4 frost hits
        this.blizzardTimer = 0;       // frozen from blizzard super
        this.blizzardNoJump = false;  // blizzard prevents jumping
        this.shieldDashing = false;   // strong shield dash active
        this.phalanxInvincible = false; // phalanx super invincibility
        this.blackHoleCharging = false; // black weapon charge state
        this.blackHoleChargeTime = 0;   // black hole charge duration
        this.ghostMode = false;       // black super ghost flight / death ghost flight
        this.deathGhost = false;      // 2v2 dead-state ghost (movement only)
        this.stephengunActive = false; // derun super stephengun mode
        this.stephengunCooldown = 0;  // stephengun fire cooldown
        this.frostShotCooldown = 0;   // frost dagger ice-shot cooldown
        this.wolves = [];             // derun wolf entities
        this.ironChains = null;       // hammer iron chain entities
        this.hammerWavePending = false; // hammer spread wave emits once per swing
    }

    Fighter.prototype.reset = function (x) {
        this.x = x || this.spawnX;
        this.y = G.GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.hp = this.maxHP;
        this.state = 'idle';
        this.onGround = true;
        this.crouching = false;
        this.dropThrough = false;
        this.dropThroughTimer = 0;
        this.coyoteTimer = G.COYOTE_TIME;
        this.attackTimer = 0;
        this.attackPhase = null;
        this.hasHit = false;
        this.staggerTimer = 0;
        this.stunTimer = 0;
        this.flashTimer = 0;
        this.parryWindowTimer = 0;
        this.parrySuccessTimer = 0;
        this.swordTrail = [];
        this.projectiles = [];
        this.gunCooldown = 0;
        this.rangedFlashTimer = 0;

        // Super reset
        this.superCharge = 0;
        this.superMax = false;
        this.superActive = false;
        this.superCharging = false;
        this.superChargingTimer = 0;
        this.superTimer = 0;
        this.superReadyFlashTimer = 0;
        this.bladeOneShot = false;
        this.clone = null;
        this.sniperPassiveTimer = 0;
        this.knockbackTimer = 0;
        this.slowTimer = 0;
        this.onLadder = false;

        // Fantasy weapon state reset
        this.frostCounter = 0;
        this.frostCounterTimer = 0;
        this.frozenTimer = 0;
        this.blizzardTimer = 0;
        this.blizzardNoJump = false;
        this.shieldDashing = false;
        this.phalanxInvincible = false;
        this.blackHoleCharging = false;
        this.blackHoleChargeTime = 0;
        this.ghostMode = false;
        this.deathGhost = false;
        this.stephengunActive = false;
        this.stephengunCooldown = 0;
        this.frostShotCooldown = 0;
        this.wolves = [];
        this.ironChains = null;
        this.hammerWavePending = false;
    };

    Fighter.prototype.equipWeapon = function (weapon) {
        this.weapon = weapon;
        this.weaponDamage = weapon.damage;
        this.weaponWindup = G.ATTACK_WINDUP * weapon.windupMult;
        this.weaponActive = G.ATTACK_ACTIVE * weapon.activeMult;
        this.weaponRecovery = G.ATTACK_RECOVERY * weapon.recoveryMult;
        this.weaponSpeedMult = weapon.speedMult;
        this.weaponRangeMult = weapon.rangeMult;
    };

    Object.defineProperty(Fighter.prototype, 'currentH', {
        get: function () {
            return this.crouching ? this.crouchH : this.h;
        }
    });

    Object.defineProperty(Fighter.prototype, 'hurtbox', {
        get: function () {
            return {
                x: this.x - this.w / 2,
                y: this.y - this.currentH,
                w: this.w,
                h: this.currentH,
            };
        }
    });

    Fighter.prototype.getSwordHitbox = function () {
        if (this.attackPhase !== 'active') return null;
        // Gun/sniper uses projectiles, not a melee hitbox
        if (this.weapon && (this.weapon.id === 'gun' || this.weapon.id === 'sniper')) return null;
        // Shield uses dash collision, black uses black holes
        if (this.weapon && (this.weapon.id === 'shield' || this.weapon.id === 'black')) return null;
        var swordLen = Math.floor(44 * this.weaponRangeMult);
        var swordW = 10;
        if (this.attackType === 'crouch') {
            // Low forward sweep — can hit crouching opponents
            return {
                x: this.facing === 1 ? this.x : this.x - swordLen,
                y: this.y - this.crouchH,
                w: swordLen,
                h: this.crouchH,
            };
        } else if (this.attackType === 'air') {
            return {
                x: this.x + this.facing * 15,
                y: this.y - this.currentH / 2,
                w: swordLen,
                h: swordLen * 0.7,
            };
        } else {
            return {
                x: this.facing === 1 ? this.x + 10 : this.x - 10 - swordLen,
                y: this.y - this.currentH * 0.65,
                w: swordLen,
                h: swordW,
            };
        }
    };

    Fighter.prototype.update = function (dt, opponent) {
        var c = this.controls;
        var keys = G.keys;
        var justPressed = G.justPressed;

        if (G.is2v2 && this.hp <= 0 && !this.deathGhost) {
            this.enterDeathGhost();
        }

        if (this.dropThroughTimer > 0) {
            this.dropThroughTimer -= dt;
            if (this.dropThroughTimer <= 0) {
                this.dropThroughTimer = 0;
                this.dropThrough = false;
            }
        }

        if (this.rangedFlashTimer > 0) {
            this.rangedFlashTimer -= dt;
            if (this.rangedFlashTimer <= 0) {
                this.rangedFlashTimer = 0;
                if (this.attackPhase === 'active' && this.weapon &&
                    (this.weapon.id === 'gun' || this.weapon.id === 'sniper')) {
                    this.attackPhase = null;
                }
            }
        }

        // Map stun (Clock bell) — lock controls but keep gravity/physics
        if (this.stunTimer > 0) {
            this.stunTimer -= dt;
            this.state = 'stagger';
            this.attackPhase = null;
            this.parryWindowTimer = 0;
            this.vx *= 0.82;
            this.applyPhysics(dt);
            if (this.stunTimer <= 0 && this.state === 'stagger') this.state = 'idle';
            return;
        }

        // Frozen state (frost daggers 4/4 or stacked)
        if (this.frozenTimer > 0) {
            this.frozenTimer -= dt;
            this.vx *= 0.85;
            this.applyPhysics(dt);
            return;
        }

        // Ghost mode (black super) — free flight
        if (this.ghostMode) {
            var speed = 4;
            if (keys[c.left]) { this.vx = -speed; this.facing = -1; }
            else if (keys[c.right]) { this.vx = speed; this.facing = 1; }
            else this.vx *= 0.8;
            if (keys[c.up]) this.vy = -speed;
            else if (keys[c.down]) this.vy = speed;
            else this.vy *= 0.8;
            this.x += this.vx;
            this.y += this.vy;
            // Walls still apply, can't go below ground or above screen
            if (this.x - this.w / 2 < G.WALL_LEFT) this.x = G.WALL_LEFT + this.w / 2;
            if (this.x + this.w / 2 > G.WALL_RIGHT) this.x = G.WALL_RIGHT - this.w / 2;
            if (this.y > G.GROUND_Y) this.y = G.GROUND_Y;
            if (this.y - this.h < 0) this.y = this.h;
            return;
        }

        // Super charging freeze — can't move during 0.5s charge-up
        if (this.superCharging) {
            this.vx *= 0.85;
            this.applyPhysics(dt);
            return;
        }

        // Stagger
        if (this.staggerTimer > 0) {
            this.staggerTimer -= dt;
            this.vx *= 0.9;
            this.applyPhysics(dt);
            return;
        }

        // Attack timer (melee weapons only — gun/sniper skip this)
        if (this.attackPhase && !(this.weapon && (this.weapon.id === 'gun' || this.weapon.id === 'sniper'))) {
            this.attackTimer -= dt;
            if (this.attackTimer <= 0) {
                if (this.attackPhase === 'windup') {
                    this.attackPhase = 'active';
                    this.attackTimer = this.weaponActive;
                    this.hasHit = false;
                    // Shield dash velocity
                    if (this.weapon && this.weapon.id === 'shield') {
                        this.vx = this.facing * 14;
                        G.playDash();
                    } else if (this.weapon && this.weapon.id === 'hammer') {
                        this.hammerWavePending = true;
                        G.playWeaponSwing('hammer', this.superActive);
                    } else {
                        G.playWeaponSwing(this.weapon ? this.weapon.id : 'sword', this.superActive);
                    }
                } else if (this.attackPhase === 'active') {
                    this.attackPhase = 'recovery';
                    this.attackTimer = this.weaponRecovery;
                    // Blade one-shot: if active phase ended without a hit, remove super
                    if (this.bladeOneShot && this.superActive && !this.hasHit) {
                        G.onBladeAttackEnd(this, false);
                    }
                } else {
                    this.attackPhase = null;
                    this.state = 'idle';
                    this.shieldDashing = false;
                }
            }
            if (!this.onGround) {
                if (keys[c.left]) this.vx -= 0.3;
                if (keys[c.right]) this.vx += 0.3;
            }
            this.applyPhysics(dt);
            return;
        }

        // Parry success — brief freeze then return to idle
        if (this.state === 'parry_success') {
            this.parrySuccessTimer -= dt;
            if (this.parrySuccessTimer <= 0) {
                this.state = 'idle';
            }
            this.applyPhysics(dt);
            return;
        }

        // Movement — facing is set by left/right keys
        var slowFactor = 1;
        if (this.blizzardTimer > 0) { slowFactor = 0.25; this.blizzardTimer -= dt; if (this.blizzardTimer <= 0) this.blizzardNoJump = false; }
        else if (this.slowTimer > 0) slowFactor = 0.4;
        this.crouching = false;
        if (this.onLadder) {
            // Ladder climbing — override normal movement
            if (keys[c.up]) {
                this.vy = -2.5 * slowFactor;
                this.onGround = false;
                this.walkDustTimer += dt;
                if (this.walkDustTimer > 220) {
                    this.walkDustTimer = 0;
                    G.initAudio();
                    G.playLadderClimb();
                }
            } else if (keys[c.down]) {
                this.vy = 2.5 * slowFactor;
                this.walkDustTimer += dt;
                if (this.walkDustTimer > 220) {
                    this.walkDustTimer = 0;
                    G.initAudio();
                    G.playLadderClimb();
                }
            } else {
                this.vy = 0;
            }
            if (keys[c.left]) {
                this.facing = -1;
                this.vx -= G.WALK_SPEED * 0.2 * this.weaponSpeedMult * slowFactor;
            } else if (keys[c.right]) {
                this.facing = 1;
                this.vx += G.WALK_SPEED * 0.2 * this.weaponSpeedMult * slowFactor;
            }
            this.state = 'walk';
        } else if (keys[c.down] && this.onGround) {
            if (!this.crouching) {
                G.initAudio();
                G.playCrouch();
            }
            this.crouching = true;
            this.state = 'crouch';
        } else if (keys[c.left]) {
            this.facing = -1;
            this.vx -= G.WALK_SPEED * 0.3 * this.weaponSpeedMult * slowFactor;
            if (this.onGround) this.state = 'walk';
        } else if (keys[c.right]) {
            this.facing = 1;
            this.vx += G.WALK_SPEED * 0.3 * this.weaponSpeedMult * slowFactor;
            if (this.onGround) this.state = 'walk';
        } else if (this.onGround) {
            this.state = 'idle';
        }

        // Jump (not while on ladder — up key climbs instead)
        if (justPressed[c.up] && (this.onGround || this.coyoteTimer > 0) && !this.onLadder && !this.blizzardNoJump) {
            this.vy = G.JUMP_FORCE;
            this.onGround = false;
            this.coyoteTimer = 0;
            this.state = 'jump';
            // Jump dust effect
            G.spawnParticles(this.x - 8, this.y, 'rgba(180,170,150,0.7)', 4, 2);
            G.spawnParticles(this.x + 8, this.y, 'rgba(180,170,150,0.7)', 4, 2);
            G.initAudio();
            G.playJump();
        }

        // Drop through
        if (keys[c.down] && this.onGround && justPressed[c.down]) {
            this.dropThrough = true;
            this.dropThroughTimer = 150;
        }

        // Stephengun cooldown
        if (this.stephengunCooldown > 0) this.stephengunCooldown -= dt;
        if (this.frostShotCooldown > 0) this.frostShotCooldown -= dt;

        // Frost counter decay — decays one hit at a time every 3s
        if (this.frostCounterTimer > 0 && this.frostCounter > 0) {
            this.frostCounterTimer -= dt;
            if (this.frostCounterTimer <= 0) {
                this.frostCounter = Math.max(0, this.frostCounter - 1);
                // If there are more stacks, restart the decay timer
                if (this.frostCounter > 0) {
                    this.frostCounterTimer = 3000;
                }
            }
        }

        // Black hole charge timer
        if (this.blackHoleCharging) {
            this.blackHoleChargeTime += dt;
            if (this.blackHoleChargeTime > 4000) this.blackHoleChargeTime = 4000;
        }

        // Attack
        var actionsBlocked = typeof G.isPlayerActionBlocked === 'function' && G.isPlayerActionBlocked(this);
        if (justPressed[c.attack] && actionsBlocked) {
            G.initAudio();
            if (typeof G.playGunDryClick === 'function') G.playGunDryClick();
        } else if (justPressed[c.attack]) {
            // Black weapon — toggle black hole charging
            if (this.weapon && this.weapon.id === 'black' && !this.ghostMode) {
                if (!this.blackHoleCharging) {
                    this.blackHoleCharging = true;
                    this.blackHoleChargeTime = 0;
                } else if (this.blackHoleChargeTime >= 500) {
                    G.spawnBlackHole(this, opponent, this.blackHoleChargeTime);
                    this.blackHoleCharging = false;
                    this.blackHoleChargeTime = 0;
                } else {
                    this.blackHoleCharging = false;
                    this.blackHoleChargeTime = 0;
                }
            }
            // Derun stephengun mode — fire wolf
            else if (this.weapon && this.weapon.id === 'derun' && this.stephengunActive) {
                if (this.stephengunCooldown <= 0) {
                    this.stephengunCooldown = 1000;
                    G.spawnWolf(this, opponent);
                    G.playWolfSpawn();
                }
            }
            // Frost daggers — also launch short-range ice shards
            else if (this.weapon && this.weapon.id === 'frostdaggers') {
                if (this.frostShotCooldown <= 0) {
                    this.frostShotCooldown = this.superActive ? 130 : 220;
                    var shotY = this.crouching ? (this.y - this.crouchH * 0.55) : (this.y - this.h * 0.58);
                    var shotX = this.x + this.facing * 20;
                    var shotSpeed = 7.2;
                    this.projectiles.push({
                        x: shotX,
                        y: shotY - 3,
                        vx: this.facing * shotSpeed,
                        vy: -0.35,
                        damage: this.weaponDamage,
                        ttl: 500,
                        isFrost: true,
                        isSniper: false,
                    });
                    this.projectiles.push({
                        x: shotX,
                        y: shotY + 3,
                        vx: this.facing * shotSpeed,
                        vy: 0.35,
                        damage: this.weaponDamage,
                        ttl: 500,
                        isFrost: true,
                        isSniper: false,
                    });
                    G.spawnParticles(shotX, shotY, '#88ddff', 4, 2);
                    G.playFrostShot();
                }
                if (!this.attackPhase) {
                    this.attackPhase = 'windup';
                    this.attackTimer = this.weaponWindup;
                    this.hasHit = false;
                    this.state = 'attack';
                    this.swordTrail = [];
                    this.hammerWavePending = false;

                    if (this.crouching) {
                        this.attackType = 'crouch';
                    } else if (!this.onGround) {
                        this.attackType = 'air';
                    } else {
                        this.attackType = 'ground';
                    }

                    this.parryWindowTimer = G.PARRY_WINDOW;
                }
            }
            // Shield weapon — dash forward
            else if (this.weapon && this.weapon.id === 'shield') {
                if (!this.attackPhase) {
                    this.attackPhase = 'windup';
                    this.attackTimer = this.weaponWindup;
                    this.hasHit = false;
                    this.state = 'attack';
                    this.attackType = 'ground';
                    this.shieldDashing = true;
                }
            }
            // Gun/Sniper fires a projectile — no attack phases, just cooldown
            else if (this.weapon && (this.weapon.id === 'gun' || this.weapon.id === 'sniper')) {
                if (this.gunCooldown <= 0) {
                    var isSniper = this.weapon.id === 'sniper';
                    this.gunCooldown = isSniper ? 3500 : G.getGunCooldown(this);

                    // Spawn bullet — gun shoots at head height (dodgeable by crouching)
                    // Sniper shoots at center mass
                    var bulletY;
                    if (isSniper) {
                        bulletY = this.crouching ? this.y - this.crouchH * 0.5 : this.y - this.h * 0.5;
                    } else {
                        // Gun bullet at upper-body height — crouching ducks under it
                        bulletY = this.y - this.h * 0.65;
                    }
                    var bulletSpeed = isSniper ? G.SNIPER_BULLET_SPEED : G.BULLET_SPEED;
                    this.projectiles.push({
                        x: this.x + this.facing * 20,
                        y: bulletY,
                        vx: this.facing * bulletSpeed,
                        damage: this.weaponDamage,
                        ttl: isSniper ? 2000 : 1500,
                        isSniper: isSniper,
                    });
                    if (isSniper) {
                        G.playSniperShot();
                        // Muzzle flash — bigger for sniper
                        G.spawnParticles(this.x + this.facing * 24, bulletY, '#ff6633', 8, 5);
                        G.spawnParticles(this.x + this.facing * 26, bulletY, '#fff', 5, 3);
                        G.fxTriggerShake(5, 200);
                    } else {
                        G.playGunshot();
                        G.spawnParticles(this.x + this.facing * 22, bulletY, '#ffaa33', 5, 3);
                        G.spawnParticles(this.x + this.facing * 24, bulletY, '#fff', 3, 2);
                    }

                    // Recoil — sniper has MASSIVE recoil
                    var recoilVx = isSniper ? 16 : 4;
                    var recoilVy = isSniper ? -6 : -2;
                    this.vx -= this.facing * recoilVx;
                    if (this.onGround) this.vy = recoilVy;

                    // Brief visual recoil (no movement lock)
                    this.attackPhase = 'active';
                    this.rangedFlashTimer = isSniper ? 150 : 80;
                } else {
                    G.playGunDryClick();
                }
            } else {
                this.attackPhase = 'windup';
                this.attackTimer = this.weaponWindup;
                this.hasHit = false;
                this.state = 'attack';
                this.swordTrail = [];
                this.hammerWavePending = false;

                if (this.crouching) {
                    this.attackType = 'crouch';
                } else if (!this.onGround) {
                    this.attackType = 'air';
                } else {
                    this.attackType = 'ground';
                }

                this.parryWindowTimer = G.PARRY_WINDOW;
            }
        }

        if (this.parryWindowTimer > 0) {
            this.parryWindowTimer -= dt;
        }

        // Gun cooldown
        if (this.gunCooldown > 0) {
            this.gunCooldown -= dt;
        }

        // Rain slow debuff
        if (this.slowTimer > 0) this.slowTimer -= dt;

        // Landing dust detection
        this.wasOnGround = this.onGround;
        this.applyPhysics(dt);
        if (this.onGround && !this.wasOnGround) {
            // Just landed — dust puff
            G.spawnParticles(this.x, this.y, 'rgba(160,150,130,0.6)', 5, 2.5);
            G.initAudio();
            G.playLand();
        }

        // Walk dust + footstep sounds
        if (this.state === 'walk' && this.onGround) {
            this.walkDustTimer += dt;
            if (this.walkDustTimer > 180) {
                this.walkDustTimer = 0;
                G.spawnParticles(this.x - this.facing * 6, this.y, 'rgba(150,140,120,0.4)', 2, 1);
                G.initAudio();
                G.playFootstep();
            }
        } else {
            this.walkDustTimer = 0;
        }

        // Animation
        this.breatheTimer += dt;
        this.breatheOffset = Math.sin(this.breatheTimer * 0.003) * 1.5;

        if (this.state === 'walk') {
            this.animTimer += dt;
            if (this.animTimer > 120) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        }

        // Update projectiles
        this.updateProjectiles(dt);
    };

    Fighter.prototype.updateProjectiles = function (dt) {
        for (var i = this.projectiles.length - 1; i >= 0; i--) {
            var b = this.projectiles[i];
            b.x += b.vx;
            b.y += b.vy || 0;
            if (typeof b.ttl === 'number') {
                b.ttl -= dt;
            }
            // Remove if off screen
            if (b.x < G.WALL_LEFT - 20 || b.x > G.WALL_RIGHT + 20 || b.y < -30 || b.y > G.H + 30 || (typeof b.ttl === 'number' && b.ttl <= 0)) {
                this.projectiles.splice(i, 1);
            }
        }
    };

    Fighter.prototype.drawProjectiles = function () {
        for (var i = 0; i < this.projectiles.length; i++) {
            var b = this.projectiles[i];
            if (b.isFrost) {
                // Frost shard projectile
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(Math.atan2(b.vy || 0, b.vx || 1));
                ctx.fillStyle = 'rgba(136,221,255,0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#88ddff';
                ctx.beginPath();
                ctx.moveTo(7, 0);
                ctx.lineTo(-4, -3);
                ctx.lineTo(-4, 3);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#e6f7ff';
                ctx.fillRect(-1, -1, 5, 2);
                ctx.restore();
            } else if (b.isSniper) {
                // Sniper round — red tracer, bigger
                ctx.fillStyle = 'rgba(255,60,60,0.4)';
                ctx.beginPath();
                ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(b.x - 6, b.y - 2, 12, 4);
                ctx.fillStyle = '#fff';
                ctx.fillRect(b.x - 3, b.y - 1, 6, 2);
                // Long red trail
                ctx.fillStyle = 'rgba(255,60,60,0.5)';
                ctx.fillRect(b.x - b.vx * 2.5, b.y - 1, b.vx * 2.5, 2);
            } else {
                // Regular gun bullet — yellow
                ctx.fillStyle = 'rgba(255,200,50,0.3)';
                ctx.beginPath();
                ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffcc33';
                ctx.fillRect(b.x - 4, b.y - 2, 8, 4);
                ctx.fillStyle = '#fff';
                ctx.fillRect(b.x - 2, b.y - 1, 4, 2);
                // Trail
                ctx.fillStyle = 'rgba(255,180,50,0.4)';
                ctx.fillRect(b.x - b.vx * 1.5, b.y - 1, b.vx * 1.5, 2);
            }
        }
    };

    Fighter.prototype.applyPhysics = function (dt) {
        var platforms = G.getCurrentMap().platforms;
        if (typeof G.getSolidObstaclePlatforms === 'function') {
            var extraPlatforms = G.getSolidObstaclePlatforms();
            if (extraPlatforms && extraPlatforms.length) {
                platforms = platforms.concat(extraPlatforms);
            }
        }

        if (!this.onGround && !this.onLadder) {
            this.vy += G.GRAVITY;
        }

        if (this.knockbackTimer > 0) this.knockbackTimer -= dt;
        if (this.weapon && this.weapon.id === 'shield' && this.shieldDashing && this.attackPhase === 'active') {
            this.vx *= 0.93;
        } else {
            this.vx *= G.FRICTION;
        }
        var maxVx = this.knockbackTimer > 0 ? 80 : G.WALK_SPEED;
        if (this.weapon && this.weapon.id === 'shield' && this.shieldDashing && this.attackPhase === 'active') {
            maxVx = Math.max(maxVx, 14);
        }
        this.vx = Math.max(-maxVx, Math.min(maxVx, this.vx));

        this.x += this.vx;
        this.y += this.vy;

        // Ground
        if (this.y >= G.GROUND_Y) {
            this.y = G.GROUND_Y;
            this.vy = 0;
            this.onGround = true;
        }

        // Platforms — land on top when falling (ghost mode skips platforms)
        if (!this.dropThrough && this.vy >= 0 && !this.ghostMode) {
            for (var i = 0; i < platforms.length; i++) {
                var p = platforms[i];
                var prevY = this.y - this.vy;
                if (
                    prevY <= p.y + 2 &&
                    this.y >= p.y &&
                    this.x + this.w / 2 > p.x + 4 &&
                    this.x - this.w / 2 < p.x + p.w - 4
                ) {
                    this.y = p.y;
                    this.vy = 0;
                    this.onGround = true;
                    break;
                }
            }
        }

        // Walked off platform
        if (this.onGround && this.y < G.GROUND_Y) {
            var onPlatform = false;
            for (var i = 0; i < platforms.length; i++) {
                var p = platforms[i];
                if (
                    Math.abs(this.y - p.y) < 3 &&
                    this.x + this.w / 2 > p.x + 4 &&
                    this.x - this.w / 2 < p.x + p.w - 4
                ) {
                    onPlatform = true;
                    break;
                }
            }
            if (!onPlatform) this.onGround = false;
        }

        if (this.onGround) {
            this.coyoteTimer = G.COYOTE_TIME;
        } else if (this.coyoteTimer > 0) {
            this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        // Walls
        if (this.x - this.w / 2 < G.WALL_LEFT) {
            this.x = G.WALL_LEFT + this.w / 2;
            if (Math.abs(this.vx) > 3) { G.initAudio(); G.playWallBounce(); }
            this.vx = 0;
        }
        if (this.x + this.w / 2 > G.WALL_RIGHT) {
            this.x = G.WALL_RIGHT - this.w / 2;
            if (Math.abs(this.vx) > 3) { G.initAudio(); G.playWallBounce(); }
            this.vx = 0;
        }
    };

    Fighter.prototype.applyKnockback = function (vx, vy, duration) {
        this.vx = vx;
        this.vy = vy;
        this.onGround = false;
        this.knockbackTimer = Math.max(this.knockbackTimer || 0, duration || 240);
    };

    Fighter.prototype.enterDeathGhost = function () {
        if (this.deathGhost) return;
        this.deathGhost = true;
        this.ghostMode = true;

        // Disable all combat/action state: dead ghosts can only move.
        this.attackPhase = null;
        this.attackTimer = 0;
        this.hasHit = false;
        this.parryWindowTimer = 0;
        this.rangedFlashTimer = 0;
        this.blackHoleCharging = false;
        this.blackHoleChargeTime = 0;
        this.shieldDashing = false;
        this.hammerWavePending = false;
        this.superCharging = false;
        this.superChargingTimer = 0;
        this.superActive = false;
        this.superTimer = 0;
        this.phalanxInvincible = false;
        this.bladeOneShot = false;
        this.stephengunActive = false;
        this.stephengunCooldown = 0;
        this.clone = null;
        this.wolves = [];
        this.ironChains = null;
        this.projectiles = [];

        this.staggerTimer = 0;
        this.stunTimer = 0;
        this.frozenTimer = 0;
        this.state = 'idle';
        this.crouching = false;
        this.onGround = false;
        this.onLadder = false;
        this.vx = 0;
        this.vy = 0;

        G.spawnParticles(this.x, this.y - this.currentH * 0.5, '#6633aa', 10, 3);
        G.spawnParticles(this.x, this.y - this.currentH * 0.5, '#220044', 6, 2);
    };

    Fighter.prototype.takeDamage = function (amount, attackerX) {
        var wasAlive = this.hp > 0;
        this.hp -= amount;
        if (this.hp < 0) this.hp = 0;

        if (wasAlive && this.hp <= 0) {
            G.lastKOImpact = {
                x: this.x,
                y: this.y - this.currentH * 0.45,
                attackerX: attackerX
            };
        }

        this.flashTimer = 150;
        this.staggerTimer = G.STAGGER_DURATION;
        this.state = 'stagger';
        this.attackPhase = null;

        var dir = this.x > attackerX ? 1 : -1;
        this.applyKnockback(dir * 7, -3.5, 260);

        // Impact sparks (white)
        G.spawnParticles(this.x, this.y - this.currentH / 2, '#fff', 8, 4);
        // Blood particles (red tones)
        G.spawnParticles(this.x + dir * 8, this.y - this.currentH * 0.4, '#cc2222', 6, 3.5);
        G.spawnParticles(this.x + dir * 4, this.y - this.currentH * 0.6, '#881111', 4, 2.5);
        G.spawnParticles(this.x, this.y - this.currentH * 0.3, '#ff4444', 3, 2);
        G.fxTriggerShake(6, 200);
        G.playHit();

        if (G.is2v2 && this.hp <= 0) {
            this.enterDeathGhost();
        }
    };

    Fighter.prototype.startStagger = function () {
        this.staggerTimer = G.STAGGER_DURATION * 1.5;
        this.state = 'stagger';
        this.attackPhase = null;
        this.vx = -this.facing * 3;
    };

    Fighter.prototype.applyBellStun = function (duration) {
        var stunDuration = duration || 1000;
        this.stunTimer = Math.max(this.stunTimer || 0, stunDuration);
        this.staggerTimer = 0;
        this.state = 'stagger';
        this.attackPhase = null;
        this.attackTimer = 0;
        this.parryWindowTimer = 0;
        this.rangedFlashTimer = 0;
        this.blackHoleCharging = false;
        this.blackHoleChargeTime = 0;
        this.shieldDashing = false;
        this.superCharging = false;
        this.superChargingTimer = 0;
        this.coyoteTimer = 0;
        this.vx *= 0.35;
    };

    Fighter.prototype.draw = function () {
        ctx.save();
        var hb = this.hurtbox;

        var flashing = this.flashTimer > 0;
        if (flashing && Math.floor(this.flashTimer / 30) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        var bodyColor = flashing ? '#fff' : this.color;
        var lightColor = flashing ? '#eee' : this.colorLight;
        var darkColor = flashing ? '#ccc' : this.colorDark;
        var showSuperReadyFX = false;
        var superReadyPulse = 0;
        var superReadyElapsed = 0;
        var superReadyLife = 0;

        // Ghost mode tint (purple, semi-transparent)
        if (this.ghostMode && !flashing) {
            ctx.globalAlpha = 0.35;
            bodyColor = '#6633aa';
            lightColor = '#8855cc';
            darkColor = '#4422aa';
        }

        // Frozen tint (ice blue)
        if (this.frozenTimer > 0 && !flashing) {
            bodyColor = '#88ccee';
            lightColor = '#aaddff';
            darkColor = '#5599cc';
        }

        // Blizzard slow tint
        if (this.blizzardTimer > 0 && !flashing) {
            bodyColor = '#6699bb';
            lightColor = '#88bbdd';
            darkColor = '#447799';
        }

        // Rain slow tint (blue/cold)
        if (this.slowTimer > 0 && !flashing && this.blizzardTimer <= 0 && this.frozenTimer <= 0) {
            var p2RainTint = this === G._p2Ref || this.color === '#cc3b3b';
            if (p2RainTint) {
                bodyColor = '#cc7777';
                lightColor = '#ee9999';
                darkColor = '#aa5555';
            } else {
                bodyColor = '#4488cc';
                lightColor = '#66aadd';
                darkColor = '#225599';
            }
        }

        // Bell stun tint
        if (this.stunTimer > 0 && !flashing && this.frozenTimer <= 0 && this.blizzardTimer <= 0) {
            bodyColor = '#ccb96c';
            lightColor = '#f1df8f';
            darkColor = '#8f7a3a';
        }

        // One-time super-ready flash
        if (this.superReadyFlashTimer > 0 && !flashing) {
            showSuperReadyFX = true;
            superReadyElapsed = SUPER_READY_FLASH_TOTAL - this.superReadyFlashTimer;
            if (superReadyElapsed < 0) superReadyElapsed = 0;
            superReadyLife = this.superReadyFlashTimer / SUPER_READY_FLASH_TOTAL;
            if (superReadyLife < 0) superReadyLife = 0;
            superReadyPulse = Math.sin(superReadyElapsed * 0.095) * 0.5 + 0.5;
            ctx.globalAlpha = 0.9 + superReadyPulse * 0.1;
            bodyColor = '#ffd94d';
            lightColor = '#fff6cf';
            darkColor = '#cd8a00';
        }

        var bx = hb.x, by = hb.y, bw = hb.w, bh = hb.h;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this.x - 16, G.GROUND_Y - 3, 32, 6);

        var bobY = 0;
        if (this.state === 'walk') bobY = Math.sin(this.animFrame * Math.PI / 2) * 2;
        bobY += this.breatheOffset;
        var drawY = by + bobY;

        if (showSuperReadyFX) {
            drawSuperReadyBurst(this, drawY, bh, superReadyPulse, superReadyElapsed, superReadyLife);
        }

        // Legs
        ctx.fillStyle = darkColor;
        if (this.crouching) {
            ctx.fillRect(bx + 4, drawY + bh - 10, 10, 10);
            ctx.fillRect(bx + bw - 14, drawY + bh - 10, 10, 10);
        } else {
            var legOff = this.state === 'walk' ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
            ctx.fillRect(bx + 6, drawY + bh - 18 + legOff, 9, 18 - legOff);
            ctx.fillRect(bx + bw - 15, drawY + bh - 18 - legOff, 9, 18 + legOff);
        }

        // Torso
        ctx.fillStyle = bodyColor;
        ctx.fillRect(bx + 2, drawY + 14, bw - 4, bh - 32);
        ctx.fillStyle = lightColor;
        ctx.fillRect(bx + 4, drawY + 16, bw - 12, 4);

        // Head
        ctx.fillStyle = bodyColor;
        ctx.fillRect(bx + 6, drawY, bw - 12, 16);
        ctx.fillStyle = '#111';
        var visorX = this.facing === 1 ? bx + bw - 14 : bx + 6;
        ctx.fillRect(visorX, drawY + 6, 8, 4);
        ctx.fillStyle = lightColor;
        ctx.fillRect(bx + bw / 2 - 2, drawY - 4, 4, 6);

        // Shield
        var shieldSide = -this.facing;
        ctx.fillStyle = darkColor;
        var shieldX = this.x + shieldSide * (bw / 2 + 2);
        ctx.fillRect(shieldX - 5, drawY + 16, 10, 16);
        ctx.fillStyle = lightColor;
        ctx.fillRect(shieldX - 4, drawY + 17, 8, 14);

        // Sword
        this.drawSword(drawY, bx, by, bw, bh);

        if (showSuperReadyFX) {
            drawSuperReadyShine(this, bx, drawY, bw, bh, superReadyPulse, superReadyLife);
            if (superReadyLife > 0.35 && Math.random() < 0.28) {
                G.spawnParticles(
                    this.x + (Math.random() - 0.5) * 18,
                    drawY + 6 + Math.random() * (bh - 20),
                    'rgba(255,245,180,0.9)', 1, 1.4
                );
            }
            drawSuperReadyLabel(this, drawY, superReadyPulse, superReadyElapsed);
        }

        ctx.restore();
        if (this.flashTimer > 0) this.flashTimer -= 16.67;
        if (this.superReadyFlashTimer > 0) this.superReadyFlashTimer -= 16.67;
    };

    Fighter.prototype.drawSword = function (drawY, bx, by, bw, bh) {
        var swordArmX = this.x + this.facing * (bw / 2);
        var wep = this.weapon;
        var bc = wep.bladeColor;
        var bh2 = wep.bladeHighlight;
        var gc = wep.guardColor;
        var rm = this.weaponRangeMult;

        if (wep.id === 'blade') {
            this.drawBlade(drawY, swordArmX, bw, bc, bh2, gc, rm);
        } else if (wep.id === 'spear') {
            this.drawSpear(drawY, swordArmX, bw, bc, bh2, gc, rm);
        } else if (wep.id === 'gun') {
            this.drawGun(drawY, swordArmX, bw);
        } else if (wep.id === 'sniper') {
            this.drawSniper(drawY, swordArmX, bw);
        } else if (wep.id === 'hammer') {
            this.drawHammer(drawY, swordArmX, bw);
        } else if (wep.id === 'frostdaggers') {
            this.drawFrostDaggers(drawY, swordArmX, bw, bc, bh2, gc, rm);
        } else if (wep.id === 'shield') {
            this.drawShieldWeapon(drawY, swordArmX, bw);
        } else if (wep.id === 'black') {
            this.drawBlackOrb(drawY, swordArmX, bw);
        } else if (wep.id === 'derun') {
            this.drawDerunWeapon(drawY, swordArmX, bw, bc, bh2, gc, rm);
        } else {
            this.drawSwordWeapon(drawY, swordArmX, bw, bc, bh2, gc, rm);
        }
    };

    // ── SWORD (classic) ─────────────────────────────────────────
    Fighter.prototype.drawSwordWeapon = function (drawY, ax, bw, bc, bh, gc, rm) {
        var len = Math.floor(28 * rm);
        if (this.attackPhase === 'windup') {
            ctx.fillStyle = '#888';
            ctx.fillRect(ax - 2, drawY - 8, 4, 20);
            ctx.fillStyle = bc;
            ctx.fillRect(ax - 2, drawY - 8 - len, 4, len);
            ctx.fillStyle = bh;
            ctx.fillRect(ax - 1, drawY - 6 - len, 2, len - 4);
        } else if (this.attackPhase === 'active') {
            ctx.fillStyle = '#888';
            ctx.fillRect(ax - 2, drawY + 14, 4, 8);
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 4, drawY + 12, 8, 4);
            var bladeX = this.facing === 1 ? ax + 2 : ax - 2 - len * 1.4;
            ctx.fillStyle = bc;
            ctx.fillRect(bladeX, drawY + 14, len * 1.4, 5);
            ctx.fillStyle = bh;
            ctx.fillRect(bladeX + 2, drawY + 15, len * 1.4 - 4, 3);
            ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ax, drawY + 16, len * 1.5, this.facing === 1 ? -0.3 : Math.PI - 0.3, this.facing === 1 ? 0.3 : Math.PI + 0.3);
            ctx.stroke();
        } else if (this.attackPhase === 'recovery') {
            ctx.fillStyle = '#888';
            ctx.fillRect(ax - 2, drawY + 18, 4, 8);
            ctx.fillStyle = '#999';
            var rx = this.facing === 1 ? ax + 2 : ax - len;
            ctx.fillRect(rx, drawY + 26, len, 4);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillRect(ax - 2, drawY + 10, 4, 14);
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 4, drawY + 8, 8, 4);
            ctx.save();
            ctx.translate(ax, drawY + 24);
            ctx.rotate(this.facing * 0.4);
            ctx.fillStyle = bc;
            ctx.fillRect(-2, 0, 4, len);
            ctx.fillStyle = bh;
            ctx.fillRect(-1, 2, 2, len - 4);
            ctx.restore();
        }
    };

    // ── BLADE (short, fast, curved) ─────────────────────────────
    Fighter.prototype.drawBlade = function (drawY, ax, bw, bc, bh, gc, rm) {
        var len = Math.floor(20 * rm);
        if (this.attackPhase === 'windup') {
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 2, 4, 10);
            ctx.fillStyle = bc;
            ctx.fillRect(ax - 1, drawY - len + 4, 3, len);
            ctx.fillStyle = bh;
            ctx.fillRect(ax, drawY - len + 6, 1, len - 6);
        } else if (this.attackPhase === 'active') {
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 16, 4, 6);
            var bx = this.facing === 1 ? ax + 2 : ax - 2 - len * 1.2;
            ctx.fillStyle = bc;
            // Curved blade shape
            ctx.beginPath();
            ctx.moveTo(bx, drawY + 17);
            ctx.lineTo(bx + len * 1.2 * this.facing, drawY + 14);
            ctx.lineTo(bx + len * 1.2 * this.facing, drawY + 18);
            ctx.lineTo(bx, drawY + 21);
            ctx.fill();
            ctx.fillStyle = bh;
            ctx.fillRect(bx + 2 * this.facing, drawY + 16, len * 0.8, 2);
            // Speed lines
            ctx.strokeStyle = 'rgba(170,220,255,0.4)';
            ctx.lineWidth = 1;
            for (var i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(ax - this.facing * (10 + i * 8), drawY + 14 + i * 3);
                ctx.lineTo(ax - this.facing * (20 + i * 8), drawY + 14 + i * 3);
                ctx.stroke();
            }
        } else if (this.attackPhase === 'recovery') {
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 18, 4, 6);
            ctx.fillStyle = '#777';
            var rx = this.facing === 1 ? ax + 2 : ax - len * 0.8;
            ctx.fillRect(rx, drawY + 24, len * 0.8, 3);
        } else {
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 12, 4, 10);
            ctx.save();
            ctx.translate(ax, drawY + 22);
            ctx.rotate(this.facing * 0.6);
            ctx.fillStyle = bc;
            ctx.fillRect(-1, 0, 3, len);
            ctx.fillStyle = bh;
            ctx.fillRect(0, 2, 1, len - 4);
            // Curved tip
            ctx.fillStyle = bc;
            ctx.fillRect(-2, len - 3, 5, 2);
            ctx.restore();
        }
    };

    // ── SPEAR (long shaft, pointed tip) ─────────────────────────
    Fighter.prototype.drawSpear = function (drawY, ax, bw, bc, bh, gc, rm) {
        var len = Math.floor(40 * rm);
        if (this.attackPhase === 'windup') {
            // Pulled back vertically
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY - 4, 4, len + 12);
            ctx.fillStyle = bc;
            ctx.fillRect(ax - 1, drawY - 4, 2, len + 8);
            // Spear tip
            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.moveTo(ax - 3, drawY - 4);
            ctx.lineTo(ax, drawY - 14);
            ctx.lineTo(ax + 3, drawY - 4);
            ctx.fill();
            ctx.fillStyle = bh;
            ctx.fillRect(ax - 1, drawY - 12, 2, 8);
        } else if (this.attackPhase === 'active') {
            // Thrust forward horizontally
            ctx.fillStyle = gc;
            var shaftX = this.facing === 1 ? ax - 6 : ax + 6 - len * 1.4;
            ctx.fillRect(shaftX, drawY + 16, len * 1.4, 3);
            ctx.fillStyle = bc;
            ctx.fillRect(shaftX, drawY + 17, len * 1.4, 1);
            // Spear tip
            var tipX = this.facing === 1 ? shaftX + len * 1.4 : shaftX;
            ctx.fillStyle = '#bbb';
            ctx.beginPath();
            ctx.moveTo(tipX, drawY + 12);
            ctx.lineTo(tipX + this.facing * 14, drawY + 17);
            ctx.lineTo(tipX, drawY + 23);
            ctx.fill();
            ctx.fillStyle = bh;
            ctx.beginPath();
            ctx.moveTo(tipX + this.facing * 2, drawY + 14);
            ctx.lineTo(tipX + this.facing * 12, drawY + 17);
            ctx.lineTo(tipX + this.facing * 2, drawY + 20);
            ctx.fill();
            // Thrust line
            ctx.strokeStyle = 'rgba(200,180,150,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ax - this.facing * 8, drawY + 17);
            ctx.lineTo(ax - this.facing * 30, drawY + 17);
            ctx.stroke();
        } else if (this.attackPhase === 'recovery') {
            ctx.fillStyle = gc;
            var rsx = this.facing === 1 ? ax : ax - len * 0.6;
            ctx.fillRect(rsx, drawY + 22, len * 0.6, 3);
            ctx.fillStyle = '#999';
            ctx.beginPath();
            ctx.moveTo(rsx + (this.facing === 1 ? len * 0.6 : 0), drawY + 19);
            ctx.lineTo(rsx + (this.facing === 1 ? len * 0.6 + 8 : -8), drawY + 23);
            ctx.lineTo(rsx + (this.facing === 1 ? len * 0.6 : 0), drawY + 27);
            ctx.fill();
        } else {
            // Held diagonally at rest
            ctx.save();
            ctx.translate(ax, drawY + 8);
            ctx.rotate(this.facing * 0.3);
            ctx.fillStyle = gc;
            ctx.fillRect(-2, -4, 3, len + 8);
            ctx.fillStyle = bc;
            ctx.fillRect(-1, -2, 1, len + 4);
            // Tip
            ctx.fillStyle = '#bbb';
            ctx.beginPath();
            ctx.moveTo(-3, -4);
            ctx.lineTo(0, -14);
            ctx.lineTo(3, -4);
            ctx.fill();
            ctx.fillStyle = bh;
            ctx.fillRect(-1, -12, 2, 8);
            ctx.restore();
        }
    };

    // ── GUN ──────────────────────────────────────────────────────
    Fighter.prototype.drawGun = function (drawY, ax, bw) {
        var recoil = 0;
        if (this.attackPhase === 'windup' || this.attackPhase === 'active') {
            recoil = -this.facing * 4;
        }

        // Arm
        ctx.fillStyle = '#888';
        ctx.fillRect(ax - 2 + recoil, drawY + 12, 4, 10);

        // Gun body
        var gunX = ax + this.facing * 6 + recoil;
        var gunY = drawY + 14;

        // Barrel
        ctx.fillStyle = '#555';
        var barrelX = this.facing === 1 ? gunX : gunX - 18;
        ctx.fillRect(barrelX, gunY, 18, 5);
        ctx.fillStyle = '#444';
        ctx.fillRect(barrelX, gunY + 1, 18, 2);

        // Barrel tip highlight
        ctx.fillStyle = '#777';
        var tipX = this.facing === 1 ? barrelX + 16 : barrelX;
        ctx.fillRect(tipX, gunY, 2, 5);

        // Body/receiver
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(gunX - 4, gunY + 2, 10, 7);
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(gunX - 3, gunY + 3, 8, 4);

        // Grip
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(gunX - 1, gunY + 7, 5, 8);
        ctx.fillStyle = '#7B4420';
        ctx.fillRect(gunX, gunY + 8, 3, 6);

        // Muzzle flash during active phase
        if (this.attackPhase === 'active') {
            ctx.fillStyle = 'rgba(255,200,50,0.7)';
            var flashX = this.facing === 1 ? barrelX + 18 : barrelX - 6;
            ctx.fillRect(flashX, gunY - 2, 6, 9);
            ctx.fillStyle = 'rgba(255,255,200,0.5)';
            ctx.fillRect(flashX + this.facing * 2, gunY, 4, 5);
        }
    };

    // ── SNIPER ───────────────────────────────────────────────────
    Fighter.prototype.drawSniper = function (drawY, ax, bw) {
        var recoil = 0;
        if (this.attackPhase === 'active') {
            recoil = -this.facing * 8;
        }

        // Arm
        ctx.fillStyle = '#888';
        ctx.fillRect(ax - 2 + recoil, drawY + 10, 4, 12);

        var gunX = ax + this.facing * 6 + recoil;
        var gunY = drawY + 12;

        // Long barrel
        ctx.fillStyle = '#333';
        var barrelLen = 30;
        var barrelX = this.facing === 1 ? gunX : gunX - barrelLen;
        ctx.fillRect(barrelX, gunY, barrelLen, 4);
        ctx.fillStyle = '#222';
        ctx.fillRect(barrelX, gunY + 1, barrelLen, 1);

        // Barrel tip
        ctx.fillStyle = '#555';
        var tipX = this.facing === 1 ? barrelX + barrelLen - 2 : barrelX;
        ctx.fillRect(tipX, gunY - 1, 2, 6);

        // Scope
        ctx.fillStyle = '#444';
        var scopeX = this.facing === 1 ? barrelX + 8 : barrelX + barrelLen - 14;
        ctx.fillRect(scopeX, gunY - 6, 6, 5);
        ctx.fillStyle = '#66aaff';
        ctx.fillRect(scopeX + 1, gunY - 5, 4, 3);

        // Stock
        ctx.fillStyle = '#2a2a2a';
        var stockX = this.facing === 1 ? gunX - 12 : gunX + 4;
        ctx.fillRect(stockX, gunY + 1, 12, 6);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(stockX + 1, gunY + 2, 10, 3);

        // Grip
        ctx.fillStyle = '#222';
        ctx.fillRect(gunX - 1, gunY + 5, 4, 8);

        // Muzzle flash during active phase
        if (this.attackPhase === 'active') {
            ctx.fillStyle = 'rgba(255,100,30,0.8)';
            var flashX = this.facing === 1 ? barrelX + barrelLen : barrelX - 10;
            ctx.fillRect(flashX, gunY - 4, 10, 12);
            ctx.fillStyle = 'rgba(255,200,100,0.6)';
            ctx.fillRect(flashX + this.facing * 3, gunY - 2, 6, 8);
        }

        // Cooldown indicator — reload bar
        if (this.gunCooldown > 0) {
            var maxCooldown = (this.weapon && this.weapon.id === 'sniper') ? 3500 : G.getGunCooldown(this);
            var pct = Math.max(0, Math.min(1, this.gunCooldown / Math.max(1, maxCooldown)));
            var barW = 30;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(this.x - barW / 2, drawY - 12, barW, 4);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.x - barW / 2, drawY - 12, barW * pct, 4);
        }
    };

    // ── HAMMER ─────────────────────────────────────────────────
    Fighter.prototype.drawHammer = function (drawY, ax, bw) {
        var handleW = 4, handleH = 32, headW = 22, headH = 14;
        if (this.attackPhase === 'windup') {
            // Raised above head
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(ax - handleW / 2, drawY - 10 - handleH, handleW, handleH);
            ctx.fillStyle = '#777';
            ctx.fillRect(ax - headW / 2, drawY - 10 - handleH - headH, headW, headH);
            ctx.fillStyle = '#aaa';
            ctx.fillRect(ax - headW / 2 + 2, drawY - 10 - handleH - headH + 2, headW - 4, 3);
            ctx.fillStyle = '#555';
            ctx.fillRect(ax - headW / 2, drawY - 10 - handleH - headH + headH - 3, headW, 3);
        } else if (this.attackPhase === 'active') {
            // Swung forward/down — horizontal
            ctx.fillStyle = '#5a3a1a';
            var hx = this.facing === 1 ? ax : ax - handleH;
            ctx.fillRect(hx, drawY + 18, handleH, handleW);
            ctx.fillStyle = '#777';
            var hamX = this.facing === 1 ? ax + handleH - 2 : ax - handleH - headW + 2;
            ctx.fillRect(hamX, drawY + 12, headW, headH);
            ctx.fillStyle = '#aaa';
            ctx.fillRect(hamX + 2, drawY + 14, headW - 4, 3);
            ctx.fillStyle = '#555';
            ctx.fillRect(hamX, drawY + 12 + headH - 3, headW, 3);
            // Impact arc
            ctx.strokeStyle = 'rgba(200,200,200,0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ax, drawY + 20, handleH + headW * 0.5, this.facing === 1 ? -0.4 : Math.PI - 0.4, this.facing === 1 ? 0.4 : Math.PI + 0.4);
            ctx.stroke();
        } else if (this.attackPhase === 'recovery') {
            // Resting on ground
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(ax - handleW / 2, drawY + 10, handleW, handleH * 0.7);
            ctx.fillStyle = '#666';
            var rx = this.facing === 1 ? ax + 2 : ax - headW;
            ctx.fillRect(rx, drawY + 10 + handleH * 0.6, headW * 0.8, headH * 0.8);
        } else {
            // Idle — hanging at side
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(ax - handleW / 2, drawY + 8, handleW, handleH);
            ctx.fillStyle = '#777';
            ctx.save();
            ctx.translate(ax, drawY + 8 + handleH);
            ctx.rotate(this.facing * 0.3);
            ctx.fillRect(-headW / 2, 0, headW, headH);
            ctx.fillStyle = '#aaa';
            ctx.fillRect(-headW / 2 + 2, 2, headW - 4, 3);
            ctx.restore();
        }
    };

    // ── FROST DAGGERS ─────────────────────────────────────────
    Fighter.prototype.drawFrostDaggers = function (drawY, ax, bw, bc, bh, gc, rm) {
        var len = Math.floor(16 * rm);
        if (this.attackPhase === 'windup') {
            // Both daggers pulled back
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 4, drawY + 6, 3, 8);
            ctx.fillRect(ax + 1, drawY + 6, 3, 8);
            ctx.fillStyle = bc;
            ctx.fillRect(ax - 3, drawY - len + 8, 2, len);
            ctx.fillRect(ax + 1, drawY - len + 8, 2, len);
            ctx.fillStyle = bh;
            ctx.fillRect(ax - 2, drawY - len + 10, 1, len - 4);
            ctx.fillRect(ax + 2, drawY - len + 10, 1, len - 4);
        } else if (this.attackPhase === 'active') {
            // Both daggers slashing forward
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 14, 4, 5);
            var bx1 = this.facing === 1 ? ax + 2 : ax - 2 - len;
            var bx2 = this.facing === 1 ? ax + 2 : ax - 2 - len;
            ctx.fillStyle = bc;
            ctx.fillRect(bx1, drawY + 13, len, 2);
            ctx.fillRect(bx2, drawY + 19, len, 2);
            ctx.fillStyle = bh;
            ctx.fillRect(bx1 + 2, drawY + 13, len - 4, 1);
            ctx.fillRect(bx2 + 2, drawY + 19, len - 4, 1);
            // Ice speed lines
            ctx.strokeStyle = 'rgba(136,221,255,0.5)';
            ctx.lineWidth = 1;
            for (var i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(ax - this.facing * (8 + i * 6), drawY + 12 + i * 3);
                ctx.lineTo(ax - this.facing * (16 + i * 6), drawY + 12 + i * 3);
                ctx.stroke();
            }
            // Ice crystal particles
            if (Math.random() < 0.5) {
                G.spawnParticles(bx1 + len * this.facing, drawY + 16, 'rgba(136,221,255,0.7)', 1, 2);
            }
        } else if (this.attackPhase === 'recovery') {
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 2, drawY + 18, 4, 5);
            ctx.fillStyle = '#6699aa';
            var rx = this.facing === 1 ? ax + 2 : ax - len * 0.6;
            ctx.fillRect(rx, drawY + 22, len * 0.6, 2);
            ctx.fillRect(rx, drawY + 26, len * 0.5, 2);
        } else {
            // Idle — crossed daggers
            ctx.fillStyle = gc;
            ctx.fillRect(ax - 3, drawY + 12, 6, 6);
            ctx.save();
            ctx.translate(ax, drawY + 18);
            ctx.rotate(this.facing * 0.4);
            ctx.fillStyle = bc;
            ctx.fillRect(-1, 0, 2, len);
            ctx.fillStyle = bh;
            ctx.fillRect(0, 2, 1, len - 3);
            ctx.restore();
            ctx.save();
            ctx.translate(ax, drawY + 18);
            ctx.rotate(this.facing * 0.8);
            ctx.fillStyle = bc;
            ctx.fillRect(-1, 0, 2, len);
            ctx.fillStyle = bh;
            ctx.fillRect(0, 2, 1, len - 3);
            ctx.restore();
        }
    };

    // ── STRONG SHIELD ─────────────────────────────────────────
    Fighter.prototype.drawShieldWeapon = function (drawY, ax, bw) {
        var shW = 20, shH = 30;
        var shX = this.x + this.facing * (bw / 2 + 4);
        var invincible = this.phalanxInvincible;

        if (this.attackPhase === 'active' && this.shieldDashing) {
            // Dash — shield extended far forward
            shX = this.x + this.facing * (bw / 2 + 14);
            ctx.fillStyle = invincible ? '#ffdd44' : '#667788';
            ctx.fillRect(shX - shW / 2, drawY + 6, shW, shH);
            ctx.fillStyle = invincible ? '#ffeeaa' : '#8899aa';
            ctx.fillRect(shX - shW / 2 + 2, drawY + 8, shW - 4, shH - 4);
            // Cross
            ctx.fillStyle = invincible ? '#ffcc00' : '#556677';
            ctx.fillRect(shX - 1, drawY + 10, 2, shH - 8);
            ctx.fillRect(shX - shW / 2 + 4, drawY + 18, shW - 8, 2);
            // Dash lines
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            for (var i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x - this.facing * (10 + i * 10), drawY + 12 + i * 8);
                ctx.lineTo(this.x - this.facing * (25 + i * 10), drawY + 12 + i * 8);
                ctx.stroke();
            }
        } else if (this.attackPhase === 'windup') {
            // Windup — pulling back before dash
            ctx.fillStyle = invincible ? '#ffdd44' : '#667788';
            shX = this.x - this.facing * 2;
            ctx.fillRect(shX - shW / 2, drawY + 8, shW, shH);
            ctx.fillStyle = invincible ? '#ffeeaa' : '#8899aa';
            ctx.fillRect(shX - shW / 2 + 2, drawY + 10, shW - 4, shH - 4);
            ctx.fillStyle = invincible ? '#ffcc00' : '#556677';
            ctx.fillRect(shX - 1, drawY + 12, 2, shH - 8);
            ctx.fillRect(shX - shW / 2 + 4, drawY + 20, shW - 8, 2);
        } else {
            // Idle — shield in front
            ctx.fillStyle = invincible ? '#ffdd44' : '#667788';
            ctx.fillRect(shX - shW / 2, drawY + 8, shW, shH);
            ctx.fillStyle = invincible ? '#ffeeaa' : '#8899aa';
            ctx.fillRect(shX - shW / 2 + 2, drawY + 10, shW - 4, shH - 4);
            // Cross pattern
            ctx.fillStyle = invincible ? '#ffcc00' : '#556677';
            ctx.fillRect(shX - 1, drawY + 12, 2, shH - 8);
            ctx.fillRect(shX - shW / 2 + 4, drawY + 20, shW - 8, 2);
            // Rivets
            ctx.fillStyle = invincible ? '#ffe066' : '#445566';
            ctx.fillRect(shX - shW / 2 + 2, drawY + 10, 3, 3);
            ctx.fillRect(shX + shW / 2 - 5, drawY + 10, 3, 3);
            ctx.fillRect(shX - shW / 2 + 2, drawY + shH + 3, 3, 3);
            ctx.fillRect(shX + shW / 2 - 5, drawY + shH + 3, 3, 3);
        }
        // Phalanx golden glow
        if (invincible) {
            ctx.save();
            ctx.globalAlpha = 0.2 + Math.sin(Date.now() * 0.008) * 0.1;
            ctx.fillStyle = '#ffdd44';
            ctx.beginPath();
            ctx.arc(this.x, drawY + 20, 35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    };

    // ── BLACK ORB ─────────────────────────────────────────────
    Fighter.prototype.drawBlackOrb = function (drawY, ax, bw) {
        var orbX = ax + this.facing * 8;
        var orbY = drawY + 18;
        var orbR = 6;
        var t = Date.now();

        if (this.blackHoleCharging) {
            // Growing dark orb while charging
            var chProg = Math.min(1, this.blackHoleChargeTime / 4000);
            orbR = 6 + chProg * 8;
            // Swirling energy
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.beginPath(); ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(100,0,200,' + (0.4 + chProg * 0.4) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(orbX, orbY, orbR + 2, t * 0.01, t * 0.01 + Math.PI * 1.4); ctx.stroke();
            ctx.fillStyle = '#440066';
            ctx.beginPath(); ctx.arc(orbX, orbY, 2 + chProg * 2, 0, Math.PI * 2); ctx.fill();
        } else {
            // Idle dark orb
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath(); ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(80,0,150,0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(orbX, orbY, orbR + 1, t * 0.005, t * 0.005 + Math.PI); ctx.stroke();
            ctx.fillStyle = '#220044';
            ctx.beginPath(); ctx.arc(orbX, orbY, 2, 0, Math.PI * 2); ctx.fill();
            // Ambient dark particles
            if (Math.random() < 0.1) {
                G.spawnParticles(orbX, orbY, 'rgba(80,0,150,0.5)', 1, 1);
            }
        }
    };

    // ── DERUN (golden blade / stephengun) ──────────────────────
    Fighter.prototype.drawDerunWeapon = function (drawY, ax, bw, bc, bh, gc, rm) {
        if (this.stephengunActive) {
            // Stephengun — gun shape, golden/bronze
            var recoil = 0;
            if (this.stephengunCooldown > 800) recoil = -this.facing * 4;
            ctx.fillStyle = '#886622';
            ctx.fillRect(ax - 2 + recoil, drawY + 12, 4, 10);
            var gunX = ax + this.facing * 6 + recoil;
            var gunY = drawY + 14;
            ctx.fillStyle = '#ddaa44';
            var barrelX = this.facing === 1 ? gunX : gunX - 20;
            ctx.fillRect(barrelX, gunY, 20, 5);
            ctx.fillStyle = '#ffcc66';
            ctx.fillRect(barrelX + 2, gunY + 1, 16, 2);
            ctx.fillStyle = '#886622';
            ctx.fillRect(gunX - 3, gunY + 3, 8, 7);
            ctx.fillStyle = '#aa8833';
            ctx.fillRect(gunX - 2, gunY + 4, 6, 4);
            ctx.fillStyle = '#664411';
            ctx.fillRect(gunX, gunY + 8, 4, 6);
            // Wolf emblem
            ctx.fillStyle = '#555';
            ctx.fillRect(barrelX + (this.facing === 1 ? 16 : 0), gunY - 1, 2, 7);
            // Fire flash
            if (this.stephengunCooldown > 800) {
                ctx.fillStyle = 'rgba(255,200,50,0.7)';
                var fX = this.facing === 1 ? barrelX + 20 : barrelX - 6;
                ctx.fillRect(fX, gunY - 2, 6, 9);
            }
        } else {
            // Normal mode — golden blade (like sword but gold)
            var len = Math.floor(26 * rm);
            if (this.attackPhase === 'windup') {
                ctx.fillStyle = '#886622';
                ctx.fillRect(ax - 2, drawY - 6, 4, 18);
                ctx.fillStyle = bc;
                ctx.fillRect(ax - 2, drawY - 6 - len, 4, len);
                ctx.fillStyle = bh;
                ctx.fillRect(ax - 1, drawY - 4 - len, 2, len - 4);
            } else if (this.attackPhase === 'active') {
                ctx.fillStyle = '#886622';
                ctx.fillRect(ax - 2, drawY + 14, 4, 8);
                ctx.fillStyle = gc;
                ctx.fillRect(ax - 4, drawY + 12, 8, 4);
                var bladeX = this.facing === 1 ? ax + 2 : ax - 2 - len * 1.3;
                ctx.fillStyle = bc;
                ctx.fillRect(bladeX, drawY + 14, len * 1.3, 5);
                ctx.fillStyle = bh;
                ctx.fillRect(bladeX + 2, drawY + 15, len * 1.3 - 4, 3);
                ctx.strokeStyle = 'rgba(255,200,80,0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ax, drawY + 16, len * 1.4, this.facing === 1 ? -0.3 : Math.PI - 0.3, this.facing === 1 ? 0.3 : Math.PI + 0.3);
                ctx.stroke();
            } else if (this.attackPhase === 'recovery') {
                ctx.fillStyle = '#886622';
                ctx.fillRect(ax - 2, drawY + 18, 4, 8);
                ctx.fillStyle = '#aa8833';
                var rx = this.facing === 1 ? ax + 2 : ax - len * 0.8;
                ctx.fillRect(rx, drawY + 26, len * 0.8, 4);
            } else {
                ctx.fillStyle = '#886622';
                ctx.fillRect(ax - 2, drawY + 10, 4, 14);
                ctx.fillStyle = gc;
                ctx.fillRect(ax - 4, drawY + 8, 8, 4);
                ctx.save();
                ctx.translate(ax, drawY + 24);
                ctx.rotate(this.facing * 0.4);
                ctx.fillStyle = bc;
                ctx.fillRect(-2, 0, 4, len);
                ctx.fillStyle = bh;
                ctx.fillRect(-1, 2, 2, len - 4);
                ctx.restore();
            }
        }
    };

    // Override shield drawing for shield weapon (skip default small shield)
    var _origDraw = Fighter.prototype.draw;
    Fighter.prototype.draw = function () {
        if (this.weapon && this.weapon.id === 'shield') {
            // Don't draw the default small off-hand shield — the weapon IS the shield
            ctx.save();
            var hb = this.hurtbox;
            var flashing = this.flashTimer > 0;
            if (flashing && Math.floor(this.flashTimer / 30) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
            var bodyColor = flashing ? '#fff' : this.color;
            var lightColor = flashing ? '#eee' : this.colorLight;
            var darkColor = flashing ? '#ccc' : this.colorDark;
            var showSuperReadyFX = false;
            var superReadyPulse = 0;
            var superReadyElapsed = 0;
            var superReadyLife = 0;
            if (this.ghostMode && !flashing) { ctx.globalAlpha = 0.35; bodyColor = '#6633aa'; lightColor = '#8855cc'; darkColor = '#4422aa'; }
            if (this.frozenTimer > 0 && !flashing) { bodyColor = '#88ccee'; lightColor = '#aaddff'; darkColor = '#5599cc'; }
            if (this.blizzardTimer > 0 && !flashing) { bodyColor = '#6699bb'; lightColor = '#88bbdd'; darkColor = '#447799'; }
            if (this.slowTimer > 0 && !flashing && this.blizzardTimer <= 0 && this.frozenTimer <= 0) {
                var p2RainTint = this === G._p2Ref || this.color === '#cc3b3b';
                if (p2RainTint) { bodyColor = '#cc7777'; lightColor = '#ee9999'; darkColor = '#aa5555'; }
                else { bodyColor = '#4488cc'; lightColor = '#66aadd'; darkColor = '#225599'; }
            }
            if (this.superReadyFlashTimer > 0 && !flashing) {
                showSuperReadyFX = true;
                superReadyElapsed = SUPER_READY_FLASH_TOTAL - this.superReadyFlashTimer;
                if (superReadyElapsed < 0) superReadyElapsed = 0;
                superReadyLife = this.superReadyFlashTimer / SUPER_READY_FLASH_TOTAL;
                if (superReadyLife < 0) superReadyLife = 0;
                superReadyPulse = Math.sin(superReadyElapsed * 0.095) * 0.5 + 0.5;
                ctx.globalAlpha = 0.9 + superReadyPulse * 0.1;
                bodyColor = '#ffd94d';
                lightColor = '#fff6cf';
                darkColor = '#cd8a00';
            }
            var bx = hb.x, by = hb.y, bw = hb.w, bh = hb.h;
            var bobY = 0;
            if (this.state === 'walk') bobY = Math.sin(this.animFrame * Math.PI / 2) * 2;
            bobY += this.breatheOffset;
            var drawY = by + bobY;
            if (showSuperReadyFX) {
                drawSuperReadyBurst(this, drawY, bh, superReadyPulse, superReadyElapsed, superReadyLife);
            }
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(this.x - 16, G.GROUND_Y - 3, 32, 6);
            // Legs
            ctx.fillStyle = darkColor;
            if (this.crouching) {
                ctx.fillRect(bx + 4, drawY + bh - 10, 10, 10);
                ctx.fillRect(bx + bw - 14, drawY + bh - 10, 10, 10);
            } else {
                var legOff = this.state === 'walk' ? Math.sin(this.animFrame * Math.PI / 2) * 4 : 0;
                ctx.fillRect(bx + 6, drawY + bh - 18 + legOff, 9, 18 - legOff);
                ctx.fillRect(bx + bw - 15, drawY + bh - 18 - legOff, 9, 18 + legOff);
            }
            // Torso
            ctx.fillStyle = bodyColor;
            ctx.fillRect(bx + 2, drawY + 14, bw - 4, bh - 32);
            ctx.fillStyle = lightColor;
            ctx.fillRect(bx + 4, drawY + 16, bw - 12, 4);
            // Head
            ctx.fillStyle = bodyColor;
            ctx.fillRect(bx + 6, drawY, bw - 12, 16);
            ctx.fillStyle = '#111';
            var visorX = this.facing === 1 ? bx + bw - 14 : bx + 6;
            ctx.fillRect(visorX, drawY + 6, 8, 4);
            ctx.fillStyle = lightColor;
            ctx.fillRect(bx + bw / 2 - 2, drawY - 4, 4, 6);
            // Draw the shield weapon (no off-hand shield)
            this.drawSword(drawY, bx, by, bw, bh);
            if (showSuperReadyFX) {
                drawSuperReadyShine(this, bx, drawY, bw, bh, superReadyPulse, superReadyLife);
                if (superReadyLife > 0.35 && Math.random() < 0.28) {
                    G.spawnParticles(
                        this.x + (Math.random() - 0.5) * 18,
                        drawY + 6 + Math.random() * (bh - 20),
                        'rgba(255,245,180,0.9)', 1, 1.4
                    );
                }
                drawSuperReadyLabel(this, drawY, superReadyPulse, superReadyElapsed);
            }
            ctx.restore();
            if (this.flashTimer > 0) this.flashTimer -= 16.67;
            if (this.superReadyFlashTimer > 0) this.superReadyFlashTimer -= 16.67;
            return;
        }
        _origDraw.call(this);
    };

    G.Fighter = Fighter;
})(window.Game);
