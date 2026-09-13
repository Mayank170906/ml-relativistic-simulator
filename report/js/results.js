// Interactive model comparison logic for results.html
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var sklearn = SITE_DATA.MODEL_RESULTS.sklearn_normal;
    var targets = SITE_DATA.TARGET_META.targets.map(function (t) { return t.id; });
    var models = Array.from(new Set(sklearn.map(function (r) { return r.model; })));

    var targetSelect = document.getElementById("targetSelect");
    targets.forEach(function (t) {
      var o = document.createElement("option");
      o.value = t; o.textContent = t.replace(/_/g, " ");
      targetSelect.appendChild(o);
    });

    var modelFilter = document.getElementById("modelFilter");
    models.forEach(function (m) {
      var o = document.createElement("option"); o.value = m; o.textContent = m; modelFilter.appendChild(o);
    });

    var currentMetric = "R2";
    var metricLabels = { R2: "R² (higher is better)", RMSE: "RMSE (lower is better, raw units)", MAE: "MAE (lower is better, raw units)" };

    document.querySelectorAll("#metricSeg button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("#metricSeg button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentMetric = btn.getAttribute("data-metric");
        renderChart();
      });
    });
    targetSelect.addEventListener("change", renderChart);

    var chart;
    function renderChart() {
      var target = targetSelect.value;
      var rows = sklearn.filter(function (r) { return r.target === target; });
      var better = currentMetric === "R2" ? "higher" : "lower";
      rows = rows.slice().sort(function (a, b) {
        return better === "higher" ? b[currentMetric] - a[currentMetric] : a[currentMetric] - b[currentMetric];
      });
      var labels = rows.map(function (r) { return r.model; });
      var values = rows.map(function (r) { return r[currentMetric]; });
      var colors = rows.map(function (r, i) {
        if (i === 0) return "#16a34a";
        if (i === rows.length - 1) return "#e0393e";
        return "#4f5bff";
      });

      chart && chart.destroy();
      chart = ChartHelpers.barChart(document.getElementById("compareChart"), labels, [
        { label: metricLabels[currentMetric], data: values, backgroundColor: colors }
      ], { indexAxis: "y", plugins: { legend: { display: false } } });

      document.getElementById("metricNote").textContent =
        "Target: " + target.replace(/_/g, " ") + " — green = best model, red = worst model, for this metric on the normal held-out test set.";

      var best = rows[0], worst = rows[rows.length - 1];
      document.getElementById("rankNote").innerHTML =
        "<strong>" + best.model + "</strong> is best for <strong>" + target.replace(/_/g, " ") + "</strong> (R² = " + best.R2.toFixed(4) + "), while <strong>" + worst.model + "</strong> is weakest (R² = " + worst.R2.toFixed(4) + "). Metrics are not directly comparable across targets with different physical units — always compare within one target.";
    }

    targetSelect.value = "gamma";
    renderChart();

    // full table
    var tbody = document.querySelector("#fullTable tbody");
    function renderTable() {
      var filterModel = modelFilter.value;
      var bestPerTarget = {};
      targets.forEach(function (t) {
        var rows = sklearn.filter(function (r) { return r.target === t; });
        bestPerTarget[t] = rows.reduce(function (a, b) { return b.R2 > a.R2 ? b : a; }).model;
      });
      tbody.innerHTML = "";
      sklearn.filter(function (r) { return !filterModel || r.model === filterModel; }).forEach(function (r) {
        var tr = document.createElement("tr");
        tr.setAttribute("data-model", r.model);
        tr.setAttribute("data-target", r.target);
        tr.setAttribute("data-r2", r.R2);
        tr.setAttribute("data-rmse", r.RMSE);
        tr.setAttribute("data-mae", r.MAE);
        var isBest = bestPerTarget[r.target] === r.model;
        tr.innerHTML =
          "<td>" + r.model + "</td>" +
          "<td>" + r.target.replace(/_/g, " ") + "</td>" +
          '<td class="num ' + (isBest ? "best" : "") + '">' + r.R2.toFixed(4) + (isBest ? " ★" : "") + "</td>" +
          '<td class="num">' + r.RMSE.toExponential(3) + "</td>" +
          '<td class="num">' + r.MAE.toExponential(3) + "</td>";
        tbody.appendChild(tr);
      });
    }
    modelFilter.addEventListener("change", renderTable);
    renderTable();

    // overall ranking
    var byModel = {};
    sklearn.forEach(function (r) {
      byModel[r.model] = byModel[r.model] || [];
      byModel[r.model].push(r.R2);
    });
    var ranking = Object.keys(byModel).map(function (m) {
      return { model: m, mean: byModel[m].reduce(function (a, b) { return a + b; }, 0) / byModel[m].length };
    }).sort(function (a, b) { return b.mean - a.mean; });

    ChartHelpers.barChart(document.getElementById("overallRankChart"),
      ranking.map(function (r) { return r.model; }),
      [{ label: "Mean R² across 8 targets", data: ranking.map(function (r) { return r.mean; }), backgroundColor: "#4f5bff" }],
      { indexAxis: "y" }
    );
  });
})();
