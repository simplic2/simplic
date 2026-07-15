let currentCharts = {};

function initDashboardCharts(themePrimary, themeSecondary) {
    // Destruir gráficos anteriores se existirem
    if (currentCharts.conversion) currentCharts.conversion.destroy();
    if (currentCharts.source) currentCharts.source.destroy();

    const ctx1 = document.getElementById('conversionChart').getContext('2d');
    currentCharts.conversion = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Sucesso',
                data: [65, 78, 72, 89, 95, 45, 60],
                borderColor: themePrimary,
                tension: 0.3,
                fill: false
            }]
        },
        options: { responsive: true }
    });

    const ctx2 = document.getElementById('sourceChart').getContext('2d');
    currentCharts.source = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['WhatsApp Direct', 'Anúncios', 'Orgânico'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: [themePrimary, themeSecondary, '#cbd5e0']
            }]
        },
        options: { responsive: true }
    });
}