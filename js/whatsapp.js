document.addEventListener('DOMContentLoaded', () => {
    const btnSend = document.getElementById('btnSendWhatsApp');
    
    if (btnSend) {
        btnSend.addEventListener('click', () => {
            const clientName = document.getElementById('clientName').value;
            const chargeValue = document.getElementById('chargeValue').value;
            const paymentLink = document.getElementById('paymentLink').value;
            const template = document.getElementById('whatsappTemplate').value;

            if (!clientName || !chargeValue || !paymentLink) {
                alert("Por favor, preencha os dados e gere o link de pagamento primeiro!");
                return;
            }

            // Substitui as variáveis no texto do template
            let message = template
                .replace('[Nome]', clientName)
                .replace('[Valor]', chargeValue)
                .replace('[Link]', paymentLink);

            // Abre o WhatsApp Web com o texto pronto
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
        });
    }
});
