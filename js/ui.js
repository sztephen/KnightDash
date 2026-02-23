// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — UI Drawing
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var W = G.W, H = G.H;

    G.drawUI = function (p1, p2, p3, p4) {
        var ctx = G.ctx;
        var superY = 44; // right below the heart row
        var is2v2 = G.is2v2 && p3 && p4;

        if (is2v2) {
            // ── 2v2: Left side stacked (P1 blue top, P2 red below) ──
            drawHP(ctx, 30, 12, p1.hp, getMaxHp(p1), '#3b6dcc', '#5b9aff');
            G.drawSuperUI(30, 36, p1);
            G.drawSniperPassiveTimer(p1, 30 + 66, 36);

            drawHP(ctx, 30, 52, p2.hp, getMaxHp(p2), '#cc3b3b', '#ff5b5b');
            G.drawSuperUI(30, 76, p2);
            G.drawSniperPassiveTimer(p2, 30 + 66, 76);

            // ── Right side stacked (AI3 green top, AI4 purple below) ──
            var p3x = W - 30 - getMaxHp(p3) * 30;
            drawHP(ctx, p3x, 12, p3.hp, getMaxHp(p3), '#338833', '#44aa44');
            G.drawSuperUI(p3x, 36, p3);
            G.drawSniperPassiveTimer(p3, p3x + 66, 36);

            var p4x = W - 30 - getMaxHp(p4) * 30;
            drawHP(ctx, p4x, 52, p4.hp, getMaxHp(p4), '#883388', '#aa44aa');
            G.drawSuperUI(p4x, 76, p4);
            G.drawSniperPassiveTimer(p4, p4x + 66, 76);
        } else {
            // ── 1v1: original layout ──
            drawHP(ctx, 30, 20, p1.hp, getMaxHp(p1), '#3b6dcc', '#5b9aff');
            G.drawSuperUI(30, superY, p1);
            G.drawSniperPassiveTimer(p1, 30 + 66, superY);

            var p2x = W - 30 - getMaxHp(p2) * 30;
            drawHP(ctx, p2x, 20, p2.hp, getMaxHp(p2), '#cc3b3b', '#ff5b5b');
            G.drawSuperUI(p2x, superY, p2);
            G.drawSniperPassiveTimer(p2, p2x + 66, superY);
        }

        var modeState = G.getModeState ? G.getModeState() : null;
        if (modeState && modeState.id === 'blitz') {
            drawBlitzUI(ctx, modeState, is2v2);
        }
    };

    function drawBlitzUI(ctx, modeState, is2v2) {
        var order = modeState.blitzOrder || [];
        if (order.length === 0) return;

        var titleY = is2v2 ? 100 : 18;
        var y = is2v2 ? 118 : 84;

        if (is2v2) {
            // Team tracks: team1 progress and team2 progress
            drawBlitzTrack(ctx, 150, y, modeState.team1Progress, order, '#5b9aff');
            drawBlitzTrack(ctx, W - 150, y, modeState.team2Progress, order, '#44aa44');
        } else {
            drawBlitzTrack(ctx, 150, y, modeState.p1Progress, order, '#5b9aff');
            drawBlitzTrack(ctx, W - 150, y, modeState.p2Progress, order, '#ff5b5b');
        }

        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillText('BLITZ', W / 2, titleY);
        ctx.textAlign = 'start';
    }

    function drawBlitzTrack(ctx, centerX, y, progress, order, accent) {
        var total = order.length;
        var displayNum = Math.min(total, progress + 1);
        var currentIdx = Math.min(progress, total - 1);

        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = accent;
        ctx.fillText(displayNum + '/' + total, centerX, y - 24);

        var slotW = 34;
        var slotH = 28;
        var gap = 8;
        var offsets = [-1, 0, 1, 2]; // previous, current, next, next
        for (var i = 0; i < 4; i++) {
            var slotX = centerX + offsets[i] * (slotW + gap);
            var weaponIndex = currentIdx + offsets[i];
            var isCurrent = i === 1;
            var hasWeapon = weaponIndex >= 0 && weaponIndex < total;

            ctx.fillStyle = isCurrent ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.35)';
            ctx.fillRect(slotX - slotW / 2, y - slotH / 2, slotW, slotH);
            ctx.strokeStyle = isCurrent ? accent : 'rgba(255,255,255,0.2)';
            ctx.lineWidth = isCurrent ? 2 : 1;
            ctx.strokeRect(slotX - slotW / 2, y - slotH / 2, slotW, slotH);

            if (hasWeapon && typeof G.drawWeaponIcon === 'function') {
                var scale = isCurrent ? 0.8 : 0.62;
                G.drawWeaponIcon(slotX, y + 2, order[weaponIndex].id, scale);
            } else {
                ctx.strokeStyle = 'rgba(255,255,255,0.18)';
                ctx.beginPath();
                ctx.moveTo(slotX - 8, y);
                ctx.lineTo(slotX + 8, y);
                ctx.stroke();
            }
        }
        ctx.textAlign = 'start';
    }

    function getMaxHp(player) {
        if (typeof G.getPlayerMaxHP === 'function') return G.getPlayerMaxHP(player);
        return G.HP_PER_ROUND;
    }

    function drawHP(ctx, x, y, hp, maxHp, color, light) {
        var total = typeof maxHp === 'number' ? maxHp : G.HP_PER_ROUND;
        for (var i = 0; i < total; i++) {
            var heartX = x + i * 30 + 10;
            var heartY = y + 8;
            if (hp >= i + 1) {
                // Full heart
                ctx.fillStyle = color;
                drawHeart(ctx, heartX, heartY, 10);
                ctx.fillStyle = light;
                drawHeart(ctx, heartX + 1, heartY - 1, 4);
            } else if (hp > i && hp < i + 1) {
                // Half heart - draw empty bg then clip left half filled
                ctx.fillStyle = '#333';
                drawHeart(ctx, heartX, heartY, 10);
                // Left half filled
                ctx.save();
                ctx.beginPath();
                ctx.rect(heartX - 12, heartY - 4, 12, 30);
                ctx.clip();
                ctx.fillStyle = color;
                drawHeart(ctx, heartX, heartY, 10);
                ctx.restore();
            } else {
                // Empty heart
                ctx.fillStyle = '#333';
                drawHeart(ctx, heartX, heartY, 10);
            }
        }
    }

    function drawHeart(ctx, cx, cy, size) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.4);
        ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.4);
        ctx.bezierCurveTo(cx - size, cy + size * 0.8, cx, cy + size * 1.2, cx, cy + size * 1.4);
        ctx.bezierCurveTo(cx, cy + size * 1.2, cx + size, cy + size * 0.8, cx + size, cy + size * 0.4);
        ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.4);
        ctx.fill();
    }

    function drawRoundWins(ctx, x, y, wins, color) {
        for (var i = 0; i < G.ROUNDS_TO_WIN; i++) {
            if (i < wins) {
                ctx.fillStyle = color;
                ctx.fillRect(x + i * 20 + 2, y, 3, 14);
                ctx.fillRect(x + i * 20 - 2, y + 10, 11, 3);
            } else {
                ctx.fillStyle = '#333';
                ctx.fillRect(x + i * 20 + 2, y, 3, 14);
                ctx.fillRect(x + i * 20 - 2, y + 10, 11, 3);
            }
        }
    }

    function drawLabel(ctx, x, y, text, color) {
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
    }

    G.drawCenterText = function (text, y, size, color, alpha) {
        var ctx = G.ctx;
        ctx.save();
        ctx.globalAlpha = alpha || 1;
        ctx.font = size + 'px "Press Start 2P", monospace';
        ctx.fillStyle = color || '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillText(text, W / 2 + 3, y + 3);
        ctx.fillStyle = color || '#fff';
        ctx.fillText(text, W / 2, y);
        ctx.restore();
    };
})(window.Game);
