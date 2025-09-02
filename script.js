document.getElementById("forecast-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const eps = parseFloat(document.getElementById("eps").value);
  const startYear = parseInt(document.getElementById("year").value);
  const growthPct = parseFloat(document.getElementById("growth").value);
  const prices = document.getElementById("prices").value
    .split(",")
    .map(p => parseFloat(p.trim()))
    .filter(p => !isNaN(p));
  const years = parseInt(document.getElementById("years").value);

  const g = 1 + growthPct / 100;
  const labels = [];
  const epsData = [];
  const peData = prices.map(() => []);

  for (let i = 0; i <= years; i++) {
    const year = startYear + i;
    const currentEPS = eps * Math.pow(g, i);

    labels.push(year);
    epsData.push(currentEPS);

    prices.forEach((p, idx) => {
      peData[idx].push(p / currentEPS);
    });
  }

  renderCharts(labels, epsData, prices, peData);
});

let epsChart, peChart;

function renderCharts(labels, epsData, prices, peData) {
  if (epsChart) epsChart.destroy();
  if (peChart) peChart.destroy();

  const ctx1 = document.getElementById("epsChart").getContext("2d");
  epsChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "EPS ($)",
        data: epsData,
        borderColor: "#0070f3",
        backgroundColor: "rgba(0,112,243,0.2)",
        fill: true,
        tension: 0.2
      }]
    },
    options: { responsive: true, plugins: { legend: { display: true } } }
  });

  const ctx2 = document.getElementById("peChart").getContext("2d");
  peChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels,
      datasets: prices.map((p, idx) => ({
        label: `P/E (entry @ $${p})`,
        data: peData[idx],
        borderColor: `hsl(${(idx * 70) % 360},70%,50%)`,
        fill: false,
        tension: 0.2
      }))
    },
    options: { responsive: true, plugins: { legend: { display: true } } }
  });
}
