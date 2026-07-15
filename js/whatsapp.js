const WhatsApp = {
    connected: false,

    init: function() {
        const btnGenerate = document.getElementById('btn-generate-qr');
        const btnDisconnect = document.getElementById('btn-disconnect');
        const qrContainer = document.getElementById('qr-container');

        btnGenerate.addEventListener('click', () => {
            qrContainer.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ZapPanelMockConnection" alt="QR Code">
                </div>
                <p style="margin-top:10px; font-size:0.9rem; color: #ffd279;">Escaneie para conectar em 5 segundos</p>
            `;
            
            // Simulação de leitura do QR Code
            setTimeout(() => {
                this.connected = true;
                this.updateUI();
            }, 5000);
        });

        btnDisconnect.addEventListener('click', () => {
            this.connected = false;
            this.updateUI();
            qrContainer.innerHTML = `
                <i class="fa-solid fa-qrcode qr-icon"></i>
                <p>Clique no botão abaixo para gerar o QR Code</p>
            `;
        });
    },

    updateUI: function() {
        const statusBox = document.getElementById('connection-status');
        const btnGenerate = document.getElementById('btn-generate-qr');
        const btnDisconnect = document.getElementById('btn-disconnect');
        const serverIndicator = document.querySelector('.status-indicator');
        const serverText = document.querySelector('.status-text');

        if (this.connected) {
            statusBox.className = "connection-status-box success";
            statusBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> Status: WhatsApp Conectado';
            btnGenerate.disabled = true;
            btnDisconnect.disabled = false;
            serverIndicator.className = "status-indicator online";
            serverText.textContent = "Servidor Ativo & Conectado";
        } else {
            statusBox.className = "connection-status-box";
            statusBox.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Status: Dispositivo Desconectado';
            btnGenerate.disabled = false;
            btnDisconnect.disabled = true;
            serverIndicator.className = "status-indicator offline";
            serverText.textContent = "WhatsApp Desconectado";
        }
    }
};
