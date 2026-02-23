// ═══════════════════════════════════════════════════════════════════
// KNIGHT DASH — Input Manager
// ═══════════════════════════════════════════════════════════════════

(function (G) {
    const keys = {};
    const justPressed = {};
    const prevKeys = {};

    function normalizeKey(rawKey) {
        var key = (rawKey || '').toLowerCase();
        if (key === 'spacebar') key = ' ';
        return key;
    }

    function isGameKey(key) {
        return key === 'a' || key === 'd' || key === 'w' || key === 's' || key === 'q' || key === 'e' ||
            key === 'j' || key === 'l' || key === 'i' || key === 'k' || key === 'u' || key === 'o' ||
            key === 'arrowup' || key === 'arrowdown' || key === 'enter' || key === ' ' || key === 'r';
    }

    function clearInputState() {
        for (var k in keys) {
            keys[k] = false;
            justPressed[k] = false;
            prevKeys[k] = false;
        }
    }

    window.addEventListener('keydown', function (e) {
        var key = normalizeKey(e.key);
        if (!isGameKey(key)) return;
        keys[key] = true;
        e.preventDefault();
    });
    window.addEventListener('keyup', function (e) {
        var key = normalizeKey(e.key);
        if (!isGameKey(key)) return;
        keys[key] = false;
        e.preventDefault();
    });
    window.addEventListener('blur', clearInputState);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) clearInputState();
    });

    G.keys = keys;
    G.justPressed = justPressed;

    G.updateInput = function () {
        for (var k in keys) {
            justPressed[k] = keys[k] && !prevKeys[k];
            prevKeys[k] = keys[k];
        }
    };

    G.anyKeyJustPressed = function () {
        for (var k in justPressed) {
            if (justPressed[k]) return true;
        }
        return false;
    };
})(window.Game);
