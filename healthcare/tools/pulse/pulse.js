// Simple static dashboard (no deps)
(function () {
  const $ = (s) => document.querySelector(s);

  const state = {
    data: null,
    dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
  };

  init();

  async function init() {
    try {
      const res = await fetch("data/metrics.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status} for data/metrics.json`);
      const data = await res.json();
      state.data = normalize(data);
      renderKPIs(state.data);
      draw();
      window.addEventListener("resize", debounce(draw, 150));
      $(
        "#generated"
      ).textContent = `Data generated: ${state.data.generated_at}`;
    } catch (err) {
      const box = $("#error");
      box.textContent = `Could not load metrics.json: ${err.message}`;
      box.hidden = false;
    }
  }

  function renderKPIs(data) {
    const kpis = [
      {
        label: "Avg Wait (mins)",
        value: data.summary.avg_wait_minutes.toFixed(1),
      },
      {
        label: "No-Show Rate",
        value: (data.summary.no_show_rate * 100).toFixed(1) + "%",
      },
      {
        label: "Cancellation Rate",
        value: (data.summary.cancellation_rate * 100).toFixed(1) + "%",
      },
      {
        label: "First-Contact Resolution",
        value: (data.summary.first_contact_resolution * 100).toFixed(0) + "%",
      },
    ];
    $("#kpis").innerHTML = kpis
      .map(
        (k) =>
          `<div class="kpi"><div class="v">${k.value}</div><div class="l">${k.label}</div></div>`
      )
      .join("");
  }

  function draw() {
    if (!state.data) return;
    lineChart(
      $("#chartWait"),
      state.data.timeseries.dates,
      state.data.timeseries.avg_wait_minutes,
      { unit: "min" }
    );
    lineChart(
      $("#chartNoShow"),
      state.data.timeseries.dates,
      state.data.timeseries.no_show_rate.map((x) => x * 100),
      { unit: "%", decimals: 1 }
    );
  }

  function lineChart(canvas, labels, values, opts = {}) {
    const dpr = state.dpr;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = 28;
    const w = cssW - pad * 2;
    const h = cssH - pad * 2;

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = maxVal - minVal || 1; // avoid 0 span

    const x = (i) => pad + (i / Math.max(1, labels.length - 1)) * w;
    const y = (v) => pad + h - ((v - minVal) / span) * h;

    // bg grid
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.strokeStyle = "#243a6b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, pad + h);
    ctx.lineTo(pad + w, pad + h);
    ctx.stroke();

    // y labels
    ctx.fillStyle = "#a7b4cc";
    ctx.font = "12px Inter, system-ui, sans-serif";
    const topLabel = formatNum(maxVal, opts);
    const botLabel = formatNum(minVal, opts);
    ctx.fillText(topLabel, 6, pad + 10);
    ctx.fillText(botLabel, 6, pad + h);

    // x labels (sparse)
    const step = Math.ceil(labels.length / 6);
    labels.forEach((d, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const tx = x(i);
        ctx.fillText(shortDate(d), tx - 18, pad + h + 16);
      }
    });

    // line
    ctx.strokeStyle = "#0ea5e9";
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) =>
      i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v))
    );
    ctx.stroke();

    // points
    ctx.fillStyle = "#22d3ee";
    values.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(x(i), y(v), 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function normalize(data) {
    // Keep the shape minimal and predictable
    return {
      generated_at: data.generated_at || new Date().toISOString(),
      summary: {
        avg_wait_minutes: +data.summary.avg_wait_minutes || 0,
        no_show_rate: +data.summary.no_show_rate || 0,
        cancellation_rate: +data.summary.cancellation_rate || 0,
        first_contact_resolution: +data.summary.first_contact_resolution || 0,
      },
      timeseries: {
        dates: data.timeseries.dates || [],
        avg_wait_minutes: data.timeseries.avg_wait_minutes || [],
        no_show_rate: data.timeseries.no_show_rate || [],
        cancellations: data.timeseries.cancellations || [],
        visits: data.timeseries.visits || [],
      },
    };
  }

  function shortDate(iso) {
    // "2025-08-01" -> "Aug 1"
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function formatNum(v, { unit = "", decimals = 0 } = {}) {
    const n = (v ?? 0).toFixed(decimals);
    return unit === "%" ? `${n}%` : unit === "min" ? `${n}` : `${n}`;
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), ms);
    };
  }
})();
