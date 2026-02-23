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
      { id: "int-eq-1", name: "European Equity Growth", cohortSize: 1, confidence: "Internal", assetClass: "Equity", aum: 320, confidenceLabel: "Internal", kpis: { crowdingScore: 38, psi: 0.28, peerOverlapRatio: 0, crowdingMomentum30d: -1.2 }, crowdingInterpretation: "Differentiated", factorsTop5: [{ name: "Momentum", percentile: 35 }, { name: "Quality", percentile: 42 }, { name: "Value", percentile: 48 }, { name: "Low Vol", percentile: 52 }, { name: "Size", percentile: 58 }], dispersionSnapshot: [{ factor: "Momentum", dispersionIndex: 0.48 }, { factor: "Quality", dispersionIndex: 0.44 }, { factor: "Value", dispersionIndex: 0.51 }], trendCrowding: [39, 38.8, 38.5, 38.2, 38.5, 38.8, 39, 38.6, 38.3, 38.5, 38.7, 38.4, 38.2, 38.5, 38.8, 38.5, 38.3, 38.6, 38.9, 38.6, 38.4, 38.6, 38.8, 38.5, 38.3, 38.5, 38.7, 38.4, 38.2, 38], trendPsi: [0.29, 0.288, 0.286, 0.284, 0.286, 0.288, 0.29, 0.287, 0.285, 0.287, 0.289, 0.286, 0.284, 0.286, 0.288, 0.285, 0.283, 0.285, 0.287, 0.284, 0.282, 0.284, 0.286, 0.283, 0.281, 0.283, 0.285, 0.282, 0.28, 0.28] },
      { id: "dir-eq-1", name: "French Equity Core", cohortSize: 4, confidence: "Directional", assetClass: "Equity", aum: 1200, confidenceLabel: "Directional", kpis: { crowdingScore: 58, psi: 0.67, peerOverlapRatio: 34, crowdingMomentum30d: 5.2 }, crowdingInterpretation: "Typical", factorsTop5: [{ name: "Momentum", percentile: 89 }, { name: "Quality", percentile: 82 }, { name: "Value", percentile: 76 }, { name: "Low Vol", percentile: 71 }, { name: "Size", percentile: 65 }], dispersionSnapshot: [{ factor: "Momentum", dispersionIndex: 0.22 }, { factor: "Quality", dispersionIndex: 0.28 }, { factor: "Value", dispersionIndex: 0.31 }], trendCrowding: [48, 48.7, 49.4, 50.1, 50.8, 51.4, 52, 52.6, 53.2, 53.8, 54.4, 55, 55.5, 56, 56.5, 57, 57.5, 58, 57.6, 57.2, 56.8, 57, 57.3, 57.6, 57.9, 58, 57.7, 57.9, 58.1, 58], trendPsi: [0.58, 0.585, 0.59, 0.595, 0.60, 0.605, 0.61, 0.615, 0.62, 0.625, 0.63, 0.635, 0.64, 0.645, 0.65, 0.655, 0.66, 0.665, 0.67, 0.668, 0.665, 0.662, 0.665, 0.668, 0.67, 0.668, 0.665, 0.668, 0.67, 0.67] }
    ]
  };

  function formatAum(aum) {
    if (aum == null) return "—";
    if (aum >= 1000) return (aum / 1000).toFixed(1) + "B";
    return aum + "M";
  }

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

  function getConfidence(p) {
    return p.confidence || p.confidenceLabel || "";
  }

  function getBadgeClass(portfolio) {
    var c = getConfidence(portfolio);
    if (c === "Internal") return "badge-neutral";
    if (c === "Directional") return "badge-warning";
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

  function drawScatterChartOne(canvasId, portfolios, selectedId, yKey, yLabel, tooltipY) {
    var canvas = byId(canvasId);
    if (!canvas || !portfolios || portfolios.length === 0) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 400;
    var h = canvas.clientHeight || 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    var padding = { top: 20, right: 20, bottom: 40, left: 45 };
    var chartW = w - padding.left - padding.right;
    var chartH = h - padding.top - padding.bottom;

    var psiVals = portfolios.map(function (p) { return p.kpis && p.kpis.psi != null ? p.kpis.psi : 0; });
    var yVals = portfolios.map(function (p) { return p.kpis && p.kpis[yKey] != null ? p.kpis[yKey] : 0; });
    var psiMin = Math.min.apply(null, psiVals);
    var psiMax = Math.max.apply(null, psiVals);
    var yMin = Math.min.apply(null, yVals);
    var yMax = Math.max.apply(null, yVals);
    var axisPad = 0.08;
    var psiPad = Math.max(0.05, (psiMax - psiMin) * axisPad);
    var yPad = Math.max(1, (yMax - yMin) * axisPad);
    psiMin = Math.max(-1, psiMin - psiPad);
    psiMax = Math.min(1, psiMax + psiPad);
    yMin -= yPad;
    yMax += yPad;
    var psiRange = psiMax - psiMin || 0.1;
    var yRange = yMax - yMin || 1;
    var aumVals = portfolios.map(function (p) { return p.aum != null ? p.aum : 0; });
    var aumMin = Math.min.apply(null, aumVals);
    var aumMax = Math.max.apply(null, aumVals) || 1;
    var minRadius = 6;
    var maxRadius = 24;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#8b949e";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("PSI →", padding.left + chartW / 2, h - 12);
    ctx.save();
    ctx.translate(12, padding.top + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel + " ↑", 0, 0);
    ctx.restore();

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    [yMin, (yMin + yMax) / 2, yMax].forEach(function (v) {
      var y = padding.top + chartH - (v - yMin) / yRange * chartH;
      ctx.fillText(v.toFixed(1), padding.left - 6, y);
    });
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    [psiMin, (psiMin + psiMax) / 2, psiMax].forEach(function (v) {
      var x = padding.left + (v - psiMin) / psiRange * chartW;
      ctx.fillText(v.toFixed(2), x, padding.top + chartH + 6);
    });

    ctx.strokeStyle = "#30363d";
    ctx.lineWidth = 1;
    ctx.strokeRect(padding.left, padding.top, chartW, chartH);

    var bubbles = [];
    portfolios.forEach(function (p) {
      var psi = p.kpis && p.kpis.psi != null ? p.kpis.psi : 0;
      var yVal = p.kpis && p.kpis[yKey] != null ? p.kpis[yKey] : 0;
      var aum = p.aum != null ? p.aum : aumMin;
      var r = minRadius + (Math.sqrt(aum) - Math.sqrt(aumMin)) / (Math.sqrt(aumMax) - Math.sqrt(aumMin) || 1) * (maxRadius - minRadius);
      var x = padding.left + (psi - psiMin) / psiRange * chartW;
      var y = padding.top + chartH - (yVal - yMin) / yRange * chartH;
      bubbles.push({ p: p, x: x, y: y, r: Math.max(minRadius, r), tooltipYFn: tooltipY });
    });

    var confidenceColors = {
      Internal: { fill: "rgba(139, 148, 158, 0.5)", stroke: "#8b949e" },
      Directional: { fill: "rgba(210, 153, 34, 0.5)", stroke: "#d29922" },
      Robust: { fill: "rgba(63, 185, 80, 0.5)", stroke: "#3fb950" }
    };
    bubbles.forEach(function (b) {
      var c = b.p.confidence || "Internal";
      var colors = confidenceColors[c] || confidenceColors.Internal;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = selectedId === b.p.id ? colors.fill.replace("0.5)", "0.75)") : colors.fill;
      ctx.fill();
      ctx.strokeStyle = selectedId === b.p.id ? colors.stroke : "#30363d";
      ctx.lineWidth = selectedId === b.p.id ? 2 : 1;
      ctx.stroke();
    });

    canvas._scatterBubbles = bubbles;
  }

  function drawScatterChart(portfolios, selectedId, onSelect) {
    drawScatterChartOne("scatterChart", portfolios, selectedId, "crowdingScore", "Crowding Score", function (p) { return "Crowding: " + (p.kpis.crowdingScore || 0); });
    drawScatterChartOne("scatterChart2", portfolios, selectedId, "crowdingMomentum30d", "Crowding Momentum", function (p) { var m = p.kpis.crowdingMomentum30d; return "Momentum: " + (m >= 0 ? "+" : "") + (m || 0).toFixed(1); });
  }

  function setupScatterClick(onSelect) {
    ["scatterChart", "scatterChart2"].forEach(function (canvasId) {
      var canvas = byId(canvasId);
      if (!canvas) return;
      canvas.style.cursor = "pointer";
      canvas.addEventListener("click", function (ev) {
        var bubbles = canvas._scatterBubbles;
        if (!bubbles || !onSelect) return;
        var rect = canvas.getBoundingClientRect();
        var px = ev.clientX - rect.left;
        var py = ev.clientY - rect.top;
        for (var i = bubbles.length - 1; i >= 0; i--) {
          var b = bubbles[i];
          var dx = px - b.x;
          var dy = py - b.y;
          if (dx * dx + dy * dy <= b.r * b.r) {
            onSelect(b.p.id);
            return;
          }
        }
      });
      canvas.addEventListener("mousemove", function (ev) {
        var bubbles = canvas._scatterBubbles;
        if (!bubbles) return;
        var rect = canvas.getBoundingClientRect();
        var px = ev.clientX - rect.left;
        var py = ev.clientY - rect.top;
        var hit = false;
        for (var i = bubbles.length - 1; i >= 0; i--) {
          var b = bubbles[i];
          var dx = px - b.x;
          var dy = py - b.y;
          if (dx * dx + dy * dy <= b.r * b.r) {
            hit = true;
            var tt = byId("tooltip");
            if (tt) {
              var yStr = typeof b.tooltipYFn === "function" ? b.tooltipYFn(b.p) : "";
              tt.textContent = b.p.name + " — PSI: " + (b.p.kpis.psi || 0).toFixed(2) + ", " + yStr + ", AUM: " + formatAum(b.p.aum);
              tt.classList.add("visible");
              tt.style.left = (ev.clientX + 12) + "px";
              tt.style.top = (ev.clientY + 12) + "px";
            }
            break;
          }
        }
        if (!hit) hideTooltip();
      });
      canvas.addEventListener("mouseleave", hideTooltip);
    });
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

  function renderDashboard(portfolio) {
    if (!portfolio) return;

    var nameEl = byId("selectedPortfolioName");
    if (nameEl) nameEl.textContent = portfolio.name;

    var badge = byId("confidenceBadge");
    if (badge) {
      badge.textContent = getConfidence(portfolio);
      badge.className = "badge " + getBadgeClass(portfolio);
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
        row.addEventListener("mouseenter", function () { showTooltip(row, factorTip); });
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

  function buildTable(portfolios, selectedId) {
    var tbody = byId("portfolioTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    portfolios.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.dataset.portfolioId = p.id;
      tr.className = selectedId === p.id ? "selected" : "";
      tr.innerHTML =
        "<td>" + (p.name || "") + "</td>" +
        "<td><span class=\"badge badge-" + (getBadgeClass(p).replace("badge-", "")) + "\">" + getConfidence(p) + "</span></td>" +
        "<td>" + (p.assetClass || "") + "</td>" +
        "<td>" + formatAum(p.aum) + "</td>" +
        "<td>" + (p.kpis.crowdingScore != null ? p.kpis.crowdingScore : "—") + "</td>" +
        "<td>" + (p.kpis.psi != null ? p.kpis.psi.toFixed(2) : "—") + "</td>" +
        "<td>" + (p.kpis.peerOverlapRatio != null ? p.kpis.peerOverlapRatio + "%" : "—") + "</td>" +
        "<td>" + (p.kpis.crowdingMomentum30d != null ? (p.kpis.crowdingMomentum30d >= 0 ? "+" : "") + p.kpis.crowdingMomentum30d.toFixed(1) : "—") + "</td>";
      tbody.appendChild(tr);
    });
  }

  function sortPortfolios(portfolios, key, dir) {
    var arr = portfolios.slice();
    arr.sort(function (a, b) {
      var va, vb;
      if (key === "name") {
        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();
        return dir * va.localeCompare(vb);
      }
      if (key === "confidence") {
        va = (a.confidence || a.confidenceLabel || "").toLowerCase();
        vb = (b.confidence || b.confidenceLabel || "").toLowerCase();
        return dir * va.localeCompare(vb);
      }
      if (key === "assetClass") {
        va = (a.assetClass || "").toLowerCase();
        vb = (b.assetClass || "").toLowerCase();
        return dir * va.localeCompare(vb);
      }
      if (key === "crowdingScore") {
        va = a.kpis && a.kpis.crowdingScore != null ? a.kpis.crowdingScore : -1;
        vb = b.kpis && b.kpis.crowdingScore != null ? b.kpis.crowdingScore : -1;
        return dir * (va - vb);
      }
      if (key === "psi") {
        va = a.kpis && a.kpis.psi != null ? a.kpis.psi : -1;
        vb = b.kpis && b.kpis.psi != null ? b.kpis.psi : -1;
        return dir * (va - vb);
      }
      if (key === "peerOverlapRatio") {
        va = a.kpis && a.kpis.peerOverlapRatio != null ? a.kpis.peerOverlapRatio : -1;
        vb = b.kpis && b.kpis.peerOverlapRatio != null ? b.kpis.peerOverlapRatio : -1;
        return dir * (va - vb);
      }
      if (key === "crowdingMomentum30d") {
        va = a.kpis && a.kpis.crowdingMomentum30d != null ? a.kpis.crowdingMomentum30d : -999;
        vb = b.kpis && b.kpis.crowdingMomentum30d != null ? b.kpis.crowdingMomentum30d : -999;
        return dir * (va - vb);
      }
      if (key === "aum") {
        va = a.aum != null ? a.aum : -1;
        vb = b.aum != null ? b.aum : -1;
        return dir * (va - vb);
      }
      return 0;
    });
    return arr;
  }

  function init() {
    var data = FALLBACK_DATA;
    var sortKey = "name";
    var sortDir = 1;
    var selectedId = null;

    fetch("data.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        if (d && d.portfolios && d.portfolios.length > 0) data = d;
      })
      .catch(function () {})
      .then(function () {
        var portfolios = data.portfolios || [];
        if (portfolios.length === 0) return;

        function applyFiltersAndSort() {
          var conf = (byId("filterConfidence") || {}).value || "";
          var ac = (byId("filterAssetClass") || {}).value || "";
          var filtered = portfolios.filter(function (p) {
            if (conf && getConfidence(p) !== conf) return false;
            if (ac && (p.assetClass || "") !== ac) return false;
            return true;
          });
          return sortPortfolios(filtered, sortKey, sortDir);
        }

        function updateSortIndicators() {
          var table = byId("portfolioTable");
          if (!table) return;
          var headers = table.querySelectorAll("th[data-sort]");
          headers.forEach(function (th) {
            th.classList.remove("sort-asc", "sort-desc");
            if (th.dataset.sort === sortKey) th.classList.add(sortDir === 1 ? "sort-asc" : "sort-desc");
          });
        }

        function refresh() {
          var sorted = applyFiltersAndSort();
          var selectedInList = sorted.some(function (p) { return p.id === selectedId; });
          if (!selectedInList && sorted.length > 0) selectPortfolio(sorted[0].id);
          else {
            buildTable(sorted, selectedId);
            updateSortIndicators();
            drawScatterChart(sorted, selectedId, selectPortfolio);
          }
        }

        function selectPortfolio(id) {
          selectedId = id;
          var p = portfolios.filter(function (x) { return x.id === id; })[0];
          if (p) renderDashboard(p);
          refresh();
        }

        setupScatterClick(selectPortfolio);

        var sorted = applyFiltersAndSort();
        if (sorted.length > 0) selectPortfolio(sorted[0].id);
        else refresh();

        var tbody = byId("portfolioTableBody");
        if (tbody) {
          tbody.addEventListener("click", function (ev) {
            var tr = ev.target.closest("tr[data-portfolio-id]");
            if (tr) selectPortfolio(tr.dataset.portfolioId);
          });
        }

        var filterConf = byId("filterConfidence");
        var filterAc = byId("filterAssetClass");
        if (filterConf) filterConf.addEventListener("change", refresh);
        if (filterAc) filterAc.addEventListener("change", refresh);

        var table = byId("portfolioTable");
        if (table) {
          table.addEventListener("click", function (ev) {
            var th = ev.target.closest("th[data-sort]");
            if (!th) return;
            var key = th.dataset.sort;
            if (sortKey === key) sortDir = -sortDir;
            else { sortKey = key; sortDir = 1; }
            refresh();
          });
        }
      });

    var howTrigger = byId("howItWorksTrigger");
    var howContent = byId("howItWorksContent");
    if (howTrigger && howContent) {
      howTrigger.addEventListener("click", function () {
        var open = howContent.classList.toggle("open");
        howTrigger.setAttribute("aria-expanded", open);
      });
    }

    ["tooltipFactorCrowding", "tooltipDispersion"].forEach(function (id) {
      var btn = byId(id);
      if (!btn) return;
      var key = id.replace("tooltip", "").replace(/([A-Z])/g, function (m) { return m.toLowerCase(); });
      if (key === "factorcrowding") key = "factorCrowding";
      if (key === "dispersion") key = "dispersion";
      var text = TOOLTIPS[key];
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
