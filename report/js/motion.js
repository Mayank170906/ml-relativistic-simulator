/* ===================================================================
   motion.js — interaction and animation layer.

   Loaded in <head> WITHOUT defer so the `has-motion` flag lands before
   first paint (the CSS only hides reveal targets once that class is
   present, so a JS failure or reduced-motion preference leaves the page
   fully visible rather than blank).

   Deliberately NOT loaded on research.html, which is a reading surface.
   =================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) return;

  var root = document.documentElement;
  root.classList.add("has-motion");

  /* ---------------- scroll progress ---------------- */
  function initProgress() {
    var bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      bar.style.transform = "scaleX(" + p + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------------- scroll reveal ----------------
     Only elements starting below the fold are hidden, so nothing that is
     already painted can flash out. A failsafe un-hides anything still
     hidden after 3s regardless of observer state. */
  var REVEAL_SELECTOR = [
    ".section-head",
    ".card",
    ".chart-card",
    ".table-wrap",
    ".callout",
    ".notebook-card",
    ".flow-node",
    ".image-figure",
    ".stat-strip",
    ".scratch-banner",
    ".eq",
    ".pipeline",
    ".arch-diagram",
    "details.disclosure",
    ".page-prevnext"
  ].join(",");

  function initReveal() {
    if (!("IntersectionObserver" in window)) return;

    var vh = window.innerHeight;
    var candidates = [].slice.call(document.querySelectorAll(REVEAL_SELECTOR))
      .filter(function (el) {
        // skip nested targets — animate the outermost only
        if (el.parentElement && el.parentElement.closest(REVEAL_SELECTOR)) return false;
        return el.getBoundingClientRect().top > vh * 0.92;
      });

    if (!candidates.length) return;

    // stagger siblings sharing a parent
    var seen = {};
    candidates.forEach(function (el) {
      var parent = el.parentElement;
      var key = parent ? (parent.dataset.mkey || (parent.dataset.mkey = Math.random().toString(36).slice(2))) : "root";
      seen[key] = (seen[key] || 0) + 1;
      el.style.setProperty("--i", Math.min(seen[key] - 1, 7));
      el.setAttribute("data-reveal", "");
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    candidates.forEach(function (el) { io.observe(el); });

    // failsafe
    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 3000);
  }

  /* ---------------- animated counters ---------------- */
  function parseNumeric(text) {
    var t = text.trim();
    if (!/^[0-9][0-9,]*(\.[0-9]+)?$/.test(t)) return null;
    var value = parseFloat(t.replace(/,/g, ""));
    if (!isFinite(value)) return null;
    return {
      value: value,
      grouped: t.indexOf(",") !== -1,
      decimals: (t.split(".")[1] || "").length
    };
  }

  function format(n, spec) {
    var s = spec.decimals ? n.toFixed(spec.decimals) : String(Math.round(n));
    if (spec.grouped) {
      var parts = s.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      s = parts.join(".");
    }
    return s;
  }

  function initCounters() {
    if (!("IntersectionObserver" in window)) return;

    var targets = [].slice.call(document.querySelectorAll(".metric-num, .stat .num"))
      .map(function (el) {
        var spec = parseNumeric(el.textContent);
        return spec ? { el: el, spec: spec } : null;
      })
      .filter(Boolean);

    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var item = targets.filter(function (t) { return t.el === entry.target; })[0];
        io.unobserve(entry.target);
        if (!item) return;

        var start = performance.now();
        var dur = 1100;
        var final = item.spec.value;

        function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          item.el.textContent = format(final * eased, item.spec);
          if (p < 1) requestAnimationFrame(step);
          else item.el.textContent = format(final, item.spec);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });

    targets.forEach(function (t) { io.observe(t.el); });
  }

  /* ---------------- anchor offset ---------------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initProgress();
    initReveal();
    initCounters();
    initAnchors();
  });
})();
