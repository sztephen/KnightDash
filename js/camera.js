// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Battle Zoom Camera
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    var W = G.W, H = G.H;
    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    // Camera state
    G.cam = {
        zoom: 1,
        targetZoom: 1,
        cx: W / 2,
        cy: H / 2,
        targetCx: W / 2,
        targetCy: H / 2,
        overrideActive: false,
        overrideZoom: 1,
        overrideCx: W / 2,
        overrideCy: H / 2,
    };

    var ZOOM_CLOSE_DIST = 150;   // Start zooming when closer than this
    var ZOOM_FAR_DIST = 220;     // Fully zoomed out when farther
    var MAX_ZOOM = 1.35;
    var BASE_LERP_SPEED = 0.04;
    var OVERRIDE_LERP_SPEED = 0.18;

    G.updateCamera = function (p1, p2, p3, p4) {
        // Gather alive fighters for midpoint calculation
        var fighters = [p1, p2];
        if (p3 && p3.hp > 0) fighters.push(p3);
        if (p4 && p4.hp > 0) fighters.push(p4);
        // Filter to alive only (keep at least 2 for stable camera)
        var alive = [];
        for (var fi = 0; fi < fighters.length; fi++) {
            if (fighters[fi].hp > 0) alive.push(fighters[fi]);
        }
        if (alive.length === 0) alive = [p1, p2]; // fallback

        // Compute bounding box of alive fighters
        var minX = alive[0].x, maxX = alive[0].x;
        var minY = alive[0].y, maxY = alive[0].y;
        for (var fi = 1; fi < alive.length; fi++) {
            if (alive[fi].x < minX) minX = alive[fi].x;
            if (alive[fi].x > maxX) maxX = alive[fi].x;
            if (alive[fi].y < minY) minY = alive[fi].y;
            if (alive[fi].y > maxY) maxY = alive[fi].y;
        }
        var dx = maxX - minX;
        var dy = maxY - minY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var midX = (minX + maxX) / 2;
        var midY = (minY + maxY) / 2;

        // Only zoom during intense close combat (check first two fighters)
        var bothAttacking = (p1.attackPhase || p1.staggerTimer > 0) &&
            (p2.attackPhase || p2.staggerTimer > 0);

        // In 2v2, use wider thresholds to avoid excessive zooming
        var closeDist = (p3 || p4) ? ZOOM_CLOSE_DIST * 1.5 : ZOOM_CLOSE_DIST;
        var farDist = (p3 || p4) ? ZOOM_FAR_DIST * 1.5 : ZOOM_FAR_DIST;

        if (dist < closeDist) {
            var t = 1 - (dist / closeDist);
            var extraZoom = bothAttacking ? MAX_ZOOM : MAX_ZOOM * 0.7 + 0.3;
            G.cam.targetZoom = 1 + (extraZoom - 1) * t;
            G.cam.targetCx = midX;
            G.cam.targetCy = midY;
        } else if (dist < farDist) {
            var t = (dist - closeDist) / (farDist - closeDist);
            G.cam.targetZoom = 1 + (MAX_ZOOM - 1) * (1 - t) * 0.3;
            G.cam.targetCx = midX;
            G.cam.targetCy = midY;
        } else {
            G.cam.targetZoom = 1;
            G.cam.targetCx = W / 2;
            G.cam.targetCy = H / 2;
        }

        if (G.cam.overrideActive) {
            G.cam.targetZoom = Math.max(G.cam.targetZoom, G.cam.overrideZoom);
            G.cam.targetCx = G.cam.overrideCx;
            G.cam.targetCy = G.cam.overrideCy;
        }

        // Smooth lerp
        var lerpSpeed = G.cam.overrideActive ? OVERRIDE_LERP_SPEED : BASE_LERP_SPEED;
        G.cam.zoom += (G.cam.targetZoom - G.cam.zoom) * lerpSpeed;
        G.cam.cx += (G.cam.targetCx - G.cam.cx) * lerpSpeed;
        G.cam.cy += (G.cam.targetCy - G.cam.cy) * lerpSpeed;

        var halfW = W / (2 * G.cam.zoom);
        var halfH = H / (2 * G.cam.zoom);
        G.cam.cx = clamp(G.cam.cx, halfW, W - halfW);
        G.cam.cy = clamp(G.cam.cy, halfH, H - halfH);

        // Snap if very close
        if (Math.abs(G.cam.zoom - G.cam.targetZoom) < 0.001) G.cam.zoom = G.cam.targetZoom;
    };

    G.setCameraOverride = function (cx, cy, zoom) {
        G.cam.overrideActive = true;
        G.cam.overrideZoom = Math.max(1, zoom || 1);
        G.cam.overrideCx = clamp(cx, 0, W);
        G.cam.overrideCy = clamp(cy, 0, H);
    };

    G.clearCameraOverride = function () {
        G.cam.overrideActive = false;
        G.cam.overrideZoom = 1;
        G.cam.overrideCx = W / 2;
        G.cam.overrideCy = H / 2;
    };

    G.resetCamera = function () {
        G.cam.zoom = 1;
        G.cam.targetZoom = 1;
        G.cam.cx = W / 2;
        G.cam.cy = H / 2;
        G.cam.targetCx = W / 2;
        G.cam.targetCy = H / 2;
        G.clearCameraOverride();
    };

    G.applyCameraTransform = function () {
        var ctx = G.ctx;
        if (G.cam.zoom === 1) return;
        ctx.translate(G.cam.cx, G.cam.cy);
        ctx.scale(G.cam.zoom, G.cam.zoom);
        ctx.translate(-G.cam.cx, -G.cam.cy);
    };
})(window.Game);
