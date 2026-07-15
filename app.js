// ==========================================
// CONFIGURAÇÕES SUPABASE
// ==========================================
const SUPABASE_URL = "https://kgidkxaqvgcqiqwqxvut.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaWRreGFxdmdjcWlxd3F4dnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODc0MzAsImV4cCI6MjA5ODA2MzQzMH0.DLQoO8_q_QeW-a084ZDCFRc0OIeuEDaYpkUg2tSCB0E"; 

let _supabase;

// Inicialização segura do cliente Supabase
try {
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Biblioteca do Supabase não foi carregada pelo HTML.");
    }
} catch (e) {
    console.error("Erro ao inicializar o cliente Supabase:", e);
}
// VARIÁVEIS GLOBAIS DE ESTADO
let usuarioLogado = "";
let empresaSelecionada = "";
let whatsappAccounts = []; 

// ==========================================
// TOAST NOTIFICATIONS (ALERTAS FLUTUANTES)
// ==========================================
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "🔔";
    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// SISTEMA DE LOGIN (CONECTADO AO SUPABASE)
// ==========================================
async function login(){
    let userField = document.getElementById("user");
    let passField = document.getElementById("pass");
    let companyField = document.getElementById("loginCompany");

    if (!userField || !passField || !companyField) {
        showToast("Erro crítico: Campos de login não encontrados.", "error");
        return;
    }

    let userDigitado = userField.value.trim();
    let passDigitadoAtual = passField.value.trim(); 
    let empresaEscolhida = companyField.value;

    try {
        // Busca o operador diretamente na tabela 'system_operators'
        const { data: usuario, error } = await _supabase
            .from('system_operators')
            .select('*')
            .eq('username', userDigitado)
            .single();

        if (error || !usuario || usuario.password !== passDigitadoAtual) {
            showToast("Login ou senha incorretos!", "error");
            return;
        }

        let empresasPermitidas = usuario.allowed_companies;

        // Validação estrita de escopo de empresa
        if (!empresasPermitidas.includes(empresaEscolhida)) {
            showToast(`Acesso negado! O usuário ${userDigitado} não tem permissão para acessar a ${empresaEscolhida}.`, "error");
            return;
        }

        usuarioLogado = usuario.username;
        empresaSelecionada = empresaEscolhida;

        // Persiste as credenciais codificadas no sessionStorage
        sessionStorage.setItem("_ss_op", btoa(usuarioLogado));
        sessionStorage.setItem("_ss_company", btoa(empresaSelecionada));

        // Aplica as mudanças exclusivas de layout para o Admin
        checkAdminLayout();

        document.getElementById("lblUsuario").innerText = usuarioLogado;
        document.getElementById("lblEmpresaAtiva").innerText = empresaSelecionada.toUpperCase() + " WHATSAPP";

        document.getElementById("login").classList.add("hidden");
        document.getElementById("app").classList.remove("hidden");

        showToast(`Bem-vindo, ${usuarioLogado}!`, "success");
        await syncLoadAll();

    } catch (err) {
        console.error(err);
        showToast("Erro ao tentar autenticar. Verifique sua rede.", "error");
    }
}

// ==========================================
// SAÍDA E LOGOUT DO SISTEMA
// ==========================================
function logout() {
    sessionStorage.clear();
    usuarioLogado = "";
    empresaSelecionada = "";
    
    document.getElementById("login").classList.remove("hidden");
    document.getElementById("app").classList.add("hidden");
    
    // Reseta o layout do grid ao estado padrão
    const mainGrid = document.getElementById("main-grid");
    const rightColumn = document.getElementById("right-column");
    if (mainGrid) mainGrid.style.gridTemplateColumns = "1.2fr 0.8fr";
    if (rightColumn) rightColumn.classList.remove("hidden");

    showToast("Sessão encerrada com sucesso.", "info");
}

// ==========================================
// ADAPTAÇÃO DA INTERFACE PARA ADMIN / OPERADOR
// ==========================================
function checkAdminLayout() {
    const btnAdmin = document.getElementById("btnAdminPanel");
    const rightColumn = document.getElementById("right-column");
    const mainGrid = document.getElementById("main-grid");

    if (usuarioLogado === "Admin") {
        // Mostra o botão do Painel Admin
        if (btnAdmin) btnAdmin.classList.remove("hidden");
        
        // INTERFACE DO ADMIN: Oculta toda a coluna de mídias/player e expande os envios
        if (rightColumn) rightColumn.classList.add("hidden");
        if (mainGrid) mainGrid.style.gridTemplateColumns = "1fr";
    } else {
        // INTERFACE DO OPERADOR: Esconde botão de admin e exibe a coluna operacional
        if (btnAdmin) btnAdmin.classList.add("hidden");
        if (rightColumn) rightColumn.classList.remove("hidden");
        if (mainGrid) mainGrid.style.gridTemplateColumns = "1.2fr 0.8fr";
    }
}

async function openAdminPanel() {
    document.getElementById("modalAdmin").classList.remove("hidden");
    await loadAdminMetrics();
}

function closeAdminPanel() {
    document.getElementById("modalAdmin").classList.add("hidden");
}

// ==========================================
// MÉTRICAS E CONTADORES DO PAINEL ADMIN
// ==========================================
async function loadAdminMetrics() {
    let tbody = document.getElementById("adminOperatorsTable");
    tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">Carregando métricas em tempo real...</td></tr>`;

    try {
        // Busca todos os operadores cadastrados no banco
        const { data: operadores, error: errOp } = await _supabase
            .from('system_operators')
            .select('*')
            .order('username', { ascending: true });

        if (errOp) throw errOp;

        let html = "";
        
        for (let op of operadores) {
            // Conta os contatos ativos na fila de cada operador
            const { count: filaCount, error: errFila } = await _supabase
                .from('contacts_queue')
                .select('*', { count: 'exact', head: true })
                .eq('operator_name', op.username);

            // Filtra acionamentos feitos hoje (a partir de 00:00h de hoje)
            let hoje = new Date();
            hoje.setHours(0,0,0,0);

            const { count: acionadosCount, error: errAcionados } = await _supabase
                .from('contacts_queue')
                .select('*', { count: 'exact', head: true })
                .eq('operator_name', op.username)
                .eq('status', 'enviado')
                .gte('updated_at', hoje.toISOString());

            let empresasTexto = op.allowed_companies.join(", ");

            // Destaque estético se for o Administrador Geral
            let opBadgeStyle = op.username === "Admin" ? "color: var(--orange); font-weight: 800;" : "font-weight: bold;";

            html += `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 12px; ${opBadgeStyle}">👤 ${op.username}</td>
                    <td style="padding: 12px; color: var(--text-muted);">${empresasTexto}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--blue); font-size: 14px;">${filaCount || 0}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--primary); font-size: 14px;">${acionadosCount || 0}</td>
                </tr>
            `;
        }

        tbody.innerHTML = html;

    } catch (error) {
        console.error("Erro ao puxar métricas:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: var(--red);">Erro ao carregar dados dos operadores.</td></tr>`;
    }
}

// ==========================================
// CADASTRAR NOVO USUÁRIO (VIA PAINEL)
// ==========================================
async function createUser(event) {
    event.preventDefault();

    let usernameInput = document.getElementById("newUsername");
    let passwordInput = document.getElementById("newUserPassword");
    let companySelect = document.getElementById("newUserCompany");

    let username = usernameInput.value.trim();
    let password = passwordInput.value.trim();
    let companyVal = companySelect.value;

    let allowedCompanies = companyVal === "Ambas" ? ["Simplic", "Loft"] : [companyVal];

    try {
        const { error } = await _supabase
            .from('system_operators')
            .insert([{ 
                username: username, 
                password: password, 
                allowed_companies: allowedCompanies 
            }]);

        if (error) {
            if (error.code === "23505") { // Código para duplicidade de chave (username único) no Postgres
                showToast("Esse nome de usuário já está cadastrado!", "error");
            } else {
                throw error;
            }
            return;
        }

        showToast(`Operador ${username} cadastrado com sucesso!`, "success");
        
        // Reseta campos e recarrega a tabela de métricas
        usernameInput.value = "";
        passwordInput.value = "";
        await loadAdminMetrics();

    } catch (error) {
        console.error(error);
        showToast("Falha técnica ao tentar salvar o usuário.", "error");
    }
}

// ==========================================
// CARREGAMENTO DOS DADOS OPERACIONAIS (SUA LÓGICA ANTIGA DE ENVIOS)
// ==========================================
async function syncLoadAll() {
    console.log("Sincronizando dados de " + empresaSelecionada + " para " + usuarioLogado);
    // Insira ou mantenha aqui os seus códigos que buscam os contatos ativos na tela operacional
}

// ==========================================
// AUTO-LOGIN INTEGRADO AO BANCO DE DADOS
// ==========================================
window.addEventListener("DOMContentLoaded", async () => {
    let opSalvo = sessionStorage.getItem("_ss_op");
    let compSalva = sessionStorage.getItem("_ss_company");
    
    if (opSalvo && compSalva) {
        usuarioLogado = atob(opSalvo);
        empresaSelecionada = atob(compSalva);
        
        try {
            // Valida de forma segura se o operador ainda existe e possui o escopo adequado
            const { data: usuario, error } = await _supabase
                .from('system_operators')
                .select('*')
                .eq('username', usuarioLogado)
                .single();

            if (error || !usuario || !usuario.allowed_companies.includes(empresaSelecionada)) {
                logout();
                return;
            }

            // Aplica interface conforme perfil
            checkAdminLayout();

            document.getElementById("lblUsuario").innerText = usuarioLogado;
            document.getElementById("lblEmpresaAtiva").innerText = empresaSelecionada.toUpperCase() + " WHATSAPP";
            document.getElementById("login").classList.add("hidden");
            document.getElementById("app").classList.remove("hidden");
            await syncLoadAll();

        } catch (err) {
            console.error("Inconsistência no auto-login:", err);
            logout();
        }
    }
});
