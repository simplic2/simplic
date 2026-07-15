let myChart = null;

function renderChart(color1, color2) {
    const ctx = document.getElementById('conversionChart');
    if (!ctx) return;

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Gerados', 'Enviados', 'Pagos'],
            datasets: [{
                label: 'Volume de Cobranças',
                data: [120, 95, 74],
                backgroundColor: [color1, color2, '#43b02a'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}
