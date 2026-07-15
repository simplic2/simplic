// ==========================================
// CONFIGURAÇÕES SUPABASE
// ==========================================
const SUPABASE_URL = "SUA_URL_DO_SUPABASE_AQUI";
const SUPABASE_KEY = "SUA_CHAVE_ANON_DO_SUPABASE_AQUI";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// VARIÁVEIS GLOBAIS DE ESTADO
let usuarioLogado = "";
let empresaSelecionada = "";
let whatsappAccounts = []; // Exemplo para o setInterval do real-time

// ==========================================
// TOAST NOTIFICATIONS
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

        // Configura visibilidade do botão de Admin
        checkAdminButton();

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
    document.getElementById("btnAdminPanel").classList.add("hidden");
    
    showToast("Sessão encerrada com sucesso.", "info");
}

// ==========================================
// VISIBILIDADE DO PAINEL ADMIN
// ==========================================
function checkAdminButton() {
    let btnAdmin = document.getElementById("btnAdminPanel");
    if (btnAdmin) {
        if (usuarioLogado === "Admin") {
            btnAdmin.classList.remove("hidden");
        } else {
            btnAdmin.classList.add("hidden");
        }
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

            // Filtra acionamentos feitos hoje (a partir de 00:00h)
            let hoje = new Date();
            hoje.setHours(0,0,0,0);

            const { count: acionadosCount, error: errAcionados } = await _supabase
                .from('contacts_queue')
                .select('*', { count: 'exact', head: true })
                .eq('operator_name', op.username)
                .eq('status', 'enviado')
                .gte('updated_at', hoje.toISOString());

            let empresasTexto = op.allowed_companies.join(", ");

            // Se for Administrador Geral, dá destaque estético na tabela
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
            if (error.code === "23505") { // Código para duplicidade no Postgres
                showToast("Esse nome de usuário já está cadastrado!", "error");
            } else {
                throw error;
            }
            return;
        }

        showToast(`Operador ${username} cadastrado com sucesso!`, "success");
        
        // Reseta campos e recarrega os dados do painel
        usernameInput.value = "";
        passwordInput.value = "";
        await loadAdminMetrics();

    } catch (error) {
        console.error(error);
        showToast("Falha técnica ao tentar salvar o usuário.", "error");
    }
}

// ==========================================
// MOCK DA FUNÇÃO DE CARREGAMENTO GERAL
// ==========================================
async function syncLoadAll() {
    console.log("Sincronizando dados de " + empresaSelecionada + " para " + usuarioLogado);
    // Insira aqui sua lógica antiga de puxar dados (ex: contatos, scripts, etc.) do Supabase
}

// ==========================================
// LOOP REAL-TIME (SEGUNDOS DE RESTRIÇÃO)
// ==========================================
setInterval(async () => {
    if (!usuarioLogado) return;
    whatsappAccounts.forEach((w, i) => {
        let el = document.getElementById(`badge-status-${i}`);
        if (el && w.status === "restrito" && w.restricted_until) {
            // Presume-se que formatRemainingTime esteja declarado em seu código original
            el.innerText = "restrito: " + formatRemainingTime(Number(w.restricted_until));
        }
    });
}, 1000);

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
            // Busca o operador de forma dinâmica para validar se ele ainda existe/está ativo
            const { data: usuario, error } = await _supabase
                .from('system_operators')
                .select('*')
                .eq('username', usuarioLogado)
                .single();

            // Se o login foi alterado ou ele perdeu a permissão, força deslogar
            if (error || !usuario || !usuario.allowed_companies.includes(empresaSelecionada)) {
                logout();
                return;
            }

            checkAdminButton();

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
