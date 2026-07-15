function updateWhatsappTemplates(brand) {
    const templateInput = document.getElementById('wa-template');
    if (brand === 'simplic') {
        templateInput.value = "Olá! Identificamos o seu interesse no crédito rápido da Simplic. Vamos dar andamento ao seu cadastro?";
    } else {
        templateInput.value = "Olá! Obrigado por entrar em contato com a Loft. Gostaria de agendar uma visita ao seu imóvel selecionado?";
    }
}

document.getElementById('btnTestWA').addEventListener('click', () => {
    const message = document.getElementById('wa-template').value;
    alert(`🚀 [SIMULADOR DE ENVIO] Mensagem enviada com sucesso:\n\n"${message}"`);
});