const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para o Node conseguir ler os dados enviados pelo formulário HTML
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir os arquivos estáticos (index.html e styles.css que estão na mesma pasta)
app.use(express.static(path.join(__dirname)));

// --- SEU BANCO DE DADOS SIMULADO ---
// Substitua ou conecte com o seu banco real aqui.
const usuariosDB = [
  // 1. Usuários antigos (não têm o campo 'empresa_origem', o sistema vai assumir Simplic)
  { username: "usuario1", senhaHash: "senha123" },
  { username: "usuario2", senhaHash: "senha456" },
  
  // 2. Novo Usuário Administrador (Master) - Entra em qualquer um deles
  { username: "admin", senhaHash: "admin123", role: "ADMIN_GLOBAL" },
  
  // 3. Novo Usuário específico da Loft
  { username: "loftuser", senhaHash: "loft123", empresa_origem: "loft" }
];

// Rota de processamento de login
app.post('/api/login', (req, res) => {
    const { username, password, empresa } = req.body;

    // Buscar usuário na lista
    const usuario = usuariosDB.find(u => u.username === username);

    if (!usuario) {
        return res.status(401).send("Usuário ou senha incorretos.");
    }

    // Validação simples de senha (em produção, use bcrypt)
    const senhaValida = (password === usuario.senhaHash);
    if (!senhaValida) {
        return res.status(401).send("Usuário ou senha incorretos.");
    }

    // --- REGRAS DE ACESSO SOLICITADAS ---

    // REGRA 1: Se for o Administrador Global, ignora validação de empresa e acessa o selecionado
    if (usuario.role === "ADMIN_GLOBAL") {
        console.log(`Admin logado no painel da: ${empresa.toUpperCase()}`);
        return res.send(`Bem-vindo, Administrador! Você entrou no painel de envios da ${empresa.toUpperCase()}.`);
        // Aqui você pode redirecionar para a página do painel: res.redirect('/painel');
    }

    // REGRA 2: Usuários antigos que não têm "empresa_origem" no cadastro viram "simplic" por padrão
    const empresaDoUsuario = usuario.empresa_origem || "simplic";

    // REGRA 3: Se o usuário comum tentar logar selecionando a empresa errada, bloqueia
    if (empresaDoUsuario !== empresa) {
        return res.status(403).send(`Acesso negado. Este usuário pertence à ${empresaDoUsuario.toUpperCase()} e tentou logar pela ${empresa.toUpperCase()}.`);
    }

    // Se passou, login autorizado para usuário comum
    console.log(`Usuário ${username} logado no painel da: ${empresa.toUpperCase()}`);
    return res.send(`Login realizado com sucesso no painel da ${empresa.toUpperCase()}!`);
    // Aqui você pode redirecionar para a página do painel: res.redirect('/painel');
});

// Inicia o servidor localmente ou na nuvem
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
