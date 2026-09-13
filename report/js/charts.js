// Chart.js helpers shared across pages.
(function () {
  "use strict";

  var PALETTE = ["#4895ef", "#f77f00", "#9d4edd", "#06d6a0", "#ef476f", "#00b4d8", "#ffb703", "#118ab2"];

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function themeDefaults() {
    Chart.defaults.color = cssVar("--text-faint");
    Chart.defaults.borderColor = cssVar("--border");
    // Inter rather than the site mono: category labels like
    // "Random Forest Controlled" clip against the axis in a monospace face.
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.tooltip.backgroundColor = cssVar("--text");
    Chart.defaults.plugins.tooltip.titleColor = cssVar("--bg");
    Chart.defaults.plugins.tooltip.bodyColor = cssVar("--bg");
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 4;
    Chart.defaults.plugins.tooltip.displayColors = false;
    Chart.defaults.animation = { duration: 900, easing: "easeOutQuart" };
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
        borderRadius: 3,
        plugins: { legend: { display: datasets.length > 1, labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, padding: 14 } } },
        scales: {
          x: { grid: { display: false }, border: { color: cssVar("--border") } },
          y: { grid: { color: cssVar("--border"), drawTicks: false }, border: { display: false }, beginAtZero: true }
        }
      }, opts || {})
    });
  }

  function lineChart(ctx, labels, datasets, opts) {
    themeDefaults();
    return new Chart(ctx, {
      type: "line",
      data: { labels: labels, datasets: datasets.map(function (d, i) {
        return Object.assign({ borderColor: color(i), backgroundColor: color(i), tension: .3, pointRadius: 0, borderWidth: 2.25 }, d);
      }) },
      options: Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, padding: 14 } } },
        scales: {
          x: { grid: { display: false }, border: { color: cssVar("--border") } },
          y: { grid: { color: cssVar("--border"), drawTicks: false }, border: { display: false } }
        }
      }, opts || {})
    });
  }

  window.ChartHelpers = { PALETTE: PALETTE, color: color, barChart: barChart, lineChart: lineChart, themeDefaults: themeDefaults };
})();
