/**
 * Peer Risk Observatory — Demo App
 *
 * Run locally:
 *   python -m http.server 8000
 *   Then open http://localhost:8000
 *
 * GitHub Pages:
 *   Push to repo → Settings → Pages → Source: main branch, / (root)
 *   Site will be at https://<username>.github.io/<repo>/
 */

(function () {
  "use strict";

  var FALLBACK_DATA = {
    portfolios: [
      {
        id: "internal",
        name: "Internal Multi-Asset",
        cohortSize: 1,
        confidenceLabel: "Internal",
        kpis: {
          crowdingScore: 42,
          psi: 0.31,
          peerOverlapRatio: 0,
          crowdingMomentum30d: -2.1
        },
        crowdingInterpretation: "Differentiated",
        factorsTop5: [
          { name: "Value", percentile: 28 },
          { name: "Duration", percentile: 35 },
          { name: "Low Vol", percentile: 41 },
          { name: "Momentum", percentile: 52 },
          { name: "Quality", percentile: 58 }
        ],
        dispersionSnapshot: [
          { factor: "Value", dispersionIndex: 0.42 },
          { factor: "Duration", dispersionIndex: 0.38 },
          { factor: "Momentum", dispersionIndex: 0.51 }
        ],
        trendCrowding: [38, 38.6, 39.2, 39.8, 40.2, 40.6, 41, 41.5, 42, 41.6, 41.2, 40.8, 41, 41.3, 41.6, 41.9, 42.2, 42, 41.7, 41.9, 42.1, 42, 41.8, 42, 42.2, 42, 41.7, 41.9, 42.1, 42],
        trendPsi: [0.28, 0.285, 0.29, 0.295, 0.30, 0.305, 0.31, 0.308, 0.305, 0.302, 0.30, 0.302, 0.304, 0.306, 0.308, 0.31, 0.308, 0.306, 0.307, 0.308, 0.31, 0.308, 0.306, 0.308, 0.31, 0.308, 0.306, 0.308, 0.31, 0.31]
      },
      {
        id: "french",
        name: "French Equity Core",
        cohortSize: 4,
        confidenceLabel: "Directional",
        kpis: {
          crowdingScore: 58,
          psi: 0.67,
          peerOverlapRatio: 34,
          crowdingMomentum30d: 5.2
        },
        crowdingInterpretation: "Typical",
        factorsTop5: [
          { name: "Momentum", percentile: 89 },
          { name: "Quality", percentile: 82 },
          { name: "Value", percentile: 76 },
          { name: "Low Vol", percentile: 71 },
          { name: "Size", percentile: 65 }
        ],
        dispersionSnapshot: [
          { factor: "Momentum", dispersionIndex: 0.22 },
          { factor: "Quality", dispersionIndex: 0.28 },
          { factor: "Value", dispersionIndex: 0.31 }
        ],
        trendCrowding: [48, 48.7, 49.4, 50.1, 50.8, 51.4, 52, 52.6, 53.2, 53.8, 54.4, 55, 55.5, 56, 56.5, 57, 57.5, 58, 57.6, 57.2, 56.8, 57, 57.3, 57.6, 57.9, 58, 57.7, 57.9, 58.1, 58],
        trendPsi: [0.58, 0.585, 0.59, 0.595, 0.60, 0.605, 0.61, 0.615, 0.62, 0.625, 0.63, 0.635, 0.64, 0.645, 0.65, 0.655, 0.66, 0.665, 0.67, 0.668, 0.665, 0.662, 0.665, 0.668, 0.67, 0.668, 0.665, 0.668, 0.67, 0.67]
      },
      {
        id: "euro",
        name: "Euro Credit Total Return",
        cohortSize: 11,
        confidenceLabel: "Robust",
        kpis: {
          crowdingScore: 84,
          psi: 0.89,
          peerOverlapRatio: 72,
          crowdingMomentum30d: 8.3
        },
        crowdingInterpretation: "Highly crowded",
        factorsTop5: [
          { name: "Momentum", percentile: 96 },
          { name: "Low Vol", percentile: 94 },
          { name: "Quality", percentile: 91 },
          { name: "Duration", percentile: 88 },
          { name: "Value", percentile: 85 }
        ],
        dispersionSnapshot: [
          { factor: "Momentum", dispersionIndex: 0.12 },
          { factor: "Low Vol", dispersionIndex: 0.15 },
          { factor: "Duration", dispersionIndex: 0.18 }
        ],
        trendCrowding: [72, 72.6, 73.2, 73.8, 74.4, 75, 75.6, 76.2, 76.8, 77.4, 78, 78.5, 79, 79.5, 80, 80.5, 81, 81.5, 82, 82.5, 83, 83.5, 84, 83.6, 83.2, 82.8, 83, 83.3, 83.6, 84],
        trendPsi: [0.82, 0.825, 0.83, 0.835, 0.84, 0.845, 0.85, 0.855, 0.86, 0.865, 0.87, 0.875, 0.88, 0.885, 0.89, 0.888, 0.885, 0.882, 0.885, 0.888, 0.89, 0.888, 0.885, 0.888, 0.89, 0.888, 0.885, 0.888, 0.89, 0.89]
      }
    ]
  };

  var TOOLTIPS = {
    crowding: "Crowding Score (0–100): 80–100 = Highly crowded; 40–60 = Typical; 0–20 = Differentiated",
    psi: "PSI (Portfolio Similarity Index): Measures similarity to peer cohort. Range [-1, 1]. Higher = more similar.",
    overlap: "Peer Overlap Ratio: Percentage of exposure overlap with peer portfolios.",
    momentum: "Crowding Momentum (30d): Change in crowding score over the last 30 days. Positive = increasing crowding.",
    factorCrowding: "Factor Crowding Percentile: Percentile_i,f = #{j in P : E_j,f ≤ E_i,f} / |P|. 90% = more exposed than 90% of peers.",
    dispersion: "Dispersion Index: Dispersion_f = σ(E·,f) / (|μ(E·,f)| + ε). Lower = more consensus among peers."
  };

  function byId(id) {
    return document.getElementById(id) || null;
  }

  function getLabel(portfolio) {
    var n = portfolio.cohortSize;
    var suffix = n === 1 ? "Internal" : (n >= 3 && n <= 5 ? "Directional" : "Robust");
    return portfolio.name + " (N=" + n + " — " + suffix + ")";
  }

  function getBadgeClass(portfolio) {
    var n = portfolio.cohortSize;
    if (n === 1) return "badge-neutral";
    if (n >= 3 && n <= 5) return "badge-warning";
    return "badge-success";
  }

  function drawChart(canvasId, data, color) {
    var canvas = byId(canvasId);
    if (!canvas || !data || data.length === 0) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var displayW = canvas.clientWidth || 400;
    var displayH = canvas.clientHeight || 140;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    ctx.scale(dpr, dpr);

    var w = displayW;
    var h = displayH;
    var padding = { top: 12, right: 12, bottom: 28, left: 42 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;
    var min = Math.min.apply(null, data);
    var max = Math.max.apply(null, data);
    var range = max - min || 1;
    var decimals = range < 0.1 ? 2 : (range < 1 ? 1 : 0);

    canvas._chartConfig = { padding: padding, chartW: chartW, chartH: chartH, data: data, decimals: decimals };

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#8b949e";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    var yTicks = [min, min + range * 0.5, max];
    yTicks.forEach(function (val) {
      var y = padding.top + chartH - ((val - min) / range) * chartH;
      ctx.fillText(val.toFixed(decimals), padding.left - 6, y);
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    var xLabels = ["T-30", "T-15", "T"];
    var xPositions = [0, 0.5, 1];
    xPositions.forEach(function (t, i) {
      var x = padding.left + t * chartW;
      ctx.fillText(xLabels[i], x, padding.top + chartH + 6);
    });

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.stroke();

    ctx.strokeStyle = color || "#58a6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < data.length; i++) {
      var x = padding.left + (i / (data.length - 1)) * chartW;
      var y = padding.top + chartH - ((data[i] - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(88, 166, 255, 0.1)";
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fill();
  }

  function showChartTooltip(ev, canvas, label) {
    var tt = byId("tooltip");
    if (!tt) return;
    var cfg = canvas._chartConfig;
    if (!cfg || !cfg.data || cfg.data.length === 0) return;
    var rect = canvas.getBoundingClientRect();
    var x = ev.clientX - rect.left;
    var y = ev.clientY - rect.top;
    if (x < cfg.padding.left || x > cfg.padding.left + cfg.chartW) {
      hideTooltip();
      return;
    }
    var dayIndex = Math.round(((x - cfg.padding.left) / cfg.chartW) * (cfg.data.length - 1));
    dayIndex = Math.max(0, Math.min(cfg.data.length - 1, dayIndex));
    var value = cfg.data[dayIndex];
    var dayLabel = dayIndex === cfg.data.length - 1 ? "T" : "T-" + (cfg.data.length - 1 - dayIndex);
    var text = dayLabel + ": " + value.toFixed(cfg.decimals);
    if (label) text = label + " — " + text;
    tt.textContent = text;
    tt.classList.add("visible");
    tt.style.left = (ev.clientX + 12) + "px";
    tt.style.top = (ev.clientY + 12) + "px";
  }

  function setupChartHover(canvasId, label) {
    var canvas = byId(canvasId);
    if (!canvas) return;
    var onMove = function (ev) { showChartTooltip(ev, canvas, label); };
    var onLeave = function () { hideTooltip(); };
    canvas.removeEventListener("mousemove", canvas._chartOnMove);
    canvas.removeEventListener("mouseleave", canvas._chartOnLeave);
    canvas._chartOnMove = onMove;
    canvas._chartOnLeave = onLeave;
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
  }

  function showTooltip(el, text) {
    var tt = byId("tooltip");
    if (!tt) return;
    tt.textContent = text;
    tt.classList.add("visible");
    var rect = el.getBoundingClientRect();
    tt.style.left = rect.left + "px";
    tt.style.top = (rect.bottom + 6) + "px";
  }

  function hideTooltip() {
    var tt = byId("tooltip");
    if (tt) tt.classList.remove("visible");
  }

  function render(portfolio) {
    if (!portfolio) return;

    var badge = byId("confidenceBadge");
    if (badge) {
      badge.textContent = portfolio.confidenceLabel;
      badge.className = "badge " + getBadgeClass(portfolio);
    }

    var crowdingScore = byId("crowdingScore");
    if (crowdingScore) crowdingScore.textContent = portfolio.kpis.crowdingScore;

    var crowdingInterpretation = byId("crowdingInterpretation");
    if (crowdingInterpretation) crowdingInterpretation.textContent = portfolio.crowdingInterpretation;

    var psiValue = byId("psiValue");
    if (psiValue) psiValue.textContent = portfolio.kpis.psi.toFixed(2);

    var peerOverlapValue = byId("peerOverlapValue");
    if (peerOverlapValue) peerOverlapValue.textContent = portfolio.kpis.peerOverlapRatio + "%";

    var momentumEl = byId("crowdingMomentumValue");
    if (momentumEl) {
      var m = portfolio.kpis.crowdingMomentum30d;
      momentumEl.className = "kpi-value kpi-momentum " + (m >= 0 ? "positive" : "negative");
      momentumEl.textContent = (m >= 0 ? "↑ +" : "↓ -") + Math.abs(m).toFixed(1);
    }

    var factorTable = byId("factorTable");
    if (factorTable && portfolio.factorsTop5) {
      factorTable.innerHTML = "";
      var factorTip = TOOLTIPS.factorCrowding;
      portfolio.factorsTop5.forEach(function (f) {
        var row = document.createElement("div");
        row.className = "factor-row factor-row-tooltip";
        row.innerHTML =
          '<span class="factor-name">' + f.name + "</span>" +
          '<span class="factor-percentile">' + f.percentile + "%</span>" +
          '<div class="factor-bar-wrap"><div class="factor-bar" style="width:' + f.percentile + '%"></div></div>';
        row.addEventListener("mouseenter", function (e) { showTooltip(row, factorTip); });
        row.addEventListener("mouseleave", hideTooltip);
        factorTable.appendChild(row);
      });
    }

    var dispersionList = byId("dispersionList");
    if (dispersionList && portfolio.dispersionSnapshot) {
      dispersionList.innerHTML = "";
      portfolio.dispersionSnapshot.forEach(function (d) {
        var item = document.createElement("div");
        item.className = "dispersion-item";
        item.innerHTML = '<span>' + d.factor + "</span><span class=\"dispersion-value\">" + d.dispersionIndex.toFixed(2) + "</span>";
        dispersionList.appendChild(item);
      });
    }

    if (portfolio.trendCrowding) {
      drawChart("chartCrowding", portfolio.trendCrowding);
      setupChartHover("chartCrowding", "Crowding Score");
    }
    if (portfolio.trendPsi) {
      drawChart("chartPsi", portfolio.trendPsi);
      setupChartHover("chartPsi", "PSI");
    }
  }

  function init() {
    var portfolioSelect = byId("portfolioSelect");
    if (!portfolioSelect) return;

    var data = FALLBACK_DATA;
    fetch("data.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        if (d && d.portfolios && d.portfolios.length > 0) data = d;
      })
      .catch(function () {})
      .then(function () {
        portfolioSelect.innerHTML = "";
        data.portfolios.forEach(function (p) {
          var opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = getLabel(p);
          portfolioSelect.appendChild(opt);
        });
        var first = data.portfolios[0];
        if (first) {
          portfolioSelect.value = first.id;
          render(first);
        }
        portfolioSelect.addEventListener("change", function () {
          var p = data.portfolios.filter(function (x) { return x.id === portfolioSelect.value; })[0];
          render(p);
        });
      });

    var howTrigger = byId("howItWorksTrigger");
    var howContent = byId("howItWorksContent");
    if (howTrigger && howContent) {
      howTrigger.addEventListener("click", function () {
        var open = howContent.classList.toggle("open");
        howTrigger.setAttribute("aria-expanded", open);
      });
    }

    ["tooltipCrowding", "tooltipPsi", "tooltipOverlap", "tooltipMomentum", "tooltipFactorCrowding", "tooltipDispersion"].forEach(function (id) {
      var btn = byId(id);
      if (!btn) return;
      var key = id.replace("tooltip", "").replace(/([A-Z])/g, function (m) { return m.toLowerCase(); });
      if (key === "factorcrowding") key = "factorCrowding";
      if (key === "dispersion") key = "dispersion";
      var text = TOOLTIPS[key] || TOOLTIPS[id.replace("tooltip", "").toLowerCase()];
      if (text) {
        btn.addEventListener("mouseenter", function (e) { showTooltip(e.currentTarget, text); });
        btn.addEventListener("mouseleave", hideTooltip);
        btn.addEventListener("focus", function (e) { showTooltip(e.currentTarget, text); });
        btn.addEventListener("blur", hideTooltip);
      }
    });

    document.addEventListener("mouseleave", hideTooltip);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
