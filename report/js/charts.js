// Chart.js helpers shared across pages.
(function () {
  "use strict";

  var PALETTE = ["#4f5bff", "#00b8a9", "#ff6a3d", "#8b5cf6", "#e0393e", "#d97706", "#16a34a", "#0ea5e9"];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function themeDefaults() {
    Chart.defaults.color = cssVar("--text-dim");
    Chart.defaults.borderColor = cssVar("--border");
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  }

  function color(i) { return PALETTE[i % PALETTE.length]; }

  function barChart(ctx, labels, datasets, opts) {
    themeDefaults();
    return new Chart(ctx, {
      type: "bar",
      data: { labels: labels, datasets: datasets },
      options: Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: datasets.length > 1, labels: { boxWidth: 12, usePointStyle: true } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: cssVar("--border") }, beginAtZero: true }
        }
      }, opts || {})
    });
  }

  function lineChart(ctx, labels, datasets, opts) {
    themeDefaults();
    return new Chart(ctx, {
      type: "line",
      data: { labels: labels, datasets: datasets.map(function (d, i) {
        return Object.assign({ borderColor: color(i), backgroundColor: color(i), tension: .25, pointRadius: 0, borderWidth: 2 }, d);
      }) },
      options: Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { labels: { boxWidth: 12, usePointStyle: true } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: cssVar("--border") } }
        }
      }, opts || {})
    });
  }

  window.ChartHelpers = { PALETTE: PALETTE, color: color, barChart: barChart, lineChart: lineChart, themeDefaults: themeDefaults };
})();
