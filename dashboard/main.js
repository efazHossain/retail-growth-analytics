const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

fetch("/data/processed/summary.json")
  .then((response) => response.json())
  .then(renderDashboard)
  .catch((error) => {
    document.body.insertAdjacentHTML("beforeend", `<pre>${error.message}</pre>`);
  });

function renderDashboard(data) {
  renderKpis(data.kpis);
  renderTrend(data.monthly);
  renderTable(data.byCategory);
  renderBars("channels", data.byChannel, "channel", "revenue", currency);
  renderBars("regions", data.byRegion, "region", "margin_rate", percent);
}

function renderKpis(kpis) {
  const metrics = [
    ["Revenue", currency.format(kpis.revenue)],
    ["Profit", currency.format(kpis.profit)],
    ["Average Order Value", currency.format(kpis.average_order_value)],
    ["Gross Margin", percent.format(kpis.gross_margin_rate)]
  ];
  document.querySelector("#kpis").innerHTML = metrics.map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
}

function renderTrend(monthly) {
  const canvas = document.querySelector("#trend");
  const ctx = canvas.getContext("2d");
  const padding = 48;
  const values = monthly.map((row) => row.revenue);
  const max = Math.max(...values) * 1.08;
  const min = Math.min(...values) * 0.92;
  const xStep = (canvas.width - padding * 2) / (monthly.length - 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d9e2ec";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = padding + i * ((canvas.height - padding * 2) / 4);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#1d6fd6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  monthly.forEach((row, index) => {
    const x = padding + index * xStep;
    const y = canvas.height - padding - ((row.revenue - min) / (max - min)) * (canvas.height - padding * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#16202a";
  ctx.font = "18px Arial";
  ctx.fillText(currency.format(values.at(-1)), canvas.width - 190, padding + 8);
}

function renderTable(rows) {
  const headers = ["Category", "Revenue", "Profit", "Margin"];
  document.querySelector("#categories").innerHTML = `
    <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows.map((row) => `
        <tr>
          <td>${row.category}</td>
          <td>${currency.format(row.revenue)}</td>
          <td>${currency.format(row.profit)}</td>
          <td>${percent.format(row.margin_rate)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderBars(id, rows, labelField, valueField, formatter) {
  const max = Math.max(...rows.map((row) => row[valueField]));
  document.querySelector(`#${id}`).innerHTML = rows.map((row) => `
    <div class="bar-row">
      <div class="bar-label"><span>${row[labelField]}</span><strong>${formatter.format(row[valueField])}</strong></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(row[valueField] / max) * 100}%"></div></div>
    </div>
  `).join("");
}
