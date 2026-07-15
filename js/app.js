document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const brandSelector = document.getElementById('brandSelector');
    
    // ⚡ Ocultar Loader com delay premium
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1000);

    // Função de Troca de Identidade (Simplic <--> Loft)
    function applyBrandChanges(brand) {
        const body = document.body;
        const welcomeMessage = document.getElementById('welcome-message');

        if (brand === 'simplic') {
            body.className = 'brand-simplic';
            welcomeMessage.innerHTML = 'Olá, Operador <strong>Simplic</strong>';
            
            // KPIs fictícios para Simplic
            document.getElementById('kpi-leads').textContent = '1,248';
            document.getElementById('kpi-chats').textContent = '312';
            document.getElementById('kpi-conversion').textContent = '24.5%';

            // Recarregar gráficos com as cores Simplic
            initDashboardCharts('#007a87', '#43b02a');
            updateWhatsappTemplates('simplic');
        } else if (brand === 'loft') {
            body.className = 'brand-loft';
            welcomeMessage.innerHTML = 'Olá, Operador <strong>Loft</strong>';
            
            // KPIs fictícios para Loft
            document.getElementById('kpi-leads').textContent = '842';
            document.getElementById('kpi-chats').textContent = '195';
            document.getElementById('kpi-conversion').textContent = '31.2%';

            // Recarregar gráficos com as cores Loft
            initDashboardCharts('#f15a24', '#2d3748');
            updateWhatsappTemplates('loft');
        }
    }

    // Escuta a alteração no seletor do Sidebar
    brandSelector.addEventListener('change', (e) => {
        applyBrandChanges(e.target.value);
    });

    // Inicialização do Painel Padrão (Simplic)
    applyBrandChanges('simplic');
});