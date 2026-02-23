// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Audio (Procedural Web Audio API)
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var audioCtx = null;
    var sfxMasterGain = null;
    var SFX_VOLUME_BOOST = 1.3;

    G.initAudio = function () {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!sfxMasterGain) {
            sfxMasterGain = audioCtx.createGain();
            sfxMasterGain.gain.value = SFX_VOLUME_BOOST;
            sfxMasterGain.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        // SFX only. Background music disabled by request.
    };

    function getOutputNode() {
        return sfxMasterGain || audioCtx.destination;
    }

    function clamp01(v) {
        if (v < 0) return 0;
        if (v > 1) return 1;
        return v;
    }

    G.playWhoosh = function () {
        if (!audioCtx) return;
        var dur = 0.12;
        var bufferSize = audioCtx.sampleRate * dur;
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.3;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1.5;
        src.connect(filter);
        filter.connect(getOutputNode());
        src.start();
    };

    G.playClang = function () {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    };

    G.playHit = function () {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    };

    G.playCheer = function () {
        if (!audioCtx) return;
        [523, 659, 784].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, audioCtx.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.08 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(audioCtx.currentTime + i * 0.08);
            osc.stop(audioCtx.currentTime + 0.6);
        });
    };

    G.playPickup = function () {
        if (!audioCtx) return;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    };

    G.playGunDryClick = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.05);
    };

    G.playGunshot = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        G.playGunDryClick();

        // Noise burst for gunshot crack
        var dur = 0.08;
        var bufferSize = audioCtx.sampleRate * dur;
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.5;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        src.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);

        // Low thud for impact feel
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(oscGain);
        oscGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);

        // Short bright tail so shots feel less dry.
        var tail = audioCtx.createOscillator();
        var tailGain = audioCtx.createGain();
        tail.type = 'triangle';
        tail.frequency.setValueAtTime(1200, now + 0.01);
        tail.frequency.exponentialRampToValueAtTime(340, now + 0.11);
        tailGain.gain.setValueAtTime(0.05, now + 0.01);
        tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        tail.connect(tailGain);
        tailGain.connect(getOutputNode());
        tail.start(now + 0.01);
        tail.stop(now + 0.13);
    };

    G.playSniperShot = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        G.playGunDryClick();

        // Heavy noise crack — longer and louder than pistol
        var dur = 0.15;
        var bufferSize = audioCtx.sampleRate * dur;
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t * t) * 0.7;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        src.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);

        // Deep boom
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(oscGain);
        oscGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.2);

        var ring = audioCtx.createOscillator();
        var ringGain = audioCtx.createGain();
        ring.type = 'sine';
        ring.frequency.setValueAtTime(740, now + 0.02);
        ring.frequency.exponentialRampToValueAtTime(180, now + 0.28);
        ringGain.gain.setValueAtTime(0.08, now + 0.02);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        ring.connect(ringGain);
        ringGain.connect(getOutputNode());
        ring.start(now + 0.02);
        ring.stop(now + 0.3);
    };

    G.playUIClick = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var click = audioCtx.createOscillator();
        var clickGain = audioCtx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(900, now);
        click.frequency.exponentialRampToValueAtTime(420, now + 0.03);
        clickGain.gain.setValueAtTime(0.06, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        click.connect(clickGain);
        clickGain.connect(getOutputNode());
        click.start(now);
        click.stop(now + 0.04);
    };

    G.playMenuMove = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        G.playUIClick();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(360 + Math.random() * 40, now);
        osc.frequency.exponentialRampToValueAtTime(500 + Math.random() * 40, now + 0.05);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.08);
    };

    G.playMenuConfirm = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        G.playUIClick();
        [520, 780].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.2);
        });
    };

    G.playCountdownTick = function (count) {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var c = typeof count === 'number' ? count : 3;
        var baseFreq = 430;
        if (c === 2) baseFreq = 560;
        else if (c === 1) baseFreq = 720;

        // Main beep (different pitch per number)
        var tone = audioCtx.createOscillator();
        var toneGain = audioCtx.createGain();
        tone.type = 'square';
        tone.frequency.setValueAtTime(baseFreq, now);
        tone.frequency.exponentialRampToValueAtTime(baseFreq * 0.82, now + 0.1);
        toneGain.gain.setValueAtTime(0.09, now);
        toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        tone.connect(toneGain);
        toneGain.connect(getOutputNode());
        tone.start(now);
        tone.stop(now + 0.12);

        // Soft harmonic layer so it feels less flat
        var harm = audioCtx.createOscillator();
        var harmGain = audioCtx.createGain();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(baseFreq * 1.5, now + 0.01);
        harm.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.1);
        harmGain.gain.setValueAtTime(0.045, now + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        harm.connect(harmGain);
        harmGain.connect(getOutputNode());
        harm.start(now + 0.01);
        harm.stop(now + 0.12);
    };

    G.playBellRing = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;

        var tone = audioCtx.createOscillator();
        var toneGain = audioCtx.createGain();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(680, now);
        tone.frequency.exponentialRampToValueAtTime(420, now + 0.65);
        toneGain.gain.setValueAtTime(0.18, now);
        toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        tone.connect(toneGain);
        toneGain.connect(getOutputNode());
        tone.start(now);
        tone.stop(now + 0.82);

        var shimmer = audioCtx.createOscillator();
        var shimmerGain = audioCtx.createGain();
        shimmer.type = 'sine';
        shimmer.frequency.setValueAtTime(980, now + 0.02);
        shimmer.frequency.exponentialRampToValueAtTime(690, now + 0.65);
        shimmerGain.gain.setValueAtTime(0.06, now + 0.02);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        shimmer.connect(shimmerGain);
        shimmerGain.connect(getOutputNode());
        shimmer.start(now + 0.02);
        shimmer.stop(now + 0.78);

        var reverbDur = 0.2;
        var bufferSize = Math.floor(audioCtx.sampleRate * reverbDur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var p = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - p) * 0.12;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 1.2;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.035, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(getOutputNode());
        src.start(now);
    };

    G.playSuperReady = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;

        // Short magical ping stack for "super ready"
        [720, 960, 1280].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = i === 1 ? 'sine' : 'triangle';
            var t = now + i * 0.045;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.35, t + 0.08);
            gain.gain.setValueAtTime(0.065, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(t);
            osc.stop(t + 0.16);
        });

        // Airy sparkle tail
        var dur = 0.18;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var p = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - p) * 0.15;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1700;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
    };

    G.playFightStart = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;

        // "Commence" fanfare: brass-like chord stab with a brief lead-in.
        var lead = audioCtx.createOscillator();
        var leadGain = audioCtx.createGain();
        lead.type = 'square';
        lead.frequency.setValueAtTime(220, now);
        lead.frequency.exponentialRampToValueAtTime(420, now + 0.08);
        leadGain.gain.setValueAtTime(0.08, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        lead.connect(leadGain);
        leadGain.connect(getOutputNode());
        lead.start(now);
        lead.stop(now + 0.11);

        // Triad stab
        [392, 494, 587].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = i === 0 ? 'sawtooth' : 'triangle';
            var t = now + 0.05;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.28);
            gain.gain.setValueAtTime(0.13 - i * 0.02, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(t);
            osc.stop(t + 0.34);
        });

        // Low impact body
        var sub = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, now + 0.03);
        sub.frequency.exponentialRampToValueAtTime(52, now + 0.24);
        subGain.gain.setValueAtTime(0.1, now + 0.03);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        sub.connect(subGain);
        subGain.connect(getOutputNode());
        sub.start(now + 0.03);
        sub.stop(now + 0.28);

        // Crisp noise burst so it cuts through
        var dur = 0.22;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var j = 0; j < bufferSize; j++) {
            var p = j / bufferSize;
            data[j] = (Math.random() * 2 - 1) * (1 - p) * 0.18;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1350;
        filter.Q.value = 1.2;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.05, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(getOutputNode());
        src.start(now + 0.04);
    };

    G.playMapRouletteStart = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;

        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.25);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.3);
    };

    G.playMapRouletteTick = function (progress) {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var p = clamp01(typeof progress === 'number' ? progress : 0);
        var freq = 1250 - p * 820 + (Math.random() * 40 - 20);
        var amp = 0.02 + (1 - p) * 0.035;

        var tick = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        tick.type = 'triangle';
        tick.frequency.setValueAtTime(Math.max(220, freq), now);
        tick.frequency.exponentialRampToValueAtTime(Math.max(140, freq * 0.62), now + 0.035);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        tick.connect(gain);
        gain.connect(getOutputNode());
        tick.start(now);
        tick.stop(now + 0.05);
    };

    G.playMapRouletteLock = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        G.playMenuConfirm();

        var thud = audioCtx.createOscillator();
        var thudGain = audioCtx.createGain();
        thud.type = 'square';
        thud.frequency.setValueAtTime(180, now);
        thud.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        thudGain.gain.setValueAtTime(0.14, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        thud.connect(thudGain);
        thudGain.connect(getOutputNode());
        thud.start(now);
        thud.stop(now + 0.14);
    };

    G.playMapChosen = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        [392, 523, 659].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0.08, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.14);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.2);
        });
    };

    G.playMapHighlight = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.14);
    };

    G.playMapHighlightPulse = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(680 + Math.random() * 90, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.05);
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.06);
    };

    G.playParry = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.2);
    };

    G.playImpactHeavy = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.16);
    };

    G.playRain = function () {
        if (!audioCtx) return;
        var dur = 0.05;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.12;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        var gain = audioCtx.createGain();
        filter.type = 'highpass';
        filter.frequency.value = 1800;
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start();
    };
    // ─── Fantasy Weapon Sounds ──────────────────────────────────

    G.playHammerImpact = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Deep ground pound thud
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.25);
        // Noise burst for impact
        var dur = 0.1;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.4;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.35, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(getOutputNode());
        src.start(now);
    };

    G.playChainClank = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.12);
        // Metallic ring
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1800, now);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.06);
        gain2.gain.setValueAtTime(0.1, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc2.connect(gain2);
        gain2.connect(getOutputNode());
        osc2.start(now);
        osc2.stop(now + 0.1);
    };

    G.playFrostHit = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
        // Crystal shimmer
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(3000, now + 0.02);
        osc2.frequency.exponentialRampToValueAtTime(1500, now + 0.08);
        gain2.gain.setValueAtTime(0.08, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc2.connect(gain2);
        gain2.connect(getOutputNode());
        osc2.start(now + 0.02);
        osc2.stop(now + 0.1);
    };

    G.playFreeze = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Crackling ice noise
        var dur = 0.3;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t * 0.7) * 0.3;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Ice crystallize tone
        var osc = audioCtx.createOscillator();
        var oGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
        oGain.gain.setValueAtTime(0.15, now);
        oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(oGain);
        oGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.3);
    };

    G.playDash = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var dur = 0.1;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.35;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
    };

    G.playBlackHoleSpawn = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Deep void bass
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.35);
        // Eerie overtone
        var osc2 = audioCtx.createOscillator();
        var gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(200, now);
        osc2.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        gain2.gain.setValueAtTime(0.12, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc2.connect(gain2);
        gain2.connect(getOutputNode());
        osc2.start(now);
        osc2.stop(now + 0.3);
    };

    G.playGhostActivate = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Eerie whisper noise
        var dur = 0.25;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.25;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
        filter.Q.value = 3;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Ghostly tone
        var osc = audioCtx.createOscillator();
        var oGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        oGain.gain.setValueAtTime(0.1, now);
        oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(oGain);
        oGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.25);
    };

    G.playWolfSpawn = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Short growl
        var dur = 0.1;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.3;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Low bark tone
        var osc = audioCtx.createOscillator();
        var oGain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        oGain.gain.setValueAtTime(0.2, now);
        oGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(oGain);
        oGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
    };

    // ─── Extra Contextual SFX (weapon/case specific) ────────────
    G.playTitleStart = function () {
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(function () { G.playTitleStart(); });
            return;
        }
        G.playMenuConfirm();
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.2);
    };

    G.playWeaponSwing = function (weaponId, superActive) {
        if (!audioCtx) return;
        if (weaponId === 'shield') { G.playDash(); return; }
        if (weaponId === 'frostdaggers') { G.playFrostShot(); return; }
        G.playWhoosh();

        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = (weaponId === 'hammer' || weaponId === 'black') ? 'sawtooth' : 'triangle';
        var start = 560, end = 250, amp = 0.08;
        if (weaponId === 'hammer') { start = 220; end = 90; amp = 0.12; }
        else if (weaponId === 'blade') { start = 920; end = 460; amp = 0.07; }
        else if (weaponId === 'spear') { start = 700; end = 280; amp = 0.08; }
        else if (weaponId === 'black') { start = 300; end = 120; amp = 0.1; }
        else if (weaponId === 'derun') { start = 760; end = 300; amp = 0.09; }
        if (superActive) amp *= 1.18;
        osc.frequency.setValueAtTime(start, now);
        osc.frequency.exponentialRampToValueAtTime(end, now + 0.11);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.12);
    };

    G.playFrostShot = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
    };

    G.playShieldBash = function () {
        if (!audioCtx) return;
        G.playClang();
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.14);
    };

    G.playHammerWaveHit = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.24);
    };

    G.playHammerSpreadCast = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var rumble = audioCtx.createOscillator();
        var rumbleGain = audioCtx.createGain();
        rumble.type = 'triangle';
        rumble.frequency.setValueAtTime(140, now);
        rumble.frequency.exponentialRampToValueAtTime(45, now + 0.2);
        rumbleGain.gain.setValueAtTime(0.16, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        rumble.connect(rumbleGain);
        rumbleGain.connect(getOutputNode());
        rumble.start(now);
        rumble.stop(now + 0.22);
    };

    G.playHammerSpreadDamage = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var snap = audioCtx.createOscillator();
        var snapGain = audioCtx.createGain();
        snap.type = 'square';
        snap.frequency.setValueAtTime(520, now);
        snap.frequency.exponentialRampToValueAtTime(110, now + 0.08);
        snapGain.gain.setValueAtTime(0.14, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        snap.connect(snapGain);
        snapGain.connect(getOutputNode());
        snap.start(now);
        snap.stop(now + 0.1);
    };

    G.playMeleeImpact = function (weaponId, superActive) {
        if (!audioCtx) return;
        if (weaponId === 'hammer') { G.playImpactHeavy(); return; }
        if (weaponId === 'shield') { G.playShieldBash(); return; }
        if (weaponId === 'frostdaggers') { G.playFrostHit(); return; }

        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = weaponId === 'blade' ? 'triangle' : 'square';
        var start = weaponId === 'spear' ? 300 : 240;
        var end = weaponId === 'blade' ? 120 : 90;
        var amp = superActive ? 0.25 : 0.18;
        osc.frequency.setValueAtTime(start, now);
        osc.frequency.exponentialRampToValueAtTime(end, now + 0.11);
        gain.gain.setValueAtTime(amp, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.13);
    };

    G.playProjectileImpact = function (projectile, weaponId) {
        if (!audioCtx) return;
        if (projectile && projectile.isFrost) { G.playFrostHit(); return; }
        if (projectile && projectile.isSniper) { G.playImpactHeavy(); return; }

        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        var start = weaponId === 'gun' ? 520 : 420;
        osc.frequency.setValueAtTime(start, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
    };

    G.playBlackHoleConsume = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.32);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.35);
    };

    G.playSuperTrigger = function (weaponId) {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var startFreq = 420;
        if (weaponId === 'black') startFreq = 260;
        else if (weaponId === 'hammer') startFreq = 300;
        else if (weaponId === 'frostdaggers') startFreq = 520;
        else if (weaponId === 'shield') startFreq = 460;
        else if (weaponId === 'derun') startFreq = 500;

        // Main magical swell
        var swell = audioCtx.createOscillator();
        var swellGain = audioCtx.createGain();
        swell.type = 'triangle';
        swell.frequency.setValueAtTime(startFreq, now);
        swell.frequency.exponentialRampToValueAtTime(startFreq * 2.9, now + 0.42);
        swellGain.gain.setValueAtTime(0.16, now);
        swellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.56);
        swell.connect(swellGain);
        swellGain.connect(getOutputNode());
        swell.start(now);
        swell.stop(now + 0.56);

        // Harmonic layer for magical feel
        var harm = audioCtx.createOscillator();
        var harmGain = audioCtx.createGain();
        harm.type = 'sine';
        harm.frequency.setValueAtTime(startFreq * 1.24, now + 0.05);
        harm.frequency.exponentialRampToValueAtTime(startFreq * 3.5, now + 0.48);
        harmGain.gain.setValueAtTime(0, now);
        harmGain.gain.linearRampToValueAtTime(0.085, now + 0.12);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
        harm.connect(harmGain);
        harmGain.connect(getOutputNode());
        harm.start(now + 0.02);
        harm.stop(now + 0.62);

        // Sub hit so trigger still feels powerful
        var sub = audioCtx.createOscillator();
        var subGain = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(startFreq * 0.52, now);
        sub.frequency.exponentialRampToValueAtTime(startFreq * 0.32, now + 0.3);
        subGain.gain.setValueAtTime(0.07, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        sub.connect(subGain);
        subGain.connect(getOutputNode());
        sub.start(now);
        sub.stop(now + 0.36);

        // Sparkle arpeggio over the swell
        [1.55, 1.95, 2.45, 3.05].forEach(function (mul, i) {
            var ping = audioCtx.createOscillator();
            var pingGain = audioCtx.createGain();
            var t = now + 0.1 + i * 0.09;
            ping.type = 'triangle';
            ping.frequency.setValueAtTime(startFreq * mul, t);
            ping.frequency.exponentialRampToValueAtTime(startFreq * (mul * 1.18), t + 0.09);
            pingGain.gain.setValueAtTime(0.055, t);
            pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            ping.connect(pingGain);
            pingGain.connect(getOutputNode());
            ping.start(t);
            ping.stop(t + 0.13);
        });

        // Airy tail noise to extend the texture
        var dur = 0.55;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var p = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - p) * 0.18;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        var noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.035, now + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);
        src.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(getOutputNode());
        src.start(now + 0.05);
    };

    G.playWolfBite = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.07);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
    };

    // ─── Movement & Environment Sounds ────────────────────────

    G.playFootstep = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Soft thud for each step
        var dur = 0.05;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.2;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500 + Math.random() * 200;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
    };

    G.playLand = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Impact thud on landing
        var dur = 0.08;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t * t) * 0.35;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Low bass thump
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        oscGain.gain.setValueAtTime(0.08, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(oscGain);
        oscGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.1);
    };

    G.playJump = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Rising tone for jump
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 + Math.random() * 30, now);
        osc.frequency.exponentialRampToValueAtTime(400 + Math.random() * 40, now + 0.1);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.12);
        // Small whoosh
        var dur = 0.06;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * t * (1 - t) * 0.18;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.06, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        src.connect(nGain);
        nGain.connect(getOutputNode());
        src.start(now);
    };

    G.playTeleport = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Warpy shimmer
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.25);
        // Sparkle noise
        var dur = 0.15;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.15;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        var nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.1, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(getOutputNode());
        src.start(now);
    };

    G.playLadderClimb = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Creaky wood step
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280 + Math.random() * 60, now);
        osc.frequency.exponentialRampToValueAtTime(180 + Math.random() * 40, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.05);
    };

    G.playBookShoot = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Pages fluttering whoosh
        var dur = 0.1;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.25;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 1.5;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Papery snap
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        oscGain.gain.setValueAtTime(0.04, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(oscGain);
        oscGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.06);
    };

    G.playBookHit = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Thwack impact
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.08);
        // Paper flutter tail
        var dur = 0.06;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.15;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.08, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        src.connect(nGain);
        nGain.connect(getOutputNode());
        src.start(now);
    };

    G.playLavaBurn = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Sizzle noise
        var dur = 0.12;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t * 0.6) * 0.3;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1600;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
        // Deep burn tone
        var osc = audioCtx.createOscillator();
        var oscGain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        oscGain.gain.setValueAtTime(0.08, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(oscGain);
        oscGain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.12);
    };

    G.playHealSpring = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Gentle ascending sparkle chord
        [660, 880, 1100].forEach(function (freq, i) {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            var t = now + i * 0.06;
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.2, t + 0.1);
            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            osc.connect(gain);
            gain.connect(getOutputNode());
            osc.start(t);
            osc.stop(t + 0.18);
        });
    };

    G.playJumpBoost = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Springy boing
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.22);
    };

    G.playWallBounce = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Short impact thud
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(getOutputNode());
        osc.start(now);
        osc.stop(now + 0.06);
    };

    G.playCrouch = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;
        // Quick low swoosh
        var dur = 0.04;
        var bufferSize = Math.floor(audioCtx.sampleRate * dur);
        var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            var t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.12;
        }
        var src = audioCtx.createBufferSource();
        src.buffer = buffer;
        var filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        var gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(getOutputNode());
        src.start(now);
    };

    G.playDeath = function () {
        if (!audioCtx) return;
        var now = audioCtx.currentTime;

        var fall = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        fall.type = 'sawtooth';
        fall.frequency.setValueAtTime(280, now);
        fall.frequency.exponentialRampToValueAtTime(42, now + 0.32);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        fall.connect(gain);
        gain.connect(getOutputNode());
        fall.start(now);
        fall.stop(now + 0.35);

        var buzz = audioCtx.createOscillator();
        var buzzGain = audioCtx.createGain();
        buzz.type = 'square';
        buzz.frequency.setValueAtTime(95, now + 0.03);
        buzz.frequency.exponentialRampToValueAtTime(35, now + 0.25);
        buzzGain.gain.setValueAtTime(0.08, now + 0.03);
        buzzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        buzz.connect(buzzGain);
        buzzGain.connect(getOutputNode());
        buzz.start(now + 0.03);
        buzz.stop(now + 0.28);
    };
})(window.Game);
