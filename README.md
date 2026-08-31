# NÃO ESQUECE 🧠

> **Você não precisa lembrar de tudo. Eu lembro por você.**

Um app web de tarefas e lembretes feito **para quem esquece as coisas** — trabalhos, compromissos, tarefas de casa e partes da própria rotina. Simples, jovem, rápido e bonito. Não é uma planilha, não é um dashboard empresarial.

## O que ele faz

- **➕ Cria tarefa em ~10 segundos** — você pode escrever natural: *"sexta preciso entregar trabalho de física"* e o app interpreta título, dia, categoria e prioridade (mostrando uma confirmação antes de salvar).
- **🏠 Tela Hoje** — mostra só o que importa: **🔴 AGORA**, **📌 MAIS TARDE**, **🌙 ANTES DE DORMIR** e **⚠️ NÃO ESQUECER**.
- **🎯 Próximo passo** — cada tarefa pode ter só o próximo passo, pra facilitar começar.
- **⏰ Adiamento humano** — adie sem culpa. O app registra quantas vezes e pergunta "o que está pegando?" (e oferece dividir em passos menores se a tarefa é grande).
- **🔁 Rotinas** — hábitos que se repetem (manhã, escola, noite) com escolha de dias da semana.
- **🎯 Modo foco** — tela minimalista com timer opcional (25:00) e botões PAUSAR / CONCLUÍ / NÃO CONSIGO AGORA.
- **😭 Esqueci alguma coisa** — anote na hora o que você acabou de lembrar (ex: "tenho prova de matemática quinta").
- **📊 Histórico** — números do seu progresso sem inventar dados.

## Páginas / rotas

| Rota | Conteúdo |
|---|---|
| `/` | redireciona para `/hoje` |
| `/hoje` | página principal |
| `/tarefas` | lista com filtros (todas / pendentes / concluídas) |
| `/rotina` | hábitos recorrentes |
| `/historico` | estatísticas e padrões |
| `/configuracoes` | preferências (notificações) |

## Stack

- **React 18** + **Vite 5** + **React Router 6**
- **CSS puro** organizado (dark mode por padrão, mobile-first, acessível)
- Persistência em **localStorage** através da camada `src/services/taskService.js`

> A camada `taskService` é uma abstração: hoje usa `localStorage`, mas pode ser trocada por um banco (Supabase, API própria etc.) **sem reescrever a interface**. Procure por `>>> PONTO DE INTEGRAÇÃO FUTURA <<<`.

## Rodar localmente

```bash
npm install
npm run dev
# abre em http://localhost:3000
```

## Publicar no Netlify

```bash
npm run build   # gera a pasta dist/
```

Suba a pasta `dist` (ou conecte o repositório). O `netlify.toml` já cuida do redirecionamento das rotas (sem erro 404).

## Estrutura

```
src/
├── App.jsx                 → rotas + providers
├── main.jsx                → entrada
├── components/             → Sidebar, BottomNavigation, TaskCard, TaskModal,
│                             SnoozeDialog, FocusMode, QuickAdd, ForgotModal,
│                             badges, estados (empty/loading/error), toasts
├── context/                → TasksContext (dados), UIContext (UI/toasts)
├── services/               → taskService (persistência) + parser (interpretação)
├── utils/date.js           → helpers de data
├── pages/                  → Hoje, Tarefas, Rotina, Historico, Configuracoes, NotFound
└── styles/                 → tema, layout, componentes, páginas, responsivo
```

## Segurança

Não há API keys, senhas ou tokens no código. Não coloque nada disso aqui.
