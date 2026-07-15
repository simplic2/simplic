document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const brandSelector = document.getElementById('brandSelector');
    const btnGenerate = document.getElementById('btnGenerate');

    // 1. Remove o Loader inicial
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }, 800);
    }

    // 2. Lógica para gerar o link (Adapte ao seu método real de geração de links)
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const value = document.getElementById('chargeValue').value;
            if (!value) {
                alert("Insira um valor para gerar o link.");
                return;
            }
            // Simulação de geração de link de pagamento único
            const randomID = Math.floor(100000 + Math.random() * 900000);
            document.getElementById('paymentLink').value = `https://pagar.me/checkout/${randomID}`;
        });
    }

    // 3. Aplicação do visual da Marca (Simplic ou Loft)
    function applyBrand(brand) {
        const body = document.body;
        const welcomeMessage = document.getElementById('welcome-message');

        if (brand === 'simplic') {
            body.className = 'brand-simplic';
            if (welcomeMessage) welcomeMessage.innerHTML = 'Painel de Cobrança <strong>Simplic</strong>';
            renderChart('#007a87', '#43b02a'); // Azul e Verde
        } else {
            body.className = 'brand-loft';
            if (welcomeMessage) welcomeMessage.innerHTML = 'Painel de Cobrança <strong>Loft</strong>';
            renderChart('#f15a24', '#2d3748'); // Laranja e Cinza
        }
    }

    if (brandSelector) {
        brandSelector.addEventListener('change', (e) => applyBrand(e.target.value));
    }

    // Inicializa como Simplic por padrão
    applyBrand('simplic');
});
