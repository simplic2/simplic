# SIMPLIC Whatsapp - Dashboard Premium

Este repositório contém o código-fonte modularizado do painel de controle operacional **SIMPLIC Whatsapp**, com integração nativa com o **Supabase** para sincronização em tempo real das instâncias de WhatsApp, filas de acionamento e scripts de mensagens personalizados.

## 📂 Estrutura do Projeto

O código original foi desacoplado de forma limpa seguindo as melhores práticas de desenvolvimento web moderno:

```bash
├── index.html     # Estrutura do documento e definição de modais/layouts
├── styles.css     # Definições de variáveis de cor (:root), layouts (grid, kpi), botões e animações
├── app.js         # Lógica operacional, integração com o Supabase, Jogo da Velha, Player e Timers
└── README.md      # Instruções de configuração e uso
```

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3**: Interface responsiva com tema escuro (Premium Dark Mode).
- **JavaScript (ES6+)**: Lógica da aplicação integrada, timers assíncronos e player de áudio.
- **Supabase**: Backend-as-a-Service para persistência das instâncias, contatos e scripts.

## 🚀 Como Executar

1. Clone o repositório ou baixe os arquivos em sua máquina.
2. Certifique-se de que os três arquivos (`index.html`, `styles.css` e `app.js`) estão na mesma pasta.
3. Abra o arquivo `index.html` em qualquer navegador moderno.
