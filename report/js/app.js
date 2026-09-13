// Shared site chrome: navigation injection, mobile toggle, theme toggle, sort/table helpers.
(function () {
  "use strict";

  var NAV_ITEMS = [
    { href: "index.html", label: "Home" },
    { href: "overview.html", label: "Overview" },
    { href: "physics.html", label: "Physics" },
    { href: "physics-engine.html", label: "Engine" },
    { href: "datasets.html", label: "Datasets" },
    { href: "models.html", label: "Models" },
    { href: "results.html", label: "Results" },
    { href: "ood.html", label: "OOD" },
    { href: "targets.html", label: "Targets" },
    { href: "conclusions.html", label: "Conclusions" }
  ];

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function buildHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    var current = currentPage();
    var linksHtml = NAV_ITEMS.map(function (item) {
      var cls = item.href === current ? ' class="active"' : "";
      return '<a href="' + item.href + '"' + cls + ">" + item.label + "</a>";
    }).join("");

    host.innerHTML =
      '<div class="wrap nav">' +
      '<a class="nav-brand" href="index.html"><span class="dot" aria-hidden="true"></span>Relativistic ML Report</a>' +
      '<button class="nav-toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>' +
      '<nav class="nav-links" id="navLinks" aria-label="Primary">' + linksHtml + "</nav>" +
      '<button class="theme-toggle" id="themeToggle" title="Toggle theme" aria-label="Toggle color theme">◐</button>' +
      "</div>";

    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function buildFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML =
      '<div class="wrap">' +
      "<div>Relativistic Physics × Machine Learning — a research report built entirely from this project's own notebooks, datasets and models. No numbers on this site are fabricated.</div>" +
      '<div class="footer-links">' +
      '<a href="https://github.com/Mayank170906/relativistic-simulator" target="_blank" rel="noopener">Physics engine on GitHub</a>' +
      '<a href="https://pypi.org/project/relativistic-simulator/" target="_blank" rel="noopener">PyPI package</a>' +
      '<a href="https://mayank170906.github.io/relativistic-simulator/" target="_blank" rel="noopener">Engine documentation</a>' +
      "</div></div>";
  }

  function initTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var stored = null;
    try { stored = localStorage.getItem("site-theme"); } catch (e) {}
    if (stored) document.documentElement.setAttribute("data-theme", stored);
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var isDark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("site-theme", next); } catch (e) {}
    });
  }

  // Generic sortable table: add data-sortable to <table>, headers get data-key.
  function initSortableTables() {
    document.querySelectorAll("table[data-sortable]").forEach(function (table) {
      var tbody = table.tBodies[0];
      table.querySelectorAll("thead th[data-key]").forEach(function (th) {
        var dir = 0;
        th.addEventListener("click", function () {
          var key = th.getAttribute("data-key");
          var type = th.getAttribute("data-type") || "string";
          dir = dir === 1 ? -1 : 1;
          table.querySelectorAll("thead th").forEach(function (h) { h.querySelector(".arrow") && (h.querySelector(".arrow").textContent = ""); });
          var arrow = th.querySelector(".arrow");
          if (arrow) arrow.textContent = dir === 1 ? "▲" : "▼";
          var rows = Array.prototype.slice.call(tbody.rows);
          rows.sort(function (a, b) {
            var av = a.getAttribute("data-" + key), bv = b.getAttribute("data-" + key);
            if (type === "number") { av = parseFloat(av); bv = parseFloat(bv); return dir * (av - bv); }
            return dir * String(av).localeCompare(String(bv));
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildHeader();
    buildFooter();
    initTheme();
    initSortableTables();
  });

  window.SiteApp = { NAV_ITEMS: NAV_ITEMS };
})();
