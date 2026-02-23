// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Constants & Shared State
// ═══════════════════════════════════════════════════════════════════

window.Game = window.Game || {};

(function (G) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const W = 960;
    const H = 540;
    canvas.width = W;
    canvas.height = H;

    function resizeCanvas() {
        const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
        canvas.style.width = (W * scale) + 'px';
        canvas.style.height = (H * scale) + 'px';
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Expose to global Game namespace
    G.canvas = canvas;
    G.ctx = ctx;
    G.W = W;
    G.H = H;

    G.GRAVITY = 0.55;
    G.GROUND_Y = H - 60;
    G.WALK_SPEED = 2.88;
    G.JUMP_FORCE = -10.5;
    G.COYOTE_TIME = 120;
    G.FRICTION = 0.82;
    G.WALL_LEFT = 30;
    G.WALL_RIGHT = W - 30;

    G.HP_PER_ROUND = 3;
    G.getPlayerMaxHP = function (player) {
        if (player && typeof player.maxHP === 'number') return player.maxHP;
        return G.HP_PER_ROUND;
    };
    G.getPlayerDamageBonus = function (player) {
        if (player && typeof player.damageBonus === 'number') return player.damageBonus;
        return 0;
    };
    G.getDamageAmount = function (attacker, baseDamage) {
        var dmg = typeof baseDamage === 'number' ? baseDamage : 0;
        if (attacker) dmg += G.getPlayerDamageBonus(attacker);
        return dmg;
    };
    G.isLavaImmune = function (player) {
        return !!(player && player.lavaImmune);
    };
    G.ROUNDS_TO_WIN = 3;
    G.NORMAL_DAMAGE = 1;
    G.PARRY_COUNTER_DAMAGE = 1.5;
    G.ATTACK_WINDUP = 150;
    G.ATTACK_ACTIVE = 100;
    G.ATTACK_RECOVERY = 200;
    G.PARRY_WINDOW = 120;
    G.STAGGER_DURATION = 400;
    G.HITSTOP_DURATION = 80;

    // ─── Weapons ───────────────────────────────────────────────
    G.BULLET_SPEED = 8;
    G.SNIPER_BULLET_SPEED = 14;

    G.WEAPON_TABS = [
        { id: 'normal', name: 'Normal' },
        { id: 'fantasy', name: 'Fantasy' },
    ];

    G.WEAPONS = [
        {
            id: 'sword',
            name: 'Sword',
            group: 'normal',
            desc: 'Balanced blade. Reliable speed & damage for any situation.',
            superDesc: 'SUMMON CLONE: Creates a spectral ally that fights alongside you for 4s.',
            damage: 1,
            windupMult: 1.0,
            activeMult: 1.0,
            recoveryMult: 1.0,
            speedMult: 1.0,
            rangeMult: 1.0,
            bladeColor: '#ccc',
            bladeHighlight: '#fff',
            guardColor: '#b08840',
            icon: 'sword',
        },
        {
            id: 'blade',
            name: 'Blade',
            group: 'normal',
            desc: 'Super Fast daggers. Rapid low-damage cuts. High mobility.',
            superDesc: "ASSASSIN'S STRIKE: Next attack is a guaranteed ONE-SHOT kill if it hits.",
            damage: 0.5,
            windupMult: 0.5,
            activeMult: 0.6,
            recoveryMult: 0.5,
            speedMult: 1.45,
            rangeMult: 0.75,
            bladeColor: '#aaddff',
            bladeHighlight: '#ddeeff',
            guardColor: '#5577aa',
            icon: 'blade',
        },
        {
            id: 'spear',
            name: 'Spear',
            group: 'normal',
            desc: 'Heavy polearm. Slow but with superior reach. Keeps enemies at bay.',
            superDesc: 'EXTENDED RANGE: Doubles your attack reach for 4 seconds.',
            damage: 1.5,
            windupMult: 1.5,
            activeMult: 1.1,
            recoveryMult: 1.5,
            speedMult: 0.75,
            rangeMult: 1.55,
            bladeColor: '#887766',
            bladeHighlight: '#ccbbaa',
            guardColor: '#665544',
            icon: 'spear',
        },
        {
            id: 'gun',
            name: 'Gun',
            group: 'normal',
            desc: 'Standard issue firearm. Fires dodgeable rounds. Keep distance.',
            superDesc: 'RAPID FIRE: Doubles fire rate and reload speed for 4 seconds.',
            damage: 0.5,
            windupMult: 0.4,
            activeMult: 0.3,
            recoveryMult: 0.5,
            speedMult: 1.0,
            rangeMult: 0.5,
            bladeColor: '#555',
            bladeHighlight: '#888',
            guardColor: '#8B4513',
            icon: 'gun',
        },
        {
            id: 'sniper',
            name: 'Sniper',
            group: 'normal',
            desc: 'Anti-material rifle. Massive damage but very slow movement.',
            superDesc: 'EMERGENCY REPAIR: Instantly recovers 1 Heart and reloads.',
            damage: 3,
            windupMult: 0.5,
            activeMult: 0.3,
            recoveryMult: 0.6,
            speedMult: 0.65,
            rangeMult: 0.5,
            bladeColor: '#333',
            bladeHighlight: '#666',
            guardColor: '#2a2a2a',
            icon: 'sniper',
        },

        // ─── Fantasy Weapons ─────────────────────────────────────
        {
            id: 'hammer',
            name: 'Hammer',
            group: 'fantasy',
            desc: 'Devastating sledgehammer. Slow but deals 1.5 hearts on direct hit + ground shockwave.',
            superDesc: 'IRON CHAIN: 3 chains swing from the sky dealing damage + knockback.',
            damage: 1.5,
            windupMult: 2.0,
            activeMult: 1.5,
            recoveryMult: 2.0,
            speedMult: 0.6,
            rangeMult: 1.1,
            bladeColor: '#777',
            bladeHighlight: '#aaa',
            guardColor: '#5a3a1a',
            icon: 'hammer',
        },
        {
            id: 'frostdaggers',
            name: 'Frost Daggers',
            group: 'fantasy',
            desc: 'Lightning-fast ice daggers that fire frost shards. 0.5 heart per hit. Slows & freezes at 4 hits (1s).',
            superDesc: 'BLIZZARD: Freeze opponent. 75% slow, no jumping, 4 seconds.',
            damage: 0.5,
            windupMult: 0.24,
            activeMult: 0.18,
            recoveryMult: 0.3,
            speedMult: 1.3,
            rangeMult: 0.65,
            bladeColor: '#88ddff',
            bladeHighlight: '#ccf0ff',
            guardColor: '#4488aa',
            icon: 'frostdaggers',
        },
        {
            id: 'shield',
            name: 'Strong Shield',
            group: 'fantasy',
            desc: 'Permanent frontal shield. Attack = dash forward for 1 heart damage.',
            superDesc: 'PHALANX: 3 seconds of complete invincibility.',
            damage: 1,
            windupMult: 0.6,
            activeMult: 0.8,
            recoveryMult: 1.0,
            speedMult: 0.85,
            rangeMult: 0.9,
            bladeColor: '#8899aa',
            bladeHighlight: '#aabbcc',
            guardColor: '#556677',
            icon: 'shield',
        },
        {
            id: 'black',
            name: 'Black',
            group: 'fantasy',
            desc: 'Spawns black holes. Hold longer = bigger hole. Full suck-in = instant kill.',
            superDesc: 'GHOST: Become invincible ghost. Fly freely for 4 seconds.',
            damage: 0,
            windupMult: 0.5,
            activeMult: 0.3,
            recoveryMult: 0.5,
            speedMult: 0.95,
            rangeMult: 0.5,
            bladeColor: '#220033',
            bladeHighlight: '#440066',
            guardColor: '#110022',
            icon: 'black',
        },
        {
            id: 'derun',
            name: 'Derun',
            group: 'fantasy',
            desc: 'Fast blade. Super transforms into Stephengun, shooting wolf projectiles.',
            superDesc: 'STEPHENGUN: Switch to wolf cannon. Wolves hunt opponent. 0.5 heart damage.',
            damage: 0.5,
            windupMult: 0.5,
            activeMult: 0.6,
            recoveryMult: 0.5,
            speedMult: 1.1,
            rangeMult: 0.85,
            bladeColor: '#ddaa44',
            bladeHighlight: '#ffcc66',
            guardColor: '#886622',
            icon: 'derun',
        },
    ];

    G.STATE = {
        TITLE: 'TITLE',
        HOW_TO_PLAY: 'HOW_TO_PLAY',
        MAP_PREVIEW: 'MAP_PREVIEW',
        MAP_ROULETTE: 'MAP_ROULETTE',
        WEAPON_SELECT: 'WEAPON_SELECT',
        COUNTDOWN: 'COUNTDOWN',
        FIGHTING: 'FIGHTING',
        HITSTOP: 'HITSTOP',
        ROUND_END: 'ROUND_END',
        MATCH_END: 'MATCH_END',
        SUPER_PAUSE: 'SUPER_PAUSE',
    };
})(window.Game);
