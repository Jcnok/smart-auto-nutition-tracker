<div align="center">
  <img src="public/cover.png" alt="AutoNutry Cover Image" width="100%" style="border-radius: 12px; box-shadow: 0px 4px 12px rgba(0,0,0,0.1);" />

  # 🥗 AutoNutry 

  **Uma plataforma de rastreamento nutricional premium impulsionada por Inteligência Artificial.**

  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![Google Gemini AI](https://img.shields.io/badge/Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#licença)

  [**🇺🇸 Read in English**](#-english-version) | [**🇧🇷 Leia em Português**](#-visão-geral)

</div>

<br />

## 🇧🇷 Visão Geral 

O **AutoNutry** é um aplicativo moderno de nutrição desenhado para simplificar o seu acompanhamento calórico diário. Em vez de buscar manualmente por alimentos em bancos de dados imensos, o aplicativo utiliza o poder do **Gemini 2.5 Flash** para analisar, reconhecer e estimar as calorias e macronutrientes (Proteínas, Carboidratos e Gorduras) diretamente a partir de fotos do seu prato ou de uma breve descrição em texto.

Desenvolvido inteiramente no frontend (Single Page Application) com Javascript puro e Vite, focado em alta velocidade, responsividade e com uma identidade visual dark/light mode deslumbrante.

---

## 🚀 Principais Features

- **🤖 Análise Nutricional via IA:** Extrai informações nutricionais de imagens (*visão computacional*) ou de descrições em linguagem natural.
- **🛡️ Isolamento de Dados:** Sistema de autenticação local (localStorage), em que cada usuário tem seu ambiente, dados e histórico de forma completamente isolada, sem a necessidade de um backend server real.
- **📊 Dashboard Interativo:** Exibição de estatísticas diárias via componentes visuais fluídos e anéis de progresso circulares de calorias.
- **📈 Histórico Analítico:** Acompanhamento dos últimos 7 dias via integração com `Chart.js`.
- **🌗 Modos Claro & Escuro:** Design premium fluido com tema customizável e acessível.
- **🌐 Internacionalização (i18n):** Tradução nativa entre *Português Brasileiro* (padrão) e *Inglês*.
- **⚡ Super Rápido:** Configurado pelo Vite, sem frameworks inchados, apenas a força do Vanilla JS moderno.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
| :--- | :--- |
| **Linguagem Base** | JavaScript (ES6+), HTML5, CSS3 Custom Properties |
| **Inteligência Artificial**| Google AI Studio (`gemini-2.5-flash`) |
| **Bundler / Ferramental**| Vite |
| **Visualização de Dados** | Chart.js |
| **Ícones** | Lucide Icons |
| **Hospedagem Recomendada**| Vercel |

---

## ⚙️ Como Utilizar Localmente

### Pré-Requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior).
- Uma chave de API gratuita do **Google AI Studio** ([Clique aqui de obter](https://aistudio.google.com/)).

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/SEU_USUARIO/smart-nutrition-tracker.git
cd smart-nutrition-tracker
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as Variáveis de Ambiente:
Crie um arquivo `.env` na raiz do projeto inspirado pelo arquivo `.env.example` e adicione sua chave de API do Gemini:
```env
VITE_GEMINI_API_KEY=sua_chave_de_api_aqui
```

4. Execute o Servidor de Desenvolvimento:
```bash
npm run dev
```
O aplicativo já estará rodando em `http://localhost:5173`. Acesse e aproveite!

---

## 📦 Como Hospedar na Vercel (Em 1 Minuto)

Este projeto foi construído via Vite, portanto hospedar é incrivelmente simples.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Faça Login na Vercel e conecte seu perfil do GitHub.
2. Importe este repositório (`smart-nutrition-tracker`).
3. Nas **Environment Variables** (Configurações da Vercel), adicione:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `SUA_CHAVE_AQUI`
4. O *Framework Preset* será automaticamente detectado como **Vite**.
5. Clique em **Deploy**! A Vercel construirá os arquivos `dist/` automaticamente na nuvem, e seu link estará no ar.

---

## 📌 Próximos Passos (Roadmap)

- [ ] **Integração Backend (BaaS):** Substituir a instância local por Firestore (Firebase) ou Supabase para backup na nuvem persistente e permitir cross-login em dispositivos diferentes.
- [ ] **PWA (Progressive Web App):** Habilitar suporte a service workers para o usuário "instalar" o app como nativo em Android e iOS.
- [ ] **Relatórios de Macro avançados:** Gerar relatórios mensais exportáveis via PDF.

---

## 👨‍💻 Desenvolvedor & Créditos

Projeto arquitetado e desenvolvido por **Julio Okuda**, como parte de testes avançados e do processo de inovação por **Vibecoding** através de pair-programming com agentes de **Google Gemini AI**.

Sinta-se livre para entrar em contato ou dar um star ⭐ neste repositório caso este projeto tenha sido útil para estudos ou referências e design!


<br /><br />
<hr />
<br />

<a id="-english-version"></a>
## 🇺🇸 English Version

**AutoNutry** is a modern nutrition application designed to simplify your daily caloric tracking. Instead of manually searching for items in huge food databases, it harnesses the power of **Gemini 2.5 Flash** to analyze, recognize, and estimate calories and macronutrients directly from photos of your plate or natural language text descriptions.

### ✨ Key Features
- **🤖 AI Nutrition Analysis:** Uses advanced vision and LLMs for seamless data entry.
- **🛡️ Isolated Storage:** Safe local-first offline architecture using namespaced localStorage for different users.
- **📊 Interactive Dashboard:** Gorgeous data visualization via Chart.js and raw CSS progress rings.
- **🌗 Dark Mode Friendly:** Beautiful dark/light themes out of the box with `all 0.3s ease` transitions.
- **🌐 i18n:** Built-in language switching (PT-BR / EN).

### 🚀 Getting Started
```bash
# Clone
git clone https://github.com/YOUR_USERNAME/smart-nutrition-tracker.git
cd smart-nutrition-tracker

# Install Dependencies
npm install

# Run (Requires setting VITE_GEMINI_API_KEY in a .env file first)
npm run dev
```

### 📦 Vercel Deployment
Simply link your GitHub repository to Vercel, ensure you pass down the `VITE_GEMINI_API_KEY` as an environment variable in the dashboard, and click deploy! Since the app is built on Vite, Vercel will automatically compile the `dist` folder natively.

**Developed with ❤️ by Julio Okuda (Vibecoding / Gemini AI).**
