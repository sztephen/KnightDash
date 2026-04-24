// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Main Game Loop & Flow
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var ctx = G.ctx;
    var W = G.W, H = G.H;

    // ─── Game State ───────────────────────────────────────────────
    var gameState = G.STATE.TITLE;
    var countdownTimer = 0;
    var countdownNum = 3;
    var countdownLastSfxNum = 0;
    var countdownFightCuePlayed = false;
    var mapPreviewTimer = 0;
    var roundEndTimer = 0;
    var roundWinner = 0;
    var matchWinner = 0;
    var titleBlink = 0;
    var BASE_WALL_LEFT = G.WALL_LEFT;
    var BASE_WALL_RIGHT = G.WALL_RIGHT;
    var SUDDEN_DEATH_START_MS = 60000;
    var SUDDEN_DEATH_MIN_WIDTH = 220;
    var SUDDEN_DEATH_SHRINK_PX_PER_SEC = 22;
    var SUDDEN_DEATH_DAMAGE_TICK_MS = 1000;
    var SUDDEN_DEATH_DAMAGE_PER_TICK = 0.5;
    var suddenDeathTimer = 0;
    var suddenDeathActive = false;

    // Super pause state
    var superPauseTimer = 0;
    var superPauseName = '';
    var superPauseColor = '';
    var FINISHER_DURATION_MS = 500;
    var FINISHER_TIME_SCALE = 0.28;
    var FINISHER_ZOOM = 1.72;
    var finisherTimer = 0;

    // Weapon select
    var p1WeaponIdx = 0;
    var p2WeaponIdx = 0;
    var p1TabIdx = 0;
    var p2TabIdx = 0;
    var p1Confirmed = false;
    var p2Confirmed = false;
    var weaponSelectTimer = 0;
    var weaponSelectPhase = 1;  // 1 = P1 picking, 2 = passing, 3 = P2 picking
    var passTimer = 0;

    // Ban system (classic mode)
    var banEnabled = false;
    var banCount = 1;
    var p1BannedWeapons = []; // weapon IDs P1 banned → P2 can't use
    var p2BannedWeapons = []; // weapon IDs P2 banned → P1 can't use
    var banActive = false;
    var banPhase = 0; // 0=P1 banning, 1=pass, 2=P2 banning, 3=pass-back
    var banSelections = []; // temp array of currently selected ban IDs
    var banTabIdx = 0;
    var banWeaponIdx = 0;
    var banTimer = 0;
    var banSelectOpen = false;
    var banOptionIdx = 0; // 0=Enable Ban, 1=No Ban
    var banCountSelectOpen = false;
    var banCountIdx = 0; // 0=1 ban, 1=2 bans, 2=3 bans
    var TITLE_MODES = [
        { id: 'classic', name: 'ok start...' },
        { id: 'blitz', name: 'blitz' },
        { id: 'howto', name: 'how to play' },
    ];
    var BLITZ_TYPES = [
        { id: '1v1', name: '1v1' },
        { id: '2v2', name: '2v2' },
    ];
    var BLITZ_1V1_TYPES = [
        { id: 'human', name: 'Human', ai: false },
        { id: 'ai', name: 'AI', ai: true },
    ];
    var BLITZ_1V1_AI_TYPES = [
        { id: 'ai_easy', name: 'AI Easy', aiHp: 2, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_medium', name: 'AI Medium', aiHp: 3, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_hard', name: 'AI Hard', aiHp: 4, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_bitch', name: 'AI Bitch', aiHp: 6, aiDmgBonus: 0.5, aiLavaImmune: true },
    ];
    var BLITZ_2V2_TYPES = [
        { id: 'ai_easy', name: 'AI Easy', aiHp: 2, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_medium', name: 'AI Medium', aiHp: 3, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_hard', name: 'AI Hard', aiHp: 4, aiDmgBonus: 0, aiLavaImmune: false },
        { id: 'ai_bitch', name: 'AI Bitch', aiHp: 6, aiDmgBonus: 0.5, aiLavaImmune: true },
    ];
    var blitz1v1SelectOpen = false;
    var blitz1v1TypeIdx = 0;
    var blitz1v1AiSelectOpen = false;
    var blitz1v1AiTypeIdx = 1;
    var blitz2v2SelectOpen = false;
    var blitz2v2TypeIdx = 1;
    var aiDifficultyHp = G.HP_PER_ROUND;
    var aiDifficultyDamageBonus = 0;
    var aiDifficultyLavaImmune = false;
    var titleModeIdx = 0;
    var blitzTypeIdx = 0;
    var blitzTypeSelectOpen = false;
    var blitzAiSoonTimer = 0;
    var BLITZ_AI_SOON_MS = 1400;
    var activeModeId = TITLE_MODES[0].id;
    var blitzOrder = [];
    var blitzProgress = { p1: 0, p2: 0, team1: 0, team2: 0 };
    G.is2v2 = false;
    // ─── Map Select (manual pick for classic) ──────────────────
    var mapSelectIdx = 0;
    var mapSelectConfirmed = false;
    var mapSelectFlashTimer = 0;
    var MAP_SELECT_LOCK_FLASH_MS = 900;

    // ─── Map Roulette (spinning animation for blitz) ─────────
    var MAP_ROULETTE_SPIN_MS = 5000;
    var MAP_ROULETTE_MIN_STEP_MS = 95;
    var MAP_ROULETTE_MAX_STEP_MS = 1250;
    var MAP_ROULETTE_END_STEP_MS = 1000;
    var MAP_ROULETTE_LAND_HOLD_MS = 1000;
    var MAP_ROULETTE_HIGHLIGHT_DELAY_MS = 0;
    var MAP_ROULETTE_SKIP_CONTINUE_DELAY_MS = 120;
    var rouletteSpinElapsed = 0;
    var rouletteStepTimer = 0;
    var rouletteLanding = false;
    var rouletteLandingTimer = 0;
    var rouletteSettled = false;
    var rouletteSettledTimer = 0;
    var rouletteFlashTimer = 0;
    var rouletteFinalIndex = -1;
    var rouletteForceHighlight = false;
    var rouletteHighlightSfxPlayed = false;
    var rouletteHighlightPulseTimer = 0;
    var rouletteBag = [];
    var rouletteLastIndex = -1;

    // Show a random stage backdrop on every page refresh.
    if (typeof G.randomizeMap === 'function') {
        G.randomizeMap();
    }

    var p1 = new G.Fighter(
        W * 0.3, 1,
        '#3b6dcc', '#5b9aff', '#2a4f99',
        { left: 'a', right: 'd', up: 'w', down: 's', attack: 'q' }
    );

    var p2 = new G.Fighter(
        W * 0.7, -1,
        '#cc3b3b', '#ff5b5b', '#992a2a',
        { left: 'j', right: 'l', up: 'i', down: 'k', attack: 'u' }
    );

    // P3 and P4 — AI fighters for 2v2 mode (dummy controls, never human-driven)
    var p3 = new G.Fighter(
        W * 0.6, 1,
        '#44aa44', '#66cc66', '#338833',
        { left: '_3l', right: '_3r', up: '_3u', down: '_3d', attack: '_3a' }
    );
    var p4 = new G.Fighter(
        W * 0.7, -1,
        '#aa44aa', '#cc66cc', '#883388',
        { left: '_4l', right: '_4r', up: '_4u', down: '_4d', attack: '_4a' }
    );

    function getModeName(modeId) {
        for (var i = 0; i < TITLE_MODES.length; i++) {
            if (TITLE_MODES[i].id === modeId) return TITLE_MODES[i].name;
        }
        return TITLE_MODES[0].name;
    }

    function applyFighterHPByMode() {
        var baseHp = G.HP_PER_ROUND;
        p1.maxHP = baseHp;
        p2.maxHP = baseHp;
        p3.maxHP = baseHp;
        p4.maxHP = baseHp;
        p1.damageBonus = 0;
        p2.damageBonus = 0;
        p3.damageBonus = 0;
        p4.damageBonus = 0;
        p1.lavaImmune = false;
        p2.lavaImmune = false;
        p3.lavaImmune = false;
        p4.lavaImmune = false;

        if (G.aiEnabled) {
            if (G.is2v2) {
                p3.maxHP = aiDifficultyHp;
                p4.maxHP = aiDifficultyHp;
                p3.damageBonus = aiDifficultyDamageBonus;
                p4.damageBonus = aiDifficultyDamageBonus;
                p3.lavaImmune = aiDifficultyLavaImmune;
                p4.lavaImmune = aiDifficultyLavaImmune;
            } else {
                p2.maxHP = aiDifficultyHp;
                p2.damageBonus = aiDifficultyDamageBonus;
                p2.lavaImmune = aiDifficultyLavaImmune;
            }
        }
    }

    function shuffleWeapons(weapons) {
        var shuffled = weapons.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = tmp;
        }
        return shuffled;
    }

    function equipBlitzWeapons() {
        if (!blitzOrder || blitzOrder.length === 0) return;
        if (G.is2v2) {
            var t1Idx = Math.min(blitzProgress.team1, blitzOrder.length - 1);
            var t2Idx = Math.min(blitzProgress.team2, blitzOrder.length - 1);
            p1.equipWeapon(blitzOrder[t1Idx]);
            p2.equipWeapon(blitzOrder[t1Idx]);
            p3.equipWeapon(blitzOrder[t2Idx]);
            p4.equipWeapon(blitzOrder[t2Idx]);
        } else {
            var p1Idx = Math.min(blitzProgress.p1, blitzOrder.length - 1);
            var p2Idx = Math.min(blitzProgress.p2, blitzOrder.length - 1);
            p1.equipWeapon(blitzOrder[p1Idx]);
            p2.equipWeapon(blitzOrder[p2Idx]);
        }
    }

    function setupBlitzMatch() {
        blitzOrder = shuffleWeapons(G.WEAPONS);
        blitzProgress.p1 = 0;
        blitzProgress.p2 = 0;
        blitzProgress.team1 = 0;
        blitzProgress.team2 = 0;
        equipBlitzWeapons();
    }

    function confirmMapSelection() {
        if (mapSelectConfirmed) return;
        mapSelectConfirmed = true;
        mapSelectFlashTimer = MAP_SELECT_LOCK_FLASH_MS;
        G.currentMapIndex = mapSelectIdx;
        if (typeof G.resetObstacles === 'function') {
            G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
        }
        G.initAudio();
        G.playMapRouletteLock();
        G.playMapChosen();
    }

    function enterMapSelect() {
        mapSelectIdx = G.currentMapIndex;
        mapSelectConfirmed = false;
        mapSelectFlashTimer = 0;
        G.currentMapIndex = mapSelectIdx;
        if (typeof G.resetObstacles === 'function') {
            G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
        }
    }

    // ─── Roulette helpers (blitz) ────────────────────────────────
    function shuffleIndexes(count) {
        var shuffled = [];
        for (var i = 0; i < count; i++) shuffled.push(i);
        for (var j = shuffled.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var tmp = shuffled[j];
            shuffled[j] = shuffled[k];
            shuffled[k] = tmp;
        }
        return shuffled;
    }

    function refillRouletteBag() {
        rouletteBag = shuffleIndexes(G.MAPS.length);
        if (rouletteBag.length > 1 && rouletteBag[rouletteBag.length - 1] === rouletteLastIndex) {
            var swapIdx = Math.floor(Math.random() * (rouletteBag.length - 1));
            var tmp = rouletteBag[swapIdx];
            rouletteBag[swapIdx] = rouletteBag[rouletteBag.length - 1];
            rouletteBag[rouletteBag.length - 1] = tmp;
        }
    }

    function nextRouletteIndex() {
        if (rouletteBag.length === 0) refillRouletteBag();
        var idx = rouletteBag.pop();
        rouletteLastIndex = idx;
        return idx;
    }

    function settleRoulette(forceHighlight) {
        if (rouletteSettled) return;
        rouletteSettled = true;
        rouletteSettledTimer = 0;
        rouletteFlashTimer = MAP_SELECT_LOCK_FLASH_MS;
        rouletteForceHighlight = !!forceHighlight;
        if (rouletteFinalIndex < 0) {
            rouletteFinalIndex = nextRouletteIndex();
        }
        G.currentMapIndex = rouletteFinalIndex;
        if (typeof G.resetObstacles === 'function') {
            G.resetObstacles(G.currentMapIndex, { rerollLayout: !rouletteLanding });
        }
        rouletteLastIndex = rouletteFinalIndex;
        G.initAudio();
        G.playMapRouletteLock();
        G.playMapChosen();
    }

    function startRouletteAnimation() {
        rouletteSpinElapsed = 0;
        rouletteStepTimer = 0;
        rouletteLanding = false;
        rouletteLandingTimer = 0;
        rouletteSettled = false;
        rouletteSettledTimer = 0;
        rouletteFlashTimer = 0;
        rouletteFinalIndex = -1;
        rouletteForceHighlight = false;
        rouletteHighlightSfxPlayed = false;
        rouletteHighlightPulseTimer = 0;
        rouletteLastIndex = G.currentMapIndex;
        rouletteBag = [];
        G.currentMapIndex = nextRouletteIndex();
        rouletteFinalIndex = nextRouletteIndex();
        if (G.MAPS.length > 1 && rouletteFinalIndex === G.currentMapIndex) {
            rouletteFinalIndex = nextRouletteIndex();
        }
        if (typeof G.resetObstacles === 'function') {
            G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
        }
        G.playMapRouletteStart();
        G.playMapRouletteTick(0);
    }

    function updateRouletteAnimation(dt) {
        if (rouletteSettled) {
            rouletteSettledTimer += dt;
            var highlightReady = rouletteForceHighlight || rouletteSettledTimer >= MAP_ROULETTE_HIGHLIGHT_DELAY_MS;
            if (highlightReady && !rouletteHighlightSfxPlayed) {
                rouletteHighlightSfxPlayed = true;
                rouletteHighlightPulseTimer = 0;
                G.playMapHighlight();
            }
            if (highlightReady && rouletteFlashTimer > 0) {
                rouletteFlashTimer -= dt;
                rouletteHighlightPulseTimer += dt;
                if (rouletteHighlightPulseTimer >= 260) {
                    rouletteHighlightPulseTimer = 0;
                    G.playMapHighlightPulse();
                }
            }
            return;
        }

        if (rouletteLanding) {
            rouletteLandingTimer += dt;
            if (rouletteLandingTimer >= MAP_ROULETTE_LAND_HOLD_MS) {
                settleRoulette(false);
            }
            return;
        }

        rouletteSpinElapsed += dt;
        rouletteStepTimer += dt;

        var spinProgress = Math.min(1, rouletteSpinElapsed / MAP_ROULETTE_SPIN_MS);
        var stepMs = MAP_ROULETTE_MIN_STEP_MS;
        if (spinProgress < 0.45) {
            stepMs = MAP_ROULETTE_MIN_STEP_MS + (spinProgress / 0.45) * 180;
        } else if (spinProgress < 0.72) {
            stepMs = 275 + ((spinProgress - 0.45) / 0.27) * 275;
        } else if (spinProgress < 0.86) {
            stepMs = 550 + ((spinProgress - 0.72) / 0.14) * (MAP_ROULETTE_END_STEP_MS - 550);
        } else {
            stepMs = MAP_ROULETTE_END_STEP_MS +
                ((spinProgress - 0.86) / 0.14) * (MAP_ROULETTE_MAX_STEP_MS - MAP_ROULETTE_END_STEP_MS);
        }

        if (rouletteStepTimer >= stepMs) {
            rouletteStepTimer = 0;
            G.currentMapIndex = nextRouletteIndex();
            if (typeof G.resetObstacles === 'function') {
                G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
            }
            G.playMapRouletteTick(spinProgress);
        }

        if (rouletteSpinElapsed >= MAP_ROULETTE_SPIN_MS) {
            rouletteLanding = true;
            rouletteLandingTimer = 0;
            G.currentMapIndex = rouletteFinalIndex;
            rouletteLastIndex = rouletteFinalIndex;
            if (typeof G.resetObstacles === 'function') {
                G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
            }
            G.playMapRouletteTick(1);
        }
    }

    function drawRouletteHighlight(centerY, mapTitle, titleSize) {
        var flashPct = rouletteFlashTimer > 0
            ? rouletteFlashTimer / MAP_SELECT_LOCK_FLASH_MS
            : 0;
        var pulse = Math.sin(mapPreviewTimer * 0.012) * 0.5 + 0.5;
        var text = mapTitle || '';
        var size = titleSize || 38;

        ctx.save();
        ctx.font = size + 'px "Press Start 2P", monospace';
        var textW = ctx.measureText(text).width;
        ctx.restore();

        var boxW = Math.max(180, Math.min(W - 48, textW + 48));
        var boxH = size + 24;
        var boxX = W / 2 - boxW / 2;
        var boxY = centerY - boxH / 2;

        ctx.save();
        ctx.fillStyle = 'rgba(255,204,68,' + (0.08 + pulse * 0.08 + flashPct * 0.25) + ')';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = 'rgba(255,240,180,' + (0.35 + pulse * 0.2 + flashPct * 0.35) + ')';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        var shineX = boxX - 100 + ((mapPreviewTimer * 0.55) % (boxW + 200));
        var shineGrad = ctx.createLinearGradient(shineX, 0, shineX + 90, 0);
        shineGrad.addColorStop(0, 'rgba(255,255,255,0)');
        shineGrad.addColorStop(0.5, 'rgba(255,255,220,' + (0.14 + flashPct * 0.32) + ')');
        shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.rect(boxX + 2, boxY + 2, boxW - 4, boxH - 4);
        ctx.clip();
        ctx.fillStyle = shineGrad;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.restore();
    }

    function enterMapRoulette() {
        resetSuddenDeathArena();
        gameState = G.STATE.MAP_ROULETTE;
        mapPreviewTimer = 0;
        startRouletteAnimation();
    }

    G.getModeState = function () {
        return {
            id: activeModeId,
            name: getModeName(activeModeId),
            blitzOrder: blitzOrder,
            p1Progress: blitzProgress.p1,
            p2Progress: blitzProgress.p2,
            team1Progress: blitzProgress.team1,
            team2Progress: blitzProgress.team2,
            is2v2: G.is2v2,
        };
    };

    // ─── Title Screen ─────────────────────────────────────────────
    function drawTitleScreen() {
        G.drawStage();

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);

        G.drawCenterText('KNIGHT', H * 0.28, 42, '#ffcc44');
        G.drawCenterText('DASH', H * 0.42, 42, '#ffcc44');
        G.drawCenterText('2-Player Local Duel', H * 0.54, 12, '#aaa');

        // Crossed swords
        ctx.save();
        ctx.translate(W / 2, H * 0.18);
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-25, 15); ctx.lineTo(25, -15); ctx.stroke();
        ctx.fillStyle = '#b08840';
        ctx.fillRect(-2, -2, 8, 4);
        ctx.beginPath(); ctx.moveTo(25, 15); ctx.lineTo(-25, -15); ctx.stroke();
        ctx.fillStyle = '#b08840';
        ctx.fillRect(-6, -2, 8, 4);
        ctx.restore();

        var modeTop = H * 0.62;
        titleBlink += 16.67;
        var selectPulse = Math.sin(titleBlink * 0.01) * 0.5 + 0.5;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        if (banCountSelectOpen) {
            // Ban count submenu (1 / 2 / 3)
            ctx.fillText('BAN COUNT', W / 2, modeTop);
            var BAN_COUNTS = [1, 2, 3];
            var banCountRowStep = 24;
            for (var bci = 0; bci < BAN_COUNTS.length; bci++) {
                var bcSelected = bci === banCountIdx;
                var bcy = modeTop + 22 + bci * banCountRowStep;
                var bcFillA = 0.12 + selectPulse * 0.2;
                var bcStrokeA = 0.45 + selectPulse * 0.5;
                var bcTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = bcSelected
                    ? 'rgba(255,204,68,' + bcFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, bcy - 10, 280, 18);
                ctx.strokeStyle = bcSelected
                    ? 'rgba(255,204,68,' + bcStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = bcSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, bcy - 10, 280, 18);
                ctx.font = bcSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = bcSelected
                    ? 'rgba(255,230,140,' + bcTextA + ')'
                    : '#aaa';
                ctx.fillText(BAN_COUNTS[bci] + (BAN_COUNTS[bci] === 1 ? ' Ban' : ' Bans'), W / 2, bcy + 2);

                if (bcSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, bcy - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, bcy - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BAN_COUNTS.length * banCountRowStep + 8);
        } else if (banSelectOpen) {
            // Ban enable/disable submenu
            ctx.fillText('WEAPON BANS', W / 2, modeTop);
            var BAN_OPTIONS = ['Enable Ban', 'No Ban'];
            var banRowStep = 24;
            for (var boi = 0; boi < BAN_OPTIONS.length; boi++) {
                var boSelected = boi === banOptionIdx;
                var boy = modeTop + 22 + boi * banRowStep;
                var boFillA = 0.12 + selectPulse * 0.2;
                var boStrokeA = 0.45 + selectPulse * 0.5;
                var boTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = boSelected
                    ? 'rgba(255,204,68,' + boFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, boy - 10, 280, 18);
                ctx.strokeStyle = boSelected
                    ? 'rgba(255,204,68,' + boStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = boSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, boy - 10, 280, 18);
                ctx.font = boSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = boSelected
                    ? 'rgba(255,230,140,' + boTextA + ')'
                    : '#aaa';
                ctx.fillText(BAN_OPTIONS[boi], W / 2, boy + 2);

                if (boSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, boy - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, boy - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BAN_OPTIONS.length * banRowStep + 8);
        } else if (!blitzTypeSelectOpen) {
            ctx.fillText('SELECT MODE', W / 2, modeTop);

            for (var mi = 0; mi < TITLE_MODES.length; mi++) {
                var mode = TITLE_MODES[mi];
                var selected = mi === titleModeIdx;
                var my = modeTop + 22 + mi * 24;
                var selectedFillA = 0.12 + selectPulse * 0.2;
                var selectedStrokeA = 0.45 + selectPulse * 0.5;
                var selectedTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = selected
                    ? 'rgba(255,204,68,' + selectedFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, my - 10, 280, 18);
                ctx.strokeStyle = selected
                    ? 'rgba(255,204,68,' + selectedStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = selected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, my - 10, 280, 18);
                ctx.font = selected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = selected
                    ? 'rgba(255,230,140,' + selectedTextA + ')'
                    : '#aaa';
                ctx.fillText(mode.name, W / 2, my + 2);

                if (selected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, my - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, my - 3, 6, 6);
                }
            }
        } else if (blitz1v1AiSelectOpen) {
            // Third level: 1v1 AI difficulty
            ctx.fillText('1v1 AI DIFFICULTY', W / 2, modeTop);
            var oneVOneAiRowStep = 24;
            for (var bi = 0; bi < BLITZ_1V1_AI_TYPES.length; bi++) {
                var aiType = BLITZ_1V1_AI_TYPES[bi];
                var aiSelected = bi === blitz1v1AiTypeIdx;
                var by = modeTop + 22 + bi * oneVOneAiRowStep;
                var aiSelectedFillA = 0.12 + selectPulse * 0.2;
                var aiSelectedStrokeA = 0.45 + selectPulse * 0.5;
                var aiSelectedTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = aiSelected
                    ? 'rgba(255,204,68,' + aiSelectedFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, by - 10, 280, 18);
                ctx.strokeStyle = aiSelected
                    ? 'rgba(255,204,68,' + aiSelectedStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = aiSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, by - 10, 280, 18);
                ctx.font = aiSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = aiSelected
                    ? 'rgba(255,230,140,' + aiSelectedTextA + ')'
                    : '#aaa';
                ctx.fillText(aiType.name, W / 2, by + 2);

                if (aiSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, by - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, by - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BLITZ_1V1_AI_TYPES.length * oneVOneAiRowStep + 8);
        } else if (blitz1v1SelectOpen) {
            // Second level: 1v1 → Human / AI
            ctx.fillText('1v1 OPPONENT', W / 2, modeTop);
            var oneVOneRowStep = 24;
            for (var bi = 0; bi < BLITZ_1V1_TYPES.length; bi++) {
                var blitzType = BLITZ_1V1_TYPES[bi];
                var blitzSelected = bi === blitz1v1TypeIdx;
                var by = modeTop + 22 + bi * oneVOneRowStep;
                var blitzSelectedFillA = 0.12 + selectPulse * 0.2;
                var blitzSelectedStrokeA = 0.45 + selectPulse * 0.5;
                var blitzSelectedTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = blitzSelected
                    ? 'rgba(255,204,68,' + blitzSelectedFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, by - 10, 280, 18);
                ctx.strokeStyle = blitzSelected
                    ? 'rgba(255,204,68,' + blitzSelectedStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = blitzSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, by - 10, 280, 18);
                ctx.font = blitzSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = blitzSelected
                    ? 'rgba(255,230,140,' + blitzSelectedTextA + ')'
                    : '#aaa';
                ctx.fillText(blitzType.name, W / 2, by + 2);

                if (blitzSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, by - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, by - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BLITZ_1V1_TYPES.length * oneVOneRowStep + 8);
        } else if (blitz2v2SelectOpen) {
            // Second level: 2v2 → AI difficulty
            ctx.fillText('2v2 AI DIFFICULTY', W / 2, modeTop);
            var twoVTwoRowStep = 24;
            for (var bi = 0; bi < BLITZ_2V2_TYPES.length; bi++) {
                var aiType = BLITZ_2V2_TYPES[bi];
                var aiSelected = bi === blitz2v2TypeIdx;
                var by = modeTop + 22 + bi * twoVTwoRowStep;
                var aiSelectedFillA = 0.12 + selectPulse * 0.2;
                var aiSelectedStrokeA = 0.45 + selectPulse * 0.5;
                var aiSelectedTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = aiSelected
                    ? 'rgba(255,204,68,' + aiSelectedFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, by - 10, 280, 18);
                ctx.strokeStyle = aiSelected
                    ? 'rgba(255,204,68,' + aiSelectedStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = aiSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, by - 10, 280, 18);
                ctx.font = aiSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = aiSelected
                    ? 'rgba(255,230,140,' + aiSelectedTextA + ')'
                    : '#aaa';
                ctx.fillText(aiType.name, W / 2, by + 2);

                if (aiSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, by - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, by - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BLITZ_2V2_TYPES.length * twoVTwoRowStep + 8);
        } else {
            // First level: 1v1 / 2v2
            ctx.fillText('BLITZ FORMAT', W / 2, modeTop);
            var blitzFormatRowStep = 24;
            for (var bi = 0; bi < BLITZ_TYPES.length; bi++) {
                var blitzType = BLITZ_TYPES[bi];
                var blitzSelected = bi === blitzTypeIdx;
                var by = modeTop + 22 + bi * blitzFormatRowStep;
                var blitzSelectedFillA = 0.12 + selectPulse * 0.2;
                var blitzSelectedStrokeA = 0.45 + selectPulse * 0.5;
                var blitzSelectedTextA = 0.65 + selectPulse * 0.35;

                ctx.fillStyle = blitzSelected
                    ? 'rgba(255,204,68,' + blitzSelectedFillA + ')'
                    : 'rgba(255,255,255,0.06)';
                ctx.fillRect(W / 2 - 140, by - 10, 280, 18);
                ctx.strokeStyle = blitzSelected
                    ? 'rgba(255,204,68,' + blitzSelectedStrokeA + ')'
                    : 'rgba(255,255,255,0.15)';
                ctx.lineWidth = blitzSelected ? 2 : 1;
                ctx.strokeRect(W / 2 - 140, by - 10, 280, 18);
                ctx.font = blitzSelected ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                ctx.fillStyle = blitzSelected
                    ? 'rgba(255,230,140,' + blitzSelectedTextA + ')'
                    : '#aaa';
                ctx.fillText(blitzType.name, W / 2, by + 2);

                if (blitzSelected) {
                    ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + selectPulse * 0.45) + ')';
                    ctx.fillRect(W / 2 - 152, by - 3, 6, 6);
                    ctx.fillRect(W / 2 + 146, by - 3, 6, 6);
                }
            }

            ctx.font = '7px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillText('Q/U: SELECT  |  E/O: BACK', W / 2, modeTop + 22 + BLITZ_TYPES.length * blitzFormatRowStep + 8);
        }

        G.drawCenterText(G.MAPS.length + ' MAPS', H * 0.85, 8, 'rgba(255,255,255,0.4)');

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#5b9aff';
        ctx.fillText('P1: WASD + Q + E', W * 0.3, H * 0.88);
        ctx.fillStyle = '#ff5b5b';
        ctx.fillText('P2: IJKL + U + O', W * 0.7, H * 0.88);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText('Made By Stephen S', W / 2, H * 0.95);
        ctx.textAlign = 'start';
    }

    function drawHowToCard(x, y, w, h, title, accent, lines) {
        ctx.fillStyle = 'rgba(14, 18, 34, 0.8)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = 'rgba(0,0,0,0.24)';
        ctx.fillRect(x + 1, y + 1, w - 2, 20);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 1, y + 1, w - 2, 20);

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = accent;
        ctx.textAlign = 'left';
        ctx.fillText(title, x + 8, y + 14);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = 'rgba(240,240,245,0.88)';
        for (var i = 0; i < lines.length; i++) {
            ctx.fillText('- ' + lines[i], x + 8, y + 38 + i * 18);
        }
    }

    function drawHowToPlayScreen() {
        G.drawStage();
        var overlay = ctx.createLinearGradient(0, 0, 0, H);
        overlay.addColorStop(0, 'rgba(6,10,20,0.8)');
        overlay.addColorStop(1, 'rgba(10,10,16,0.86)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, W, H);

        G.drawCenterText('HOW TO PLAY', H * 0.11, 24, '#ffcc44');
        G.drawCenterText('CLEAR BASICS FOR NEW PLAYERS', H * 0.16, 10, 'rgba(255,255,255,0.62)');

        drawHowToCard(44, 106, 424, 146, 'COMBAT BASICS', '#ffcc44', [
            'Goal: drop opponent from 3 hearts to 0',
            'Win 3 rounds to win the match',
            'Parry: time your attack into enemy hit to counter',
            'Use super at the right moment to swing rounds',
        ]);

        drawHowToCard(492, 106, 424, 146, 'MOVEMENT + DEFENSE', '#88bbff', [
            'Jump between platforms to change angle',
            'Crouch lowers your hurtbox to dodge shots/swings',
            'Ladders and map height help reset pressure',
            'Spacing matters more than mashing attacks',
        ]);

        drawHowToCard(44, 270, 424, 146, 'MAPS + OBSTACLES', '#88ddaa', [
            'Choose your map before each round',
            'Maps have different layouts and platform routes',
            'Obstacles can damage, boost, teleport, heal, or slow',
            'Learn hazards fast to turn them into advantages',
        ]);

        drawHowToCard(492, 270, 424, 146, 'POWERUPS + WEAPONS', '#ff9f9f', [
            'Heart powerups spawn and heal missing HP',
            'Contest center stage to secure those pickups',
            'Weapon tabs: Normal and Fantasy',
            'Classic = fixed weapon, Blitz = rotating weapons',
        ]);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(30, 432, W - 60, 74);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 432, W - 60, 74);

        G.drawCenterText('CONTROLS', H * 0.84, 10, 'rgba(255,255,255,0.9)');
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#5b9aff';
        ctx.fillText('P1: A/D MOVE  W JUMP  S CROUCH  Q ATTACK  E SUPER', W * 0.5, H * 0.89);
        ctx.fillStyle = '#ff7a7a';
        ctx.fillText('P2: J/L MOVE  I JUMP  K CROUCH  U ATTACK  O SUPER', W * 0.5, H * 0.93);
        ctx.textAlign = 'start';
        G.drawCenterText('Q / U: BACK', H * 0.965, 8, 'rgba(255,255,255,0.75)');
    }

    // ─── Weapon Select Screen ─────────────────────────────────────
    function drawWeaponIcon(cx, cy, weaponId, scale) {
        ctx.save();
        ctx.translate(cx, cy);
        var s = scale || 1;
        if (weaponId === 'sword') {
            ctx.fillStyle = '#b08840';
            ctx.fillRect(-4 * s, -2 * s, 8 * s, 5 * s);
            ctx.fillStyle = '#ccc';
            ctx.fillRect(-3 * s, -22 * s, 6 * s, 20 * s);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-1 * s, -20 * s, 3 * s, 16 * s);
            ctx.fillStyle = '#888';
            ctx.fillRect(-3 * s, 3 * s, 6 * s, 10 * s);
        } else if (weaponId === 'blade') {
            ctx.fillStyle = '#5577aa';
            ctx.fillRect(-3 * s, -1 * s, 6 * s, 4 * s);
            ctx.fillStyle = '#aaddff';
            ctx.beginPath();
            ctx.moveTo(-2 * s, -1 * s);
            ctx.lineTo(0, -18 * s);
            ctx.lineTo(4 * s, -15 * s);
            ctx.lineTo(2 * s, -1 * s);
            ctx.fill();
            ctx.fillStyle = '#ddeeff';
            ctx.fillRect(0, -14 * s, 2 * s, 10 * s);
            ctx.fillStyle = '#5577aa';
            ctx.fillRect(-2 * s, 3 * s, 5 * s, 8 * s);
        } else if (weaponId === 'spear') {
            ctx.fillStyle = '#665544';
            ctx.fillRect(-2 * s, -10 * s, 4 * s, 30 * s);
            ctx.fillStyle = '#887766';
            ctx.fillRect(-1 * s, -8 * s, 2 * s, 26 * s);
            ctx.fillStyle = '#bbb';
            ctx.beginPath();
            ctx.moveTo(-4 * s, -10 * s);
            ctx.lineTo(0, -24 * s);
            ctx.lineTo(4 * s, -10 * s);
            ctx.fill();
            ctx.fillStyle = '#ddd';
            ctx.fillRect(-1 * s, -22 * s, 2 * s, 12 * s);
        } else if (weaponId === 'gun') {
            // Gun icon
            ctx.fillStyle = '#555';
            ctx.fillRect(-12 * s, -2 * s, 24 * s, 5 * s);
            ctx.fillStyle = '#444';
            ctx.fillRect(-12 * s, -1 * s, 24 * s, 2 * s);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(-4 * s, 2 * s, 10 * s, 7 * s);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(-3 * s, 3 * s, 8 * s, 4 * s);
            ctx.fillStyle = '#6B3410';
            ctx.fillRect(-1 * s, 8 * s, 5 * s, 8 * s);
            ctx.fillStyle = '#777';
            ctx.fillRect(10 * s, -3 * s, 2 * s, 7 * s);
        } else if (weaponId === 'sniper') {
            // Sniper icon — long rifle with scope
            ctx.fillStyle = '#333';
            ctx.fillRect(-16 * s, -1 * s, 32 * s, 4 * s);
            ctx.fillStyle = '#222';
            ctx.fillRect(-16 * s, 0, 32 * s, 1 * s);
            // Scope
            ctx.fillStyle = '#444';
            ctx.fillRect(-4 * s, -6 * s, 8 * s, 5 * s);
            ctx.fillStyle = '#66aaff';
            ctx.fillRect(-3 * s, -5 * s, 6 * s, 3 * s);
            // Stock
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(-16 * s, 2 * s, 12 * s, 6 * s);
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(-15 * s, 3 * s, 10 * s, 3 * s);
            // Grip
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 3 * s, 4 * s, 8 * s);
            // Barrel tip
            ctx.fillStyle = '#555';
            ctx.fillRect(14 * s, -2 * s, 2 * s, 6 * s);
        } else if (weaponId === 'hammer') {
            // Hammer icon — T-shape
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(-2 * s, -2 * s, 4 * s, 22 * s);
            ctx.fillStyle = '#777';
            ctx.fillRect(-10 * s, -14 * s, 20 * s, 12 * s);
            ctx.fillStyle = '#aaa';
            ctx.fillRect(-8 * s, -12 * s, 16 * s, 3 * s);
            ctx.fillStyle = '#555';
            ctx.fillRect(-10 * s, -5 * s, 20 * s, 3 * s);
        } else if (weaponId === 'frostdaggers') {
            // Frost daggers icon — two crossed daggers
            ctx.fillStyle = '#4488aa';
            ctx.fillRect(-4 * s, 0 * s, 3 * s, 5 * s);
            ctx.fillRect(1 * s, 0 * s, 3 * s, 5 * s);
            ctx.fillStyle = '#88ddff';
            ctx.save();
            ctx.rotate(-0.2);
            ctx.fillRect(-2 * s, -16 * s, 2 * s, 16 * s);
            ctx.restore();
            ctx.save();
            ctx.rotate(0.2);
            ctx.fillRect(0 * s, -16 * s, 2 * s, 16 * s);
            ctx.restore();
            ctx.fillStyle = '#ccf0ff';
            ctx.fillRect(-1 * s, -14 * s, 1 * s, 10 * s);
            ctx.fillRect(1 * s, -14 * s, 1 * s, 10 * s);
        } else if (weaponId === 'shield') {
            // Shield icon — kite shield
            ctx.fillStyle = '#667788';
            ctx.beginPath();
            ctx.moveTo(0, -14 * s);
            ctx.lineTo(10 * s, -8 * s);
            ctx.lineTo(10 * s, 4 * s);
            ctx.lineTo(0, 14 * s);
            ctx.lineTo(-10 * s, 4 * s);
            ctx.lineTo(-10 * s, -8 * s);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#8899aa';
            ctx.beginPath();
            ctx.moveTo(0, -12 * s);
            ctx.lineTo(8 * s, -7 * s);
            ctx.lineTo(8 * s, 3 * s);
            ctx.lineTo(0, 12 * s);
            ctx.lineTo(-8 * s, 3 * s);
            ctx.lineTo(-8 * s, -7 * s);
            ctx.closePath();
            ctx.fill();
            // Cross
            ctx.fillStyle = '#556677';
            ctx.fillRect(-1 * s, -10 * s, 2 * s, 20 * s);
            ctx.fillRect(-7 * s, -2 * s, 14 * s, 2 * s);
        } else if (weaponId === 'black') {
            // Black hole icon — dark circle with purple ring
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(0, 0, 10 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#7733cc';
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.arc(0, 0, 10 * s, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.fillStyle = '#440066';
            ctx.beginPath();
            ctx.arc(0, 0, 4 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#aa66ff';
            ctx.beginPath();
            ctx.arc(0, 0, 2 * s, 0, Math.PI * 2);
            ctx.fill();
        } else if (weaponId === 'derun') {
            // Derun icon — golden sword
            ctx.fillStyle = '#886622';
            ctx.fillRect(-4 * s, -2 * s, 8 * s, 5 * s);
            ctx.fillStyle = '#ddaa44';
            ctx.fillRect(-3 * s, -22 * s, 6 * s, 20 * s);
            ctx.fillStyle = '#ffcc66';
            ctx.fillRect(-1 * s, -20 * s, 3 * s, 16 * s);
            ctx.fillStyle = '#664411';
            ctx.fillRect(-3 * s, 3 * s, 6 * s, 10 * s);
        }
        ctx.restore();
    }

    G.drawWeaponIcon = drawWeaponIcon;

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        var currentY = y;

        for (var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = ctx.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    }

    function getWeaponsForTab(tabId) {
        return G.WEAPONS.filter(function (weapon) {
            return (weapon.group || 'normal') === tabId;
        });
    }

    function normalizeWeaponIndex(tabIdx, weaponIdx) {
        var tab = G.WEAPON_TABS[tabIdx] || G.WEAPON_TABS[0];
        var weapons = getWeaponsForTab(tab.id);
        if (weapons.length === 0) return 0;
        return (weaponIdx + weapons.length) % weapons.length;
    }

    function drawWeaponSelectPanel(px, py, pw, ph, playerIdx, tabIdx, weaponIdx, confirmed, playerColor, bannedIds) {
        var tabs = G.WEAPON_TABS;
        var activeTab = tabs[tabIdx] || tabs[0];
        var weapons = getWeaponsForTab(activeTab.id);
        weaponIdx = normalizeWeaponIndex(tabIdx, weaponIdx);

        // Panel bg
        ctx.fillStyle = confirmed ? 'rgba(30,50,30,0.92)' : 'rgba(15,15,30,0.92)';
        ctx.fillRect(px, py, pw, ph);
        // Border
        ctx.strokeStyle = confirmed ? '#44cc44' : playerColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

        // Player title
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = playerColor;
        ctx.fillText('PLAYER ' + (playerIdx + 1), px + pw / 2, py + 28);

        // Divider
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(px + 16, py + 38, pw - 32, 1);

        // Tabs (Normal / Fantasy)
        var tabY = py + 45;
        var tabW = (pw - 30) / tabs.length;
        for (var ti = 0; ti < tabs.length; ti++) {
            var t = tabs[ti];
            var tx = px + 15 + ti * tabW;
            var active = ti === tabIdx;
            ctx.fillStyle = active ? 'rgba(90,130,200,0.35)' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(tx, tabY, tabW - 8, 22);
            ctx.strokeStyle = active ? playerColor : 'rgba(255,255,255,0.18)';
            ctx.lineWidth = active ? 2 : 1;
            ctx.strokeRect(tx + 0.5, tabY + 0.5, tabW - 9, 21);
            ctx.font = active ? '9px "Press Start 2P", monospace' : '8px "Press Start 2P", monospace';
            ctx.fillStyle = active ? '#fff' : '#999';
            ctx.textAlign = 'center';
            ctx.fillText(t.name.toUpperCase(), tx + (tabW - 8) / 2, tabY + 14);
        }

        // List Geometry
        var listTop = py + 78;
        var listBottom = py + ph - 44;
        var availableH = listBottom - listTop;

        if (weapons.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(px + 16, listTop + 8, pw - 32, availableH - 16);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.strokeRect(px + 16, listTop + 8, pw - 32, availableH - 16);
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillStyle = '#ddd';
            ctx.textAlign = 'center';
            ctx.fillText('NO WEAPONS IN THIS TAB YET', px + pw / 2, py + ph * 0.56);
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = '#999';
            ctx.fillText('FANTASY COMING SOON', px + pw / 2, py + ph * 0.62);
        } else {
            var baseH = availableH / (weapons.length + 1.8);
            var currentY = listTop;

            for (var i = 0; i < weapons.length; i++) {
                var wep = weapons[i];
                var sel = i === weaponIdx;
                var isBanned = bannedIds && isWeaponBanned(wep.id, bannedIds);
                var itemH = sel ? baseH * 2.8 : baseH;

                // Selection highlight background
                if (sel) {
                    ctx.fillStyle = isBanned ? 'rgba(80,30,30,0.25)' : (confirmed ? 'rgba(60,140,60,0.25)' : 'rgba(60,80,140,0.25)');
                    ctx.fillRect(px + 10, currentY, pw - 20, itemH - 4);
                    ctx.strokeStyle = isBanned ? '#663333' : (confirmed ? '#44cc44' : '#6688cc');
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px + 10, currentY, pw - 20, itemH - 4);
                }

                // Icon
                var iconX = px + 40;
                var iconY = currentY + (sel ? 30 : itemH * 0.5);
                ctx.save();
                if (isBanned) ctx.globalAlpha = 0.2;
                drawWeaponIcon(iconX, iconY, wep.id, sel ? 2.2 : 1.5);
                ctx.restore();

                // Name
                var textX = px + 80;
                var nameY = currentY + (sel ? 22 : itemH * 0.5 + 4);
                ctx.font = sel ? '12px "Press Start 2P", monospace' : '10px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                if (isBanned) {
                    ctx.fillStyle = sel ? '#663333' : '#3a2222';
                    ctx.fillText(wep.name + '  [BANNED]', textX, nameY);
                } else {
                    ctx.fillStyle = sel ? '#fff' : '#666';
                    ctx.fillText(wep.name, textX, nameY);
                }

                // Descriptions (only if selected)
                if (sel) {
                    var descW = pw - 100;
                    var descY = currentY + 42;
                    ctx.font = '8px "Press Start 2P", monospace';
                    if (isBanned) {
                        ctx.fillStyle = '#553333';
                        wrapText(ctx, 'THIS WEAPON HAS BEEN BANNED', textX, descY, descW, 12);
                    } else {
                        ctx.fillStyle = '#aaa';
                        var nextY = wrapText(ctx, wep.desc, textX, descY, descW, 12);

                        if (wep.superDesc) {
                            descY = nextY + 6;
                            ctx.fillStyle = '#ffcc44';
                            wrapText(ctx, wep.superDesc, textX, descY, descW, 12);
                        }
                    }
                }

                currentY += itemH;
            }
        }

        // Bottom prompt
        var tabKeys = playerIdx === 0 ? 'A/D' : 'J/L';
        var listKeys = playerIdx === 0 ? 'W/S' : 'I/K';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#777';
        ctx.fillText('TAB ' + tabKeys + '  •  WEAPON ' + listKeys, px + pw / 2, py + ph - 30);

        ctx.font = '9px "Press Start 2P", monospace';
        if (confirmed) {
            ctx.fillStyle = '#44cc44';
            ctx.fillText('READY!', px + pw / 2, py + ph - 14);
        } else {
            if (Math.sin(weaponSelectTimer * 0.004) > 0) {
                var atkKey = playerIdx === 0 ? 'Q' : 'U';
                ctx.fillStyle = weapons.length > 0 ? '#999' : '#666';
                ctx.fillText(weapons.length > 0 ? (atkKey + ' to confirm') : 'CHOOSE A TAB WITH WEAPONS', px + pw / 2, py + ph - 14);
            }
        }
    }



    function drawWeaponSelectScreen() {
        if (banActive) {
            drawBanPhaseScreen();
            return;
        }

        G.drawStage();
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);

        var panelW = W * 0.55;
        var panelH = H * 0.78;
        var px = (W - panelW) / 2;
        var py = H * 0.14;

        if (weaponSelectPhase === 1) {
            // Player 1 picking
            G.drawCenterText('PLAYER 1 — CHOOSE WEAPON', H * 0.08, 12, '#5b9aff');
            drawWeaponSelectPanel(px, py, panelW, panelH, 0, p1TabIdx, p1WeaponIdx, p1Confirmed, '#5b9aff', banEnabled ? p2BannedWeapons : null);
        } else if (weaponSelectPhase === 2) {
            // Pass screen — no weapon info visible
            G.drawCenterText('PLAYER 1 LOCKED IN!', H * 0.32, 14, '#44cc44');
            G.drawCenterText('PASS TO PLAYER 2', H * 0.45, 18, '#ff5b5b');
            if (Math.sin(passTimer * 0.005) > 0) {
                G.drawCenterText('PRESS ANY KEY', H * 0.62, 10, '#999');
            }
        } else if (weaponSelectPhase === 3) {
            // Player 2 picking
            G.drawCenterText('PLAYER 2 — CHOOSE WEAPON', H * 0.08, 12, '#ff5b5b');
            drawWeaponSelectPanel(px, py, panelW, panelH, 1, p2TabIdx, p2WeaponIdx, p2Confirmed, '#ff5b5b', banEnabled ? p1BannedWeapons : null);
        }
    }

    function updateWeaponSelect(dt) {
        dt = dt || 16.67;
        var jp = G.justPressed;
        var numTabs = G.WEAPON_TABS.length;
        weaponSelectTimer += dt;

        if (banActive) {
            updateBanPhase(dt);
            return;
        }

        var p1Bans = banEnabled ? p2BannedWeapons : null;
        var p2Bans = banEnabled ? p1BannedWeapons : null;

        if (weaponSelectPhase === 1) {
            // P1 picking
            if (!p1Confirmed) {
                if (jp['a']) {
                    p1TabIdx = (p1TabIdx - 1 + numTabs) % numTabs;
                    p1WeaponIdx = normalizeWeaponIndex(p1TabIdx, 0);
                    if (p1Bans) p1WeaponIdx = skipBannedWeapon(p1TabIdx, p1WeaponIdx, 1, p1Bans);
                    G.playMenuMove();
                }
                if (jp['d']) {
                    p1TabIdx = (p1TabIdx + 1) % numTabs;
                    p1WeaponIdx = normalizeWeaponIndex(p1TabIdx, 0);
                    if (p1Bans) p1WeaponIdx = skipBannedWeapon(p1TabIdx, p1WeaponIdx, 1, p1Bans);
                    G.playMenuMove();
                }
                var p1TabWeapons = getWeaponsForTab(G.WEAPON_TABS[p1TabIdx].id);
                if (jp['w']) {
                    if (p1TabWeapons.length > 0) {
                        p1WeaponIdx = (p1WeaponIdx - 1 + p1TabWeapons.length) % p1TabWeapons.length;
                        if (p1Bans) p1WeaponIdx = skipBannedWeapon(p1TabIdx, p1WeaponIdx, -1, p1Bans);
                        G.playMenuMove();
                    }
                }
                if (jp['s']) {
                    if (p1TabWeapons.length > 0) {
                        p1WeaponIdx = (p1WeaponIdx + 1) % p1TabWeapons.length;
                        if (p1Bans) p1WeaponIdx = skipBannedWeapon(p1TabIdx, p1WeaponIdx, 1, p1Bans);
                        G.playMenuMove();
                    }
                }
                var p1SelBanned = p1Bans && p1TabWeapons.length > 0 && isWeaponBanned(p1TabWeapons[p1WeaponIdx].id, p1Bans);
                if (jp['q'] && p1TabWeapons.length > 0 && !p1SelBanned) {
                    p1Confirmed = true;
                    weaponSelectPhase = 2;  // go to pass screen
                    passTimer = 0;
                    G.playMenuConfirm();
                }
            }
        } else if (weaponSelectPhase === 2) {
            // Pass screen — wait for any key
            passTimer += dt;
            if (passTimer > 300 && G.anyKeyJustPressed()) {
                weaponSelectPhase = 3;  // P2's turn
                if (p2Bans) p2WeaponIdx = skipBannedWeapon(p2TabIdx, p2WeaponIdx, 1, p2Bans);
                G.playMenuConfirm();
            }
        } else if (weaponSelectPhase === 3) {
            // P2 picking
            if (!p2Confirmed) {
                if (jp['j']) {
                    p2TabIdx = (p2TabIdx - 1 + numTabs) % numTabs;
                    p2WeaponIdx = normalizeWeaponIndex(p2TabIdx, 0);
                    if (p2Bans) p2WeaponIdx = skipBannedWeapon(p2TabIdx, p2WeaponIdx, 1, p2Bans);
                    G.playMenuMove();
                }
                if (jp['l']) {
                    p2TabIdx = (p2TabIdx + 1) % numTabs;
                    p2WeaponIdx = normalizeWeaponIndex(p2TabIdx, 0);
                    if (p2Bans) p2WeaponIdx = skipBannedWeapon(p2TabIdx, p2WeaponIdx, 1, p2Bans);
                    G.playMenuMove();
                }
                var p2TabWeapons = getWeaponsForTab(G.WEAPON_TABS[p2TabIdx].id);
                if (jp['i']) {
                    if (p2TabWeapons.length > 0) {
                        p2WeaponIdx = (p2WeaponIdx - 1 + p2TabWeapons.length) % p2TabWeapons.length;
                        if (p2Bans) p2WeaponIdx = skipBannedWeapon(p2TabIdx, p2WeaponIdx, -1, p2Bans);
                        G.playMenuMove();
                    }
                }
                if (jp['k']) {
                    if (p2TabWeapons.length > 0) {
                        p2WeaponIdx = (p2WeaponIdx + 1) % p2TabWeapons.length;
                        if (p2Bans) p2WeaponIdx = skipBannedWeapon(p2TabIdx, p2WeaponIdx, 1, p2Bans);
                        G.playMenuMove();
                    }
                }
                var p2SelBanned = p2Bans && p2TabWeapons.length > 0 && isWeaponBanned(p2TabWeapons[p2WeaponIdx].id, p2Bans);
                if (jp['u'] && p2TabWeapons.length > 0 && !p2SelBanned) {
                    p2Confirmed = true;
                    G.playMenuConfirm();
                }
            }
        }

        // Both confirmed — equip weapons and proceed
        if (p1Confirmed && p2Confirmed) {
            var p1Weapons = getWeaponsForTab(G.WEAPON_TABS[p1TabIdx].id);
            var p2Weapons = getWeaponsForTab(G.WEAPON_TABS[p2TabIdx].id);
            if (p1Weapons.length === 0 || p2Weapons.length === 0) return;
            p1WeaponIdx = normalizeWeaponIndex(p1TabIdx, p1WeaponIdx);
            p2WeaponIdx = normalizeWeaponIndex(p2TabIdx, p2WeaponIdx);
            p1.equipWeapon(p1Weapons[p1WeaponIdx]);
            p2.equipWeapon(p2Weapons[p2WeaponIdx]);
            resetRound();
            startCountdown();
        }
    }

    function enterWeaponSelect() {
        gameState = G.STATE.WEAPON_SELECT;
        p1Confirmed = false;
        p2Confirmed = false;
        p1TabIdx = 0;
        p2TabIdx = 0;
        p1WeaponIdx = normalizeWeaponIndex(p1TabIdx, 0);
        p2WeaponIdx = normalizeWeaponIndex(p2TabIdx, 0);
        weaponSelectTimer = 0;
        weaponSelectPhase = 1;
        passTimer = 0;

        // Initialize ban phase if enabled
        p1BannedWeapons = [];
        p2BannedWeapons = [];
        if (banEnabled) {
            banActive = true;
            banPhase = 0; // P1 banning
            banSelections = [];
            banTabIdx = 0;
            banWeaponIdx = 0;
            banTimer = 0;
        } else {
            banActive = false;
        }
    }

    function getAllWeapons() {
        return G.WEAPONS.slice();
    }

    function getBanWeaponsForTab(tabId) {
        return G.WEAPONS.filter(function (w) {
            return (w.group || 'normal') === tabId;
        });
    }

    function normalizeBanWeaponIndex(tabIdx, weaponIdx) {
        var tab = G.WEAPON_TABS[tabIdx] || G.WEAPON_TABS[0];
        var weapons = getBanWeaponsForTab(tab.id);
        if (weapons.length === 0) return 0;
        return (weaponIdx + weapons.length) % weapons.length;
    }

    function isWeaponBanned(weaponId, bannedList) {
        for (var i = 0; i < bannedList.length; i++) {
            if (bannedList[i] === weaponId) return true;
        }
        return false;
    }

    function skipBannedWeapon(tabIdx, weaponIdx, direction, bannedIds) {
        var tab = G.WEAPON_TABS[tabIdx] || G.WEAPON_TABS[0];
        var weapons = getWeaponsForTab(tab.id);
        if (weapons.length === 0) return 0;
        var tries = weapons.length;
        while (tries > 0 && isWeaponBanned(weapons[weaponIdx].id, bannedIds)) {
            weaponIdx = (weaponIdx + direction + weapons.length) % weapons.length;
            tries--;
        }
        return weaponIdx;
    }

    function drawBanPhaseScreen() {
        G.drawStage();
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);

        var panelW = W * 0.55;
        var panelH = H * 0.78;
        var px = (W - panelW) / 2;
        var py = H * 0.14;

        if (banPhase === 0) {
            // P1 banning weapons for P2
            G.drawCenterText('PLAYER 1 — BAN WEAPON' + (banCount > 1 ? 'S' : '') + ' FOR P2', H * 0.06, 11, '#ff6644');
            G.drawCenterText('BAN ' + banSelections.length + ' / ' + banCount, H * 0.11, 9, '#ffaa66');
            drawBanPanel(px, py, panelW, panelH, 0, banTabIdx, banWeaponIdx, banSelections, '#5b9aff');
        } else if (banPhase === 1) {
            // Pass screen
            G.drawCenterText('P1 BANS LOCKED!', H * 0.32, 14, '#44cc44');
            G.drawCenterText('PASS TO PLAYER 2', H * 0.45, 18, '#ff5b5b');
            if (Math.sin(banTimer * 0.005) > 0) {
                G.drawCenterText('PRESS ANY KEY', H * 0.62, 10, '#999');
            }
        } else if (banPhase === 2) {
            // P2 banning weapons for P1
            G.drawCenterText('PLAYER 2 — BAN WEAPON' + (banCount > 1 ? 'S' : '') + ' FOR P1', H * 0.06, 11, '#ff6644');
            G.drawCenterText('BAN ' + banSelections.length + ' / ' + banCount, H * 0.11, 9, '#ffaa66');
            drawBanPanel(px, py, panelW, panelH, 1, banTabIdx, banWeaponIdx, banSelections, '#ff5b5b');
        } else if (banPhase === 3) {
            // Pass back screen
            G.drawCenterText('P2 BANS LOCKED!', H * 0.32, 14, '#44cc44');
            G.drawCenterText('PASS TO PLAYER 1', H * 0.45, 18, '#5b9aff');
            if (Math.sin(banTimer * 0.005) > 0) {
                G.drawCenterText('PRESS ANY KEY', H * 0.62, 10, '#999');
            }
        }
    }

    function drawBanPanel(px, py, pw, ph, playerIdx, tabIdx, weaponIdx, selections, playerColor) {
        var tabs = G.WEAPON_TABS;
        var activeTab = tabs[tabIdx] || tabs[0];
        var weapons = getBanWeaponsForTab(activeTab.id);
        weaponIdx = normalizeBanWeaponIndex(tabIdx, weaponIdx);

        // Panel bg
        ctx.fillStyle = 'rgba(25,10,10,0.92)';
        ctx.fillRect(px, py, pw, ph);
        // Border — red/orange for ban
        ctx.strokeStyle = '#cc5533';
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

        // Player title
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = playerColor;
        ctx.fillText('PLAYER ' + (playerIdx + 1) + ' BANNING', px + pw / 2, py + 28);

        // Divider
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(px + 16, py + 38, pw - 32, 1);

        // Tabs
        var tabY = py + 45;
        var tabW = (pw - 30) / tabs.length;
        for (var ti = 0; ti < tabs.length; ti++) {
            var t = tabs[ti];
            var tx = px + 15 + ti * tabW;
            var active = ti === tabIdx;
            ctx.fillStyle = active ? 'rgba(140,60,40,0.35)' : 'rgba(255,255,255,0.08)';
            ctx.fillRect(tx, tabY, tabW - 8, 22);
            ctx.strokeStyle = active ? '#cc5533' : 'rgba(255,255,255,0.18)';
            ctx.lineWidth = active ? 2 : 1;
            ctx.strokeRect(tx + 0.5, tabY + 0.5, tabW - 9, 21);
            ctx.font = active ? '9px "Press Start 2P", monospace' : '8px "Press Start 2P", monospace';
            ctx.fillStyle = active ? '#fff' : '#999';
            ctx.textAlign = 'center';
            ctx.fillText(t.name.toUpperCase(), tx + (tabW - 8) / 2, tabY + 14);
        }

        // Weapon list
        var listTop = py + 78;
        var listBottom = py + ph - 44;
        var availableH = listBottom - listTop;

        if (weapons.length === 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.fillRect(px + 16, listTop + 8, pw - 32, availableH - 16);
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillStyle = '#ddd';
            ctx.textAlign = 'center';
            ctx.fillText('NO WEAPONS IN THIS TAB', px + pw / 2, py + ph * 0.56);
        } else {
            var baseH = availableH / (weapons.length + 1.8);
            var currentY = listTop;

            for (var i = 0; i < weapons.length; i++) {
                var wep = weapons[i];
                var sel = i === weaponIdx;
                var banned = isWeaponBanned(wep.id, selections);
                var itemH = sel ? baseH * 2.8 : baseH;

                // Selection highlight
                if (sel) {
                    ctx.fillStyle = banned ? 'rgba(140,40,40,0.35)' : 'rgba(140,80,40,0.25)';
                    ctx.fillRect(px + 10, currentY, pw - 20, itemH - 4);
                    ctx.strokeStyle = banned ? '#cc3333' : '#cc8844';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px + 10, currentY, pw - 20, itemH - 4);
                }

                // Icon
                var iconX = px + 40;
                var iconY = currentY + (sel ? 30 : itemH * 0.5);
                ctx.save();
                if (banned) ctx.globalAlpha = 0.35;
                drawWeaponIcon(iconX, iconY, wep.id, sel ? 2.2 : 1.5);
                ctx.restore();

                // Name
                var textX = px + 80;
                var nameY = currentY + (sel ? 22 : itemH * 0.5 + 4);
                ctx.font = sel ? '12px "Press Start 2P", monospace' : '10px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                ctx.fillStyle = banned ? '#cc3333' : (sel ? '#fff' : '#666');
                ctx.fillText(wep.name + (banned ? '  [BANNED]' : ''), textX, nameY);

                // Description (only if selected)
                if (sel) {
                    var descW = pw - 100;
                    var descY = currentY + 42;
                    ctx.font = '8px "Press Start 2P", monospace';
                    ctx.fillStyle = banned ? '#884444' : '#aaa';
                    wrapText(ctx, wep.desc, textX, descY, descW, 12);
                }

                currentY += itemH;
            }
        }

        // Bottom prompt
        var tabKeys = playerIdx === 0 ? 'A/D' : 'J/L';
        var listKeys = playerIdx === 0 ? 'W/S' : 'I/K';
        var atkKey = playerIdx === 0 ? 'Q' : 'U';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#777';
        ctx.fillText('TAB ' + tabKeys + '  •  WEAPON ' + listKeys, px + pw / 2, py + ph - 30);

        ctx.font = '9px "Press Start 2P", monospace';
        if (Math.sin(weaponSelectTimer * 0.004) > 0) {
            ctx.fillStyle = weapons.length > 0 ? '#cc8844' : '#666';
            ctx.fillText(weapons.length > 0 ? (atkKey + ' to ban/unban') : 'NO WEAPONS', px + pw / 2, py + ph - 14);
        }
    }

    function updateBanPhase(dt) {
        dt = dt || 16.67;
        var jp = G.justPressed;
        var numTabs = G.WEAPON_TABS.length;
        weaponSelectTimer += dt;
        banTimer += dt;

        if (banPhase === 0) {
            // P1 banning — uses P1 controls (WASD + Q)
            if (jp['a']) {
                banTabIdx = (banTabIdx - 1 + numTabs) % numTabs;
                banWeaponIdx = normalizeBanWeaponIndex(banTabIdx, 0);
                G.playMenuMove();
            }
            if (jp['d']) {
                banTabIdx = (banTabIdx + 1) % numTabs;
                banWeaponIdx = normalizeBanWeaponIndex(banTabIdx, 0);
                G.playMenuMove();
            }
            var tabWeapons = getBanWeaponsForTab(G.WEAPON_TABS[banTabIdx].id);
            if (jp['w'] && tabWeapons.length > 0) {
                banWeaponIdx = (banWeaponIdx - 1 + tabWeapons.length) % tabWeapons.length;
                G.playMenuMove();
            }
            if (jp['s'] && tabWeapons.length > 0) {
                banWeaponIdx = (banWeaponIdx + 1) % tabWeapons.length;
                G.playMenuMove();
            }
            if (jp['q'] && tabWeapons.length > 0) {
                var wep = tabWeapons[banWeaponIdx];
                var idx = banSelections.indexOf(wep.id);
                if (idx >= 0) {
                    // Unban
                    banSelections.splice(idx, 1);
                    G.playMenuConfirm();
                } else if (banSelections.length < banCount) {
                    // Ban
                    banSelections.push(wep.id);
                    G.playMenuConfirm();
                    if (banSelections.length >= banCount) {
                        // Auto-advance after short delay
                        p1BannedWeapons = banSelections.slice();
                        banPhase = 1;
                        banTimer = 0;
                        banSelections = [];
                        banTabIdx = 0;
                        banWeaponIdx = 0;
                    }
                }
            }
        } else if (banPhase === 1) {
            // Pass screen — wait for any key
            if (banTimer > 300 && G.anyKeyJustPressed()) {
                banPhase = 2;
                banTimer = 0;
                G.playMenuConfirm();
            }
        } else if (banPhase === 2) {
            // P2 banning — uses P2 controls (IJKL + U)
            if (jp['j']) {
                banTabIdx = (banTabIdx - 1 + numTabs) % numTabs;
                banWeaponIdx = normalizeBanWeaponIndex(banTabIdx, 0);
                G.playMenuMove();
            }
            if (jp['l']) {
                banTabIdx = (banTabIdx + 1) % numTabs;
                banWeaponIdx = normalizeBanWeaponIndex(banTabIdx, 0);
                G.playMenuMove();
            }
            var tabWeapons2 = getBanWeaponsForTab(G.WEAPON_TABS[banTabIdx].id);
            if (jp['i'] && tabWeapons2.length > 0) {
                banWeaponIdx = (banWeaponIdx - 1 + tabWeapons2.length) % tabWeapons2.length;
                G.playMenuMove();
            }
            if (jp['k'] && tabWeapons2.length > 0) {
                banWeaponIdx = (banWeaponIdx + 1) % tabWeapons2.length;
                G.playMenuMove();
            }
            if (jp['u'] && tabWeapons2.length > 0) {
                var wep2 = tabWeapons2[banWeaponIdx];
                var idx2 = banSelections.indexOf(wep2.id);
                if (idx2 >= 0) {
                    banSelections.splice(idx2, 1);
                    G.playMenuConfirm();
                } else if (banSelections.length < banCount) {
                    banSelections.push(wep2.id);
                    G.playMenuConfirm();
                    if (banSelections.length >= banCount) {
                        p2BannedWeapons = banSelections.slice();
                        banPhase = 3;
                        banTimer = 0;
                        banSelections = [];
                    }
                }
            }
        } else if (banPhase === 3) {
            // Pass back screen — wait for any key, then proceed to weapon select
            if (banTimer > 300 && G.anyKeyJustPressed()) {
                banActive = false;
                banPhase = 0;
                weaponSelectPhase = 1;
                passTimer = 0;
                // Skip past any banned weapon at initial index
                p1WeaponIdx = skipBannedWeapon(p1TabIdx, p1WeaponIdx, 1, p2BannedWeapons);
                G.playMenuConfirm();
            }
        }
    }

    function enterMapPreview() {
        resetSuddenDeathArena();
        gameState = G.STATE.MAP_PREVIEW;
        mapPreviewTimer = 0;
        enterMapSelect();
    }

    function resetSuddenDeathArena() {
        suddenDeathTimer = 0;
        suddenDeathActive = false;
        G.WALL_LEFT = BASE_WALL_LEFT;
        G.WALL_RIGHT = BASE_WALL_RIGHT;
        if (p1) p1._borderShrinkDmgAccum = 0;
        if (p2) p2._borderShrinkDmgAccum = 0;
        if (p3) p3._borderShrinkDmgAccum = 0;
        if (p4) p4._borderShrinkDmgAccum = 0;
    }

    function updateSuddenDeathBounds(dt) {
        suddenDeathTimer += dt;
        if (!suddenDeathActive && suddenDeathTimer >= SUDDEN_DEATH_START_MS) {
            suddenDeathActive = true;
        }
        if (!suddenDeathActive) return;

        var minHalfWidth = SUDDEN_DEATH_MIN_WIDTH * 0.5;
        var centerX = W * 0.5;
        var maxLeft = centerX - minHalfWidth;
        var minRight = centerX + minHalfWidth;
        var step = SUDDEN_DEATH_SHRINK_PX_PER_SEC * (dt / 1000);

        G.WALL_LEFT = Math.min(maxLeft, G.WALL_LEFT + step);
        G.WALL_RIGHT = Math.max(minRight, G.WALL_RIGHT - step);
        if (G.WALL_RIGHT - G.WALL_LEFT < SUDDEN_DEATH_MIN_WIDTH) {
            G.WALL_LEFT = maxLeft;
            G.WALL_RIGHT = minRight;
        }
    }

    function applySuddenDeathDamage(player, dt) {
        if (!suddenDeathActive || !player || player.hp <= 0) return;

        var touchPad = 1;
        var touchingLeft = player.x - player.w * 0.5 <= G.WALL_LEFT + touchPad;
        var touchingRight = player.x + player.w * 0.5 >= G.WALL_RIGHT - touchPad;

        if (!touchingLeft && !touchingRight) {
            player._borderShrinkDmgAccum = 0;
            return;
        }

        if (typeof player._borderShrinkDmgAccum !== 'number') player._borderShrinkDmgAccum = 0;
        player._borderShrinkDmgAccum += dt;

        while (player._borderShrinkDmgAccum >= SUDDEN_DEATH_DAMAGE_TICK_MS && player.hp > 0) {
            player._borderShrinkDmgAccum -= SUDDEN_DEATH_DAMAGE_TICK_MS;
            var hazardX = touchingLeft ? G.WALL_LEFT - 20 : G.WALL_RIGHT + 20;
            if (typeof player.takeDamage === 'function') player.takeDamage(SUDDEN_DEATH_DAMAGE_PER_TICK, hazardX);
            else {
                player.hp -= SUDDEN_DEATH_DAMAGE_PER_TICK;
                if (player.hp < 0) player.hp = 0;
            }
        }
    }

    function applySuddenDeathDamageAll(dt) {
        applySuddenDeathDamage(p1, dt);
        applySuddenDeathDamage(p2, dt);
        if (G.is2v2) {
            applySuddenDeathDamage(p3, dt);
            applySuddenDeathDamage(p4, dt);
        }
    }

    function drawSuddenDeathBorders() {
        if (!suddenDeathActive) return;
        var pulse = Math.sin(Date.now() * 0.012) * 0.5 + 0.5;
        var sideAlpha = 0.14 + pulse * 0.08;
        var edgeAlpha = 0.45 + pulse * 0.35;

        ctx.save();
        ctx.fillStyle = 'rgba(190,30,30,' + sideAlpha + ')';
        if (G.WALL_LEFT > 0) ctx.fillRect(0, 0, G.WALL_LEFT, H);
        if (G.WALL_RIGHT < W) ctx.fillRect(G.WALL_RIGHT, 0, W - G.WALL_RIGHT, H);

        ctx.strokeStyle = 'rgba(255,120,120,' + edgeAlpha + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(G.WALL_LEFT, 0);
        ctx.lineTo(G.WALL_LEFT, H);
        ctx.moveTo(G.WALL_RIGHT, 0);
        ctx.lineTo(G.WALL_RIGHT, H);
        ctx.stroke();
        ctx.restore();
    }

    // ─── Round / Match Control ────────────────────────────────────
    function clearRoundFinisher() {
        finisherTimer = 0;
        G.lastKOImpact = null;
        if (typeof G.clearCameraOverride === 'function') {
            G.clearCameraOverride();
        }
    }

    function getFinisherImpactPoint() {
        var loser, winner;
        if (G.is2v2) {
            // In 2v2: losing team is the one whose round ended
            // Pick the last fighter to die from losing team
            if (roundWinner === 1) {
                loser = p4.hp <= 0 ? p4 : p3;
                winner = p1.hp > 0 ? p1 : p2;
            } else {
                loser = p2.hp <= 0 ? p2 : p1;
                winner = p3.hp > 0 ? p3 : p4;
            }
        } else {
            loser = roundWinner === 1 ? p2 : p1;
            winner = roundWinner === 1 ? p1 : p2;
        }
        var impactX = (winner.x + loser.x) * 0.5;
        var impactY = loser.y - loser.currentH * 0.45;
        var impact = G.lastKOImpact;

        if (impact) {
            if (typeof impact.x === 'number') impactX = impact.x;
            if (typeof impact.y === 'number') impactY = impact.y;
            if (typeof impact.attackerX === 'number') {
                impactX = (impactX + impact.attackerX) * 0.5;
            }
        }

        return { x: impactX, y: impactY };
    }

    function startRoundFinisher() {
        var impact = getFinisherImpactPoint();
        finisherTimer = FINISHER_DURATION_MS;
        if (typeof G.setCameraOverride === 'function') {
            G.setCameraOverride(impact.x, impact.y, FINISHER_ZOOM);
        }
        G.playDeath();
        G.playCheer();
        G.lastKOImpact = null;
    }

    function finalizeRoundOutcome() {
        clearRoundFinisher();
        G.resetCamera();

        if (activeModeId === 'blitz') {
            var blitzTotal = blitzOrder.length;

            if (G.is2v2) {
                // Team-based progression
                if (roundWinner === 1) {
                    blitzProgress.team1 = Math.min(blitzTotal, blitzProgress.team1 + 1);
                } else {
                    blitzProgress.team2 = Math.min(blitzTotal, blitzProgress.team2 + 1);
                }

                if (blitzProgress.team1 >= blitzTotal || blitzProgress.team2 >= blitzTotal) {
                    matchWinner = blitzProgress.team1 >= blitzTotal ? 1 : 2;
                    gameState = G.STATE.MATCH_END;
                    roundEndTimer = 0;
                } else {
                    equipBlitzWeapons();
                    gameState = G.STATE.ROUND_END;
                    roundEndTimer = 0;
                }
            } else {
                if (roundWinner === 1) {
                    blitzProgress.p1 = Math.min(blitzTotal, blitzProgress.p1 + 1);
                } else {
                    blitzProgress.p2 = Math.min(blitzTotal, blitzProgress.p2 + 1);
                }

                if (blitzProgress.p1 >= blitzTotal || blitzProgress.p2 >= blitzTotal) {
                    matchWinner = blitzProgress.p1 >= blitzTotal ? 1 : 2;
                    gameState = G.STATE.MATCH_END;
                    roundEndTimer = 0;
                } else {
                    equipBlitzWeapons();
                    gameState = G.STATE.ROUND_END;
                    roundEndTimer = 0;
                }
            }
            return;
        }

        if (roundWinner === 1) p1.roundWins++;
        else p2.roundWins++;

        if (p1.roundWins >= G.ROUNDS_TO_WIN || p2.roundWins >= G.ROUNDS_TO_WIN) {
            matchWinner = p1.roundWins >= G.ROUNDS_TO_WIN ? 1 : 2;
            gameState = G.STATE.MATCH_END;
            roundEndTimer = 0;
        } else {
            gameState = G.STATE.ROUND_END;
            roundEndTimer = 0;
        }
    }

    function resetRound() {
        resetSuddenDeathArena();
        if (G.is2v2) {
            // 2v2: P1+P2 on left, P3+P4 on right
            p1.reset(W * 0.25);
            p2.reset(W * 0.35);
            p3.reset(W * 0.6);
            p4.reset(W * 0.75);
            p1.facing = 1;
            p2.facing = 1;
            p3.facing = -1;
            p4.facing = -1;
            p1.equipWeapon(p1.weapon);
            p2.equipWeapon(p2.weapon);
            p3.equipWeapon(p3.weapon);
            p4.equipWeapon(p4.weapon);
        } else {
            var spawn1 = typeof G.getMapSpawnPoint === 'function' ? G.getMapSpawnPoint(1) : null;
            var spawn2 = typeof G.getMapSpawnPoint === 'function' ? G.getMapSpawnPoint(2) : null;
            p1.reset(spawn1 && typeof spawn1.x === 'number' ? spawn1.x : W * 0.3);
            p2.reset(spawn2 && typeof spawn2.x === 'number' ? spawn2.x : W * 0.7);
            p1.facing = 1;
            p2.facing = -1;
            p1.equipWeapon(p1.weapon);
            p2.equipWeapon(p2.weapon);
            if (spawn1 && typeof spawn1.y === 'number') {
                p1.y = spawn1.y;
                p1.vx = 0;
                p1.vy = 0;
                p1.onGround = false;
                p1.applyPhysics(0);
            }
            if (spawn2 && typeof spawn2.y === 'number') {
                p2.y = spawn2.y;
                p2.vx = 0;
                p2.vy = 0;
                p2.onGround = false;
                p2.applyPhysics(0);
            }
        }
        G.particles.length = 0;
        G.blackHoles.length = 0;
        if (typeof G.resetObstacles === 'function') {
            G.resetObstacles(G.currentMapIndex, { rerollLayout: false });
        }
        G.resetHearts();
        G.resetHitstop();
        clearRoundFinisher();
        if (G.aiEnabled && typeof G.resetAI === 'function') G.resetAI();
    }

    function startCountdown() {
        gameState = G.STATE.COUNTDOWN;
        countdownTimer = 0;
        countdownNum = 3;
        countdownLastSfxNum = 0;
        countdownFightCuePlayed = false;
    }

    function startMatch() {
        resetSuddenDeathArena();
        applyFighterHPByMode();
        p1.roundWins = 0;
        p2.roundWins = 0;
        p1WeaponIdx = 0;
        p2WeaponIdx = 0;
        p1TabIdx = 0;
        p2TabIdx = 0;
        p1BannedWeapons = [];
        p2BannedWeapons = [];
        banActive = false;
        banPhase = 0;
        banSelections = [];
        if (activeModeId === 'blitz') {
            setupBlitzMatch();
        } else {
            blitzOrder = [];
            blitzProgress.p1 = 0;
            blitzProgress.p2 = 0;
            blitzProgress.team1 = 0;
            blitzProgress.team2 = 0;
        }
        // Expose player refs for obstacle damage tracking + AI + super
        G._p1Ref = p1;
        G._p2Ref = p2;
        G._p3Ref = p3;
        G._p4Ref = p4;
        clearRoundFinisher();
        if (activeModeId === 'blitz') {
            enterMapRoulette();
        } else {
            enterMapPreview();
        }
    }

    // ─── Main Game Loop ───────────────────────────────────────────
    var lastTime = 0;

    function gameLoop(timestamp) {
        var rawDt = Math.min(timestamp - lastTime, 33.33);
        if (!lastTime) rawDt = 16.67;
        lastTime = timestamp;
        var dt = rawDt;

        if (gameState === G.STATE.FIGHTING && finisherTimer > 0) {
            dt *= FINISHER_TIME_SCALE;
        }

        G.updateInput();

        ctx.save();
        if (G.fx.shakeTimer > 0) {
            G.fx.shakeTimer -= dt;
            var sx = (Math.random() - 0.5) * G.fx.shakeMagnitude;
            var sy = (Math.random() - 0.5) * G.fx.shakeMagnitude;
            ctx.translate(sx, sy);
        }

        switch (gameState) {
            case G.STATE.TITLE:
                drawTitleScreen();
                var modeUp = G.justPressed['w'] || G.justPressed['i'] || G.justPressed['arrowup'];
                var modeDown = G.justPressed['s'] || G.justPressed['k'] || G.justPressed['arrowdown'];
                var modeConfirm = G.justPressed['q'] || G.justPressed['u'] || G.justPressed['enter'] || G.justPressed[' '];
                var modeBack = G.justPressed['e'] || G.justPressed['o'];
                if (blitzAiSoonTimer > 0) blitzAiSoonTimer = Math.max(0, blitzAiSoonTimer - dt);

                // Ban count submenu
                if (banCountSelectOpen) {
                    if (modeUp && !modeDown) {
                        banCountIdx = (banCountIdx - 1 + 3) % 3;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        banCountIdx = (banCountIdx + 1) % 3;
                        G.initAudio();
                        G.playMenuMove();
                    }
                    if (modeBack) {
                        banCountSelectOpen = false;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        banCount = banCountIdx + 1;
                        banEnabled = true;
                        banCountSelectOpen = false;
                        banSelectOpen = false;
                        activeModeId = 'classic';
                        G.aiEnabled = false;
                        G.is2v2 = false;
                        aiDifficultyHp = G.HP_PER_ROUND;
                        aiDifficultyDamageBonus = 0;
                        aiDifficultyLavaImmune = false;
                        G.playTitleStart();
                        startMatch();
                    }
                    break;
                }

                // Ban enable/disable submenu
                if (banSelectOpen) {
                    if (modeUp && !modeDown) {
                        banOptionIdx = (banOptionIdx - 1 + 2) % 2;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        banOptionIdx = (banOptionIdx + 1) % 2;
                        G.initAudio();
                        G.playMenuMove();
                    }
                    if (modeBack) {
                        banSelectOpen = false;
                        banCountSelectOpen = false;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        if (banOptionIdx === 0) {
                            // Enable Ban → show ban count submenu
                            banCountSelectOpen = true;
                            banCountIdx = 0;
                            G.playMenuConfirm();
                        } else {
                            // No Ban → start match immediately
                            banEnabled = false;
                            banSelectOpen = false;
                            activeModeId = 'classic';
                            G.aiEnabled = false;
                            G.is2v2 = false;
                            aiDifficultyHp = G.HP_PER_ROUND;
                            aiDifficultyDamageBonus = 0;
                            aiDifficultyLavaImmune = false;
                            G.playTitleStart();
                            startMatch();
                        }
                    }
                    break;
                }

                // 1v1 AI difficulty submenu
                if (blitz1v1AiSelectOpen) {
                    if (modeUp && !modeDown) {
                        blitz1v1AiTypeIdx = (blitz1v1AiTypeIdx - 1 + BLITZ_1V1_AI_TYPES.length) % BLITZ_1V1_AI_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        blitz1v1AiTypeIdx = (blitz1v1AiTypeIdx + 1) % BLITZ_1V1_AI_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    }
                    if (modeBack) {
                        blitz1v1AiSelectOpen = false;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        var oneVOneAiChoice = BLITZ_1V1_AI_TYPES[blitz1v1AiTypeIdx];
                        activeModeId = 'blitz';
                        G.is2v2 = false;
                        G.aiEnabled = true;
                        aiDifficultyHp = oneVOneAiChoice.aiHp;
                        aiDifficultyDamageBonus = oneVOneAiChoice.aiDmgBonus || 0;
                        aiDifficultyLavaImmune = !!oneVOneAiChoice.aiLavaImmune;
                        if (typeof G.resetAI === 'function') G.resetAI();
                        blitz1v1AiSelectOpen = false;
                        blitz1v1SelectOpen = false;
                        blitz2v2SelectOpen = false;
                        blitzTypeSelectOpen = false;
                        G.playTitleStart();
                        startMatch();
                    }
                    break;
                }

                // 1v1 sub-submenu (Human / AI)
                if (blitz1v1SelectOpen) {
                    if (modeUp && !modeDown) {
                        blitz1v1TypeIdx = (blitz1v1TypeIdx - 1 + BLITZ_1V1_TYPES.length) % BLITZ_1V1_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        blitz1v1TypeIdx = (blitz1v1TypeIdx + 1) % BLITZ_1V1_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    }
                    if (modeBack) {
                        blitz1v1SelectOpen = false;
                        blitz1v1AiSelectOpen = false;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        var oneVOneChoice = BLITZ_1V1_TYPES[blitz1v1TypeIdx];
                        if (!oneVOneChoice.ai) {
                            activeModeId = 'blitz';
                            G.is2v2 = false;
                            G.aiEnabled = false;
                            aiDifficultyHp = G.HP_PER_ROUND;
                            aiDifficultyDamageBonus = 0;
                            aiDifficultyLavaImmune = false;
                            blitz1v1AiSelectOpen = false;
                            blitz1v1SelectOpen = false;
                            blitz2v2SelectOpen = false;
                            blitzTypeSelectOpen = false;
                            G.playTitleStart();
                            startMatch();
                        } else {
                            blitz1v1AiSelectOpen = true;
                            G.playMenuConfirm();
                        }
                    }
                    break;
                }

                // 2v2 sub-submenu (AI difficulty)
                if (blitz2v2SelectOpen) {
                    if (modeUp && !modeDown) {
                        blitz2v2TypeIdx = (blitz2v2TypeIdx - 1 + BLITZ_2V2_TYPES.length) % BLITZ_2V2_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        blitz2v2TypeIdx = (blitz2v2TypeIdx + 1) % BLITZ_2V2_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    }
                    if (modeBack) {
                        blitz2v2SelectOpen = false;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        var twoVTwoChoice = BLITZ_2V2_TYPES[blitz2v2TypeIdx];
                        activeModeId = 'blitz';
                        G.is2v2 = true;
                        G.aiEnabled = true;
                        aiDifficultyHp = twoVTwoChoice.aiHp;
                        aiDifficultyDamageBonus = twoVTwoChoice.aiDmgBonus || 0;
                        aiDifficultyLavaImmune = !!twoVTwoChoice.aiLavaImmune;
                        if (typeof G.resetAI === 'function') G.resetAI();
                        blitz1v1SelectOpen = false;
                        blitz2v2SelectOpen = false;
                        blitzTypeSelectOpen = false;
                        blitzAiSoonTimer = 0;
                        G.playTitleStart();
                        startMatch();
                    }
                    break;
                }

                // First-level blitz menu (1v1 / 2v2)
                if (blitzTypeSelectOpen) {
                    if (modeUp && !modeDown) {
                        blitzTypeIdx = (blitzTypeIdx - 1 + BLITZ_TYPES.length) % BLITZ_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    } else if (modeDown && !modeUp) {
                        blitzTypeIdx = (blitzTypeIdx + 1) % BLITZ_TYPES.length;
                        G.initAudio();
                        G.playMenuMove();
                    }

                    if (modeBack) {
                        blitzTypeSelectOpen = false;
                        blitz1v1SelectOpen = false;
                        blitz1v1AiSelectOpen = false;
                        blitz2v2SelectOpen = false;
                        blitzAiSoonTimer = 0;
                        G.initAudio();
                        G.playMenuConfirm();
                    } else if (modeConfirm) {
                        G.initAudio();
                        var blitzTypeId = BLITZ_TYPES[blitzTypeIdx].id;
                        if (blitzTypeId === '1v1') {
                            // Open 1v1 sub-submenu
                            blitz1v1SelectOpen = true;
                            blitz1v1TypeIdx = 0;
                            blitz1v1AiSelectOpen = false;
                            blitz1v1AiTypeIdx = 1;
                            blitz2v2SelectOpen = false;
                            G.playMenuConfirm();
                        } else if (blitzTypeId === '2v2') {
                            // Open 2v2 AI difficulty submenu
                            blitz2v2SelectOpen = true;
                            blitz2v2TypeIdx = 1;
                            blitz1v1SelectOpen = false;
                            blitz1v1AiSelectOpen = false;
                            G.playMenuConfirm();
                        }
                    }
                    break;
                }

                if (modeUp && !modeDown) {
                    titleModeIdx = (titleModeIdx - 1 + TITLE_MODES.length) % TITLE_MODES.length;
                    G.initAudio();
                    G.playMenuMove();
                } else if (modeDown && !modeUp) {
                    titleModeIdx = (titleModeIdx + 1) % TITLE_MODES.length;
                    G.initAudio();
                    G.playMenuMove();
                }

                if (modeConfirm) {
                    G.initAudio();
                    var selectedModeId = TITLE_MODES[titleModeIdx].id;
                    if (selectedModeId === 'howto') {
                        G.playMenuConfirm();
                        gameState = G.STATE.HOW_TO_PLAY;
                    } else if (selectedModeId === 'blitz') {
                        blitzTypeIdx = 0;
                        blitzTypeSelectOpen = true;
                        blitz1v1SelectOpen = false;
                        blitz1v1AiSelectOpen = false;
                        blitz2v2SelectOpen = false;
                        blitzAiSoonTimer = 0;
                        G.playMenuConfirm();
                    } else {
                        // Classic mode — open ban submenu
                        banSelectOpen = true;
                        banOptionIdx = 0;
                        banCountSelectOpen = false;
                        banCountIdx = 0;
                        G.playMenuConfirm();
                    }
                }
                break;

            case G.STATE.HOW_TO_PLAY:
                titleBlink += dt;
                drawHowToPlayScreen();
                if (G.justPressed['q'] || G.justPressed['u']) {
                    G.initAudio();
                    G.playMenuConfirm();
                    gameState = G.STATE.TITLE;
                }
                break;

            case G.STATE.MAP_PREVIEW:
                mapPreviewTimer += dt;
                if (mapSelectFlashTimer > 0) mapSelectFlashTimer -= dt;

                // ── Input: navigate maps ──
                if (!mapSelectConfirmed) {
                    var mapUp = G.justPressed['w'] || G.justPressed['i'];
                    var mapDown = G.justPressed['s'] || G.justPressed['k'];
                    var mapLeft = G.justPressed['a'] || G.justPressed['j'];
                    var mapRight = G.justPressed['d'] || G.justPressed['l'];

                    var prev = mapUp || mapLeft;
                    var next = mapDown || mapRight;

                    if (prev && !next) {
                        mapSelectIdx = (mapSelectIdx - 1 + G.MAPS.length) % G.MAPS.length;
                        G.currentMapIndex = mapSelectIdx;
                        if (typeof G.resetObstacles === 'function') G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
                        G.initAudio();
                        G.playMenuMove();
                    } else if (next && !prev) {
                        mapSelectIdx = (mapSelectIdx + 1) % G.MAPS.length;
                        G.currentMapIndex = mapSelectIdx;
                        if (typeof G.resetObstacles === 'function') G.resetObstacles(G.currentMapIndex, { rerollLayout: true });
                        G.initAudio();
                        G.playMenuMove();
                    }

                    if (G.justPressed['q'] || G.justPressed['u'] || G.justPressed['enter'] || G.justPressed[' ']) {
                        G.initAudio();
                        confirmMapSelection();
                    }
                }

                // ── Draw: map background as live preview ──
                G.drawStage();
                G.drawObstacles();

                // Dark overlay
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(0, 0, W, H);

                var previewMap = G.getCurrentMap();
                var previewMapTitle = previewMap.name.toUpperCase();

                // ── Map list (left side) ──
                var listX = 40;
                var listTop = 60;
                var itemH = 32;
                var listW = 240;
                var visibleCount = Math.min(G.MAPS.length, 12);

                // Panel background
                ctx.fillStyle = 'rgba(10,10,20,0.75)';
                ctx.fillRect(listX - 8, listTop - 24, listW + 16, visibleCount * itemH + 48);
                ctx.strokeStyle = 'rgba(255,204,68,0.35)';
                ctx.lineWidth = 2;
                ctx.strokeRect(listX - 8, listTop - 24, listW + 16, visibleCount * itemH + 48);

                ctx.font = '10px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.fillText('SELECT MAP', listX + listW / 2, listTop - 8);
                ctx.textAlign = 'start';

                // Scroll offset so selected item stays visible
                var scrollOffset = 0;
                if (G.MAPS.length > visibleCount) {
                    scrollOffset = Math.max(0, Math.min(mapSelectIdx - Math.floor(visibleCount / 2), G.MAPS.length - visibleCount));
                }

                for (var mi = 0; mi < visibleCount && mi + scrollOffset < G.MAPS.length; mi++) {
                    var mapIdx = mi + scrollOffset;
                    var mapObj = G.MAPS[mapIdx];
                    var sel = mapIdx === mapSelectIdx;
                    var iy = listTop + mi * itemH;
                    var pulse = Math.sin(mapPreviewTimer * 0.008) * 0.5 + 0.5;

                    if (sel && mapSelectConfirmed) {
                        var flashPct = mapSelectFlashTimer > 0 ? mapSelectFlashTimer / MAP_SELECT_LOCK_FLASH_MS : 0;
                        ctx.fillStyle = 'rgba(68,204,68,' + (0.2 + flashPct * 0.3) + ')';
                        ctx.fillRect(listX, iy, listW, itemH - 4);
                        ctx.strokeStyle = '#44cc44';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(listX, iy, listW, itemH - 4);
                    } else if (sel) {
                        ctx.fillStyle = 'rgba(255,204,68,' + (0.1 + pulse * 0.15) + ')';
                        ctx.fillRect(listX, iy, listW, itemH - 4);
                        ctx.strokeStyle = 'rgba(255,204,68,' + (0.5 + pulse * 0.4) + ')';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(listX, iy, listW, itemH - 4);
                    } else {
                        ctx.fillStyle = 'rgba(255,255,255,0.04)';
                        ctx.fillRect(listX, iy, listW, itemH - 4);
                    }

                    // Map number
                    ctx.font = '8px "Press Start 2P", monospace';
                    ctx.textAlign = 'left';
                    ctx.fillStyle = sel ? 'rgba(255,204,68,0.7)' : 'rgba(255,255,255,0.3)';
                    ctx.fillText((mapIdx + 1) + '.', listX + 8, iy + 18);

                    // Map name
                    ctx.font = sel ? '10px "Press Start 2P", monospace' : '9px "Press Start 2P", monospace';
                    ctx.fillStyle = sel ? '#fff' : '#888';
                    ctx.fillText(mapObj.name.toUpperCase(), listX + 36, iy + 18);

                    // Selection arrow
                    if (sel && !mapSelectConfirmed) {
                        ctx.fillStyle = 'rgba(255,204,68,' + (0.55 + pulse * 0.45) + ')';
                        ctx.fillRect(listX - 5, iy + 10, 4, 8);
                    }
                }
                ctx.textAlign = 'start';

                // ── Right side: map info ──
                var infoX = 310;
                var infoW = W - infoX - 30;

                // Map title (large)
                if (mapSelectConfirmed) {
                    var flashPct2 = mapSelectFlashTimer > 0 ? mapSelectFlashTimer / MAP_SELECT_LOCK_FLASH_MS : 0;
                    // Highlight box behind title
                    ctx.save();
                    var titlePulse = Math.sin(mapPreviewTimer * 0.012) * 0.5 + 0.5;
                    ctx.font = '32px "Press Start 2P", monospace';
                    var titleTextW = ctx.measureText(previewMapTitle).width;
                    var boxW2 = Math.max(180, Math.min(infoW, titleTextW + 48));
                    var boxX2 = infoX + infoW / 2 - boxW2 / 2;
                    ctx.fillStyle = 'rgba(68,204,68,' + (0.08 + titlePulse * 0.08 + flashPct2 * 0.25) + ')';
                    ctx.fillRect(boxX2, 52, boxW2, 50);
                    ctx.strokeStyle = 'rgba(100,255,100,' + (0.35 + flashPct2 * 0.35) + ')';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(boxX2, 52, boxW2, 50);
                    ctx.restore();
                }
                ctx.font = '32px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = mapSelectConfirmed ? '#44ff44' : '#ffcc44';
                ctx.fillText(previewMapTitle, infoX + infoW / 2, 88);

                // Status line
                ctx.font = '9px "Press Start 2P", monospace';
                ctx.fillStyle = mapSelectConfirmed ? '#88ff88' : 'rgba(255,255,255,0.55)';
                ctx.fillText(mapSelectConfirmed ? 'MAP LOCKED IN!' : 'W/S or I/K to browse  •  Q/U to confirm', infoX + infoW / 2, 108);

                // ── Obstacle legend ──
                var obstacleTypes = {};
                if (previewMap.obstacles) {
                    for (var oi = 0; oi < previewMap.obstacles.length; oi++) {
                        obstacleTypes[previewMap.obstacles[oi].type] = true;
                    }
                }
                if (previewMap.dynamicHazards) {
                    for (var dh = 0; dh < previewMap.dynamicHazards.length; dh++) {
                        obstacleTypes[previewMap.dynamicHazards[dh]] = true;
                    }
                }
                var legendY = 145;
                var typeKeys = Object.keys(obstacleTypes);
                if (typeKeys.length > 0) {
                    ctx.font = '9px "Press Start 2P", monospace';
                    ctx.fillStyle = 'rgba(255,255,255,0.5)';
                    ctx.fillText('HAZARDS', infoX + infoW / 2, legendY);
                    for (var ti = 0; ti < typeKeys.length; ti++) {
                        var info = G.getObstacleLabel(typeKeys[ti]);
                        ctx.fillStyle = info.color;
                        ctx.beginPath();
                        ctx.arc(infoX + infoW / 2 - 60, legendY + 22 + ti * 26, 5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.font = '9px "Press Start 2P", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#ddd';
                        ctx.fillText(info.name, infoX + infoW / 2 - 48, legendY + 26 + ti * 26);
                        ctx.textAlign = 'center';
                    }
                } else {
                    ctx.font = '9px "Press Start 2P", monospace';
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fillText('NO OBSTACLES', infoX + infoW / 2, legendY);
                }
                ctx.textAlign = 'start';

                // ── Map count footer ──
                ctx.font = '7px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.fillText('MAP ' + (mapSelectIdx + 1) + ' / ' + G.MAPS.length, infoX + infoW / 2, H - 20);
                ctx.textAlign = 'start';

                // ── Advance to weapon select after confirmed + key press ──
                if (mapSelectConfirmed && mapSelectFlashTimer <= 0 && G.anyKeyJustPressed()) {
                    G.playMenuConfirm();
                    enterWeaponSelect();
                }
                break;

            case G.STATE.MAP_ROULETTE:
                mapPreviewTimer += dt;
                var rouletteSkipPressed = !rouletteSettled && G.anyKeyJustPressed();
                if (rouletteSkipPressed) {
                    settleRoulette(true);
                }
                updateRouletteAnimation(dt);
                G.drawStage();
                G.drawObstacles();

                // Dark overlay
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(0, 0, W, H);

                // Map name
                var rMap = G.getCurrentMap();
                var rMapTitle = rMap.name.toUpperCase();
                var rMapNameY = H * 0.22;
                var rHighlightReady = rouletteSettled &&
                    (rouletteForceHighlight || rouletteSettledTimer >= MAP_ROULETTE_HIGHLIGHT_DELAY_MS);
                if (rHighlightReady) {
                    drawRouletteHighlight(rMapNameY, rMapTitle, 38);
                }
                G.drawCenterText(rMapTitle, rMapNameY, 38, '#ffcc44');
                if (rouletteSettled) {
                    G.drawCenterText('MAP LOCKED IN', H * 0.30, 10, '#ffdd88');
                } else if (rouletteLanding) {
                    G.drawCenterText('LANDING...', H * 0.30, 10, 'rgba(255,255,255,0.68)');
                } else {
                    G.drawCenterText('RANDOMIZING MAP...', H * 0.30, 10, 'rgba(255,255,255,0.6)');
                }

                // Obstacle legend
                var rObstacleTypes = {};
                if (rMap.obstacles) {
                    for (var roi = 0; roi < rMap.obstacles.length; roi++) {
                        rObstacleTypes[rMap.obstacles[roi].type] = true;
                    }
                }
                if (rMap.dynamicHazards) {
                    for (var rdh = 0; rdh < rMap.dynamicHazards.length; rdh++) {
                        rObstacleTypes[rMap.dynamicHazards[rdh]] = true;
                    }
                }
                var rLegendY = H * 0.42;
                var rTypeKeys = Object.keys(rObstacleTypes);
                if (rTypeKeys.length > 0) {
                    G.drawCenterText('HAZARDS', H * 0.36, 10, 'rgba(255,255,255,0.5)');
                    for (var rti = 0; rti < rTypeKeys.length; rti++) {
                        var rInfo = G.getObstacleLabel(rTypeKeys[rti]);
                        ctx.fillStyle = rInfo.color;
                        ctx.beginPath();
                        ctx.arc(W / 2 - 60, rLegendY + rti * 28, 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.font = '10px "Press Start 2P", monospace';
                        ctx.textAlign = 'left';
                        ctx.fillStyle = '#ddd';
                        ctx.fillText(rInfo.name, W / 2 - 46, rLegendY + rti * 28 + 4);
                        ctx.textAlign = 'start';
                    }
                } else {
                    G.drawCenterText('NO OBSTACLES', H * 0.42, 10, 'rgba(255,255,255,0.3)');
                }

                // Progress bar / prompt
                if (!rouletteSettled) {
                    var rSpinPct = Math.min(1, rouletteSpinElapsed / MAP_ROULETTE_SPIN_MS);
                    var rBarW = 280;
                    var rBarH = 8;
                    var rBarX = W / 2 - rBarW / 2;
                    var rBarY = H * 0.78 - 4;
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    ctx.fillRect(rBarX, rBarY, rBarW, rBarH);
                    ctx.fillStyle = 'rgba(255,204,68,0.85)';
                    ctx.fillRect(rBarX + 1, rBarY + 1, (rBarW - 2) * rSpinPct, rBarH - 2);
                    ctx.save();
                    ctx.globalAlpha = 0.55 + (Math.sin(mapPreviewTimer * 0.008) * 0.25 + 0.25);
                    G.drawCenterText('PRESS ANY KEY TO SKIP', H * 0.84, 9, '#bbb');
                    ctx.restore();
                } else if (rHighlightReady && Math.sin(mapPreviewTimer * 0.005) > 0) {
                    G.drawCenterText('PRESS ANY KEY TO CONTINUE', H * 0.78, 10, '#aaa');
                }

                var rContinueDelay = rouletteForceHighlight
                    ? MAP_ROULETTE_SKIP_CONTINUE_DELAY_MS
                    : MAP_ROULETTE_HIGHLIGHT_DELAY_MS + 100;
                if (!rouletteSkipPressed && rouletteSettled && rouletteSettledTimer > rContinueDelay && G.anyKeyJustPressed()) {
                    G.playMenuConfirm();
                    equipBlitzWeapons();
                    resetRound();
                    startCountdown();
                }
                break;

            case G.STATE.WEAPON_SELECT:
                updateWeaponSelect(dt);
                drawWeaponSelectScreen();
                break;

            case G.STATE.COUNTDOWN:
                countdownTimer += dt;
                // Keep arena elements visible/animated before fight begins.
                if (typeof G.updateMapDynamics === 'function') {
                    G.updateMapDynamics(dt, p1, p2, { allowHazards: false, p3: G.is2v2 ? p3 : null, p4: G.is2v2 ? p4 : null });
                }
                G.updateObstacles(dt);
                G.updateHearts(dt, p1, p2, G.is2v2 ? p3 : null, G.is2v2 ? p4 : null);
                G.drawStage();
                G.drawObstacles();
                if (typeof G.drawMapDynamicsWorld === 'function') G.drawMapDynamicsWorld();
                G.drawHearts();
                p1.draw();
                p2.draw();
                if (G.is2v2) { p3.draw(); p4.draw(); }
                if (typeof G.drawMapDynamicsOverlay === 'function') G.drawMapDynamicsOverlay();
                if (G.is2v2) {
                    G.drawUI(p1, p2, p3, p4);
                } else {
                    G.drawUI(p1, p2);
                }

                var elapsed = countdownTimer;
                if (!countdownFightCuePlayed && elapsed >= 2100) {
                    countdownFightCuePlayed = true;
                    G.initAudio();
                    if (G.playFightStart) G.playFightStart();
                    G.fxTriggerShake(10, 230);
                }
                if (elapsed < 700) countdownNum = 3;
                else if (elapsed < 1400) countdownNum = 2;
                else if (elapsed < 2100) countdownNum = 1;
                else if (elapsed < 2800) countdownNum = 0;
                else gameState = G.STATE.FIGHTING;

                if (countdownNum > 0 && countdownNum !== countdownLastSfxNum) {
                    countdownLastSfxNum = countdownNum;
                    G.initAudio();
                    if (G.playCountdownTick) G.playCountdownTick(countdownNum);
                }

                if (countdownNum > 0) {
                    var scale = 1 + (1 - ((elapsed % 700) / 700)) * 0.5;
                    G.drawCenterText(
                        String(countdownNum), H * 0.4,
                        Math.floor(48 * scale), '#ffcc44',
                        Math.max(0.3, 1 - (elapsed % 700) / 700)
                    );
                } else if (gameState === G.STATE.COUNTDOWN) {
                    var fa = 1 - ((elapsed - 2100) / 700);
                    G.drawCenterText('FIGHT!', H * 0.4, 48, '#ff4444', fa);
                }

                // Show map name + weapon names
                var map = G.getCurrentMap();
                var nameAlpha = countdownTimer < 2000
                    ? Math.min(1, countdownTimer / 500)
                    : Math.max(0, 1 - (countdownTimer - 2000) / 500);
                if (nameAlpha > 0) {
                    G.drawCenterText(map.name.toUpperCase(), H * 0.57, 15, 'rgba(255,255,255,0.6)', nameAlpha * 0.8);
                    // Show weapon names above each fighter's head
                    ctx.save();
                    ctx.globalAlpha = nameAlpha * 0.6;
                    ctx.font = '7px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    var p1NameY = Math.max(16, p1.y - p1.currentH - 12);
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fillText(p1.weapon.name, p1.x + 1, p1NameY + 1);
                    ctx.fillStyle = '#5b9aff';
                    ctx.fillText(p1.weapon.name, p1.x, p1NameY);

                    var p2NameY = Math.max(16, p2.y - p2.currentH - 12);
                    ctx.fillStyle = 'rgba(0,0,0,0.65)';
                    ctx.fillText(p2.weapon.name, p2.x + 1, p2NameY + 1);
                    ctx.fillStyle = '#ff5b5b';
                    ctx.fillText(p2.weapon.name, p2.x, p2NameY);

                    if (G.is2v2 && p3.weapon && p4.weapon) {
                        var p3NameY = Math.max(16, p3.y - p3.currentH - 12);
                        ctx.fillStyle = 'rgba(0,0,0,0.65)';
                        ctx.fillText(p3.weapon.name, p3.x + 1, p3NameY + 1);
                        ctx.fillStyle = '#66cc66';
                        ctx.fillText(p3.weapon.name, p3.x, p3NameY);

                        var p4NameY = Math.max(16, p4.y - p4.currentH - 12);
                        ctx.fillStyle = 'rgba(0,0,0,0.65)';
                        ctx.fillText(p4.weapon.name, p4.x + 1, p4NameY + 1);
                        ctx.fillStyle = '#cc66cc';
                        ctx.fillText(p4.weapon.name, p4.x, p4NameY);
                    }

                    ctx.textBaseline = 'alphabetic';
                    ctx.restore();
                }
                break;

            case G.STATE.SUPER_PAUSE:
                superPauseTimer -= dt;

                // Draw frozen game scene (no updates)
                ctx.save();
                G.applyCameraTransform();
                G.drawStage();
                G.drawObstacles();
                if (typeof G.drawMapDynamicsWorld === 'function') G.drawMapDynamicsWorld();
                G.drawHearts();
                G.drawSuperEffects(p1);
                G.drawSuperEffects(p2);
                p1.draw();
                p2.draw();
                G.drawClone(p1);
                G.drawClone(p2);
                p1.drawProjectiles();
                p2.drawProjectiles();
                if (G.is2v2) {
                    G.drawSuperEffects(p3);
                    G.drawSuperEffects(p4);
                    p3.draw();
                    p4.draw();
                    G.drawClone(p3);
                    G.drawClone(p4);
                    p3.drawProjectiles();
                    p4.drawProjectiles();
                }
                G.drawBlackHoles();
                G.drawFantasyEntities(p1);
                G.drawFantasyEntities(p2);
                if (G.is2v2) {
                    G.drawFantasyEntities(p3);
                    G.drawFantasyEntities(p4);
                }
                G.drawParticles();
                G.drawSuperTimer(p1);
                G.drawSuperTimer(p2);
                if (G.is2v2) {
                    G.drawSuperTimer(p3);
                    G.drawSuperTimer(p4);
                }
                ctx.restore();
                drawSuddenDeathBorders();
                if (typeof G.drawMapDynamicsOverlay === 'function') G.drawMapDynamicsOverlay();
                if (G.is2v2) {
                    G.drawUI(p1, p2, p3, p4);
                } else {
                    G.drawUI(p1, p2);
                }

                // Dark overlay
                var pauseAlpha = Math.min(0.6, (2000 - superPauseTimer) / 300 * 0.6);
                ctx.fillStyle = 'rgba(0,0,0,' + pauseAlpha + ')';
                ctx.fillRect(0, 0, W, H);

                // Super name text — large centered with glow
                var textAlpha = Math.min(1, (2000 - superPauseTimer) / 200);
                var textScale = 1 + Math.max(0, 1 - (2000 - superPauseTimer) / 300) * 0.5;
                ctx.save();
                ctx.globalAlpha = textAlpha;
                // Glow behind text
                ctx.fillStyle = superPauseColor;
                ctx.globalAlpha = textAlpha * 0.15;
                ctx.fillRect(W * 0.1, H * 0.35, W * 0.8, H * 0.2);
                ctx.globalAlpha = textAlpha;
                G.drawCenterText(superPauseName, H * 0.45, Math.floor(32 * textScale), superPauseColor);
                ctx.restore();

                // Resume when timer expires
                if (superPauseTimer <= 0) {
                    gameState = G.STATE.FIGHTING;
                }
                break;

            case G.STATE.FIGHTING:
                var inHitstop = G.hitstopTimer > 0;
                if (inHitstop) {
                    G.hitstopTimer = Math.max(0, G.hitstopTimer - dt);
                } else {
                    updateSuddenDeathBounds(dt);

                    if (typeof G.updateMapDynamics === 'function') {
                        G.updateMapDynamics(dt, p1, p2, { allowHazards: true, p3: G.is2v2 ? p3 : null, p4: G.is2v2 ? p4 : null });
                    }

                    if (G.is2v2) {
                        // ── 2v2 Update Logic ──
                        // AI for p2 (human teammate — no AI needed, human controls)
                        // AI for p3 targeting team1 [p1, p2]
                        if (G.aiEnabled && typeof G.updateAI === 'function') {
                            G.updateAI(p3, [p1, p2], dt);
                            G.updateAI(p4, [p1, p2], dt);
                        }

                        // Update all 4 fighters (each needs an "opponent" for facing/etc — use closest enemy)
                        p1.update(dt, p3); // p1 faces p3 as default opponent
                        p2.update(dt, p4); // p2 faces p4 as default opponent
                        p3.update(dt, p1);
                        p4.update(dt, p2);

                        // Cross-team combat: no friendly fire
                        G.checkCombat(p1, p3, dt);
                        G.checkCombat(p1, p4, dt);
                        G.checkCombat(p2, p3, dt);
                        G.checkCombat(p2, p4, dt);

                        // Supers: each fighter against each enemy
                        G.updateSuper(p1, p3, dt);
                        G.updateSuper(p2, p4, dt);
                        G.updateSuper(p3, p1, dt);
                        G.updateSuper(p4, p2, dt);

                        // Black holes affect all fighters
                        G.updateBlackHoles([p1, p2, p3, p4], dt);

                        // Obstacles for all 4
                        G.checkObstacles(p1, dt);
                        G.checkObstacles(p2, dt);
                        G.checkObstacles(p3, dt);
                        G.checkObstacles(p4, dt);

                        // Hearts for all 4
                        G.updateHearts(dt, p1, p2, p3, p4);

                        // Camera tracks all alive fighters
                        G.updateCamera(p1, p2, p3, p4);
                    } else {
                        // ── 1v1 Update Logic ──
                        p1.update(dt, p2);
                        if (G.aiEnabled && typeof G.updateAI === 'function') G.updateAI(p2, p1, dt);
                        p2.update(dt, p1);
                        G.checkCombat(p1, p2, dt);
                        G.updateSuper(p1, p2, dt);
                        G.updateSuper(p2, p1, dt);
                        G.updateBlackHoles(p1, p2, dt);
                        G.checkObstacles(p1, dt);
                        G.checkObstacles(p2, dt);
                        G.updateHearts(dt, p1, p2);
                        G.updateCamera(p1, p2);
                    }

                    // Check for super pause request from any super activation
                    if (G._superPauseRequest) {
                        var req = G._superPauseRequest;
                        G._superPauseRequest = null;
                        superPauseTimer = 2000;
                        superPauseName = req.name;
                        superPauseColor = req.color;
                        gameState = G.STATE.SUPER_PAUSE;
                    }
                    applySuddenDeathDamageAll(dt);
                    G.updateParticles(dt);
                    G.updateObstacles(dt);
                }

                // Apply camera zoom
                ctx.save();
                G.applyCameraTransform();

                G.drawStage();
                G.drawObstacles();
                if (typeof G.drawMapDynamicsWorld === 'function') G.drawMapDynamicsWorld();
                G.drawHearts();
                G.drawSuperEffects(p1);
                G.drawSuperEffects(p2);
                p1.draw();
                p2.draw();
                G.drawClone(p1);
                G.drawClone(p2);
                p1.drawProjectiles();
                p2.drawProjectiles();

                if (G.is2v2) {
                    G.drawSuperEffects(p3);
                    G.drawSuperEffects(p4);
                    p3.draw();
                    p4.draw();
                    G.drawClone(p3);
                    G.drawClone(p4);
                    p3.drawProjectiles();
                    p4.drawProjectiles();
                }

                G.drawBlackHoles();
                G.drawFantasyEntities(p1);
                G.drawFantasyEntities(p2);
                if (G.is2v2) {
                    G.drawFantasyEntities(p3);
                    G.drawFantasyEntities(p4);
                }
                G.drawParticles();
                G.drawFrostCounter(p1);
                G.drawFrostCounter(p2);
                G.drawFrozenEffect(p1);
                G.drawFrozenEffect(p2);
                G.drawBlackHoleStopwatch(p1);
                G.drawBlackHoleStopwatch(p2);
                G.drawSuperTimer(p1);
                G.drawSuperTimer(p2);

                if (G.is2v2) {
                    G.drawFrostCounter(p3);
                    G.drawFrostCounter(p4);
                    G.drawFrozenEffect(p3);
                    G.drawFrozenEffect(p4);
                    G.drawBlackHoleStopwatch(p3);
                    G.drawBlackHoleStopwatch(p4);
                    G.drawSuperTimer(p3);
                    G.drawSuperTimer(p4);
                }

                ctx.restore(); // Restore camera zoom
                drawSuddenDeathBorders();

                if (typeof G.drawMapDynamicsOverlay === 'function') G.drawMapDynamicsOverlay();
                // UI drawn OUTSIDE zoom so it stays readable
                if (G.is2v2) {
                    G.drawUI(p1, p2, p3, p4);
                } else {
                    G.drawUI(p1, p2);
                }

                if (finisherTimer > 0) {
                    finisherTimer -= rawDt;
                    if (finisherTimer <= 0) {
                        finalizeRoundOutcome();
                    }
                } else if (!inHitstop) {
                    if (G.is2v2) {
                        // Round ends when BOTH members of a team die
                        var team1Dead = p1.hp <= 0 && p2.hp <= 0;
                        var team2Dead = p3.hp <= 0 && p4.hp <= 0;
                        if (team1Dead || team2Dead) {
                            roundWinner = team2Dead ? 1 : 2;
                            startRoundFinisher();
                        }
                    } else {
                        if (p1.hp <= 0 || p2.hp <= 0) {
                            roundWinner = p1.hp <= 0 ? 2 : 1;
                            startRoundFinisher();
                        }
                    }
                }
                break;

            case G.STATE.ROUND_END:
                roundEndTimer += dt;
                G.updateParticles(dt);
                G.drawStage();
                G.drawHearts();
                p1.draw();
                p2.draw();
                if (G.is2v2) { p3.draw(); p4.draw(); }
                G.drawParticles();
                if (G.is2v2) {
                    G.drawUI(p1, p2, p3, p4);
                } else {
                    G.drawUI(p1, p2);
                }

                if (G.is2v2) {
                    var wc = roundWinner === 1 ? '#5b9aff' : '#44aa44';
                    G.drawCenterText('TEAM ' + roundWinner, H * 0.35, 28, wc);
                } else {
                    var wc = roundWinner === 1 ? '#5b9aff' : '#ff5b5b';
                    G.drawCenterText('PLAYER ' + roundWinner, H * 0.35, 28, wc);
                }
                G.drawCenterText('WINS THE ROUND!', H * 0.48, 18, '#fff');

                if (roundEndTimer > 2500) {
                    if (activeModeId === 'blitz') {
                        enterMapRoulette();
                    } else {
                        enterMapPreview();
                    }
                }
                break;

            case G.STATE.MATCH_END:
                roundEndTimer += dt;
                G.updateParticles(dt);

                if (Math.random() < 0.15) {
                    var colors = ['#ffcc44', '#ff5b5b', '#5b9aff', '#44ff88', '#ff44ff'];
                    G.spawnParticles(
                        Math.random() * W, -10,
                        colors[Math.floor(Math.random() * colors.length)],
                        3, 3
                    );
                }

                G.drawStage();
                p1.draw();
                p2.draw();
                if (G.is2v2) { p3.draw(); p4.draw(); }
                G.drawParticles();
                if (G.is2v2) {
                    G.drawUI(p1, p2, p3, p4);
                } else {
                    G.drawUI(p1, p2);
                }

                if (G.is2v2) {
                    var mc = matchWinner === 1 ? '#5b9aff' : '#44aa44';
                    G.drawCenterText('TEAM ' + matchWinner, H * 0.3, 36, mc);
                } else {
                    var mc = matchWinner === 1 ? '#5b9aff' : '#ff5b5b';
                    G.drawCenterText('PLAYER ' + matchWinner, H * 0.3, 36, mc);
                }
                G.drawCenterText(activeModeId === 'blitz' ? 'WINS BLITZ!' : 'WINS THE MATCH!', H * 0.44, 22, '#ffcc44');

                if (roundEndTimer > 1500) {
                    var blinkR = Math.sin(roundEndTimer * 0.005) > 0;
                    if (blinkR) G.drawCenterText('PRESS R TO REMATCH', H * 0.62, 12, '#aaa');
                    if (G.justPressed['r']) {
                        G.playMenuConfirm();
                        startMatch();
                    }
                }
                break;
        }

        // Parry flash
        if (G.fx.parryFlashTimer > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + (G.fx.parryFlashTimer / 60 * 0.6) + ')';
            ctx.fillRect(0, 0, W, H);
            G.fx.parryFlashTimer -= dt / 16.67;
        }

        ctx.restore();

        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
})(window.Game);
