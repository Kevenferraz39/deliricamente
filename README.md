# Deliricamente — Site Oficial do Coletivo

Site oficial do coletivo de hip-hop, literatura periférica e intervenção urbana **Deliricamente** de Caieiras-SP. Parte do movimento **AGC — Arte, Guerrilha e Conhecimento**.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite 8 + React Router v6 |
| Backend | Firebase (Firestore + Auth + Storage) |
| Estilo | CSS puro com custom properties |
| Deploy | Vercel (CI/CD automático via GitHub) |
| Segurança | Firestore Rules + sanitização + rate limiting + audit logs |

---

## Estrutura do Projeto

```
deliricamente/
├── src/
│   ├── pages/                  # Uma página por rota
│   │   ├── HomePage.jsx
│   │   ├── BlogPage.jsx
│   │   ├── PostPage.jsx
│   │   ├── HistoriaPage.jsx
│   │   ├── GaleriaPage.jsx
│   │   ├── MusicaPage.jsx
│   │   ├── LojaPage.jsx
│   │   ├── ContatoPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ErrorPage.jsx
│   │   ├── UserProfilePage.jsx
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminShell.jsx
│   │       └── LogsPage.jsx
│   ├── components/
│   │   └── Footer.jsx
│   ├── context/
│   │   └── AppContext.jsx       # Estado global via React Context
│   ├── hooks/
│   │   └── useSessionTimeout.js # Auto-logout por inatividade
│   ├── security/
│   │   ├── sanitize.js          # Sanitização de inputs (XSS)
│   │   ├── rateLimit.js         # Rate limiting client-side
│   │   └── auditLogger.js       # Audit logs → Firestore
│   ├── components.jsx           # Componentes visuais compartilhados
│   ├── data.jsx                 # Dados seed
│   ├── firebase.js              # Configuração Firebase
│   ├── spotify.js               # Integração Spotify API
│   ├── main.jsx                 # App + BrowserRouter + Routes
│   └── styles/
│       └── global.css
├── firestore.rules              # Regras de segurança Firestore (RLS)
├── firestore.indexes.json       # Índices compostos Firestore
├── firebase.json                # Firebase Hosting config
├── vercel.json                  # Vercel config + security headers
├── .firebaserc                  # Projeto Firebase padrão
└── vite.config.js
```

---

## Rotas

| URL | Página |
|-----|--------|
| `/` | Home |
| `/blog` | Arquivo de posts |
| `/blog/:id` | Post individual |
| `/historia` | Timeline do coletivo |
| `/galeria` | Galeria de fotos e vídeos |
| `/musica` | Integração Spotify |
| `/loja` | Loja |
| `/contato` | Contato e booking |
| `/perfil` | Perfil do usuário logado |
| `/admin` | Login / painel admin |
| `/error/:code` | Páginas de erro HTTP |
| `*` | 404 |

---

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Criar arquivo de variáveis (nunca commitar)
cp .env.example .env
# Preencher com as chaves reais

# Iniciar servidor de desenvolvimento
npm run dev
# → http://localhost:3000

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## Variáveis de Ambiente

Crie `.env` na raiz com:

```env
VITE_GOOGLE_FONTS_KEY=
VITE_IMGBB_KEY=
VITE_SPOTIFY_CLIENT_ID=
VITE_SPOTIFY_CLIENT_SECRET=
VITE_SPOTIFY_TOKEN=
```

As chaves de produção ficam no painel do Vercel (Settings → Environment Variables).

---

## Deploy (Vercel)

O deploy é automático a cada push no branch `main`.

**Configuração inicial (uma vez só):**
1. Importar repositório em [vercel.com](https://vercel.com)
2. Framework: Vite (detectado automaticamente)
3. Adicionar variáveis de ambiente no painel
4. Pronto — qualquer `git push` atualiza o site

---

## Firebase

```bash
# Login (uma vez)
npx firebase-tools login

# Deploy das regras de segurança
npx firebase-tools deploy --only firestore

# Deploy completo (hosting + firestore)
npx firebase-tools deploy
```

---

## Segurança

- **Firestore Rules** — RLS por coleção (posts, comments, users, logs)
- **Input sanitization** — remoção de HTML/scripts em todos os campos
- **Rate limiting** — login (5/15min), comentário (3/min), registro (3/h)
- **Audit logs** — todas as ações gravadas no Firestore (imutável)
- **Auto-logout** — 30 minutos de inatividade
- **Security headers** — CSP, HSTS, X-Frame-Options, etc.

---

## Identidade Visual

- **Cores:** Vermelho `#E10600` · Preto `#0A0A0A` · Off-white `#F4F8EB`
- **Display:** Anton
- **Body:** Space Grotesk
- **Mono:** JetBrains Mono

---

© Deliricamente · Caieiras-SP · Todos os direitos da quebrada  
Parte do movimento **AGC — Arte, Guerrilha e Conhecimento**
