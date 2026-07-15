const Dashboard = {
    logs: [
        { phone: '5511999999999', message: 'Olá! Seu pedido foi confirmado.', status: 'success', time: '14:23:10' },
        { phone: '5521988888888', message: 'Lembrete de agendamento amanhã às 10h.', status: 'success', time: '14:15:02' },
        { phone: '5531977777777', message: 'Seu código de verificação é 8493', status: 'failed', time: '13:58:44' }
    ],

    init: function() {
        this.renderStats();
        this.renderLogs();
        this.setupForm();
        
        document.getElementById('btn-refresh-logs').addEventListener('click', () => this.renderLogs());
    },

    renderStats: function() {
        const successCount = this.logs.filter(log => log.status === 'success').length;
        const failedCount = this.logs.filter(log => log.status === 'failed').length;
        
        document.getElementById('count-sent').innerText = this.logs.length;
        document.getElementById('count-delivered').innerText = successCount;
        document.getElementById('count-failed').innerText = failedCount;
    },

    renderLogs: function() {
        const tbody = document.getElementById('logs-table-body');
        tbody.innerHTML = '';

        this.logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${log.phone}</td>
                <td>${log.message}</td>
                <td><span class="badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}">${log.status === 'success' ? 'Entregue' : 'Falha'}</span></td>
                <td>${log.time}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    setupForm: function() {
        const form = document.getElementById('quick-send-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            this.logs.unshift({
                phone: phone,
                message: message,
                status: 'success',
                time: new Date().toLocaleTimeString()
            });

            this.renderStats();
            this.renderLogs();
            form.reset();
            alert("Mensagem enviada ficticiamente com sucesso!");
        });
    }
};
