/* Pixel pets: a cream cat, a soft pink hamster and a yellow duck (20px each).
   They walk along the bottom of the page toward your cursor and look at it.
   Click or tap one to knock it out (four different moves), then it bounces back.
   Self-contained: injects its own CSS and canvas.
   Usage: <script src="pixel-pets.js"></script> just before </body>.
   Tweak: S = size of one art pixel in CSS px (1 = 20px pets, 2 = 40px pets). */
(function () {
  'use strict';
  if (window.__pixelPets) return;
  window.__pixelPets = true;

  var S = 1,5, N = 20, OUT = '#2b1736';

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

  /* ---------- Sprite building (20x20). Shapes first, then an automatic dark outline. ---------- */
  function mk() { var c = document.createElement('canvas'); c.width = N; c.height = N; return c; }
  function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
  function ell(c, cx, cy, rx, ry, col) {
    c.fillStyle = col;
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) c.fillRect(x, y, 1, 1);
    }
  }
  function outline(c) {
    var id = c.getImageData(0, 0, N, N), d = id.data, out = new Uint8ClampedArray(d.length);
    out.set(d);
    function op(x, y) { return x >= 0 && y >= 0 && x < N && y < N && d[(y * N + x) * 4 + 3] > 0; }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var i = (y * N + x) * 4;
      if (d[i + 3] === 0 && (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) {
        out[i] = 0x2b; out[i + 1] = 0x17; out[i + 2] = 0x36; out[i + 3] = 255;
      }
    }
    c.putImageData(new ImageData(out, N, N), 0, 0);
  }

  function drawCat(c) {
    var B = '#f6e7c8', D = '#e0c58f', L = '#fffaf0', E = '#f2b5a0', K = '#ffb3a7', Nz = '#e58f8f';
    [[3, 2, 2], [3, 3, 3], [3, 4, 4], [3, 5, 5]].forEach(function (r) {
      rect(c, r[0], r[1], r[2], 1, B); rect(c, N - r[0] - r[2], r[1], r[2], 1, B);
    });
    rect(c, 4, 3, 1, 1, E); rect(c, 4, 4, 2, 1, E); rect(c, N - 5, 3, 1, 1, E); rect(c, N - 6, 4, 2, 1, E);
    ell(c, 10, 11, 8.4, 7.4, B);
    ell(c, 6.5, 17.5, 2.3, 1.3, D); ell(c, 13.5, 17.5, 2.3, 1.3, D);
    ell(c, 10, 14, 4.6, 3.4, L);
    rect(c, 4, 11, 2, 1, K); rect(c, 14, 11, 2, 1, K);
    rect(c, 9, 10, 2, 1, Nz);
  }
  function drawHamster(c) {
    var P = '#ffc9d6', D = '#f0a3b8', L = '#fff0f3', I = '#f08aa5', K = '#ff9eb5', Nz = '#d9607f', M = '#b0536c';
    ell(c, 4.6, 4.8, 2.4, 2.4, P); ell(c, 15.4, 4.8, 2.4, 2.4, P);
    ell(c, 4.6, 4.8, 1.2, 1.2, I); ell(c, 15.4, 4.8, 1.2, 1.2, I);
    ell(c, 10, 11.3, 8.8, 7.1, P);
    ell(c, 6.3, 17.6, 2.2, 1.2, D); ell(c, 13.7, 17.6, 2.2, 1.2, D);
    ell(c, 10, 13, 6.8, 4.4, L);
    rect(c, 3, 12, 2, 2, K); rect(c, 15, 12, 2, 2, K);
    rect(c, 9, 11, 2, 1, Nz); rect(c, 9, 12, 2, 1, M);
  }
  function drawDuck(c) {
    var Y = '#ffe14d', D = '#f4c430', L = '#fff3a8', Bk = '#ff9f2e', Bd = '#e8861a', K = '#ffb08a';
    rect(c, 9, 2, 2, 2, Y); rect(c, 8, 3, 1, 1, Y);
    ell(c, 10, 11, 7.6, 7, Y);
    ell(c, 6.2, 17.8, 2.4, 1.1, Bk); ell(c, 13.8, 17.8, 2.4, 1.1, Bk);
    ell(c, 3.8, 12.5, 1.9, 2.8, D); ell(c, 16.2, 12.5, 1.9, 2.8, D);
    ell(c, 10, 14.2, 4.2, 3.2, L);
    rect(c, 4, 10, 2, 1, K); rect(c, 14, 10, 2, 1, K);
    rect(c, 7, 10, 6, 2, Bk); rect(c, 8, 12, 4, 1, Bd);
  }

  var SPECIES = [
    { key: 'cat',     label: 'Cream cat',    draw: drawCat,     mouth: true,  speed: 125, step: 9,  off: -26, x0: 24 },
    { key: 'hamster', label: 'Pink hamster', draw: drawHamster, mouth: true,  speed: 150, step: 12, off: 0,   x0: 52 },
    { key: 'duck',    label: 'Yellow duck',  draw: drawDuck,    mouth: false, speed: 95,  step: 7,  off: 26,  x0: 80, waddle: true }
  ];

  function drawFace(c, sp, mode, ex, ey, blink) {
    c.fillStyle = OUT;
    if (mode === 'x') {
      [[5, 8], [7, 8], [6, 9], [5, 10], [7, 10], [12, 8], [14, 8], [13, 9], [12, 10], [14, 10]].forEach(function (p) { c.fillRect(p[0], p[1], 1, 1); });
      return;
    }
    if (mode === 'wow') {
      c.fillRect(5, 7, 2, 4); c.fillRect(13, 7, 2, 4);
      if (sp.mouth) c.fillRect(9, 12, 2, 2);
      return;
    }
    if (blink) { c.fillRect(5 + ex, 9 + ey, 2, 1); c.fillRect(13 + ex, 9 + ey, 2, 1); }
    else { c.fillRect(5 + ex, 8 + ey, 2, 2); c.fillRect(13 + ex, 8 + ey, 2, 2); }
  }
  function paint(p, cv, mode, ex, ey, blink) {
    var c = cv.getContext('2d');
    c.clearRect(0, 0, N, N);
    c.drawImage(p.base, 0, 0);
    drawFace(c, p.sp, mode, ex, ey, blink);
  }
  function makePet(sp) {
    var p = { sp: sp, base: mk(), imgs: { norm: mk(), x: mk(), wow: mk(), ghost: mk() }, x: sp.x0, walk: 0, A: null, last: -1, ex: 0, ey: 0, walking: false, blinkAt: rand(1, 4), blinkUntil: 0, phase: rand(0, 3) };
    var bc = p.base.getContext('2d');
    sp.draw(bc); outline(bc);
    paint(p, p.imgs.x, 'x'); paint(p, p.imgs.wow, 'wow');
    var gc = p.imgs.ghost.getContext('2d');
    gc.drawImage(p.base, 0, 0);
    var id = gc.getImageData(0, 0, N, N), d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0 && !(d[i] === 0x2b && d[i + 1] === 0x17 && d[i + 2] === 0x36)) { d[i] = 0xea; d[i + 1] = 0xf6; d[i + 2] = 0xff; }
    }
    gc.putImageData(id, 0, 0);
    gc.fillStyle = OUT; gc.fillRect(5, 8, 2, 2); gc.fillRect(13, 8, 2, 2); gc.fillRect(9, 12, 2, 2);
    var xd = p.imgs.x.getContext('2d').getImageData(0, 0, N, N).data;
    p.pix = [];
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var j = (y * N + x) * 4;
      if (xd[j + 3] > 0) p.pix.push({ x: x, y: y, c: 'rgb(' + xd[j] + ',' + xd[j + 1] + ',' + xd[j + 2] + ')' });
    }
    return p;
  }

  var FONT = {
    B: ['##.', '#.#', '##.', '#.#', '##.'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
    N: ['#.#', '###', '###', '#.#', '#.#'], K: ['#.#', '#.#', '##.', '#.#', '#.#'],
    P: ['##.', '#.#', '##.', '#..', '#..'], W: ['#.#', '#.#', '###', '###', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], E: ['###', '#..', '##.', '#..', '###'],
    R: ['##.', '#.#', '##.', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###']
  };

  function init() {
    var HIT = Math.max(24, N * S + 6);
    var css = document.createElement('style');
    css.textContent =
      '.pixel-pets-fx{position:fixed;left:0;top:0;pointer-events:none;z-index:800;image-rendering:pixelated}' +
      '.pixel-pets-hit{position:fixed;left:0;top:0;width:' + HIT + 'px;height:' + HIT + 'px;z-index:801;' +
      'cursor:inherit;background:transparent;border:0;padding:0;margin:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
      '.pixel-pets-hit:focus-visible{outline:2px solid #ff7aa8;outline-offset:1px}';
    document.head.appendChild(css);

    var cv = document.createElement('canvas');
    cv.className = 'pixel-pets-fx';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');

    var pets = SPECIES.map(makePet);
    pets.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pixel-pets-hit';
      b.setAttribute('aria-label', p.sp.label + '. Press to knock it out.');
      b.addEventListener('click', function () { trigger(p); });
      document.body.appendChild(b);
      p.hit = b;
    });

    var pr = 1, Wp = 0, Hp = 0, G = 0;
    function size() {
      var dpr = window.devicePixelRatio || 1;
      pr = Math.max(1, Math.round(dpr));
      var w = window.innerWidth, h = window.innerHeight;
      cv.width = Math.round(w * pr); cv.height = Math.round(h * pr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      Wp = w / S; Hp = h / S; G = Math.floor(Hp) - 2;
      ctx.imageSmoothingEnabled = false;
      pets.forEach(function (p) { p.x = clamp(p.x, 12, Wp - 12); });
    }
    size();
    window.addEventListener('resize', size);

    function drawSpr(img, o) {
      var sx = o.sx == null ? 1 : o.sx, sy = o.sy == null ? 1 : o.sy;
      if (Math.abs(sx) < 0.02 || Math.abs(sy) < 0.02) return;
      var px = o.px == null ? N / 2 : o.px, py = o.py == null ? N : o.py;
      ctx.save();
      ctx.globalAlpha = o.alpha == null ? 1 : o.alpha;
      ctx.translate(Math.round(o.x - N / 2 + px), Math.round(o.y - N + py));
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
      ctx.fillStyle = '#5d5d78'; ctx.fillRect(cx - 4, b - 2, 8, 2); ctx.fillRect(cx - 2, b - 4, 4, 2);
      ctx.fillStyle = '#7b7b97'; ctx.fillRect(cx - 6, b - 6, 12, 2); ctx.fillRect(cx + 6, b - 5, 2, 1);
      ctx.fillStyle = '#a8a8c4'; ctx.fillRect(cx - 6, b - 6, 12, 1);
    }
    function drawText(str, cx, y, sc) {
      var w = str.length * 4 * sc - sc, x0 = Math.round(cx - w / 2);
      var passes = [[1, 0, OUT], [-1, 0, OUT], [0, 1, OUT], [0, -1, OUT], [0, 0, '#ffffff']];
      passes.forEach(function (ps) {
        ctx.fillStyle = ps[2];
        for (var i = 0; i < str.length; i++) {
          var g = FONT[str.charAt(i)];
          for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) {
            if (g[r].charAt(c) === '#') ctx.fillRect(x0 + i * 4 * sc + c * sc + ps[0], y + r * sc + ps[1], sc, sc);
          }
        }
      });
    }

    /* ---------- Knockout moves. A.x / A.y is where the pet stood when it was hit. ---------- */
    var ANIMS = [
      {
        name: 'Anvil', label: 'BONK', lt: 0.34, le: 1.3, dur: 2.4,
        draw: function (t, A) {
          var X = A.x, Y = A.y, im = A.p.imgs, sy = 1, sx = 1;
          if (t >= 0.34 && t < 0.42) { var k = (t - 0.34) / 0.08; sy = 1 - 0.8 * k; sx = 1 + 0.3 * k; }
          else if (t >= 0.42 && t < 1.55) { sy = 0.2; sx = 1.3; }
          else if (t >= 1.55) { var b = backOut(clamp01((t - 1.55) / 0.5)); sy = 0.2 + 0.8 * b; sx = 1.3 - 0.3 * b; }
          drawSpr(t < 0.34 ? im.wow : (t < 1.6 ? im.x : im.norm), { x: X, y: Y, sx: sx, sy: sy });
          var bottom, from = Y - 70;
          if (t < 0.34) { var f = t / 0.34; bottom = from + ((Y - N) - from) * f * f; }
          else if (t < 1.3) { bottom = Y - N * sy; }
          else { var u = (t - 1.3) / 0.4; bottom = (Y - N * 0.2) - u * u * 90; }
          if (bottom > Y - 130) {
            drawAnvil(X, Math.round(bottom));
            if (t >= 0.45 && t < 1.5) {
              var cols = ['#f2a900', '#ff7aa8', '#f2a900'];
              for (var i = 0; i < 3; i++) {
                var a = t * 9 + i * 2.094;
                star(X + Math.cos(a) * 9, bottom - 10 + Math.sin(a) * 3, cols[i]);
              }
            }
          }
        }
      },
      {
        name: 'Shatter', label: 'POW', lt: 0.14, le: 1.0, dur: 2.3,
        start: function (p) {
          return p.pix.map(function (q) {
            var a = Math.atan2(q.y - 11, q.x - 10) + rand(-0.6, 0.6), sp = rand(25, 62);
            return { x: q.x, y: q.y, c: q.c, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - rand(22, 50), gy: Math.floor(rand(0, 5)) };
          });
        },
        draw: function (t, A) {
          var X = A.x, Y = A.y, im = A.p.imgs;
          if (t < 0.14) { var k = t / 0.14; drawSpr(im.wow, { x: X, y: Y, sx: 1 + 0.35 * k, sy: 1 - 0.25 * k }); return; }
          var tt = t - 0.14;
          if (tt < 0.22) {
            var len = 4 + (tt / 0.22) * 18;
            ctx.save(); ctx.globalAlpha = 1 - tt / 0.22; ctx.fillStyle = '#f2a900';
            for (var i = 0; i < 8; i++) {
              var ang = i * Math.PI / 4 + 0.39;
              for (var r = len - 5; r <= len; r++) ctx.fillRect(Math.round(X + Math.cos(ang) * r), Math.round(Y - 10 + Math.sin(ang) * r), 1, 1);
            }
            ctx.restore();
          }
          if (t < 1.5) {
            var fade = tt > 1.0 ? clamp01(1 - (tt - 1.0) / 0.3) : 1;
            ctx.save(); ctx.globalAlpha = fade;
            A.d.forEach(function (q) {
              var x = X - N / 2 + q.x + q.vx * tt, y = Y - N + q.y + q.vy * tt + 70 * tt * tt;
              y = Math.min(y, Y + q.gy - 1);
              ctx.fillStyle = q.c; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
            });
            ctx.restore();
          } else if (t >= 1.55) {
            var s = backOut(clamp01((t - 1.55) / 0.5));
            drawSpr(im.norm, { x: X, y: Y, sx: s, sy: s });
          }
        }
      },
      {
        name: 'Launch', label: 'BYE', lt: 0.1, le: 1.0, dur: 2.3,
        draw: function (t, A) {
          var X = A.x, Y = A.y, im = A.p.imgs, dir = X > Wp / 2 ? -1 : 1;
          if (t < 1.2) {
            for (var g = 3; g >= 0; g--) {
              var k = Math.max(0, t - g * 0.045) / 1.1;
              if (k > 1) continue;
              drawSpr(t < 0.12 ? im.wow : im.x, {
                x: X + dir * 110 * k, y: Y - 110 * k + 35 * k * k, rot: dir * k * 20, sx: 1 - 0.9 * k, sy: 1 - 0.9 * k,
                px: N / 2, py: N / 2, alpha: 1 - g * 0.22
              });
            }
          } else if (t >= 1.45) {
            var f = clamp01((t - 1.45) / 0.8), from = Y - 90;
            drawSpr(im.norm, { x: X, y: from + (Y - from) * bounceOut(f) });
          }
        }
      },
      {
        name: 'Ghost', label: 'RIP', lt: 0.45, le: 1.7, dur: 2.6,
        draw: function (t, A) {
          var X = A.x, Y = A.y, im = A.p.imgs, fd = X > Wp / 2 ? -1 : 1;
          if (t < 1.9) {
            var k = clamp01(t / 0.45);
            drawSpr(t < 0.12 ? im.wow : im.x, { x: X, y: Y, rot: fd * (k * k) * Math.PI / 2, px: fd < 0 ? 0 : N, py: N });
          } else {
            var s = backOut(clamp01((t - 1.9) / 0.5));
            drawSpr(im.norm, { x: X, y: Y, sx: s, sy: s });
          }
          if (t >= 0.5 && t < 2.3) {
            var kk = clamp01((t - 0.5) / 1.7), e = 1 - (1 - kk) * (1 - kk);
            var gx = X + fd * N + Math.sin(t * 5) * 3, gy = Y - N / 2 - 40 * e;
            var al = kk < 0.7 ? 0.9 : 0.9 * (1 - (kk - 0.7) / 0.3);
            drawSpr(im.ghost, { x: gx, y: gy + N / 2, alpha: al });
            ctx.save(); ctx.globalAlpha = al; ctx.fillStyle = '#e0a800';
            var hx = Math.round(gx), hy = Math.round(gy);
            ctx.fillRect(hx - 4, hy - 13, 8, 1); ctx.fillRect(hx - 5, hy - 12, 1, 1);
            ctx.fillRect(hx + 4, hy - 12, 1, 1); ctx.fillRect(hx - 4, hy - 11, 8, 1);
            ctx.restore();
          }
        }
      }
    ];

    function trigger(p) {
      var i;
      do { i = Math.floor(Math.random() * ANIMS.length); } while (i === p.last);
      p.last = i;
      var def = ANIMS[i];
      p.A = { def: def, p: p, t0: performance.now() / 1000, d: def.start ? def.start(p) : null, x: p.x, y: G };
    }

    var ptr = { x: 0, y: 0, on: false };
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true;
    });
    document.documentElement.addEventListener('mouseleave', function () { ptr.on = false; });

    var MIN_GAP = 22 / S;
    function separate() {
      var sorted = pets.slice().sort(function (a, b) { return a.x - b.x; });
      for (var pass = 0; pass < 2; pass++) {
        for (var i = 1; i < sorted.length; i++) {
          var a = sorted[i - 1], b = sorted[i], d = MIN_GAP - (b.x - a.x);
          if (d <= 0) continue;
          var am = !a.A, bm = !b.A;
          if (am && bm) { a.x -= d / 2; b.x += d / 2; }
          else if (am) a.x -= d;
          else if (bm) b.x += d;
        }
      }
      pets.forEach(function (p) { if (!p.A) p.x = clamp(p.x, 12, Wp - 12); });
    }

    var last = 0;
    function frame(ms) {
      var now = ms / 1000, dt = Math.min(0.05, now - last);
      last = now;

      pets.forEach(function (p) {
        if (p.A && now - p.A.t0 >= p.A.def.dur) p.A = null;
        p.ex = 0; p.ey = 0; p.walking = false;
        if (ptr.on) {
          var mx = ptr.x / S, my = ptr.y / S;
          p.ex = clamp(Math.round((mx - p.x) / 14), -1, 1);
          p.ey = clamp(Math.round((my - (G - N / 2)) / 14), -1, 1);
          if (!p.A) {
            var dx = clamp(mx + p.sp.off / S, 12, Wp - 12) - p.x;
            if (Math.abs(dx) > 3) {
              p.x += (dx > 0 ? 1 : -1) * Math.min(Math.abs(dx), p.sp.speed / S * dt);
              p.walk += dt * p.sp.step;
              p.walking = true;
            }
          }
        }
        if (!p.walking) p.walk = 0;
        if (now > p.blinkAt) { p.blinkUntil = now + 0.14; p.blinkAt = now + rand(2.2, 5); }
      });
      separate();

      ctx.setTransform(pr * S, 0, 0, pr * S, 0, 0);
      ctx.clearRect(0, 0, Wp + 1, Hp + 1);
      ctx.fillStyle = 'rgba(43,23,54,0.2)';
      pets.forEach(function (p) {
        var sx = Math.round(p.A ? p.A.x : p.x);
        ctx.fillRect(sx - 6, G, 12, 1); ctx.fillRect(sx - 4, G + 1, 8, 1);
      });

      pets.forEach(function (p) {
        paint(p, p.imgs.norm, 'norm', p.ex, p.ey, now < p.blinkUntil);
        var hx = p.x;
        if (p.A) {
          var t = now - p.A.t0;
          p.A.def.draw(t, p.A);
          if (t >= p.A.def.lt && t < p.A.def.le) drawText(p.A.def.label, p.A.x, Math.max(2, p.A.y - 34), (t - p.A.def.lt) < 0.1 ? 3 : 2);
          hx = p.A.x;
        } else {
          var hop = p.walking ? (Math.floor(p.walk) % 2) : (Math.floor(now * 1.6 + p.phase) % 2);
          var wob = (p.sp.waddle && p.walking) ? (Math.floor(p.walk) % 2 ? 1 : -1) : 0;
          drawSpr(p.imgs.norm, { x: p.x + wob, y: G - hop });
        }
        p.hit.style.transform = 'translate(' + Math.round(hx * S - HIT / 2) + 'px,' + Math.round((G - N / 2) * S - HIT / 2) + 'px)';
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
