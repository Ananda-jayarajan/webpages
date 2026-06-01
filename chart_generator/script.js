const initialData = [
  { label: "Design", value: 92 },
  { label: "Speed", value: 84 },
  { label: "Usability", value: 96 },
  { label: "Features", value: 78 },
  { label: "Reliability", value: 88 },
  { label: "Support", value: 74 }
];

const blankData = [
  { label: "Category 1", value: 70 },
  { label: "Category 2", value: 85 },
  { label: "Category 3", value: 60 },
  { label: "Category 4", value: 90 },
  { label: "Category 5", value: 75 }
];

const state = {
  points: structuredClone(initialData),
  chart: null,
  updateTimer: null
};

const elements = {
  chartTitle: document.querySelector("#chartTitle"),
  datasetName: document.querySelector("#datasetName"),
  lineColor: document.querySelector("#lineColor"),
  fillColor: document.querySelector("#fillColor"),
  gridColor: document.querySelector("#gridColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  scaleMax: document.querySelector("#scaleMax"),
  fillOpacity: document.querySelector("#fillOpacity"),
  dataRows: document.querySelector("#dataRows"),
  addRowButton: document.querySelector("#addRowButton"),
  generateButton: document.querySelector("#generateButton"),
  sampleButton: document.querySelector("#sampleButton"),
  heroSampleButton: document.querySelector("#heroSampleButton"),
  resetButton: document.querySelector("#resetButton"),
  exportButton: document.querySelector("#exportButton"),
  pointCount: document.querySelector("#pointCount"),
  averageValue: document.querySelector("#averageValue"),
  highestValue: document.querySelector("#highestValue"),
  toast: document.querySelector("#toast"),
  chartCanvas: document.querySelector("#radarChart"),
  chartCard: document.querySelector("#chartCard")
};

const canvasBackgroundPlugin = {
  id: "canvasBackground",
  beforeDraw(chart, args, options) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = options.color || "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

Chart.register(canvasBackgroundPlugin);

document.addEventListener("DOMContentLoaded", () => {
  renderRows();
  renderChart();
  bindEvents();
});

function bindEvents() {
  elements.addRowButton.addEventListener("click", addRow);
  elements.generateButton.addEventListener("click", () => {
    syncStateFromRows();
    renderChart();
    showToast("Chart generated.");
  });
  elements.sampleButton.addEventListener("click", loadSampleData);
  elements.heroSampleButton.addEventListener("click", () => {
    loadSampleData();
    document.querySelector("#editor").scrollIntoView({ behavior: "smooth" });
  });
  elements.resetButton.addEventListener("click", resetEditor);
  elements.exportButton.addEventListener("click", exportChartImage);

  [
    elements.chartTitle,
    elements.datasetName,
    elements.lineColor,
    elements.fillColor,
    elements.gridColor,
    elements.backgroundColor,
    elements.scaleMax,
    elements.fillOpacity
  ].forEach((input) => {
    input.addEventListener("input", queueChartUpdate);
  });

  elements.dataRows.addEventListener("input", (event) => {
    if (event.target.matches("input")) {
      syncStateFromRows();
      queueChartUpdate();
    }
  });

  elements.dataRows.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-row-button");
    if (!button) return;
    const index = Number(button.dataset.index);
    removeRow(index);
  });
}

function renderRows() {
  elements.dataRows.innerHTML = "";

  state.points.forEach((point, index) => {
    const row = document.createElement("div");
    row.className = "data-row";
    row.setAttribute("role", "row");

    row.innerHTML = `
      <input
        type="text"
        class="label-input"
        value="${escapeHtml(point.label)}"
        aria-label="Label for point ${index + 1}"
        placeholder="Example: Quality"
        data-index="${index}"
      />
      <input
        type="number"
        class="value-input"
        value="${Number(point.value)}"
        min="0"
        step="1"
        aria-label="Value for point ${index + 1}"
        placeholder="80"
        data-index="${index}"
      />
      <button
        type="button"
        class="remove-row-button"
        aria-label="Remove point ${index + 1}"
        data-index="${index}"
        ${state.points.length <= 3 ? "disabled" : ""}
      >×</button>
    `;

    elements.dataRows.appendChild(row);
  });
}

function addRow() {
  syncStateFromRows();
  const nextNumber = state.points.length + 1;
  state.points.push({ label: `Category ${nextNumber}`, value: 50 });
  renderRows();
  renderChart();
  showToast("New data point added.");
}

function removeRow(index) {
  syncStateFromRows();

  if (state.points.length <= 3) {
    showToast("Keep at least 3 points for a radar chart.");
    return;
  }

  state.points.splice(index, 1);
  renderRows();
  renderChart();
  showToast("Data point removed.");
}

function syncStateFromRows() {
  const labels = Array.from(elements.dataRows.querySelectorAll(".label-input"));
  const values = Array.from(elements.dataRows.querySelectorAll(".value-input"));

  state.points = labels.map((labelInput, index) => {
    const cleanLabel = labelInput.value.trim() || `Category ${index + 1}`;
    const parsedValue = Number(values[index].value);

    return {
      label: cleanLabel,
      value: Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0
    };
  });
}

function getChartSettings() {
  const rawMax = Number(elements.scaleMax.value);
  const highestValue = Math.max(...state.points.map((point) => point.value), 0);
  const scaleMax = Number.isFinite(rawMax) && rawMax > 0
    ? Math.max(rawMax, highestValue || rawMax)
    : Math.max(100, highestValue);

  return {
    title: elements.chartTitle.value.trim() || "Untitled Radar Chart",
    datasetName: elements.datasetName.value.trim() || "Dataset",
    lineColor: elements.lineColor.value,
    fillColor: hexToRgba(elements.fillColor.value, Number(elements.fillOpacity.value)),
    gridColor: elements.gridColor.value,
    backgroundColor: elements.backgroundColor.value,
    scaleMax
  };
}

function renderChart() {
  syncStateFromRows();

  if (state.points.length < 3) {
    showToast("Add at least 3 points to generate a radar chart.");
    return;
  }

  const settings = getChartSettings();
  const labels = state.points.map((point) => point.label);
  const values = state.points.map((point) => point.value);
  const ctx = elements.chartCanvas.getContext("2d");

  if (state.chart) {
    state.chart.destroy();
  }

  elements.chartCard.style.background = settings.backgroundColor;

  state.chart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: settings.datasetName,
          data: values,
          fill: true,
          backgroundColor: settings.fillColor,
          borderColor: settings.lineColor,
          pointBackgroundColor: settings.lineColor,
          pointBorderColor: "#ffffff",
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: settings.lineColor,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.15
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 450,
        easing: "easeOutQuart"
      },
      plugins: {
        canvasBackground: {
          color: settings.backgroundColor
        },
        title: {
          display: true,
          text: settings.title,
          color: "#111827",
          font: {
            size: 20,
            family: "Inter, system-ui, sans-serif",
            weight: "700"
          },
          padding: {
            top: 6,
            bottom: 18
          }
        },
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#374151",
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
            padding: 18,
            font: {
              family: "Inter, system-ui, sans-serif",
              weight: "600"
            }
          }
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.94)",
          titleFont: {
            family: "Inter, system-ui, sans-serif",
            weight: "700"
          },
          bodyFont: {
            family: "Inter, system-ui, sans-serif"
          },
          padding: 12,
          cornerRadius: 12,
          displayColors: false,
          callbacks: {
            label(context) {
              return `${settings.datasetName}: ${context.formattedValue}`;
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: settings.scaleMax,
          beginAtZero: true,
          ticks: {
            backdropColor: "transparent",
            color: "#6b7280",
            showLabelBackdrop: false,
            maxTicksLimit: 6,
            font: {
              family: "Inter, system-ui, sans-serif",
              size: 11,
              weight: "600"
            }
          },
          pointLabels: {
            color: "#111827",
            padding: 12,
            font: {
              family: "Inter, system-ui, sans-serif",
              size: 13,
              weight: "700"
            }
          },
          angleLines: {
            color: settings.gridColor,
            lineWidth: 1
          },
          grid: {
            color: settings.gridColor,
            circular: true
          }
        }
      }
    }
  });

  updateSummary(values);
}

function updateSummary(values) {
  const count = values.length;
  const total = values.reduce((sum, value) => sum + value, 0);
  const average = count ? total / count : 0;
  const highest = count ? Math.max(...values) : 0;

  elements.pointCount.textContent = String(count);
  elements.averageValue.textContent = formatNumber(average);
  elements.highestValue.textContent = formatNumber(highest);
}

function queueChartUpdate() {
  window.clearTimeout(state.updateTimer);
  state.updateTimer = window.setTimeout(renderChart, 160);
}

function loadSampleData() {
  elements.chartTitle.value = "Product Skill Comparison";
  elements.datasetName.value = "Team A";
  elements.lineColor.value = "#4f46e5";
  elements.fillColor.value = "#6366f1";
  elements.gridColor.value = "#d7dce8";
  elements.backgroundColor.value = "#ffffff";
  elements.scaleMax.value = "100";
  elements.fillOpacity.value = "0.22";

  state.points = structuredClone(initialData);
  renderRows();
  renderChart();
  showToast("Sample chart loaded.");
}

function resetEditor() {
  elements.chartTitle.value = "Untitled Radar Chart";
  elements.datasetName.value = "My Dataset";
  elements.lineColor.value = "#4f46e5";
  elements.fillColor.value = "#6366f1";
  elements.gridColor.value = "#d7dce8";
  elements.backgroundColor.value = "#ffffff";
  elements.scaleMax.value = "100";
  elements.fillOpacity.value = "0.22";

  state.points = structuredClone(blankData);
  renderRows();
  renderChart();
  showToast("Editor reset.");
}

function exportChartImage() {
  if (!state.chart) {
    showToast("Generate a chart before exporting.");
    return;
  }

  renderChart();

  window.setTimeout(() => {
    const safeTitle = (elements.chartTitle.value.trim() || "radar-chart")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const link = document.createElement("a");
    link.download = `${safeTitle || "radar-chart"}.png`;
    link.href = elements.chartCanvas.toDataURL("image/png", 1);
    link.click();
    showToast("Chart image exported.");
  }, 120);
}

function hexToRgba(hex, alpha = 0.2) {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const safeAlpha = Number.isFinite(alpha) ? Math.min(Math.max(alpha, 0), 1) : 0.2;

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}
