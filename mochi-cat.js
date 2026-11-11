/* Mochi, a small pixel cat that walks along the bottom of the page toward your cursor.
   Click or tap it to knock it out (four different moves). Self-contained: injects its own CSS and canvas.
   Usage: <script src="mochi-cat.js"></script> just before </body>.
   Tweak: S = size of one art pixel in CSS px (2 = a 32px cat). */
(function () {
  'use strict';
  if (window.__mochiCat) return;
  window.__mochiCat = true;

  var S = 2;

  function rep(c, n) { return new Array(n + 1).join(c); }
  function R() { return Array.prototype.join.call(arguments, ''); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function backOut(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  function bounceOut(x) {
    var n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) { x -= 1.5 / d1; return n1 * x * x + 0.75; }
    if (x < 2.5 / d1) { x -= 2.25 / d1; return n1 * x * x + 0.9375; }
    x -= 2.625 / d1; return n1 * x * x + 0.984375;
  }

  /* ---------- Sprite (16x16). Letters map to PAL. ---------- */
  var ROWS = [
    rep('.', 16),
    R('..', rep('o', 3), rep('.', 6), rep('o', 3), '..'),
    R('..oCCo', rep('.', 4), 'oCCo..'),
    R('.o', rep('c', 12), 'o.'),
    R('.o', rep('c', 12), 'o.'),
    R('.o', rep('c', 12), 'o.'),
    R('.o', rep('c', 12), 'o.'),
    R('.oc', 'kk', rep('c', 6), 'kk', 'co.'),
    R('.o', rep('c', 12), 'o.'),
    R('..o', rep('c', 10), 'o..'),
    R('..oc', rep('w', 8), 'co..'),
    R('..oc', rep('w', 8), 'co..'),
    R('..occ', rep('w', 6), 'cco..'),
    R('...o', rep('c', 8), 'o...'),
    R('...oCCo', '..', 'oCCo...'),
    R('...oooo', '..', 'oooo...')
  ];
  var PAL = { o: '#2b1736', c: '#ff9ec4', C: '#e06f9c', w: '#fff0f5', k: '#ff5d73', e: '#2b1736' };
  var GHOST_PAL = { o: '#2b1736', c: '#e6f6ff', C: '#cfe6f5', w: '#f4fbff', k: '#e6f6ff', e: '#2b1736' };

  function grid(c, pal) {
    for (var y = 0; y < ROWS.length; y++) {
      for (var x = 0; x < ROWS[y].length; x++) {
        var ch = ROWS[y].charAt(x);
        if (ch === '.') continue;
        c.fillStyle = pal[ch];
        c.fillRect(x, y, 1, 1);
      }
    }
  }
  function drawFace(c, mode, ex, ey, blink) {
    c.fillStyle = PAL.e;
    if (mode === 'x') {
      [[4, 5], [6, 5], [5, 6], [4, 7], [6, 7], [9, 5], [11, 5], [10, 6], [9, 7], [11, 7]].forEach(function (p) { c.fillRect(p[0], p[1], 1, 1); });
      c.fillRect(7, 8, 2, 1);
      return;
    }
    if (mode === 'wow') {
      c.fillRect(5, 5, 2, 3); c.fillRect(9, 5, 2, 3); c.fillRect(7, 8, 2, 2);
      return;
    }
    if (blink) {
      c.fillRect(5 + ex, 6 + ey, 1, 1); c.fillRect(10 + ex, 6 + ey, 1, 1);
    } else {
      c.fillRect(5 + ex, 5 + ey, 1, 2); c.fillRect(10 + ex, 5 + ey, 1, 2);
    }
    if (ey < 1) c.fillRect(7, 8, 2, 1);
  }
  function mk() { var c = document.createElement('canvas'); c.width = 16; c.height = 16; return c; }
  function render(cv, mode, ex, ey, blink) {
    var c = cv.getContext('2d');
    c.clearRect(0, 0, 16, 16);
    grid(c, PAL);
    drawFace(c, mode, ex, ey, blink);
  }
  var cN = mk(), cX = mk(), cW = mk(), cG = mk();
  render(cN, 'norm', 0, 0, false);
  render(cX, 'x');
  render(cW, 'wow');
  (function () {
    var c = cG.getContext('2d');
    grid(c, GHOST_PAL);
    c.fillStyle = '#2b1736';
    c.fillRect(5, 5, 1, 2); c.fillRect(10, 5, 1, 2); c.fillRect(7, 8, 2, 2);
  })();
  var imgs = { norm: cN, x: cX, wow: cW, ghost: cG };

  var PIX = (function () {
    var d = cX.getContext('2d').getImageData(0, 0, 16, 16).data, out = [];
    for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++) {
      var i = (y * 16 + x) * 4;
      if (d[i + 3] > 0) out.push({ x: x, y: y, c: 'rgb(' + d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ')' });
    }
    return out;
  })();

  var FONT = {
    B: ['##.', '#.#', '##.', '#.#', '##.'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    N: ['#.#', '###', '###', '#.#', '#.#'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
    P: ['##.', '#.#', '##.', '#..', '#..'], W: ['#.#', '#.#', '###', '###', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], E: ['###', '#..', '##.', '#..', '###'],
    R: ['##.', '#.#', '##.', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###']
  };

  function init() {
    var css = document.createElement('style');
    css.textContent =
      '.mochi-cat-fx{position:fixed;left:0;top:0;pointer-events:none;z-index:800;image-rendering:pixelated}' +
      '.mochi-cat-hit{position:fixed;left:0;top:0;width:' + (16 * S) + 'px;height:' + (16 * S) + 'px;z-index:801;' +
      'cursor:inherit;background:transparent;border:0;padding:0;margin:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
      '.mochi-cat-hit:focus-visible{outline:2px solid #ff7aa8;outline-offset:2px}';
    document.head.appendChild(css);

    var cv = document.createElement('canvas');
    cv.className = 'mochi-cat-fx';
    cv.setAttribute('aria-hidden', 'true');
    var hit = document.createElement('button');
    hit.type = 'button';
    hit.className = 'mochi-cat-hit';
    hit.setAttribute('aria-label', 'Mochi the pixel cat. Press to knock it out.');
    document.body.appendChild(cv);
    document.body.appendChild(hit);
    var ctx = cv.getContext('2d');

    var cat = { x: 28, walk: 0 };
    var dpr = 1, Wp = 0, Hp = 0, G = 0;
    function size() {
      dpr = window.devicePixelRatio || 1;
      var w = window.innerWidth, h = window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      Wp = w / S; Hp = h / S; G = Math.floor(Hp) - 2;
      ctx.imageSmoothingEnabled = false;
      cat.x = clamp(cat.x, 10, Wp - 10);
    }
    size();
    window.addEventListener('resize', size);

    function drawSpr(img, o) {
      var sx = o.sx == null ? 1 : o.sx, sy = o.sy == null ? 1 : o.sy;
      if (Math.abs(sx) < 0.02 || Math.abs(sy) < 0.02) return;
      var px = o.px == null ? 8 : o.px, py = o.py == null ? 16 : o.py;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      ctx.translate(Math.round(o.x - 8 + px), Math.round(o.y - 16 + py));
      if (o.rot) ctx.rotate(o.rot);
      ctx.scale(sx, sy);
      ctx.drawImage(img, -px, -py);
      ctx.restore();
    }
    function star(x, y, c) {
      ctx.fillStyle = c;
      x = Math.round(x); y = Math.round(y);
      ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
    }
    function drawAnvil(cx, b) {
      ctx.fillStyle = '#5d5d78'; ctx.fillRect(cx - 6, b - 2, 12, 2); ctx.fillRect(cx - 3, b - 5, 6, 3);
      ctx.fillStyle = '#7b7b97'; ctx.fillRect(cx - 8, b - 8, 16, 3); ctx.fillRect(cx + 8, b - 7, 3, 1);
      ctx.fillStyle = '#a8a8c4'; ctx.fillRect(cx - 8, b - 8, 16, 1);
    }
    function drawText(str, cx, y, sc) {
      var w = str.length * 4 * sc - sc, x0 = Math.round(cx - w / 2);
      var passes = [[1, 0, '#2b1736'], [-1, 0, '#2b1736'], [0, 1, '#2b1736'], [0, -1, '#2b1736'], [0, 0, '#ffffff']];
      passes.forEach(function (p) {
        ctx.fillStyle = p[2];
        for (var i = 0; i < str.length; i++) {
          var g = FONT[str.charAt(i)];
          for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) {
            if (g[r].charAt(c) === '#') ctx.fillRect(x0 + i * 4 * sc + c * sc + p[0], y + r * sc + p[1], sc, sc);
          }
        }
      });
    }

    /* ---------- Knockout moves. A.x / A.y is where the cat stood when it was hit. ---------- */
    var ANIMS = [
      {
        name: 'Anvil', label: 'BONK', lt: 0.34, le: 1.3, lx: 0, dur: 2.4,
        draw: function (t, A) {
          var X = A.x, Y = A.y, sy = 1, sx = 1;
          if (t >= 0.34 && t < 0.42) { var k = (t - 0.34) / 0.08; sy = 1 - 0.8 * k; sx = 1 + 0.3 * k; }
          else if (t >= 0.42 && t < 1.55) { sy = 0.2; sx = 1.3; }
          else if (t >= 1.55) { var b = backOut(clamp01((t - 1.55) / 0.5)); sy = 0.2 + 0.8 * b; sx = 1.3 - 0.3 * b; }
          drawSpr(t < 0.34 ? imgs.wow : (t < 1.6 ? imgs.x : imgs.norm), { x: X, y: Y, sx: sx, sy: sy });
          var bottom, from = Y - 70;
          if (t < 0.34) { var f = t / 0.34; bottom = from + ((Y - 16) - from) * f * f; }
          else if (t < 1.3) { bottom = Y - 16 * sy; }
          else { var u = (t - 1.3) / 0.4; bottom = (Y - 3.2) - u * u * 90; }
          if (bottom > Y - 130) {
            drawAnvil(X, Math.round(bottom));
            if (t >= 0.45 && t < 1.5) {
              var cols = ['#f2a900', '#ff7aa8', '#f2a900'];
              for (var i = 0; i < 3; i++) {
                var a = t * 9 + i * 2.094;
                star(X + Math.cos(a) * 11, bottom - 12 + Math.sin(a) * 3, cols[i]);
              }
            }
          }
        }
      },
      {
        name: 'Shatter', label: 'POW', lt: 0.14, le: 1.0, lx: 0, dur: 2.3,
        start: function () {
          return PIX.map(function (p) {
            var a = Math.atan2(p.y - 9, p.x - 8) + rand(-0.6, 0.6), sp = rand(25, 62);
            return { x: p.x, y: p.y, c: p.c, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(22, 50), gy: Math.floor(rand(0, 5)) };
          });
        },
        draw: function (t, A) {
          var X = A.x, Y = A.y;
          if (t < 0.14) { var k = t / 0.14; drawSpr(imgs.wow, { x: X, y: Y, sx: 1 + 0.35 * k, sy: 1 - 0.25 * k }); return; }
          var tt = t - 0.14;
          if (tt < 0.22) {
            var len = 4 + (tt / 0.22) * 22;
            ctx.save(); ctx.globalAlpha = 1 - tt / 0.22; ctx.fillStyle = '#f2a900';
            for (var i = 0; i < 8; i++) {
              var ang = i * Math.PI / 4 + 0.39;
              for (var r = len - 6; r <= len; r++) ctx.fillRect(Math.round(X + Math.cos(ang) * r), Math.round(Y - 8 + Math.sin(ang) * r), 1, 1);
            }
            ctx.restore();
          }
          if (t < 1.5) {
            var fade = tt > 1.0 ? clamp01(1 - (tt - 1.0) / 0.3) : 1;
            ctx.save(); ctx.globalAlpha = fade;
            A.d.forEach(function (p) {
              var x = X - 8 + p.x + p.vx * tt, y = Y - 16 + p.y + p.vy * tt + 70 * tt * tt;
              y = Math.min(y, Y + p.gy - 1);
              ctx.fillStyle = p.c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            });
            ctx.restore();
          } else if (t >= 1.55) {
            var s = backOut(clamp01((t - 1.55) / 0.5));
            drawSpr(imgs.norm, { x: X, y: Y, sx: s, sy: s });
          }
        }
      },
      {
        name: 'Launch', label: 'BYE', lt: 0.1, le: 1.0, lx: 0, dur: 2.3,
        draw: function (t, A) {
          var X = A.x, Y = A.y, dir = X > Wp / 2 ? -1 : 1;
          if (t < 1.2) {
            for (var g = 3; g >= 0; g--) {
              var k = Math.max(0, t - g * 0.045) / 1.1;
              if (k > 1) continue;
              drawSpr(t < 0.12 ? imgs.wow : imgs.x, {
                x: X + dir * 95 * k, y: Y - 120 * k + 40 * k * k, rot: dir * k * 20, sx: 1 - 0.55 * k, sy: 1 - 0.55 * k,
                px: 8, py: 8, alpha: 1 - g * 0.22
              });
            }
          } else if (t >= 1.45) {
            var f = clamp01((t - 1.45) / 0.8), from = Y - 90;
            drawSpr(imgs.norm, { x: X, y: from + (Y - from) * bounceOut(f) });
          }
        }
      },
      {
        name: 'Ghost', label: 'RIP', lt: 0.45, le: 1.7, lx: 0, dur: 2.6,
        draw: function (t, A) {
          var X = A.x, Y = A.y, dir = X > Wp / 2 ? 1 : -1;
          if (t < 1.9) {
            var k = clamp01(t / 0.45);
            /* falls over toward the side with more room */
            drawSpr(t < 0.12 ? imgs.wow : imgs.x, dir < 0
              ? { x: X, y: Y, rot: -(k * k) * Math.PI / 2, px: 0, py: 16 }
              : { x: X, y: Y, rot: (k * k) * Math.PI / 2, px: 16, py: 16 });
          } else {
            var s = backOut(clamp01((t - 1.9) / 0.5));
            drawSpr(imgs.norm, { x: X, y: Y, sx: s, sy: s });
          }
          if (t >= 0.5 && t < 2.3) {
            var kk = clamp01((t - 0.5) / 1.7), e = 1 - (1 - kk) * (1 - kk);
            var gx = X + dir * -16 + Math.sin(t * 5) * 4, gy = Y - 8 - 42 * e;
            var al = kk < 0.7 ? 0.9 : 0.9 * (1 - (kk - 0.7) / 0.3);
            drawSpr(imgs.ghost, { x: gx, y: gy + 8, alpha: al });
            ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#e0a800';
            var hx = Math.round(gx), hy = Math.round(gy);
            ctx.fillRect(hx - 4, hy - 12, 8, 1); ctx.fillRect(hx - 5, hy - 11, 1, 1);
            ctx.fillRect(hx + 4, hy - 11, 1, 1); ctx.fillRect(hx - 4, hy - 10, 8, 1);
            ctx.restore();
          }
        }
      }
    ];

    var A = null, lastMove = -1;
    function trigger() {
      var i;
      do { i = Math.floor(Math.random() * ANIMS.length); } while (i === lastMove);
      lastMove = i;
      var def = ANIMS[i];
      A = { def: def, t0: performance.now() / 1000, d: def.start ? def.start() : null, x: cat.x, y: G };
    }
    hit.addEventListener('click', trigger);

    var ptr = { x: 0, y: 0, on: false };
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
    });
    document.documentElement.addEventListener('mouseleave', function () { ptr.on = false; });

    var blinkAt = 2, blinkUntil = 0, last = 0;
    function frame(ms) {
      var now = ms / 1000, dt = Math.min(0.05, now - last);
      last = now;
      var t = A ? now - A.t0 : 0;
      if (A && t >= A.def.dur) A = null;

      var ex = 0, ey = 0, walking = false;
      if (ptr.on) {
        var mx = ptr.x / S, my = ptr.y / S;
        ex = clamp(Math.round((mx - cat.x) / 14), -1, 1);
        ey = clamp(Math.round((my - (G - 8)) / 14), -1, 1);
        if (!A) {
          var dx = clamp(mx, 10, Wp - 10) - cat.x;
          if (Math.abs(dx) > 3) {
            cat.x += (dx > 0 ? 1 : -1) * Math.min(Math.abs(dx), 62 * dt);
            cat.walk += dt * 9;
            walking = true;
          }
        }
      }
      if (!walking) cat.walk = 0;
      if (now > blinkAt) { blinkUntil = now + 0.14; blinkAt = now + rand(2.2, 5); }
      render(cN, 'norm', ex, ey, now < blinkUntil);

      ctx.setTransform(dpr * S, 0, 0, dpr * S, 0, 0);
      ctx.clearRect(0, 0, Wp + 1, Hp + 1);
      var sx = A ? A.x : cat.x;
      ctx.fillStyle = 'rgba(43,23,54,0.22)';
      ctx.fillRect(Math.round(sx) - 6, G, 12, 1); ctx.fillRect(Math.round(sx) - 4, G + 1, 8, 1);

      if (A) {
        A.def.draw(t, A);
        if (t >= A.def.lt && t < A.def.le) drawText(A.def.label, A.x + A.def.lx, Math.max(2, A.y - 44), (t - A.def.lt) < 0.1 ? 3 : 2);
      } else {
        var hop = walking ? (Math.floor(cat.walk) % 2) : (Math.floor(now * 1.6) % 2 ? -1 : 0);
        drawSpr(cN, { x: cat.x, y: G - (walking ? hop : -hop) });
      }

      hit.style.transform = 'translate(' + Math.round((sx - 8) * S) + 'px,' + Math.round((G - 16) * S) + 'px)';
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
