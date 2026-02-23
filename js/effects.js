// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Visual Effects (Shake, Flash, Particles)
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    // Mutable effects state
    G.fx = {
        shakeTimer: 0,
        shakeMagnitude: 0,
        parryFlashTimer: 0,
    };

    G.fxTriggerShake = function (mag, dur) {
        G.fx.shakeTimer = dur;
        G.fx.shakeMagnitude = mag;
    };

    G.fxTriggerParryFlash = function () {
        G.fx.parryFlashTimer = 60;
    };

    // Particle system
    G.particles = [];

    G.spawnParticles = function (x, y, color, count, speed) {
        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var spd = Math.random() * speed + 1;
            G.particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd - 2,
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 3,
                color: color,
            });
        }
    };

    G.spawnBloodBurst = function (x, y, intensity) {
        var n = intensity || 14;
        G.spawnParticles(x, y, '#aa0000', Math.floor(n * 0.5), 5);
        G.spawnParticles(x + 4, y - 6, '#cc1111', Math.floor(n * 0.6), 6);
        G.spawnParticles(x - 3, y - 2, '#ee2222', Math.floor(n * 0.5), 4);
        G.spawnParticles(x, y, 'rgba(120,0,0,0.9)', Math.floor(n * 0.3), 3);
    };

    G.updateParticles = function (dt) {
        for (var i = G.particles.length - 1; i >= 0; i--) {
            var p = G.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;
            if (p.life <= 0) G.particles.splice(i, 1);
        }
    };

    G.drawParticles = function () {
        var ctx = G.ctx;
        G.particles.forEach(function (p) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    };
})(window.Game);
