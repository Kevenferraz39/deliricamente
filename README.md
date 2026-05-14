# DELIRICAMENTE - Site do Coletivo

Site oficial do coletivo de hip hop Deliricamente de Caieiras-SP.

## 🎯 Sobre o Projeto

Site completo com:
- **Blog/Posts** com sistema de comentários, curtidas e compartilhamento
- **Painel Administrativo** completo para gerenciar posts, comentários e mídia
- **Galeria** de fotos e vídeos
- **História** do coletivo com timeline interativa
- **Área de Contato** e booking
- **Redirecionamento** para loja externa

## 🚀 Como Executar

### Opção 1: Com Vite (Recomendado)

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

O site estará disponível em `http://localhost:3000`

### Opção 2: Via CDN (Para testes rápidos)

Abra o arquivo `index-cdn.html` diretamente no navegador ou use um servidor local simples:

```bash
# Python
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

Acesse `http://localhost:8000/index-cdn.html`

## 📁 Estrutura do Projeto

```
deliricamente-site/
├── index.html              # HTML principal (Vite)
├── index-cdn.html          # Versão standalone com React CDN
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx           # App principal e roteamento
    ├── components.jsx     # Componentes visuais reutilizáveis
    ├── data.jsx           # Dados seed (posts, timeline, etc)
    ├── pages-public.jsx   # Páginas públicas do site
    ├── pages-admin.jsx    # Painel administrativo
    └── styles/
        └── global.css     # Estilos globais
```

## 🎨 Identidade Visual

- **Cores**: Vermelho (#E10600), Preto (#0A0A0A), Off-white (#F4F0E8)
- **Tipografia**: Anton (display), Space Grotesk (body), JetBrains Mono (mono)
- **Estilo**: Underground, urbano, com elementos de graffiti e cultura hip hop

## 🔑 Acesso Admin

Para acessar o painel administrativo:

1. Clique em "Admin" no menu
2. Use qualquer email válido e senha com 4+ caracteres
3. **Demo**: `admin@deliricamente.com.br` / `epifania2024`

### Funcionalidades Admin

- ✅ Criar, editar e deletar posts
- ✅ Upload de imagens e vídeos
- ✅ Editor de texto rico com Markdown
- ✅ Moderação de comentários
- ✅ Sistema de tags
- ✅ Rascunhos e publicações
- ✅ Dashboard com estatísticas

## 💾 Armazenamento

Atualmente usa **localStorage** para persistência de dados. Todos os posts, comentários e configurações são salvos localmente no navegador.

### Migrar para Firebase (Futuro)

O código está preparado para migração fácil para Firebase:

1. Criar projeto no Firebase Console
2. Adicionar configuração no arquivo de ambiente
3. Substituir funções localStorage por Firestore
4. Ativar Firebase Authentication
5. Configurar Firebase Storage para upload de imagens

## 📱 Responsividade

O site é totalmente responsivo e funciona em:
- 📱 Mobile (smartphones)
- 📱 Tablets
- 💻 Desktops

## 🎭 Funcionalidades

### Público
- Navegação fluida entre páginas
- Posts com filtros por tipo e busca
- Sistema de comentários
- Curtidas e reações
- Compartilhamento em redes sociais
- Galeria com lightbox
- Timeline interativa
- Formulário de contato

### Admin
- Login seguro
- CRUD completo de posts
- Editor rico (Markdown suportado)
- Upload de mídia
- Moderação de comentários
- Gerenciamento de tags
- Estatísticas do site

## 🚧 Próximos Passos

- [ ] Integração com Firebase
- [ ] Sistema de autenticação real
- [ ] Upload real de imagens
- [ ] Integração com YouTube/Vimeo
- [ ] Newsletter
- [ ] SEO optimization
- [ ] Analytics

## 📄 Licença

© Deliricamente - Todos os direitos da quebrada

---

**Desenvolvido com ❤️ para o movimento AGC - Arte, Guerrilha e Conhecimento**

🎤 Hip Hop | 📚 Literatura Periférica | 🎨 Cultura Underground
