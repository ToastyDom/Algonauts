/* Algonauts 2027 — draft site behaviour (v2)
   - navigation (scroll state, mobile overlay)
   - favicon that follows the colour scheme
   - floating hero particles (from the announcement page)
   - pixel icons rendered from small character maps
   - tabs on the sub pages (deep-linkable: challenge.html#rules)
   - placeholder links (href="#") do nothing until a real URL is added
   - the gameplay loop pauses off screen and for reduced motion */
(function () {
    'use strict';

    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------------- Navigation ---------------- */
    function initNav() {
        var nav = document.getElementById('nav');
        if (nav) {
            var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 40); };
            onScroll();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        var toggle = document.getElementById('nav-toggle');
        var overlay = document.getElementById('nav-overlay');
        if (!toggle || !overlay) return;
        function setOpen(open) {
            overlay.classList.toggle('open', open);
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.classList.toggle('menu-open', open);
        }
        toggle.addEventListener('click', function () { setOpen(!overlay.classList.contains('open')); });
        overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
        overlay.addEventListener('click', function (e) { if (e.target === overlay) setOpen(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    }

    function initFavicon() {
        var fav = document.getElementById('favicon');
        if (!fav || !window.matchMedia) return;
        var base = fav.getAttribute('data-base') || 'img/logos/';
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var update = function () { fav.href = base + (mq.matches ? 'logo_icon_dark.png' : 'logo_icon_light.png'); };
        update();
        if (mq.addEventListener) mq.addEventListener('change', update);
    }

    function initParticles() {
        var layer = document.getElementById('hero-particles');
        if (!layer || reduceMotion) return;
        var colors = ['124, 245, 255', '182, 168, 255', '255, 255, 255', '150, 235, 255'];
        for (var i = 0; i < 18; i++) {
            var p = document.createElement('span');
            p.className = 'p';
            var size = 2 + Math.random() * 5;
            var dur = 16 + Math.random() * 18;
            var col = colors[i % colors.length];
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.left = (Math.random() * 100) + '%';
            p.style.background = 'radial-gradient(circle, rgba(' + col + ', 0.95), rgba(' + col + ', 0) 70%)';
            p.style.animationDuration = dur + 's';
            p.style.animationDelay = (-Math.random() * dur) + 's';
            p.style.setProperty('--pdx', (Math.random() * 140 - 70) + 'px');
            p.style.setProperty('--pmax', (0.35 + Math.random() * 0.5).toFixed(2));
            layer.appendChild(p);
        }
    }

    /* ---------------- Pixel icons ----------------
       'x' = currentColor, 'a' = accent colour (--px-accent) */
    var ICONS = {
        paper: [
            '..xxxxxxxx....',
            '..x......xx...',
            '..x......xax..',
            '..x......xxxx.',
            '..x.........x.',
            '..x.aaaaaa..x.',
            '..x.........x.',
            '..x.aaaaaaa.x.',
            '..x.........x.',
            '..x.aaaaaaa.x.',
            '..x.........x.',
            '..x.aaaa....x.',
            '..x.........x.',
            '..xxxxxxxxxxx.'
        ],
        kit: [
            '..............',
            '.xxxxxxxxxxxx.',
            '.x..........x.',
            '.x.a........x.',
            '.x..a.......x.',
            '.x...a......x.',
            '.x..a.......x.',
            '.x.a..aaaa..x.',
            '.x..........x.',
            '.xxxxxxxxxxxx.',
            '...x......x...',
            'xxxxxxxxxxxxxx',
            'xxxxxxxxxxxxxx',
            '..............'
        ],
        data: [
            '...xxxxxxxx...',
            '.xxaaaaaaaaxx.',
            '.xaaaaaaaaaax.',
            '.xxaaaaaaaaxx.',
            '.x.xxxxxxxx.x.',
            '.x..........x.',
            '.xx........xx.',
            '.x.xxxxxxxx.x.',
            '.x..........x.',
            '.xx........xx.',
            '.x.xxxxxxxx.x.',
            '.x..........x.',
            '..xx......xx..',
            '....xxxxxx....'
        ],
        trophy: [
            '..............',
            '.xxxxxxxxxxxx.',
            '.x.xaaaaaax.x.',
            '.x.xaaaaaax.x.',
            '..xxaaaaaaxx..',
            '...xaaaaaax...',
            '....xaaaax....',
            '.....xaax.....',
            '......xx......',
            '......xx......',
            '.....xxxx.....',
            '....xxxxxx....',
            '....xxxxxx....',
            '..............'
        ],
        rocket: [
            '....x....',
            '...xax...',
            '...xax...',
            '..xxxxx..',
            '..x.a.x..',
            '..xxxxx..',
            '.xx.x.xx.',
            '.x..a..x.',
            '....a....'
        ],
        bolt: [
            '.....xxx.',
            '....xxx..',
            '...xxx...',
            '..xxxxxx.',
            '.xxxxxx..',
            '....xx...',
            '...xx....',
            '..xa.....',
            '.a.......'
        ],
        people: [
            '..xx..aa.',
            '.xxxxaaaa',
            '..xx..aa.',
            '.........',
            '.xxxxaaaa',
            'xxxxxaaaa',
            'xxxxxaaaa',
            'xxxxxaaaa',
            '.........'
        ],
        star: [
            '....x....',
            '....x....',
            '...xax...',
            'xxxxaxxxx',
            '.xxaaaxx.',
            '..xxaxx..',
            '..xx.xx..',
            '.xx...xx.',
            '.x.....x.'
        ]
    };

    function pixelSvg(map) {
        var h = map.length, w = map[0].length, out = '';
        for (var y = 0; y < h; y++) {
            var row = map[y], x = 0;
            while (x < w) {
                var ch = row.charAt(x);
                if (ch === '.') { x++; continue; }
                var x0 = x;
                while (x < w && row.charAt(x) === ch) x++;
                out += '<rect class="' + (ch === 'a' ? 'a' : 'x') + '" x="' + x0 + '" y="' + y + '" width="' + (x - x0) + '" height="1"/>';
            }
        }
        return '<svg viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true" focusable="false">' + out + '</svg>';
    }
    function initIcons() {
        document.querySelectorAll('[data-px]').forEach(function (el) {
            var map = ICONS[el.getAttribute('data-px')];
            if (map) el.innerHTML = pixelSvg(map);
        });
    }

    /* ---------------- Tabs ---------------- */
    function initTabs() {
        var bar = document.querySelector('[data-tabs]');
        if (!bar) return;
        var tabs = Array.prototype.slice.call(bar.querySelectorAll('[role="tab"]'));
        var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
        var navH = 64;

        function scrollToBar() {
            var y = bar.getBoundingClientRect().top + window.scrollY - navH;
            if (window.scrollY > y + 1) window.scrollTo(0, y);
        }
        function show(i, opts) {
            opts = opts || {};
            tabs.forEach(function (t, j) {
                var on = i === j;
                t.setAttribute('aria-selected', on ? 'true' : 'false');
                t.tabIndex = on ? 0 : -1;
                panels[j].hidden = !on;
            });
            if (opts.hash) history.replaceState(null, '', '#' + panels[i].id);
            if (opts.scroll) scrollToBar();
            // keep the active tab visible on narrow screens
            var t = tabs[i], inner = t.parentNode;
            if (inner.scrollWidth > inner.clientWidth) inner.scrollLeft = i === 0 ? 0 : t.offsetLeft - inner.offsetLeft - 16;
        }
        function fromHash(initial) {
            var id = decodeURIComponent(location.hash.slice(1));
            var el = id && document.getElementById(id);
            var idx = -1;
            if (el) panels.forEach(function (p, j) { if (p === el || p.contains(el)) idx = j; });
            if (idx < 0) { show(0); return; }
            show(idx);
            if (el !== panels[idx]) {
                requestAnimationFrame(function () { el.scrollIntoView(); });
            } else if (!initial) {
                scrollToBar();
            } else {
                requestAnimationFrame(function () {
                    window.scrollTo(0, bar.getBoundingClientRect().top + window.scrollY - navH);
                });
            }
        }
        tabs.forEach(function (t, i) {
            t.addEventListener('click', function (e) { e.preventDefault(); show(i, { hash: true, scroll: true }); });
            t.addEventListener('keydown', function (e) {
                var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                var n = (i + d + tabs.length) % tabs.length;
                show(n, { hash: true });
                tabs[n].focus();
            });
        });
        fromHash(true);
        window.addEventListener('hashchange', function () { fromHash(false); });
    }

    /* ---------------- Placeholder links ---------------- */
    function initPlaceholders() {
        document.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href="#"]');
            if (a) e.preventDefault();
        });
    }

    /* ---------------- Gameplay loop ---------------- */
    function initVideos() {
        document.querySelectorAll('video[data-loop]').forEach(function (v) {
            var btn = v.parentNode.querySelector('.loop-toggle');
            var userPaused = reduceMotion;   // reduced motion: start paused, play on request
            function play() { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
            function sync() {
                if (!btn) return;
                btn.classList.toggle('is-paused', v.paused);
                btn.setAttribute('aria-label', v.paused ? 'Play gameplay video' : 'Pause gameplay video');
            }
            if (reduceMotion) { v.removeAttribute('autoplay'); v.pause(); }
            v.addEventListener('play', sync);
            v.addEventListener('pause', sync);
            if (btn) btn.addEventListener('click', function () {
                if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
            });
            sync();
            if (!('IntersectionObserver' in window)) return;
            // pause off screen; resume on screen unless the visitor paused it
            new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { if (!userPaused) play(); }
                    else if (!v.paused) v.pause();
                });
            }).observe(v);
        });
    }

    /* ---------------- Hero stage: click the blocks or Mario to replay ----------------
       The scene plays once via CSS (class "play"). Replaying restarts the CSS
       animations without a start delay. CSS turns all of it off on small
       screens and with reduced motion. */
    function initStage() {
        var stage = document.getElementById('hero-stage');
        if (!stage || reduceMotion) return;
        function replay() {
            if (window.matchMedia && window.matchMedia('(max-width: 960px)').matches) return;
            stage.classList.remove('play');
            stage.style.setProperty('--D', '0s');
            void stage.offsetWidth;          // restart animations
            stage.classList.add('play');
        }
        stage.querySelectorAll('.hs-blk-a, .hs-m').forEach(function (el) { el.addEventListener('click', replay); });
    }

    function init() {
        initNav();
        initFavicon();
        initParticles();
        initIcons();
        initTabs();
        initPlaceholders();
        initVideos();
        initStage();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
