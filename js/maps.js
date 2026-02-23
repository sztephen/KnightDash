// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Maps (10 Maps)
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var W = G.W, H = G.H, GROUND_Y = G.GROUND_Y;

    // Teleport pairs are linked after MAPS is built (see below)
    var MAPS = [
        // ── MAP 0: Blank ──────────────────────────────────────────────
        {
            name: 'Blank',
            platforms: [],
            obstacles: [],
            drawBackground: function (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, W, H);
            },
            groundColor: '#999999', groundEdge: '#aaaaaa', wallColor: '#bbbbbb',
        },

        // ── MAP 1: Castle Courtyard (Original) ──────────────────────
        {
            name: 'Castle',
            platforms: [],
            obstacles: [
                { type: 'jumpboost', x: 140, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'jumpboost', x: W - 190, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'cage', x: W / 2 - 25, y: GROUND_Y - 50, w: 50, h: 50, knockbackX: 72, knockbackY: -7, knockbackDur: 420 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#0d1b2a');
                skyGrad.addColorStop(0.5, '#1b2838');
                skyGrad.addColorStop(1, '#2a1a1a');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                for (var i = 0; i < 30; i++) {
                    var sx = (i * 137 + 50) % W;
                    var sy = (i * 97 + 20) % (H * 0.5);
                    var ss = (i % 3 === 0) ? 2 : 1;
                    ctx.fillRect(sx, sy, ss, ss);
                }

                ctx.fillStyle = '#15202e';
                ctx.fillRect(60, GROUND_Y - 180, 50, 180);
                ctx.fillRect(40, GROUND_Y - 200, 90, 30);
                for (var i = 0; i < 5; i++) ctx.fillRect(40 + i * 20, GROUND_Y - 215, 10, 15);
                ctx.fillRect(W - 110, GROUND_Y - 160, 50, 160);
                ctx.fillRect(W - 130, GROUND_Y - 180, 90, 30);
                for (var i = 0; i < 5; i++) ctx.fillRect(W - 130 + i * 20, GROUND_Y - 195, 10, 15);

                ctx.fillStyle = 'rgba(200,210,230,0.15)';
                ctx.beginPath(); ctx.arc(W * 0.75, 80, 35, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(220,230,250,0.1)';
                ctx.beginPath(); ctx.arc(W * 0.75, 80, 45, 0, Math.PI * 2); ctx.fill();
            },
            groundColor: '#2a2a3a', groundEdge: '#444460', wallColor: '#1a1a28',
        },

        // ── MAP 2: Forest Canopy ────────────────────────────────────
        {
            name: 'Forest',
            platforms: [
                { x: 130, y: GROUND_Y - 80, w: 130, h: 14 },
                { x: W / 2 - 70, y: GROUND_Y - 110, w: 140, h: 14 },
                { x: W - 260, y: GROUND_Y - 80, w: 130, h: 14 },
            ],
            obstacles: [
                { type: 'jumpboost', x: 100, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'jumpboost', x: 320, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'jumpboost', x: W - 370, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'jumpboost', x: W - 150, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'teleport', x: 60, y: GROUND_Y - 40, w: 30, h: 40 },
                { type: 'teleport', x: W - 90, y: GROUND_Y - 40, w: 30, h: 40 },
                { type: 'ladder', x: W / 2 - 10, y: GROUND_Y - 130, w: 20, h: 130 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#0a1a0a');
                skyGrad.addColorStop(0.6, '#0f2a0f');
                skyGrad.addColorStop(1, '#1a2a10');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = 'rgba(180,255,100,0.4)';
                for (var i = 0; i < 15; i++) {
                    var fx = (i * 173 + 80) % (W - 100) + 50;
                    var fy = (i * 131 + 40) % (H * 0.6) + 20;
                    var fs = Math.sin(Date.now() * 0.002 + i * 1.3) * 0.3 + 0.5;
                    ctx.globalAlpha = fs * 0.6;
                    ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 1;

                for (var i = 0; i < 8; i++) {
                    var tx = i * 130 + 40;
                    var th = 120 + (i % 3) * 40;
                    ctx.fillStyle = '#0a1a08';
                    ctx.fillRect(tx + 15, GROUND_Y - th + 40, 12, th - 40);
                    ctx.fillStyle = '#0f220d';
                    ctx.beginPath();
                    ctx.moveTo(tx - 10, GROUND_Y - th + 50);
                    ctx.lineTo(tx + 21, GROUND_Y - th - 10);
                    ctx.lineTo(tx + 52, GROUND_Y - th + 50);
                    ctx.fill();
                    ctx.fillStyle = '#122a10';
                    ctx.beginPath();
                    ctx.moveTo(tx - 5, GROUND_Y - th + 75);
                    ctx.lineTo(tx + 21, GROUND_Y - th + 20);
                    ctx.lineTo(tx + 47, GROUND_Y - th + 75);
                    ctx.fill();
                }

                ctx.strokeStyle = '#1a4a15';
                ctx.lineWidth = 2;
                for (var i = 0; i < 5; i++) {
                    var vx = 100 + i * 200;
                    ctx.beginPath();
                    ctx.moveTo(vx, 0);
                    ctx.quadraticCurveTo(vx + 10, 80, vx - 5, 120 + i * 20);
                    ctx.stroke();
                }
            },
            groundColor: '#1a2a15', groundEdge: '#2a4a20', wallColor: '#0f1a0c',
        },

        // ── MAP 3: Volcanic Pit ─────────────────────────────────────
        {
            id: 'volcano',
            name: 'Volcano',
            platforms: [
                { x: 100, y: GROUND_Y - 70, w: 120, h: 14 },
                { x: W / 2 - 60, y: GROUND_Y - 95, w: 120, h: 14 },
                { x: W - 220, y: GROUND_Y - 70, w: 120, h: 14 },
            ],
            obstacles: [
                { type: 'lava', x: 230, y: GROUND_Y - 8, w: 80, h: 8 },
                { type: 'lava', x: W / 2 - 40, y: GROUND_Y - 8, w: 80, h: 8 },
                { type: 'lava', x: W / 2 + 50, y: GROUND_Y - 8, w: 80, h: 8 },
                { type: 'lava', x: W - 310, y: GROUND_Y - 8, w: 80, h: 8 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#1a0505');
                skyGrad.addColorStop(0.4, '#2a0a0a');
                skyGrad.addColorStop(0.8, '#3a1510');
                skyGrad.addColorStop(1, '#4a2010');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = 'rgba(255,100,20,0.5)';
                for (var i = 0; i < 20; i++) {
                    var ex = (i * 151 + 30) % (W - 60) + 30;
                    var ey = ((Date.now() * 0.03 + i * 87) % H);
                    var es = (i % 3) + 1;
                    ctx.globalAlpha = (1 - ey / H) * 0.6;
                    ctx.fillRect(ex, H - ey, es, es);
                }
                ctx.globalAlpha = 1;

                ctx.fillStyle = '#201010';
                ctx.beginPath();
                ctx.moveTo(100, GROUND_Y); ctx.lineTo(140, GROUND_Y - 90);
                ctx.lineTo(170, GROUND_Y - 70); ctx.lineTo(200, GROUND_Y); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(W - 200, GROUND_Y); ctx.lineTo(W - 160, GROUND_Y - 100);
                ctx.lineTo(W - 120, GROUND_Y - 60); ctx.lineTo(W - 80, GROUND_Y); ctx.fill();

                ctx.fillStyle = 'rgba(255, 60, 10, 0.08)';
                ctx.fillRect(0, GROUND_Y - 10, W, 20);
            },
            groundColor: '#2a1515', groundEdge: '#5a2020', wallColor: '#1a0a0a',
        },

        // ── MAP 4: Sky Temple ───────────────────────────────────────
        {
            name: 'Sky',
            platforms: [
                { x: 80, y: GROUND_Y - 60, w: 100, h: 14 },
                { x: 230, y: GROUND_Y - 120, w: 110, h: 14 },
                { x: W / 2 - 55, y: GROUND_Y - 180, w: 110, h: 14 },
                { x: W - 340, y: GROUND_Y - 120, w: 110, h: 14 },
                { x: W - 180, y: GROUND_Y - 60, w: 100, h: 14 },
                { x: W / 2 - 60, y: GROUND_Y - 80, w: 120, h: 14 },
            ],
            obstacles: [
                { type: 'teleport', x: 100, y: GROUND_Y - 70, w: 30, h: 30 },
                { type: 'teleport', x: W - 130, y: GROUND_Y - 70, w: 30, h: 30 },
                { type: 'jumpboost', x: W / 2 - 25, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'cloud', x: 200, y: 100, w: 80, h: 30, moveRange: 480 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#72c9ff');
                skyGrad.addColorStop(0.45, '#8fd8ff');
                skyGrad.addColorStop(1, '#d9f3ff');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                // Sun + warm glow
                var sunX = W * 0.76;
                var sunY = 78;
                var sunGlow = ctx.createRadialGradient(sunX, sunY, 14, sunX, sunY, 120);
                sunGlow.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
                sunGlow.addColorStop(0.35, 'rgba(255, 220, 120, 0.5)');
                sunGlow.addColorStop(1, 'rgba(255, 220, 120, 0)');
                ctx.fillStyle = sunGlow;
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#fff5b8';
                ctx.beginPath();
                ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
                ctx.fill();

                // Rainbow in the distance
                var rainbowCx = W * 0.5;
                var rainbowCy = GROUND_Y + 110;
                var rainbowR = 320;
                var bands = [
                    'rgba(255, 88, 88, 0.58)',
                    'rgba(255, 168, 62, 0.52)',
                    'rgba(255, 224, 90, 0.48)',
                    'rgba(110, 220, 120, 0.44)',
                    'rgba(90, 185, 255, 0.42)',
                    'rgba(120, 120, 255, 0.38)',
                    'rgba(188, 128, 255, 0.34)',
                ];
                for (var rb = 0; rb < bands.length; rb++) {
                    ctx.strokeStyle = bands[rb];
                    ctx.lineWidth = 9;
                    ctx.beginPath();
                    ctx.arc(
                        rainbowCx,
                        rainbowCy,
                        rainbowR - rb * 10,
                        Math.PI * 1.12,
                        Math.PI * 1.88
                    );
                    ctx.stroke();
                }

                // Puffy daylight clouds
                ctx.fillStyle = 'rgba(255,255,255,0.62)';
                for (var i = 0; i < 7; i++) {
                    var cx = ((Date.now() * 0.006 + i * 230) % (W + 240)) - 120;
                    var cy = 55 + i * 44;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 34, 0, Math.PI * 2);
                    ctx.arc(cx + 24, cy - 9, 25, 0, Math.PI * 2);
                    ctx.arc(cx + 48, cy, 29, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Temple columns
                ctx.fillStyle = '#506b80';
                ctx.fillRect(130, GROUND_Y - 280, 16, 280);
                ctx.fillRect(W - 146, GROUND_Y - 280, 16, 280);
                ctx.fillStyle = '#65849a';
                ctx.fillRect(122, GROUND_Y - 288, 32, 12);
                ctx.fillRect(W - 154, GROUND_Y - 288, 32, 12);

                // Light haze near horizon
                var haze = ctx.createLinearGradient(0, GROUND_Y - 140, 0, GROUND_Y + 20);
                haze.addColorStop(0, 'rgba(255,255,255,0)');
                haze.addColorStop(1, 'rgba(255,255,255,0.18)');
                ctx.fillStyle = haze;
                ctx.fillRect(0, GROUND_Y - 140, W, 160);
            },
            groundColor: '#3f6670', groundEdge: '#9ed7e0', wallColor: '#2c4f5b',
        },

        // ── MAP 5: Dungeon Depths ───────────────────────────────────
        {
            name: 'Dungeon',
            platforms: [
                { x: 80, y: GROUND_Y - 75, w: 150, h: 14 },
                { x: W - 230, y: GROUND_Y - 75, w: 150, h: 14 },
                { x: W / 2 - 80, y: GROUND_Y - 55, w: 160, h: 14 },
                { x: W / 2 - 50, y: GROUND_Y - 130, w: 100, h: 14 },
            ],
            obstacles: [
                { type: 'lava', x: 250, y: GROUND_Y - 8, w: 80, h: 8 },
                { type: 'lava', x: W - 330, y: GROUND_Y - 8, w: 80, h: 8 },
                { type: 'gear', x: W / 2 - 15, y: GROUND_Y - 105, w: 30, h: 30 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#080810');
                skyGrad.addColorStop(1, '#101020');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                ctx.strokeStyle = '#181828';
                ctx.lineWidth = 0.5;
                for (var row = 0; row < 25; row++) {
                    var offset = row % 2 === 0 ? 0 : 24;
                    for (var col = -1; col < W / 48 + 1; col++) {
                        ctx.strokeRect(col * 48 + offset, row * 20, 48, 20);
                    }
                }

                ctx.strokeStyle = 'rgba(180,180,200,0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(G.WALL_LEFT, 0);
                ctx.quadraticCurveTo(G.WALL_LEFT + 60, 20, G.WALL_LEFT + 100, 100);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(G.WALL_RIGHT, 0);
                ctx.quadraticCurveTo(G.WALL_RIGHT - 60, 20, G.WALL_RIGHT - 100, 100);
                ctx.stroke();

                ctx.fillStyle = 'rgba(100,150,255,0.15)';
                var dripY = (Date.now() * 0.05) % GROUND_Y;
                ctx.fillRect(W / 2 + 50, dripY, 2, 6);
                ctx.fillRect(200, (dripY + 100) % GROUND_Y, 2, 6);
            },
            groundColor: '#1a1a2a', groundEdge: '#333350', wallColor: '#0a0a18',
        },

        // ── MAP 6: Frozen Lake ──────────────────────────────────────
        {
            name: 'Lake',
            platforms: [
                { x: 150, y: GROUND_Y - 75, w: 140, h: 14 },
                { x: W / 2 - 70, y: GROUND_Y - 85, w: 140, h: 14 },
                { x: W - 290, y: GROUND_Y - 75, w: 140, h: 14 },
                { x: 340, y: GROUND_Y - 65, w: 90, h: 14 },
                { x: W - 430, y: GROUND_Y - 65, w: 90, h: 14 },
            ],
            obstacles: [
                { type: 'jumpboost', x: W / 2 - 25, y: GROUND_Y - 10, w: 50, h: 10 },
                { type: 'teleport', x: 180, y: GROUND_Y - 40, w: 30, h: 40 },
                { type: 'teleport', x: W - 210, y: GROUND_Y - 40, w: 30, h: 40 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#0a1525');
                skyGrad.addColorStop(0.5, '#152535');
                skyGrad.addColorStop(1, '#1a3040');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                ctx.fillStyle = 'rgba(220,230,255,0.4)';
                for (var i = 0; i < 25; i++) {
                    var sx = (i * 139 + (Date.now() * 0.02 * (i % 3 + 1))) % W;
                    var sy = (i * 113 + (Date.now() * 0.03 * (i % 2 + 1))) % H;
                    ctx.fillRect(sx, sy, 2, 2);
                }

                ctx.fillStyle = '#152535';
                for (var i = 0; i < 12; i++) {
                    var ix = 50 + i * 80;
                    var ih = 20 + (i * 7) % 30;
                    ctx.beginPath();
                    ctx.moveTo(ix - 4, 0); ctx.lineTo(ix, ih); ctx.lineTo(ix + 4, 0);
                    ctx.fill();
                }

                ctx.fillStyle = '#1a2a38';
                ctx.fillRect(90, GROUND_Y - 120, 8, 120);
                ctx.fillStyle = '#1a3545';
                ctx.beginPath();
                ctx.moveTo(60, GROUND_Y - 80);
                ctx.lineTo(94, GROUND_Y - 160);
                ctx.lineTo(128, GROUND_Y - 80);
                ctx.fill();

                ctx.fillStyle = '#1a2a38';
                ctx.fillRect(W - 98, GROUND_Y - 100, 8, 100);
                ctx.fillStyle = '#1a3545';
                ctx.beginPath();
                ctx.moveTo(W - 128, GROUND_Y - 60);
                ctx.lineTo(W - 94, GROUND_Y - 140);
                ctx.lineTo(W - 60, GROUND_Y - 60);
                ctx.fill();

                ctx.globalAlpha = 0.04;
                var aurGrad = ctx.createLinearGradient(0, 30, W, 30);
                aurGrad.addColorStop(0, '#00ff88');
                aurGrad.addColorStop(0.5, '#0088ff');
                aurGrad.addColorStop(1, '#8800ff');
                ctx.fillStyle = aurGrad;
                ctx.fillRect(0, 20, W, 60);
                ctx.globalAlpha = 1;
            },
            groundColor: '#1a2a38', groundEdge: '#3a5a70', wallColor: '#0a1520',
        },

        // ── MAP 7: Clock ─────────────────────────────────────────────
        {
            id: 'clock',
            name: 'Clock',
            spawnPoints: [
                { x: 170, y: GROUND_Y - 130 },
                { x: W - 170, y: GROUND_Y - 130 },
            ],
            bellInterval: 10000,
            bellStunDuration: 1000,
            platforms: [
                { x: 110, y: GROUND_Y - 130, w: 120, h: 14, moveAxis: 'x', moveRange: 72, moveSpeed: 1.35, movePhase: 0 },
                { x: W / 2 - 80, y: GROUND_Y - 190, w: 160, h: 14, moveAxis: 'y', moveRange: 56, moveSpeed: 0.95, movePhase: 1.1 },
                { x: W - 230, y: GROUND_Y - 130, w: 120, h: 14, moveAxis: 'x', moveRange: 72, moveSpeed: 1.35, movePhase: Math.PI },
                { x: W / 2 - 168, y: GROUND_Y - 88, w: 118, h: 14 },
                { x: W / 2 + 50, y: GROUND_Y - 88, w: 118, h: 14 },
            ],
            obstacles: [
                { type: 'gear', x: W / 2 - 20, y: GROUND_Y - 126, w: 40, h: 40 },
                { type: 'gear', x: 248, y: GROUND_Y - 58, w: 34, h: 34 },
                { type: 'gear', x: W - 282, y: GROUND_Y - 58, w: 34, h: 34 },
                { type: 'lava', x: G.WALL_LEFT + 4, y: GROUND_Y - 10, w: G.WALL_RIGHT - G.WALL_LEFT - 8, h: 10 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#0f101a');
                skyGrad.addColorStop(0.45, '#1a1624');
                skyGrad.addColorStop(1, '#2d120e');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                // Glowing moon haze
                var glow = ctx.createRadialGradient(W * 0.5, 110, 20, W * 0.5, 110, 220);
                glow.addColorStop(0, 'rgba(255, 220, 140, 0.22)');
                glow.addColorStop(0.5, 'rgba(220, 160, 90, 0.08)');
                glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, W, H);

                // Tower silhouette
                ctx.fillStyle = '#141218';
                ctx.fillRect(W / 2 - 92, GROUND_Y - 330, 184, 330);
                ctx.fillRect(W / 2 - 54, GROUND_Y - 380, 108, 70);
                ctx.fillRect(W / 2 - 6, GROUND_Y - 418, 12, 38);

                // Clock face
                var cx = W / 2;
                var cy = GROUND_Y - 262;
                var r = 64;
                var t = Date.now() * 0.0018;
                ctx.fillStyle = '#24180f';
                ctx.beginPath();
                ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f3d7a1';
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#5f3b1d';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
                ctx.stroke();

                // Clock marks
                ctx.strokeStyle = '#6b4421';
                ctx.lineWidth = 2;
                for (var m = 0; m < 12; m++) {
                    var a = (m / 12) * Math.PI * 2 - Math.PI / 2;
                    var inner = r - (m % 3 === 0 ? 14 : 8);
                    var x1 = cx + Math.cos(a) * inner;
                    var y1 = cy + Math.sin(a) * inner;
                    var x2 = cx + Math.cos(a) * (r - 4);
                    var y2 = cy + Math.sin(a) * (r - 4);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }

                // Clock hands
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(t);
                ctx.strokeStyle = '#402513';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -26);
                ctx.stroke();
                ctx.rotate(t * 0.85);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -42);
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = '#5f3b1d';
                ctx.beginPath();
                ctx.arc(cx, cy, 5, 0, Math.PI * 2);
                ctx.fill();

                // Decorative background gears
                for (var g = 0; g < 3; g++) {
                    var gx = 150 + g * 330;
                    var gy = GROUND_Y - 220 + (g % 2) * 62;
                    var gr = 28 + (g % 2) * 10;
                    var rot = t * (g % 2 === 0 ? 1 : -1) * 0.6;
                    ctx.save();
                    ctx.translate(gx, gy);
                    ctx.rotate(rot);
                    ctx.strokeStyle = 'rgba(130, 88, 52, 0.35)';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(0, 0, gr, 0, Math.PI * 2);
                    ctx.stroke();
                    for (var gt = 0; gt < 8; gt++) {
                        ctx.rotate(Math.PI * 2 / 8);
                        ctx.fillStyle = 'rgba(110, 72, 44, 0.28)';
                        ctx.fillRect(-2, gr - 5, 4, 8);
                    }
                    ctx.restore();
                }

                // Ember sparks near lava level
                ctx.fillStyle = 'rgba(255, 130, 60, 0.35)';
                for (var s = 0; s < 24; s++) {
                    var ex = (s * 89 + Date.now() * (0.01 + (s % 3) * 0.004)) % W;
                    var ey = GROUND_Y - 24 - (s * 17 % 40);
                    ctx.fillRect(ex, ey, 2, 2);
                }
            },
            groundColor: '#2b100b', groundEdge: '#8c3a1b', wallColor: '#14090a',
        },

        // ── MAP 8: Tokyo Neon Night ─────────────────────────────────
        {
            name: 'Tokyo',
            platforms: [
                { x: 120, y: GROUND_Y - 90, w: 140, h: 14 },
                { x: W / 2 - 80, y: GROUND_Y - 150, w: 160, h: 14 }, // Regeneration platform
                { x: W - 260, y: GROUND_Y - 90, w: 140, h: 14 },
                { x: W / 2 - 250, y: GROUND_Y - 60, w: 120, h: 14 },
                { x: W / 2 + 130, y: GROUND_Y - 60, w: 120, h: 14 },
            ],
            obstacles: [
                { type: 'ladder', x: W / 2 - 170, y: GROUND_Y - 150, w: 20, h: 150 },
                { type: 'ladder', x: W / 2 + 150, y: GROUND_Y - 150, w: 20, h: 150 },
                { type: 'regen', x: W / 2 - 80, y: GROUND_Y - 150, w: 160, h: 14, healPerSecond: 0.5 },
                { type: 'crumbling', x: W / 2 - 200, y: GROUND_Y - 120, w: 90, h: 12 },
                { type: 'crumbling', x: W / 2 + 110, y: GROUND_Y - 120, w: 90, h: 12 },
            ],
            drawBackground: function (ctx) {
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#05060f');
                skyGrad.addColorStop(0.45, '#0a1022');
                skyGrad.addColorStop(1, '#140a24');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                // Distant neon haze
                var haze = ctx.createRadialGradient(W * 0.52, 140, 30, W * 0.52, 140, 380);
                haze.addColorStop(0, 'rgba(255, 70, 180, 0.14)');
                haze.addColorStop(0.5, 'rgba(80, 120, 255, 0.1)');
                haze.addColorStop(1, 'rgba(10, 20, 40, 0)');
                ctx.fillStyle = haze;
                ctx.fillRect(0, 0, W, H);

                // Tiny stars
                ctx.fillStyle = 'rgba(220, 240, 255, 0.35)';
                for (var i = 0; i < 28; i++) {
                    var sx = (i * 173 + 37) % W;
                    var sy = (i * 89 + 15) % (H * 0.35);
                    var ss = (i % 4 === 0) ? 2 : 1;
                    ctx.fillRect(sx, sy, ss, ss);
                }

                // Far skyline
                for (var i = 0; i < 14; i++) {
                    var fw = 44 + (i % 3) * 16;
                    var fh = 90 + (i % 5) * 22;
                    var fx = i * 70 - 12;
                    ctx.fillStyle = '#0d1328';
                    ctx.fillRect(fx, GROUND_Y - fh - 26, fw, fh + 26);
                }

                // Near skyline with neon windows/signs
                for (var i = 0; i < 10; i++) {
                    var bw = 58 + (i % 4) * 14;
                    var bh = 130 + (i % 5) * 28;
                    var bx = i * 95 + 10;
                    var by = GROUND_Y - bh;
                    ctx.fillStyle = '#121933';
                    ctx.fillRect(bx, by, bw, bh);

                    // Neon billboard stripe
                    if (i % 2 === 0) {
                        var pulse = Math.sin(Date.now() * 0.006 + i * 1.7) * 0.5 + 0.5;
                        ctx.fillStyle = 'rgba(255, 70, 200, ' + (0.25 + pulse * 0.35) + ')';
                        ctx.fillRect(bx + 6, by + 16, bw - 12, 8);
                        ctx.fillStyle = 'rgba(30, 240, 255, ' + (0.2 + pulse * 0.25) + ')';
                        ctx.fillRect(bx + 10, by + 28, bw - 20, 4);
                    }

                    // Window grid
                    for (var wy = by + 44; wy < by + bh - 12; wy += 12) {
                        for (var wx = bx + 8; wx < bx + bw - 6; wx += 10) {
                            var lit = (wx + wy + i * 13) % 3 !== 0;
                            if (!lit) continue;
                            var wPulse = Math.sin(Date.now() * 0.004 + wx * 0.08 + wy * 0.04) * 0.5 + 0.5;
                            ctx.fillStyle = 'rgba(40, 235, 255, ' + (0.12 + wPulse * 0.28) + ')';
                            ctx.fillRect(wx, wy, 4, 5);
                        }
                    }
                }

                // Neon rail light near horizon
                var railPulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
                ctx.fillStyle = 'rgba(45, 245, 255, ' + (0.18 + railPulse * 0.16) + ')';
                ctx.fillRect(0, GROUND_Y - 6, W, 2);
                ctx.fillStyle = 'rgba(255, 80, 190, ' + (0.12 + railPulse * 0.1) + ')';
                ctx.fillRect(0, GROUND_Y - 2, W, 1);
            },
            groundColor: '#1a1630', groundEdge: '#2df5ff', wallColor: '#090b18',
        },

        // ── MAP 9: Midnight Express ─────────────────────────────────
        {
            id: 'train',
            name: 'Train',
            stageTheme: 'train',
            dynamicHazards: ['wind', 'tunnel'],
            windPushPerSecond: 12.5,
            tunnelInterval: 20000,
            tunnelDuration: 5000,
            platforms: [
                { x: 92, y: GROUND_Y - 90, w: 150, h: 14 },
                { x: W / 2 - 70, y: GROUND_Y - 135, w: 140, h: 14 },
                { x: W - 242, y: GROUND_Y - 90, w: 150, h: 14 },
                { x: W / 2 - 220, y: GROUND_Y - 62, w: 110, h: 14 },
                { x: W / 2 + 110, y: GROUND_Y - 62, w: 110, h: 14 },
            ],
            obstacles: [
                { type: 'jumpboost', x: W / 2 - 25, y: GROUND_Y - 10, w: 50, h: 10 },
            ],
            drawBackground: function (ctx) {
                var t = Date.now() * 0.045;
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#060b17');
                skyGrad.addColorStop(0.6, '#101a2e');
                skyGrad.addColorStop(1, '#151925');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                // Moon haze
                var moon = ctx.createRadialGradient(W * 0.78, 88, 16, W * 0.78, 88, 120);
                moon.addColorStop(0, 'rgba(210,220,255,0.18)');
                moon.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = moon;
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = 'rgba(220,230,255,0.32)';
                ctx.beginPath();
                ctx.arc(W * 0.78, 88, 26, 0, Math.PI * 2);
                ctx.fill();

                // Distant motion blur lines
                ctx.fillStyle = 'rgba(160,190,255,0.08)';
                for (var l = 0; l < 12; l++) {
                    var ly = 46 + l * 22;
                    var lx = ((l * 140) - t * (0.4 + (l % 3) * 0.15)) % (W + 220) - 110;
                    ctx.fillRect(lx, ly, 130, 2);
                }

                // Utility poles rushing by
                for (var p = 0; p < 6; p++) {
                    var px = ((p * 210) - t * 2.2) % (W + 260) - 130;
                    ctx.fillStyle = 'rgba(22, 26, 36, 0.72)';
                    ctx.fillRect(px, 36, 6, GROUND_Y - 36);
                    ctx.fillRect(px - 26, 84, 58, 5);
                    ctx.strokeStyle = 'rgba(90,110,140,0.22)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(px - 22, 90);
                    ctx.lineTo(px + 28, 90);
                    ctx.stroke();
                }

                // Overhead cable lines for motion depth
                ctx.strokeStyle = 'rgba(140, 170, 220, 0.16)';
                ctx.lineWidth = 1;
                for (var cbl = 0; cbl < 3; cbl++) {
                    var cy = 72 + cbl * 26;
                    var cShift = (t * (0.8 + cbl * 0.22)) % 180;
                    ctx.beginPath();
                    for (var sx = -180; sx < W + 200; sx += 180) {
                        ctx.moveTo(sx - cShift, cy);
                        ctx.lineTo(sx + 110 - cShift, cy + (cbl === 1 ? -1 : 1));
                    }
                    ctx.stroke();
                }

                // Train body under the fighting roof
                ctx.fillStyle = '#151a24';
                ctx.fillRect(0, GROUND_Y + 3, W, H - GROUND_Y - 3);
                for (var c = 0; c < 9; c++) {
                    var carX = c * 122 - ((t * 1.35) % 122);
                    ctx.fillStyle = '#202838';
                    ctx.fillRect(carX, GROUND_Y + 12, 112, 56);
                    ctx.fillStyle = '#2b3650';
                    ctx.fillRect(carX + 6, GROUND_Y + 18, 100, 36);
                    ctx.fillStyle = 'rgba(130,180,255,0.24)';
                    for (var wv = 0; wv < 4; wv++) {
                        ctx.fillRect(carX + 12 + wv * 23, GROUND_Y + 24, 16, 18);
                    }
                }

                // Roof lines
                ctx.fillStyle = 'rgba(180,210,255,0.14)';
                ctx.fillRect(0, GROUND_Y - 14, W, 2);
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                ctx.fillRect(0, GROUND_Y - 5, W, 1);
            },
            groundColor: '#242a38', groundEdge: '#5e738d', wallColor: '#121926',
        },

        // ── MAP 10: Grand Library ──────────────────────────────────
        {
            id: 'library',
            name: 'Library',
            dynamicHazards: ['books', 'silence'],
            shushInterval: 10000,
            shushDuration: 1800,
            bookSpawnInterval: 1600,
            bookDamage: 0.5,
            shelfLanes: [
                { x: G.WALL_LEFT + 20, y: GROUND_Y - 188, dir: 1 },
                { x: G.WALL_RIGHT - 20, y: GROUND_Y - 168, dir: -1 },
                { x: G.WALL_LEFT + 20, y: GROUND_Y - 126, dir: 1 },
                { x: G.WALL_RIGHT - 20, y: GROUND_Y - 106, dir: -1 },
            ],
            platforms: [
                { x: 92, y: GROUND_Y - 92, w: 160, h: 14 },
                { x: W / 2 - 75, y: GROUND_Y - 150, w: 150, h: 14 },
                { x: W - 252, y: GROUND_Y - 92, w: 160, h: 14 },
                { x: W / 2 - 225, y: GROUND_Y - 64, w: 116, h: 14 },
                { x: W / 2 + 109, y: GROUND_Y - 64, w: 116, h: 14 },
            ],
            obstacles: [
                { type: 'ladder', x: W / 2 - 12, y: GROUND_Y - 150, w: 24, h: 150 },
            ],
            drawBackground: function (ctx) {
                var t = Date.now() * 0.0022;
                var skyGrad = ctx.createLinearGradient(0, 0, 0, H);
                skyGrad.addColorStop(0, '#1b1420');
                skyGrad.addColorStop(0.55, '#24172a');
                skyGrad.addColorStop(1, '#2e1b1b');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(0, 0, W, H);

                // Stained window glow
                var winGrad = ctx.createRadialGradient(W / 2, 102, 18, W / 2, 102, 170);
                winGrad.addColorStop(0, 'rgba(255, 220, 160, 0.22)');
                winGrad.addColorStop(0.45, 'rgba(170, 130, 240, 0.12)');
                winGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = winGrad;
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#35223e';
                ctx.beginPath();
                ctx.arc(W / 2, 108, 54, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255, 230, 185, 0.3)';
                ctx.beginPath();
                ctx.arc(W / 2, 108, 42, 0, Math.PI * 2);
                ctx.fill();

                // Tall side shelves
                for (var side = 0; side < 2; side++) {
                    var sx = side === 0 ? 34 : W - 138;
                    ctx.fillStyle = '#2a1a10';
                    ctx.fillRect(sx, 36, 104, GROUND_Y - 8);
                    ctx.fillStyle = '#3a2417';
                    for (var sh = 0; sh < 9; sh++) {
                        var sy = 54 + sh * 45;
                        ctx.fillRect(sx + 6, sy, 92, 5);
                    }
                    for (var bk = 0; bk < 70; bk++) {
                        var row = Math.floor(bk / 8);
                        var col = bk % 8;
                        var bw = 7 + (bk % 3);
                        var bx = sx + 10 + col * 11;
                        var by = 58 + row * 45 - (bk % 2) * 7;
                        var hue = (bk * 27 + side * 90) % 360;
                        ctx.fillStyle = 'hsla(' + hue + ', 45%, 52%, 0.5)';
                        ctx.fillRect(bx, by, bw, 19);
                    }
                }

                // Center archive shelves
                for (var i = 0; i < 3; i++) {
                    var cx = W * 0.25 + i * 210;
                    ctx.fillStyle = '#2a1b12';
                    ctx.fillRect(cx - 48, GROUND_Y - 175, 96, 175);
                    ctx.fillStyle = '#3e2a1d';
                    ctx.fillRect(cx - 46, GROUND_Y - 169, 92, 6);
                    ctx.fillRect(cx - 46, GROUND_Y - 111, 92, 6);
                    ctx.fillRect(cx - 46, GROUND_Y - 53, 92, 6);
                }

                // Floating dust motes
                for (var d = 0; d < 26; d++) {
                    var dx = (d * 97 + t * (14 + d % 3)) % W;
                    var dy = (d * 61 + t * (8 + d % 4)) % (GROUND_Y - 30);
                    var pulse = Math.sin(t * 2 + d * 0.7) * 0.5 + 0.5;
                    ctx.fillStyle = 'rgba(255,240,190,' + (0.08 + pulse * 0.16) + ')';
                    ctx.fillRect(dx, dy, 2, 2);
                }
            },
            groundColor: '#2a1d18', groundEdge: '#7d5639', wallColor: '#1c120f',
        },
    ];

    function isMovingPlatform(p) {
        return !!p && (p.moveAxis === 'x' || p.moveAxis === 'y');
    }

    function clearMapRuntimeState(map) {
        if (!map) return;
        if (!map.platforms) map.platforms = [];

        for (var i = 0; i < map.platforms.length; i++) {
            var p = map.platforms[i];
            if (typeof p._initialX !== 'number') p._initialX = p.x;
            if (typeof p._initialY !== 'number') p._initialY = p.y;
            var phase = typeof p.movePhase === 'number' ? p.movePhase : 0;
            var range = typeof p.moveRange === 'number' ? p.moveRange : 0;
            if (isMovingPlatform(p)) {
                var offset = Math.sin(phase) * range;
                p.x = p.moveAxis === 'x' ? p._initialX + offset : p._initialX;
                p.y = p.moveAxis === 'y' ? p._initialY + offset : p._initialY;
                p._moveTimer = phase;
            } else {
                p.x = p._initialX;
                p.y = p._initialY;
                p._moveTimer = 0;
            }
        }

        map._runtime = map._runtime || {};
        map._runtime.bellTimer = typeof map.bellInterval === 'number' ? map.bellInterval : 0;
        map._runtime.bellFlashTimer = 0;
        map._runtime.bellTextTimer = 0;
        map._runtime.bellWarnSecond = 0;
        map._runtime.bellWarnPulse = 0;
        map._runtime.bellShockwaves = [];
        map._runtime.tunnelTimer = typeof map.tunnelInterval === 'number' ? map.tunnelInterval : 0;
        map._runtime.tunnelActive = false;
        map._runtime.tunnelRemaining = 0;
        map._runtime.tunnelTextTimer = 0;
        map._runtime.windSfxTimer = 900 + Math.random() * 700;
        map._runtime.shushTimer = typeof map.shushInterval === 'number' ? map.shushInterval : 0;
        map._runtime.shushActive = false;
        map._runtime.shushRemaining = 0;
        map._runtime.shushTextTimer = 0;
        map._runtime.shushGraceTimer = 0;
        map._runtime.shushViolations = { 1: false, 2: false };
        map._runtime.shushAnchors = { 1: null, 2: null };
        map._runtime.shushBursts = [];
        map._runtime.shushPenaltyFlash = 0;
        map._runtime.bookTimer = typeof map.bookSpawnInterval === 'number'
            ? map.bookSpawnInterval * (0.55 + Math.random() * 0.45)
            : 0;
        map._runtime.books = [];
    }

    function getSupportingMovingPlatform(player, map) {
        if (!player || !map || !map.platforms) return null;
        if (!player.onGround || player.y >= G.GROUND_Y) return null;
        for (var i = 0; i < map.platforms.length; i++) {
            var p = map.platforms[i];
            if (!isMovingPlatform(p)) continue;
            if (Math.abs(player.y - p.y) > 4) continue;
            if (player.x + player.w / 2 <= p.x + 4) continue;
            if (player.x - player.w / 2 >= p.x + p.w - 4) continue;
            return p;
        }
        return null;
    }

    function carryPlayerWithPlatform(player, dx, dy) {
        if (!player || (dx === 0 && dy === 0)) return;
        player.x += dx;
        player.y += dy;
        if (player.x - player.w / 2 < G.WALL_LEFT) player.x = G.WALL_LEFT + player.w / 2;
        if (player.x + player.w / 2 > G.WALL_RIGHT) player.x = G.WALL_RIGHT - player.w / 2;
        if (player.y > G.GROUND_Y) player.y = G.GROUND_Y;
    }

    function updateMovingPlatforms(map, dt, p1, p2, p3, p4) {
        if (!map || !map.platforms) return;
        var p1Support = getSupportingMovingPlatform(p1, map);
        var p2Support = getSupportingMovingPlatform(p2, map);
        var p3Support = p3 ? getSupportingMovingPlatform(p3, map) : null;
        var p4Support = p4 ? getSupportingMovingPlatform(p4, map) : null;

        for (var i = 0; i < map.platforms.length; i++) {
            var p = map.platforms[i];
            if (!isMovingPlatform(p)) continue;

            var speed = typeof p.moveSpeed === 'number' ? p.moveSpeed : 1;
            var range = typeof p.moveRange === 'number' ? p.moveRange : 0;
            if (typeof p._initialX !== 'number') p._initialX = p.x;
            if (typeof p._initialY !== 'number') p._initialY = p.y;
            if (typeof p._moveTimer !== 'number') p._moveTimer = typeof p.movePhase === 'number' ? p.movePhase : 0;

            var prevX = p.x;
            var prevY = p.y;
            p._moveTimer += dt * 0.001 * speed;
            var offset = Math.sin(p._moveTimer) * range;
            if (p.moveAxis === 'x') {
                p.x = p._initialX + offset;
                p.y = p._initialY;
            } else if (p.moveAxis === 'y') {
                p.y = p._initialY + offset;
                p.x = p._initialX;
            }

            var dx = p.x - prevX;
            var dy = p.y - prevY;
            if (p1Support === p) carryPlayerWithPlatform(p1, dx, dy);
            if (p2Support === p) carryPlayerWithPlatform(p2, dx, dy);
            if (p3Support === p) carryPlayerWithPlatform(p3, dx, dy);
            if (p4Support === p) carryPlayerWithPlatform(p4, dx, dy);
        }
    }

    function isMapDamageImmune(player) {
        return !player || player.phalanxInvincible || player.ghostMode;
    }

    function applyMapDamage(player, amount, sourceX, particleColor) {
        if (!player || player.hp <= 0 || isMapDamageImmune(player)) return;
        var dmg = typeof amount === 'number' ? amount : 0.5;
        player.hp = Math.max(0, player.hp - dmg);
        player.flashTimer = Math.max(player.flashTimer || 0, 110);
        if (typeof sourceX === 'number') {
            var dir = player.x >= sourceX ? 1 : -1;
            if (typeof player.applyKnockback === 'function') {
                player.applyKnockback(dir * 2.2, -1.4, 120);
            } else {
                player.vx += dir * 1.8;
            }
        }
        var c = particleColor || '#ffe5b8';
        G.spawnParticles(player.x, player.y - player.currentH * 0.45, c, 8, 3);
        G.fxTriggerShake(2, 90);
    }

    function rectHitsPlayer(player, x, y, w, h) {
        if (!player) return false;
        var hb = player.hurtbox;
        return x < hb.x + hb.w &&
            x + w > hb.x &&
            y < hb.y + hb.h &&
            y + h > hb.y;
    }

    function clearPlayerActionForSilence(player) {
        if (!player) return;
        player.attackPhase = null;
        player.attackTimer = 0;
        player.parryWindowTimer = 0;
        player.rangedFlashTimer = 0;
        player.blackHoleCharging = false;
        player.blackHoleChargeTime = 0;
        player.shieldDashing = false;
        player.superCharging = false;
        player.superChargingTimer = 0;
    }

    function triggerLibraryShush(map, p1, p2, p3, p4) {
        if (!map || !map._runtime) return;
        var rt = map._runtime;
        var duration = typeof map.shushDuration === 'number' ? map.shushDuration : 1800;

        rt.shushActive = true;
        rt.shushRemaining = duration;
        rt.shushTextTimer = duration + 650;
        rt.shushGraceTimer = 220;
        rt.shushViolations = { 1: false, 2: false, 3: false, 4: false };
        rt.shushAnchors = {
            1: p1 ? { x: p1.x, y: p1.y } : null,
            2: p2 ? { x: p2.x, y: p2.y } : null,
            3: p3 ? { x: p3.x, y: p3.y } : null,
            4: p4 ? { x: p4.x, y: p4.y } : null,
        };

        clearPlayerActionForSilence(p1);
        clearPlayerActionForSilence(p2);
        clearPlayerActionForSilence(p3);
        clearPlayerActionForSilence(p4);

        if (p1) p1.vx *= 0.25;
        if (p2) p2.vx *= 0.25;
        if (p3) p3.vx *= 0.25;
        if (p4) p4.vx *= 0.25;

        G.spawnParticles(W * 0.5, 82, '#f3ddac', 16, 3.8);
        G.spawnParticles(W * 0.5, 82, '#fff1cf', 10, 2.5);
        G.initAudio();
        if (typeof G.playBellRing === 'function') G.playBellRing();
    }

    function checkLibrarySilenceViolation(map, player, playerNum) {
        if (!map || !map._runtime || !player || player.hp <= 0) return;
        var rt = map._runtime;
        if (rt.shushViolations[playerNum]) return;

        var anchor = rt.shushAnchors[playerNum];
        if (!anchor) {
            rt.shushAnchors[playerNum] = { x: player.x, y: player.y };
            return;
        }

        var controls = player.controls || {};
        var keys = G.keys || {};
        var superKey = playerNum === 1 ? 'e' : playerNum === 2 ? 'o' : playerNum === 3 ? '_3super' : '_4super';
        var movementInput = !!(keys[controls.left] || keys[controls.right] || keys[controls.up] || keys[controls.down]);
        var actionInput = !!(keys[controls.attack] || keys[superKey]);
        var moved = Math.abs(player.x - anchor.x) > 7 || Math.abs(player.y - anchor.y) > 7;
        var velocity = Math.abs(player.vx) > 1.1 || Math.abs(player.vy) > 1.2;

        if (movementInput || actionInput || moved || velocity) {
            rt.shushViolations[playerNum] = true;
            applyMapDamage(player, 0.5, null, '#f4dca6');
            player.vx *= 0.2;
            G.spawnParticles(player.x, player.y - player.currentH * 0.5, '#f7e7bd', 16, 4.2);
            G.spawnParticles(player.x, player.y - player.currentH * 0.5, '#ffcc88', 8, 3.4);
            rt.shushPenaltyFlash = 180;
            rt.shushBursts.push({
                x: player.x,
                y: player.y - player.currentH * 0.45,
                r: 14,
                a: 0.75,
                life: 260,
            });
            G.initAudio();
            if (typeof G.playImpactHeavy === 'function') G.playImpactHeavy();
            else if (typeof G.playHit === 'function') G.playHit();
        }
    }

    function spawnLibraryBook(map) {
        if (!map || !map._runtime) return;
        var lanes = map.shelfLanes || [];
        if (!lanes.length) return;
        var lane = lanes[Math.floor(Math.random() * lanes.length)];
        var dir = typeof lane.dir === 'number' ? lane.dir : (lane.x < W * 0.5 ? 1 : -1);
        var speed = 4.2 + Math.random() * 1.6;
        var w = 12 + Math.random() * 6;
        var h = 8 + Math.random() * 4;

        map._runtime.books.push({
            x: lane.x,
            y: lane.y + (Math.random() - 0.5) * 14,
            vx: dir * speed,
            vy: (Math.random() - 0.5) * 0.5,
            w: w,
            h: h,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.22,
            ttl: 4200,
        });

        G.spawnParticles(lane.x, lane.y, '#c59a67', 3, 2);
        G.initAudio();
        G.playBookShoot();
    }

    function updateLibraryBooks(map, dt, p1, p2, allowHazards, p3, p4) {
        if (!map || !map._runtime || !map._runtime.books) return;
        var rt = map._runtime;
        var speedFactor = dt / 16.67;

        for (var i = rt.books.length - 1; i >= 0; i--) {
            var b = rt.books[i];
            b.x += b.vx * speedFactor;
            b.y += b.vy * speedFactor;
            b.vy += 0.018 * speedFactor;
            b.rot += b.spin * speedFactor;
            b.ttl -= dt;

            var bx = b.x - b.w * 0.5;
            var by = b.y - b.h * 0.5;

            if (allowHazards) {
                var bookTargets = [p1, p2, p3, p4];
                var bookHit = false;
                for (var bi = 0; bi < bookTargets.length; bi++) {
                    var bp = bookTargets[bi];
                    if (bp && rectHitsPlayer(bp, bx, by, b.w, b.h) && !isMapDamageImmune(bp)) {
                        applyMapDamage(bp, map.bookDamage || 0.5, b.x, '#deb887');
                        G.initAudio();
                        G.playBookHit();
                        rt.books.splice(i, 1);
                        bookHit = true;
                        break;
                    }
                }
                if (bookHit) continue;
            }

            if (b.ttl <= 0 || b.x < G.WALL_LEFT - 30 || b.x > G.WALL_RIGHT + 30 || b.y > G.H + 25) {
                rt.books.splice(i, 1);
            }
        }
    }

    function triggerClockBell(map, p1, p2, p3, p4) {
        if (!map || !map._runtime) return;
        var stunDuration = typeof map.bellStunDuration === 'number' ? map.bellStunDuration : 1000;
        map._runtime.bellFlashTimer = stunDuration;
        map._runtime.bellTextTimer = 900;
        map._runtime.bellWarnSecond = 0;
        map._runtime.bellWarnPulse = 0;
        map._runtime.bellShockwaves = [
            { r: 26, a: 0.42, speed: 2.4 },
            { r: 16, a: 0.6, speed: 2.9 },
            { r: 8, a: 0.78, speed: 3.4 },
        ];

        if (p1 && typeof p1.applyBellStun === 'function') p1.applyBellStun(stunDuration);
        if (p2 && typeof p2.applyBellStun === 'function') p2.applyBellStun(stunDuration);
        if (p3 && typeof p3.applyBellStun === 'function') p3.applyBellStun(stunDuration);
        if (p4 && typeof p4.applyBellStun === 'function') p4.applyBellStun(stunDuration);

        G.spawnParticles(W * 0.5, 72, '#ffd27a', 16, 4.6);
        G.spawnParticles(W * 0.5, 72, '#fff2bf', 10, 3.2);
        G.fxTriggerShake(9, 260);
        G.initAudio();
        if (typeof G.playBellRing === 'function') G.playBellRing();
        else if (typeof G.playClang === 'function') G.playClang();
    }

    function updateClockMap(map, dt, p1, p2, allowHazards, p3, p4) {
        if (!map || map.id !== 'clock') return;
        if (!map._runtime) clearMapRuntimeState(map);
        var rt = map._runtime;

        if (rt.bellFlashTimer > 0) {
            rt.bellFlashTimer = Math.max(0, rt.bellFlashTimer - dt);
        }
        if (rt.bellTextTimer > 0) {
            rt.bellTextTimer = Math.max(0, rt.bellTextTimer - dt);
        }
        if (rt.bellWarnPulse > 0) {
            rt.bellWarnPulse = Math.max(0, rt.bellWarnPulse - dt);
        }
        if (rt.bellShockwaves && rt.bellShockwaves.length) {
            for (var si = rt.bellShockwaves.length - 1; si >= 0; si--) {
                var sw = rt.bellShockwaves[si];
                sw.r += sw.speed * (dt / 16.67);
                sw.a = Math.max(0, sw.a - 0.0018 * dt);
                if (sw.a <= 0.01 || sw.r > W * 0.9) {
                    rt.bellShockwaves.splice(si, 1);
                }
            }
        }

        if (!allowHazards) return;
        rt.bellTimer -= dt;
        var interval = typeof map.bellInterval === 'number' ? map.bellInterval : 10000;
        var warnSecs = Math.ceil(rt.bellTimer / 1000);
        if (warnSecs > 0 && warnSecs <= 3 && warnSecs !== rt.bellWarnSecond) {
            rt.bellWarnSecond = warnSecs;
            rt.bellWarnPulse = 220;
            G.spawnParticles(W * 0.5, 72, '#ffd27a', 4, 2.4);
            G.initAudio();
            if (typeof G.playUIClick === 'function') G.playUIClick();
        } else if (warnSecs > 3) {
            rt.bellWarnSecond = 0;
        }

        if (rt.bellTimer <= 0) {
            while (rt.bellTimer <= 0) rt.bellTimer += interval;
            triggerClockBell(map, p1, p2, p3, p4);
        }
    }

    function updateTrainMap(map, dt, p1, p2, allowHazards, p3, p4) {
        if (!map || map.id !== 'train') return;
        if (!map._runtime) clearMapRuntimeState(map);
        var rt = map._runtime;

        if (rt.tunnelTextTimer > 0) {
            rt.tunnelTextTimer = Math.max(0, rt.tunnelTextTimer - dt);
        }
        if (rt.tunnelActive) {
            rt.tunnelRemaining = Math.max(0, rt.tunnelRemaining - dt);
            if (rt.tunnelRemaining <= 0) {
                rt.tunnelActive = false;
            }
        }

        if (!allowHazards) return;

        var windPerSec = typeof map.windPushPerSecond === 'number' ? map.windPushPerSecond : 12;
        var windPush = windPerSec * (dt / 1000);
        rt.windSfxTimer -= dt;
        if (rt.windSfxTimer <= 0) {
            rt.windSfxTimer = 900 + Math.random() * 850;
            G.initAudio();
            if (typeof G.playWhoosh === 'function') G.playWhoosh();
        }
        var windTargets = [p1, p2, p3, p4];
        for (var wi = 0; wi < windTargets.length; wi++) {
            var wp = windTargets[wi];
            if (wp && wp.hp > 0) {
                wp.vx -= windPush * (wp.onGround ? 1 : 0.65);
                if (wp.vx < -6.5) wp.vx = -6.5;
                if (Math.random() < 0.16) {
                    G.spawnParticles(wp.x + 16, wp.y - wp.currentH * 0.52, 'rgba(170,210,255,0.45)', 1, 1.2);
                }
            }
        }

        var interval = typeof map.tunnelInterval === 'number' ? map.tunnelInterval : 20000;
        var duration = typeof map.tunnelDuration === 'number' ? map.tunnelDuration : 5000;
        rt.tunnelTimer -= dt;
        if (rt.tunnelTimer <= 0) {
            while (rt.tunnelTimer <= 0) rt.tunnelTimer += interval;
            rt.tunnelActive = true;
            rt.tunnelRemaining = duration;
            rt.tunnelTextTimer = Math.min(1300, duration);
            G.fxTriggerShake(7, 220);
            G.initAudio();
            if (typeof G.playImpactHeavy === 'function') G.playImpactHeavy();
            if (typeof G.playClang === 'function') G.playClang();
        }
    }

    function updateLibraryMap(map, dt, p1, p2, allowHazards, p3, p4) {
        if (!map || map.id !== 'library') return;
        if (!map._runtime) clearMapRuntimeState(map);
        var rt = map._runtime;

        if (rt.shushPenaltyFlash > 0) {
            rt.shushPenaltyFlash = Math.max(0, rt.shushPenaltyFlash - dt);
        }
        if (rt.shushBursts && rt.shushBursts.length) {
            for (var bi = rt.shushBursts.length - 1; bi >= 0; bi--) {
                var burst = rt.shushBursts[bi];
                burst.life -= dt;
                burst.r += dt * 0.055;
                burst.a = Math.max(0, burst.a - dt * 0.0035);
                if (burst.life <= 0 || burst.a <= 0.01) {
                    rt.shushBursts.splice(bi, 1);
                }
            }
        }

        if (rt.shushTextTimer > 0) {
            rt.shushTextTimer = Math.max(0, rt.shushTextTimer - dt);
        }
        if (rt.shushActive) {
            rt.shushRemaining = Math.max(0, rt.shushRemaining - dt);
            if (rt.shushGraceTimer > 0) {
                rt.shushGraceTimer = Math.max(0, rt.shushGraceTimer - dt);
                if (p1) rt.shushAnchors[1] = { x: p1.x, y: p1.y };
                if (p2) rt.shushAnchors[2] = { x: p2.x, y: p2.y };
                if (p3) rt.shushAnchors[3] = { x: p3.x, y: p3.y };
                if (p4) rt.shushAnchors[4] = { x: p4.x, y: p4.y };
            } else if (allowHazards) {
                checkLibrarySilenceViolation(map, p1, 1);
                checkLibrarySilenceViolation(map, p2, 2);
                if (p3) checkLibrarySilenceViolation(map, p3, 3);
                if (p4) checkLibrarySilenceViolation(map, p4, 4);
            }
            if (rt.shushRemaining <= 0) {
                rt.shushActive = false;
            }
        }

        if (!allowHazards) return;

        var shushInterval = typeof map.shushInterval === 'number' ? map.shushInterval : 10000;
        rt.shushTimer -= dt;
        if (rt.shushTimer <= 0) {
            while (rt.shushTimer <= 0) rt.shushTimer += shushInterval;
            triggerLibraryShush(map, p1, p2, p3, p4);
        }

        var bookInterval = typeof map.bookSpawnInterval === 'number' ? map.bookSpawnInterval : 1600;
        rt.bookTimer -= dt;
        if (rt.bookTimer <= 0) {
            while (rt.bookTimer <= 0) rt.bookTimer += bookInterval;
            spawnLibraryBook(map);
        }
        updateLibraryBooks(map, dt, p1, p2, true, p3, p4);
    }

    function linkTeleportPairsForMap(map) {
        var obs = map && map.obstacles;
        if (!obs) return;
        var teleports = [];
        for (var i = 0; i < obs.length; i++) {
            if (obs[i].type === 'teleport') {
                obs[i].target = null;
                teleports.push(obs[i]);
            }
        }
        // Link them in pairs
        for (var i = 0; i < teleports.length - 1; i += 2) {
            teleports[i].target = teleports[i + 1];
            teleports[i + 1].target = teleports[i];
        }
    }

    function buildVolcanoGroundLava() {
        var lava = [];
        var left = G.WALL_LEFT + 18;
        var right = G.WALL_RIGHT - 18;
        var slotCount = 6;
        var segmentCount = 4;
        var slotIndexes = [];
        for (var i = 0; i < slotCount; i++) slotIndexes.push(i);
        for (var j = slotIndexes.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var t = slotIndexes[j];
            slotIndexes[j] = slotIndexes[k];
            slotIndexes[k] = t;
        }
        slotIndexes = slotIndexes.slice(0, segmentCount).sort(function (a, b) { return a - b; });

        var slotW = (right - left) / slotCount;
        for (var s = 0; s < slotIndexes.length; s++) {
            var slot = slotIndexes[s];
            var minW = 62;
            var maxW = 104;
            var segW = Math.floor(minW + Math.random() * (maxW - minW + 1));
            var slotMinX = left + slot * slotW + 8;
            var slotMaxX = left + (slot + 1) * slotW - segW - 8;
            var segX = slotMinX;
            if (slotMaxX > slotMinX) segX = slotMinX + Math.random() * (slotMaxX - slotMinX);
            if (segX + segW > right) segX = right - segW;
            if (segX < left) segX = left;
            lava.push({
                type: 'lava',
                x: Math.round(segX),
                y: GROUND_Y - 8,
                w: segW,
                h: 8,
            });
        }
        return lava;
    }

    function randomizeVolcanoLavaLayout(map) {
        if (!map || map.id !== 'volcano') return false;
        var kept = [];
        for (var i = 0; i < map.obstacles.length; i++) {
            if (map.obstacles[i].type !== 'lava') kept.push(map.obstacles[i]);
        }
        map.obstacles = kept.concat(buildVolcanoGroundLava());
        linkTeleportPairsForMap(map);
        return true;
    }

    // Link teleport pairs within each map
    for (var m = 0; m < MAPS.length; m++) {
        linkTeleportPairsForMap(MAPS[m]);
        clearMapRuntimeState(MAPS[m]);
    }

    // Map state
    G.MAPS = MAPS;
    G.currentMapIndex = 0;

    G.randomizeMapObstaclesLayout = function (mapIndex) {
        var idx = typeof mapIndex === 'number' ? mapIndex : G.currentMapIndex;
        var map = MAPS[idx];
        if (!map) return false;
        return randomizeVolcanoLavaLayout(map);
    };

    G.getCurrentMap = function () {
        return MAPS[G.currentMapIndex];
    };

    G.getMapSpawnPoint = function (playerNumber) {
        var map = G.getCurrentMap();
        if (!map || !map.spawnPoints || map.spawnPoints.length < 2) return null;
        var idx = playerNumber === 2 ? 1 : 0;
        var sp = map.spawnPoints[idx];
        if (!sp) return null;
        return { x: sp.x, y: sp.y };
    };

    G.resetMapRuntime = function (mapIndex) {
        var idx = typeof mapIndex === 'number' ? mapIndex : G.currentMapIndex;
        var map = MAPS[idx];
        if (!map) return;
        clearMapRuntimeState(map);
    };

    G.updateMapDynamics = function (dt, p1, p2, opts) {
        var map = G.getCurrentMap();
        if (!map) return;
        var options = opts || {};
        var allowHazards = options.allowHazards !== false;
        var p3 = options.p3 || null;
        var p4 = options.p4 || null;
        updateMovingPlatforms(map, dt, p1, p2, p3, p4);
        updateClockMap(map, dt, p1, p2, allowHazards, p3, p4);
        updateTrainMap(map, dt, p1, p2, allowHazards, p3, p4);
        updateLibraryMap(map, dt, p1, p2, allowHazards, p3, p4);
    };

    G.isPlayerActionBlocked = function (player) {
        var map = G.getCurrentMap();
        if (!map || !map._runtime || !player) return false;
        if (map.id === 'library' && map._runtime.shushActive) return true;
        return false;
    };

    G.randomizeMap = function () {
        G.currentMapIndex = Math.floor(Math.random() * MAPS.length);
    };

    // Stage drawing
    var torchFlicker = 0;

    function drawTorch(ctx, x, y) {
        torchFlicker += 0.01;
        ctx.fillStyle = '#555';
        ctx.fillRect(x, y, 8, 16);
        var flicker = Math.sin(torchFlicker * 7 + x) * 3;
        ctx.fillStyle = 'rgba(255,140,30,0.15)';
        ctx.beginPath(); ctx.arc(x + 4, y - 6, 18 + flicker, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff8822';
        ctx.fillRect(x + 1, y - 8 + flicker * 0.5, 6, 8);
        ctx.fillStyle = '#ffcc44';
        ctx.fillRect(x + 2, y - 6 + flicker * 0.3, 4, 5);
    }

    G.drawStage = function () {
        var ctx = G.ctx;
        var map = G.getCurrentMap();
        var isTrainStage = map && map.stageTheme === 'train';

        map.drawBackground(ctx);

        // Ground
        if (isTrainStage) {
            var roofGrad = ctx.createLinearGradient(0, GROUND_Y - 2, 0, H);
            roofGrad.addColorStop(0, '#323c4f');
            roofGrad.addColorStop(0.48, '#232b3a');
            roofGrad.addColorStop(1, '#161c28');
            ctx.fillStyle = roofGrad;
            ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

            // Roof seam + reflective strip
            ctx.fillStyle = 'rgba(212,230,255,0.2)';
            ctx.fillRect(0, GROUND_Y, W, 2);
            ctx.fillStyle = 'rgba(90,118,160,0.35)';
            ctx.fillRect(0, GROUND_Y + 10, W, 2);

            // Metal panels and rivets
            for (var gx = -6; gx < W + 22; gx += 42) {
                ctx.fillStyle = 'rgba(12,16,24,0.25)';
                ctx.fillRect(gx, GROUND_Y + 2, 2, H - GROUND_Y - 2);
                for (var ry = GROUND_Y + 8; ry < H - 2; ry += 14) {
                    ctx.fillStyle = 'rgba(180, 200, 225, 0.2)';
                    ctx.fillRect(gx + 7, ry, 2, 2);
                    ctx.fillRect(gx + 31, ry, 2, 2);
                }
            }

            // Slight right-to-left sheen to imply speed
            var sheenX = ((Date.now() * 0.14) % (W + 320)) - 160;
            var sheen = ctx.createLinearGradient(sheenX, 0, sheenX + 140, 0);
            sheen.addColorStop(0, 'rgba(255,255,255,0)');
            sheen.addColorStop(0.52, 'rgba(190,220,255,0.11)');
            sheen.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sheen;
            ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
        } else {
            ctx.fillStyle = map.groundColor || '#2a2a3a';
            ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
            ctx.fillStyle = map.groundEdge || '#444460';
            ctx.fillRect(0, GROUND_Y, W, 3);

            // Ground bricks
            for (var row = 0; row < 3; row++) {
                var yy = GROUND_Y + 8 + row * 16;
                var offset = row % 2 === 0 ? 0 : 24;
                for (var col = -1; col < W / 48 + 1; col++) {
                    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(col * 48 + offset, yy, 48, 16);
                }
            }
        }

        // Platforms
        map.platforms.forEach(function (p) {
            if (isTrainStage) {
                // Industrial rooftop units instead of floating castle platforms.
                ctx.fillStyle = 'rgba(0,0,0,0.28)';
                ctx.fillRect(p.x + 3, p.y + 4, p.w, p.h + 6);
                ctx.fillStyle = '#2f3a4d';
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.fillStyle = '#607a9e';
                ctx.fillRect(p.x, p.y, p.w, 3);
                ctx.fillStyle = '#1a2130';
                ctx.fillRect(p.x, p.y + p.h - 2, p.w, 2);

                // Vent grille details
                var step = 12;
                for (var vx = p.x + 8; vx < p.x + p.w - 8; vx += step) {
                    ctx.fillStyle = 'rgba(150,175,210,0.25)';
                    ctx.fillRect(vx, p.y + 5, 5, 1);
                    ctx.fillRect(vx, p.y + 8, 5, 1);
                }

                // Mounting bolts
                ctx.fillStyle = 'rgba(200,220,245,0.3)';
                ctx.fillRect(p.x + 4, p.y + p.h - 3, 2, 2);
                ctx.fillRect(p.x + p.w - 6, p.y + p.h - 3, 2, 2);
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(p.x + 4, p.y + 4, p.w, p.h);
                ctx.fillStyle = map.groundColor || '#3a3a50';
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.fillStyle = map.groundEdge || '#555578';
                ctx.fillRect(p.x, p.y, p.w, 3);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fillRect(p.x, p.y + p.h - 2, p.w, 2);
                ctx.strokeStyle = 'rgba(100,100,130,0.2)';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(p.x + 10, p.y + p.h);
                ctx.lineTo(p.x + 10, p.y + p.h + 30);
                ctx.moveTo(p.x + p.w - 10, p.y + p.h);
                ctx.lineTo(p.x + p.w - 10, p.y + p.h + 30);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });

        // Walls
        if (isTrainStage) {
            // Train roof side rails and end safety gates.
            ctx.fillStyle = '#1a2230';
            ctx.fillRect(0, GROUND_Y - 22, W, 4);
            ctx.fillStyle = '#7087aa';
            ctx.fillRect(0, GROUND_Y - 22, W, 1);

            for (var rp = 0; rp < W + 30; rp += 28) {
                ctx.fillStyle = '#44556f';
                ctx.fillRect(rp, GROUND_Y - 20, 3, 18);
            }
            ctx.fillStyle = '#2d3a4f';
            ctx.fillRect(0, GROUND_Y - 6, W, 4);

            // End gates where arena bounds are
            ctx.fillStyle = '#29374b';
            ctx.fillRect(G.WALL_LEFT - 4, GROUND_Y - 36, 8, 36);
            ctx.fillRect(G.WALL_RIGHT - 4, GROUND_Y - 36, 8, 36);
            ctx.fillStyle = '#7f9bc2';
            ctx.fillRect(G.WALL_LEFT - 4, GROUND_Y - 36, 8, 2);
            ctx.fillRect(G.WALL_RIGHT - 4, GROUND_Y - 36, 8, 2);
            for (var rb = 0; rb < 5; rb++) {
                var by = GROUND_Y - 31 + rb * 7;
                ctx.fillStyle = 'rgba(170,200,240,0.28)';
                ctx.fillRect(G.WALL_LEFT - 2, by, 4, 1);
                ctx.fillRect(G.WALL_RIGHT - 2, by, 4, 1);
            }
        } else {
            ctx.fillStyle = map.wallColor || '#1a1a28';
            ctx.fillRect(0, 0, G.WALL_LEFT, H);
            ctx.fillRect(G.WALL_RIGHT, 0, W - G.WALL_RIGHT, H);
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 0.5;
            for (var row = 0; row < H / 20; row++) {
                var offset = row % 2 === 0 ? 0 : 8;
                ctx.strokeRect(offset * 0.5, row * 20, G.WALL_LEFT, 20);
                ctx.strokeRect(G.WALL_RIGHT + offset * 0.5, row * 20, W - G.WALL_RIGHT, 20);
            }
            ctx.fillStyle = 'rgba(100,100,130,0.15)';
            ctx.fillRect(G.WALL_LEFT - 2, 0, 2, H);
            ctx.fillRect(G.WALL_RIGHT, 0, 2, H);

            // Torches
            drawTorch(ctx, G.WALL_LEFT + 2, GROUND_Y - 100);
            drawTorch(ctx, G.WALL_RIGHT - 10, GROUND_Y - 100);
            drawTorch(ctx, G.WALL_LEFT + 2, GROUND_Y - 250);
            drawTorch(ctx, G.WALL_RIGHT - 10, GROUND_Y - 250);
        }

        // Map name
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.textAlign = 'center';
        ctx.fillText(map.name, W / 2, H - 8);
        ctx.textAlign = 'start';
    };

    function drawClockOverlay(ctx, map, rt) {
        var interval = typeof map.bellInterval === 'number' ? map.bellInterval : 10000;
        var secs = Math.max(1, Math.ceil((rt.bellTimer > 0 ? rt.bellTimer : interval) / 1000));
        var flashPct = rt.bellFlashTimer > 0
            ? Math.min(1, rt.bellFlashTimer / (map.bellStunDuration || 1000))
            : 0;
        var warnPulse = rt.bellWarnPulse > 0 ? Math.min(1, rt.bellWarnPulse / 220) : 0;
        var cyclePct = Math.max(0, Math.min(1, (rt.bellTimer > 0 ? rt.bellTimer : interval) / interval));

        var overlayY = 22;
        var overlayW = 170;
        var overlayX = W / 2 - overlayW / 2;
        var pulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;

        ctx.fillStyle = 'rgba(24, 12, 8, 0.62)';
        ctx.fillRect(overlayX, overlayY - 14, overlayW, 24);
        ctx.strokeStyle = 'rgba(244, 178, 108,' + (0.45 + pulse * 0.2 + flashPct * 0.25 + warnPulse * 0.2) + ')';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(overlayX + 0.5, overlayY - 13.5, overlayW - 1, 23);

        // Countdown bar
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(overlayX + 8, overlayY + 2, overlayW - 16, 5);
        ctx.fillStyle = 'rgba(255, 210, 130,' + (0.45 + warnPulse * 0.35) + ')';
        ctx.fillRect(overlayX + 8, overlayY + 2, (overlayW - 16) * (1 - cyclePct), 5);

        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 235, 190, 0.86)';
        ctx.fillText('BELL IN ' + secs + 's', W / 2, overlayY);
        if (warnPulse > 0) {
            ctx.fillStyle = 'rgba(255, 226, 160,' + (0.6 + warnPulse * 0.35) + ')';
            ctx.fillText('GET READY!', W / 2, overlayY + 12);
        }
        if (rt.bellTextTimer > 0) {
            ctx.fillStyle = 'rgba(255, 210, 120,' + (0.7 + flashPct * 0.3) + ')';
            ctx.fillText('BELL RING!', W / 2, overlayY + 12);
        }
        if (flashPct > 0) {
            ctx.fillStyle = 'rgba(255, 224, 155,' + (0.1 + flashPct * 0.24) + ')';
            ctx.fillRect(0, 0, W, H);
        }
        ctx.textAlign = 'start';
    }

    function drawTrainOverlay(ctx, map, rt) {
        var interval = typeof map.tunnelInterval === 'number' ? map.tunnelInterval : 20000;
        var tunnelDuration = typeof map.tunnelDuration === 'number' ? map.tunnelDuration : 5000;
        var secsToTunnel = Math.max(1, Math.ceil((rt.tunnelTimer > 0 ? rt.tunnelTimer : interval) / 1000));

        ctx.fillStyle = 'rgba(9, 14, 22, 0.62)';
        ctx.fillRect(W / 2 - 94, 8, 188, 24);
        ctx.strokeStyle = 'rgba(150, 190, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - 93.5, 8.5, 187, 23);
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(210, 230, 255, 0.92)';
        if (rt.tunnelActive) {
            ctx.fillText('WIND <<  IN TUNNEL', W / 2, 22);
        } else {
            ctx.fillText('WIND <<  TUNNEL IN ' + secsToTunnel + 's', W / 2, 22);
        }

        // Wind direction streaks in HUD
        var ws = Date.now() * 0.08;
        for (var i = 0; i < 5; i++) {
            var sx = W / 2 + 72 - (i * 16) - ((ws + i * 5) % 16);
            var sy = 26;
            ctx.strokeStyle = 'rgba(178,218,255,' + (0.22 + (i % 2) * 0.08) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - 9, sy);
            ctx.stroke();
        }

        if (rt.tunnelActive) {
            var elapsed = tunnelDuration - rt.tunnelRemaining;
            var enterFade = Math.min(1, elapsed / 420);
            var exitFade = Math.min(1, rt.tunnelRemaining / 320);
            var fade = Math.min(enterFade, exitFade);
            var pulse = Math.sin(Date.now() * 0.025) * 0.5 + 0.5;
            var alpha = 0.9 - fade * 0.12 + pulse * 0.03;

            // Base near-black darkness
            ctx.fillStyle = 'rgba(2, 3, 6, ' + alpha + ')';
            ctx.fillRect(0, 0, W, H);

            // Passing tunnel wall sections for realism
            var wallShift = (Date.now() * 0.32) % 170;
            for (var w = -1; w < 10; w++) {
                var bandX = w * 170 - wallShift;
                var bandW = 96 + (w % 3) * 22;
                ctx.fillStyle = 'rgba(10, 12, 18, 0.26)';
                ctx.fillRect(bandX, 0, bandW, H);
                ctx.fillStyle = 'rgba(120,130,145,0.045)';
                ctx.fillRect(bandX + bandW - 2, 0, 2, H);
            }

            // Faint headroom strip lights flicker
            var flick = Math.sin(Date.now() * 0.07) > 0.42 ? 0.1 : 0.02;
            ctx.fillStyle = 'rgba(180, 194, 210,' + flick + ')';
            ctx.fillRect(0, H * 0.1, W, 3);

            // Vignette to crush visibility at edges
            var fog = ctx.createRadialGradient(W / 2, H * 0.56, 60, W / 2, H * 0.56, W * 0.74);
            fog.addColorStop(0, 'rgba(28, 34, 44, 0.08)');
            fog.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
            ctx.fillStyle = fog;
            ctx.fillRect(0, 0, W, H);
        }
        if (rt.tunnelTextTimer > 0) {
            var textPulse = Math.sin(Date.now() * 0.018) * 0.5 + 0.5;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(220,235,255,' + (0.7 + textPulse * 0.25) + ')';
            ctx.fillText('TUNNEL!', W / 2, 56);
        }
        ctx.textAlign = 'start';
    }

    function drawLibraryOverlay(ctx, map, rt) {
        var interval = typeof map.shushInterval === 'number' ? map.shushInterval : 10000;
        var secs = Math.max(1, Math.ceil((rt.shushTimer > 0 ? rt.shushTimer : interval) / 1000));
        var panelW = 188;
        var panelX = W / 2 - panelW / 2;

        ctx.fillStyle = 'rgba(35, 24, 16, 0.58)';
        ctx.fillRect(panelX, 8, panelW, 22);
        ctx.strokeStyle = 'rgba(233, 203, 150, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 0.5, 8.5, panelW - 1, 21);
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 237, 196, 0.94)';
        if (rt.shushActive) ctx.fillText('SHHHHH! STAY STILL!', W / 2, 22);
        else ctx.fillText('SHHH IN ' + secs + 's', W / 2, 22);

        if (rt.shushActive) {
            var pulse = Math.sin(Date.now() * 0.016) * 0.5 + 0.5;
            var strictAlpha = 0.18 + pulse * 0.13;
            ctx.fillStyle = 'rgba(30, 22, 14,' + strictAlpha + ')';
            ctx.fillRect(0, 0, W, H);

            // Subtle hush bands
            for (var b = 0; b < 5; b++) {
                var by = H * 0.2 + b * 52 + Math.sin(Date.now() * 0.006 + b * 0.9) * 6;
                ctx.fillStyle = 'rgba(242, 220, 170, ' + (0.03 + pulse * 0.02) + ')';
                ctx.fillRect(0, by, W, 1.5);
            }
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255, 236, 189,' + (0.7 + pulse * 0.25) + ')';
            ctx.fillText('SHHHHH!', W / 2, H * 0.24);
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(248, 228, 186, 0.82)';
            ctx.fillText('DON\'T MOVE OR ATTACK', W / 2, H * 0.24 + 22);
        } else if (rt.shushTextTimer > 0) {
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(248, 228, 186, 0.72)';
            ctx.fillText('QUIET DOWN...', W / 2, 48);
        }

        if (rt.shushPenaltyFlash > 0) {
            var fp = Math.min(1, rt.shushPenaltyFlash / 180);
            ctx.fillStyle = 'rgba(255, 205, 130,' + (0.08 + fp * 0.3) + ')';
            ctx.fillRect(0, 0, W, H);
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillStyle = 'rgba(255, 232, 170,' + (0.65 + fp * 0.3) + ')';
            ctx.fillText('TOO LOUD!', W / 2, H * 0.3);
        }
        ctx.textAlign = 'start';
    }

    function drawLibraryBooksWorld(ctx, map) {
        if (!map || !map._runtime || !map._runtime.books) return;
        var books = map._runtime.books;
        for (var i = 0; i < books.length; i++) {
            var b = books[i];
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rot);

            // Book shadow + body
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.fillRect(-b.w * 0.5 + 1, -b.h * 0.5 + 1, b.w, b.h);
            ctx.fillStyle = '#8c5a36';
            ctx.fillRect(-b.w * 0.5, -b.h * 0.5, b.w, b.h);
            ctx.fillStyle = '#d8c4a2';
            ctx.fillRect(-b.w * 0.36, -b.h * 0.34, b.w * 0.72, b.h * 0.68);
            ctx.fillStyle = 'rgba(80,45,30,0.55)';
            ctx.fillRect(-1, -b.h * 0.42, 2, b.h * 0.84);
            ctx.restore();
        }
    }

    function drawTrainWindWorld(ctx, map, rt) {
        if (!map || map.id !== 'train') return;
        var t = Date.now() * 0.06;
        var pulse = Math.sin(Date.now() * 0.012) * 0.5 + 0.5;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Mid-air wind streaks
        for (var i = 0; i < 30; i++) {
            var y = 34 + (i * 17) % (GROUND_Y - 70);
            var speed = 0.5 + (i % 5) * 0.18;
            var x = ((i * 141 - t * speed) % (W + 220)) - 110;
            var len = 16 + (i % 4) * 18;
            var a = 0.08 + (i % 3) * 0.03 + pulse * 0.03;
            ctx.strokeStyle = 'rgba(185,220,255,' + a + ')';
            ctx.lineWidth = 1 + (i % 2) * 0.7;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - len, y + Math.sin((t + i * 13) * 0.04) * 2.5);
            ctx.stroke();
        }

        // Ground gust dust
        for (var d = 0; d < 18; d++) {
            var gx = ((d * 90 - t * (1.2 + (d % 3) * 0.2)) % (W + 120)) - 60;
            var gy = GROUND_Y - 6 - (d % 3) * 3;
            ctx.fillStyle = 'rgba(200,220,255,' + (0.08 + pulse * 0.05) + ')';
            ctx.fillRect(gx, gy, 12 + (d % 4) * 4, 1.4);
        }
        ctx.restore();
    }

    function drawClockWorldEffects(ctx, map, rt) {
        if (!map || map.id !== 'clock' || !rt) return;
        var bellX = W * 0.5;
        var bellY = 72;

        if (rt.bellWarnPulse > 0) {
            var wp = Math.min(1, rt.bellWarnPulse / 220);
            var glow = ctx.createRadialGradient(bellX, bellY, 10, bellX, bellY, 130);
            glow.addColorStop(0, 'rgba(255, 216, 142,' + (0.22 + wp * 0.2) + ')');
            glow.addColorStop(1, 'rgba(255, 216, 142, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(bellX - 130, bellY - 130, 260, 260);
        }

        if (rt.bellShockwaves && rt.bellShockwaves.length) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (var i = 0; i < rt.bellShockwaves.length; i++) {
                var sw = rt.bellShockwaves[i];
                ctx.strokeStyle = 'rgba(255, 218, 150,' + sw.a + ')';
                ctx.lineWidth = Math.max(1.2, 2.4 - i * 0.5);
                ctx.beginPath();
                ctx.arc(bellX, bellY, sw.r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function drawLibraryShushBurstsWorld(ctx, map, rt) {
        if (!map || map.id !== 'library' || !rt || !rt.shushBursts || !rt.shushBursts.length) return;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (var i = 0; i < rt.shushBursts.length; i++) {
            var burst = rt.shushBursts[i];
            ctx.strokeStyle = 'rgba(255, 228, 170,' + burst.a + ')';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, burst.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 200, 120,' + (burst.a * 0.6) + ')';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(burst.x, burst.y, burst.r * 0.64, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }

    G.drawMapDynamicsWorld = function () {
        var ctx = G.ctx;
        var map = G.getCurrentMap();
        if (!map || !map._runtime) return;
        if (map.id === 'train') {
            drawTrainWindWorld(ctx, map, map._runtime);
        } else if (map.id === 'clock') {
            drawClockWorldEffects(ctx, map, map._runtime);
        } else if (map.id === 'library') {
            drawLibraryBooksWorld(ctx, map);
            drawLibraryShushBurstsWorld(ctx, map, map._runtime);
        }
    };

    G.drawMapDynamicsOverlay = function () {
        var ctx = G.ctx;
        var map = G.getCurrentMap();
        if (!map || !map._runtime) return;
        var rt = map._runtime;

        ctx.save();
        if (map.id === 'clock') drawClockOverlay(ctx, map, rt);
        else if (map.id === 'train') drawTrainOverlay(ctx, map, rt);
        else if (map.id === 'library') drawLibraryOverlay(ctx, map, rt);
        ctx.restore();
    };
})(window.Game);
