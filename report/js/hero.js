/* ===================================================================
   hero.js — animated hero for the landing page.

   The animation is the subject matter: particles accelerate from rest
   under a constant force. Horizontal position maps β = v/c, so they
   visibly bunch against the light-speed barrier without ever reaching
   it — the exact asymptotic behaviour the models had to learn.
   Colour travels blue → violet → amber with β, matching the site's
   redshift accent language. The faint rising curve is γ(β).
   =================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("heroCanvas");
  if (!canvas) return;

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var particles = [];
  var COUNT = 46;
  var BARRIER = 0.9;           // x-fraction of the canvas representing c
  var mouse = { x: 0.5, y: 0.5 };
  var theme = {};

  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    theme = {
      rest: cs.getPropertyValue("--brand").trim() || "#2f46c8",
      boost: cs.getPropertyValue("--brand-2").trim() || "#7c3aed",
      fast: cs.getPropertyValue("--brand-3").trim() || "#c2600b",
      line: cs.getPropertyValue("--text").trim() || "#000",
      dark: document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    };
  }

  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* colour as a function of β: rest → boost → relativistic */
  function spectrum(beta) {
    var a, b, t;
    if (beta < 0.55) { a = hexToRgb(theme.rest); b = hexToRgb(theme.boost); t = beta / 0.55; }
    else { a = hexToRgb(theme.boost); b = hexToRgb(theme.fast); t = (beta - 0.55) / 0.45; }
    t = Math.max(0, Math.min(1, t));
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function rgba(c, alpha) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + alpha + ")"; }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(seeded) {
    // Seed uniformly in β (not in q) so the initial population spreads
    // evenly across the track instead of piling up against the barrier.
    var beta0 = seeded ? Math.random() * 0.95 : 0;
    return {
      lane: Math.random(),
      // q = Ft/mc, the reduced momentum — grows linearly while β saturates
      q: beta0 / Math.sqrt(1 - beta0 * beta0),
      rate: 0.22 + Math.random() * 0.85,
      size: 1.1 + Math.random() * 1.9
    };
  }

  function init() {
    particles = [];
    for (var i = 0; i < COUNT; i++) particles.push(spawn(true));
  }

  function betaOf(q) { return q / Math.sqrt(1 + q * q); }

  /* faint γ(β) = 1/√(1−β²) reference curve */
  function drawGammaCurve() {
    ctx.save();
    ctx.globalAlpha = theme.dark ? 0.16 : 0.11;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    var maxG = 7;
    for (var i = 0; i <= 240; i++) {
      var beta = (i / 240) * 0.995;
      var g = 1 / Math.sqrt(1 - beta * beta);
      var x = beta * (W * BARRIER);
      var y = H - (Math.min(g, maxG) / maxG) * (H * 0.72) - H * 0.06;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* spacetime grid — spacing contracts toward the barrier */
  function drawGrid() {
    ctx.save();
    ctx.globalAlpha = theme.dark ? 0.13 : 0.09;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1;
    for (var i = 0; i <= 26; i++) {
      var f = i / 26;
      // contract spacing as β → 1
      var beta = f * 0.99;
      var x = beta * (W * BARRIER);
      ctx.globalAlpha = (theme.dark ? 0.14 : 0.1) * (0.25 + f * 0.75);
      ctx.beginPath();
      ctx.moveTo(x, H * 0.08);
      ctx.lineTo(x, H * 0.94);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBarrier(time) {
    var bx = W * BARRIER;
    var pulse = 0.55 + Math.sin(time / 700) * 0.12;
    var c = hexToRgb(theme.fast);

    ctx.save();
    var grad = ctx.createLinearGradient(bx - 64, 0, bx, 0);
    grad.addColorStop(0, rgba(c, 0));
    grad.addColorStop(1, rgba(c, theme.dark ? 0.13 : 0.11));
    ctx.fillStyle = grad;
    ctx.fillRect(bx - 64, 0, 64, H);

    ctx.strokeStyle = rgba(c, pulse * (theme.dark ? 1 : 0.75));
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(bx, H * 0.05);
    ctx.lineTo(bx, H * 0.95);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = "600 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = rgba(c, theme.dark ? 0.95 : 0.8);
    ctx.textAlign = "left";
    ctx.fillText("β = 1  ·  c", bx + 9, H * 0.08);
    ctx.restore();
  }

  var last = 0;
  function frame(time) {
    var dt = Math.min((time - last) / 1000, 0.05);
    last = time;

    ctx.clearRect(0, 0, W, H);

    var px = (mouse.x - 0.5) * 14;
    var py = (mouse.y - 0.5) * 10;

    ctx.save();
    ctx.translate(px * 0.3, py * 0.3);
    drawGrid();
    drawGammaCurve();
    ctx.restore();

    drawBarrier(time);

    ctx.save();
    ctx.translate(px, py);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.q += p.rate * dt;
      var beta = betaOf(p.q);

      var x = beta * (W * BARRIER);
      var y = H * (0.1 + p.lane * 0.82);
      var col = spectrum(beta);

      // trail — lengthens with β
      var trail = 10 + beta * beta * 85;
      var g = ctx.createLinearGradient(x - trail, y, x, y);
      g.addColorStop(0, rgba(col, 0));
      g.addColorStop(1, rgba(col, theme.dark ? 0.5 : 0.46));
      ctx.strokeStyle = g;
      ctx.lineWidth = p.size * 0.85;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(Math.max(0, x - trail), y);
      ctx.lineTo(x, y);
      ctx.stroke();

      // head
      var a = theme.dark ? 0.95 : 0.82;
      ctx.fillStyle = rgba(col, a);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // glow intensifies near the barrier
      if (beta > 0.8) {
        ctx.fillStyle = rgba(col, (beta - 0.8) * (theme.dark ? 0.9 : 0.5));
        ctx.beginPath();
        ctx.arc(x, y, p.size * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // recycle before the barrier so the crowding reads as dense, not solid
      if (beta > 0.988) particles[i] = spawn(false);
    }
    ctx.restore();

    requestAnimationFrame(frame);
  }

  function start() {
    readTheme();
    resize();
    init();

    if (reduced) {
      // draw one static frame only
      last = performance.now();
      ctx.clearRect(0, 0, W, H);
      drawGrid(); drawGammaCurve(); drawBarrier(0);
      particles.forEach(function (p) {
        var beta = betaOf(p.q);
        var col = spectrum(beta);
        ctx.fillStyle = rgba(col, 0.7);
        ctx.beginPath();
        ctx.arc(beta * (W * BARRIER), H * (0.1 + p.lane * 0.82), p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }

    last = performance.now();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () { resize(); });
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  }, { passive: true });

  // re-read palette when the theme toggle flips
  new MutationObserver(readTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"]
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }
})();
