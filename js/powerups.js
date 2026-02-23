// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Heart Powerups
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var hearts = [];
    var spawnTimer = 0;
    var SPAWN_INTERVAL = 8000;
    var HEART_SIZE = 10;

    G.hearts = hearts;

    G.resetHearts = function () {
        hearts.length = 0;
        spawnTimer = SPAWN_INTERVAL * 0.6;
    };

    G.updateHearts = function (dt, p1, p2, p3, p4) {
        spawnTimer -= dt;

        if (spawnTimer <= 0) {
            spawnTimer = SPAWN_INTERVAL + Math.random() * 4500;
            spawnHeart();
        }

        for (var i = hearts.length - 1; i >= 0; i--) {
            var h = hearts[i];
            h.bobTimer += dt;
            h.drawY = h.y + Math.sin(h.bobTimer * 0.004) * 4;
            if (h.alpha < 1) h.alpha = Math.min(1, h.alpha + dt * 0.003);
            h.lifetime -= dt;
            if (h.lifetime <= 0) { hearts.splice(i, 1); continue; }
            if (h.lifetime < 2000) h.blinking = true;

            var picked = tryPickup(h, p1) || tryPickup(h, p2);
            if (!picked && p3) picked = tryPickup(h, p3);
            if (!picked && p4) picked = tryPickup(h, p4);
            if (picked) {
                hearts.splice(i, 1);
            }
        }
    };

    function tryPickup(heart, player) {
        if (!player || player.hp <= 0 || player.deathGhost) return false;
        var maxHp = typeof G.getPlayerMaxHP === 'function' ? G.getPlayerMaxHP(player) : G.HP_PER_ROUND;
        if (player.hp >= maxHp) return false;
        var dx = Math.abs(player.x - heart.x);
        var dy = Math.abs((player.y - player.currentH / 2) - heart.y);
        if (dx < 28 && dy < 32) {
            player.hp = Math.min(maxHp, player.hp + 1);
            G.playPickup();
            G.spawnParticles(heart.x, heart.y, '#ff4488', 10, 4);
            G.spawnParticles(heart.x, heart.y, '#ff88aa', 6, 3);
            return true;
        }
        return false;
    }

    function spawnHeart() {
        var map = G.getCurrentMap();
        var platforms = map.platforms;
        var x, y;
        var r = Math.random();

        if (r < 0.4 && platforms.length > 0) {
            var plat = platforms[Math.floor(Math.random() * platforms.length)];
            x = plat.x + 20 + Math.random() * (plat.w - 40);
            y = plat.y - 20;
        } else if (r < 0.7) {
            x = G.WALL_LEFT + 60 + Math.random() * (G.WALL_RIGHT - G.WALL_LEFT - 120);
            y = G.GROUND_Y - 100 - Math.random() * 200;
        } else {
            x = G.WALL_LEFT + 60 + Math.random() * (G.WALL_RIGHT - G.WALL_LEFT - 120);
            y = G.GROUND_Y - 20;
        }

        hearts.push({
            x: x, y: y, drawY: y,
            bobTimer: Math.random() * 1000,
            alpha: 0,
            lifetime: 12000,
            blinking: false,
        });
    }

    G.drawHearts = function () {
        var ctx = G.ctx;
        hearts.forEach(function (h) {
            if (h.blinking && Math.floor(h.lifetime / 150) % 2 === 0) return;
            ctx.save();
            ctx.globalAlpha = h.alpha;
            ctx.translate(h.x, h.drawY);

            // Glow
            ctx.fillStyle = 'rgba(255,50,100,0.15)';
            ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();

            // Heart
            ctx.fillStyle = '#ff3366';
            drawHeartShape(ctx, 0, -2, HEART_SIZE);
            ctx.fillStyle = '#ff88aa';
            drawHeartShape(ctx, -1, -3, HEART_SIZE * 0.4);

            // Plus
            ctx.fillStyle = '#fff';
            ctx.fillRect(-1.5, -HEART_SIZE - 6, 3, 7);
            ctx.fillRect(-3.5, -HEART_SIZE - 3, 7, 3);

            ctx.restore();
        });
    };

    function drawHeartShape(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.4);
        ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.4);
        ctx.bezierCurveTo(cx - size, cy + size * 0.8, cx, cy + size * 1.2, cx, cy + size * 1.4);
        ctx.bezierCurveTo(cx, cy + size * 1.2, cx + size, cy + size * 0.8, cx + size, cy + size * 0.4);
        ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.4);
        ctx.fill();
    }
})(window.Game);
