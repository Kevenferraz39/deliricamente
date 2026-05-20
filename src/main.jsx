import React from 'react';
import ReactDOM from 'react-dom/client';
import { db, auth } from './firebase.js';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './styles/global.css';

// A ORDEM AQUI É IMPORTANTE! O components e o data precisam carregar antes.
import './components.jsx';
import './data.jsx';
import './pages-public.jsx';
import './pages-admin.jsx';

// Lista de termos ofensivos para auto-moderacao de comentarios
const OFFENSIVE_TERMS = [
  'crioulo','macaco fedorento','preto sujo','preto nojento',
  'viado','viada','sapatao','sapatona','traveco','bicha fedida',
  'baleia gorda','gordo nojento','gorda nojenta',
  'nazista','nazi','heil hitler','sieg heil','ku klux','neonazista',
  'te mato','vou te matar','morte para voce',
  'judeu ladrao','mata judeu','matar judeu',
  'faggot','nigger','kill yourself','kys',
];
const detectOffensive = (text) => {
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');
  const n = norm(text || '');
  return OFFENSIVE_TERMS.filter(t => n.includes(norm(t)));
};

const MASTER_EMAIL = 'keven.ferraz@mercadolivre.com';

// Injeta dinamicamente uma fonte do Google Fonts se ainda não carregada
function loadGoogleFont(name) {
  const id = `gfont-${name.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

// ============================================================
// APP SHELL — gerencia navegação, estado e persistência
// ============================================================
function App() {
  // State management
  const [posts, setPosts] = React.useState(() => {
    const saved = localStorage.getItem('deliricamente_posts');
    return saved ? JSON.parse(saved) : window.SEED_POSTS;
  });

  const [comments, setComments] = React.useState(() => {
    const saved = localStorage.getItem('deliricamente_comments');
    return saved ? JSON.parse(saved) : {};
  });

  const [user, setUser] = React.useState(null);

  const [page, setPage] = React.useState('home');
  const [pageData, setPageData] = React.useState(null);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [bgConfig, setBgConfig] = React.useState({ style: 'blobs', speed: 1, density: 15, opacity: 0.85 });
  const [carouselConfig, setCarouselConfig] = React.useState({ enabled: false, slides: [], autoPlay: true, interval: 5 });
  const [heroLogoUrl, setHeroLogoUrl] = React.useState('');
  const [navLogoUrl, setNavLogoUrl] = React.useState('https://i.ibb.co/nM8qGYxn/images-removebg-preview.png');

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem('deliricamente_posts', JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    localStorage.setItem('deliricamente_comments', JSON.stringify(comments));
  }, [comments]);

  // Auth via Firebase — mantém sessão e cria/atualiza doc do usuario no Firestore
  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isMaster = fbUser.email === MASTER_EMAIL;
        setUser({
          name: fbUser.displayName || fbUser.email.split('@')[0],
          role: isMaster ? 'admin master' : 'editor',
          email: fbUser.email,
          uid: fbUser.uid,
          isMaster,
        });
        try {
          const docData = {
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            active: true,
            photoUrl: fbUser.photoURL || '',
            lastLogin: serverTimestamp(),
          };
          if (isMaster) docData.role = 'admin_master';
          await setDoc(doc(db, 'users', fbUser.uid), docData, { merge: true });
        } catch (e) {
          console.warn('User doc:', e.message);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Tema dinâmico via Firestore — propaga para todos os usuários em tempo real
  React.useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'config', 'theme'), (snap) => {
        if (!snap.exists()) return;
        const t = snap.data();
        const r = document.documentElement;
        if (t.accent)      r.style.setProperty('--red',        t.accent);
        if (t.background)  r.style.setProperty('--black',      t.background);
        if (t.offWhite)    r.style.setProperty('--off-white',  t.offWhite);
        if (t.panel)       r.style.setProperty('--panel',      t.panel);
        if (t.gray)        r.style.setProperty('--gray',       t.gray);
        if (t.muted)       r.style.setProperty('--muted',      t.muted);
        if (t.paper)       r.style.setProperty('--paper',      t.paper);
        if (t.textBody)    r.style.setProperty('--text-body',   t.textBody);
        if (t.heroLogoUrl !== undefined) setHeroLogoUrl(t.heroLogoUrl || '');
        if (t.navLogoUrl !== undefined) setNavLogoUrl(t.navLogoUrl || 'https://i.ibb.co/nM8qGYxn/images-removebg-preview.png');
        if (t.fontDisplay) { loadGoogleFont(t.fontDisplay); r.style.setProperty('--font-display', `'${t.fontDisplay}', sans-serif`); }
        if (t.fontBody)    { loadGoogleFont(t.fontBody);    r.style.setProperty('--font-body',    `'${t.fontBody}', sans-serif`); }
        if (t.fontMono)    { loadGoogleFont(t.fontMono);    r.style.setProperty('--font-mono',    `'${t.fontMono}', monospace`); }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Theme sync indisponível:', e.message);
    }
  }, []);

  // Configs de fundo animado e carrossel em tempo real
  React.useEffect(() => {
    try {
      const u1 = onSnapshot(doc(db, 'config', 'background'), (snap) => {
        if (snap.exists()) setBgConfig(c => ({ ...c, ...snap.data() }));
      });
      const u2 = onSnapshot(doc(db, 'config', 'carousel'), (snap) => {
        if (snap.exists()) setCarouselConfig(c => ({ ...c, ...snap.data() }));
      });
      return () => { u1(); u2(); };
    } catch (e) {
      console.warn('Config sync indisponível:', e.message);
    }
  }, []);

  // Navigation
  const go = (newPage, data = null) => {
    setPage(newPage);
    setPageData(data);
    setMobileNav(false);
    window.scrollTo(0, 0);
  };

  // Comments functions
  const getComments = (postId) => {
    return (comments[postId] || []).filter(c => c.status === 'approved');
  };

  const addComment = (postId, comment) => {
    const flaggedTerms = detectOffensive(comment.text || '');
    const status = flaggedTerms.length > 0 ? 'flagged' : 'approved';
    const newComment = {
      ...comment,
      status,
      date: new Date().toISOString().slice(0, 10),
      ...(flaggedTerms.length > 0 ? { flaggedTerms, flaggedAt: new Date().toISOString() } : {}),
    };
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    if (status === 'approved') {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      ));
    }
  };

  // Like/reaction functions
  const toggleLike = (postId, type, add) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, [type]: p[type] + (add ? 1 : -1) } : p
    ));
  };

  // Auth functions
  const login = (userData) => {
    setUser(userData);
    go('admin-dashboard');
  };

  const logout = () => {
    signOut(auth);
    go('home');
  };

  // Navigation component
  const Nav = () => {
    if (page.startsWith('admin')) return null;

    return (
      <>
        <nav className="nav">
          <div className="wrap nav-inner">
            <a className="nav-brand" onClick={() => go('home')} style={{ cursor: 'pointer' }}>
              {navLogoUrl
                ? <img src={navLogoUrl} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', display: 'block' }} />
                : <window.LogoMark size={40} />
              }
              <div>
                Deliricamente
                <small>// CAIEIRAS · SP</small>
              </div>
            </a>

            <div className="nav-links">
              <a className={'nav-link ' + (page === 'home' ? 'active' : '')} onClick={() => go('home')}>Início</a>
              <a className={'nav-link ' + (page === 'historia' ? 'active' : '')} onClick={() => go('historia')}>História</a>
              <a className={'nav-link ' + (page === 'blog' || page === 'post' ? 'active' : '')} onClick={() => go('blog')}>Blog</a>
              <a className={'nav-link ' + (page === 'galeria' ? 'active' : '')} onClick={() => go('galeria')}>Galeria</a>
              <a className={'nav-link ' + (page === 'musica' ? 'active' : '')} onClick={() => go('musica')}>Musica</a>
              <a className={'nav-link ' + (page === 'loja' ? 'active' : '')} onClick={() => go('loja')}>Loja</a>
              <a className={'nav-link ' + (page === 'contato' ? 'active' : '')} onClick={() => go('contato')}>Contato</a>
              <a className="nav-cta" onClick={() => go('admin')}>Admin</a>
            </div>

            <button className="nav-burger" onClick={() => setMobileNav(!mobileNav)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>

        {mobileNav && (
          <div className="nav-mobile">
            <a className="nav-link" onClick={() => go('home')}>Início</a>
            <a className="nav-link" onClick={() => go('historia')}>História</a>
            <a className="nav-link" onClick={() => go('blog')}>Blog</a>
            <a className="nav-link" onClick={() => go('galeria')}>Galeria</a>
            <a className="nav-link" onClick={() => go('musica')}>Musica</a>
            <a className="nav-link" onClick={() => go('loja')}>Loja</a>
            <a className="nav-link" onClick={() => go('contato')}>Contato</a>
            <a className="nav-link" onClick={() => go('admin')}>Admin</a>
          </div>
        )}
      </>
    );
  };

  // Page rendering
  let content;

  if (page === 'home') {
    content = <window.HomePage posts={posts} go={go} bgConfig={bgConfig} carouselConfig={carouselConfig} heroLogoUrl={heroLogoUrl} />;
  } else if (page === 'blog') {
    content = <window.BlogPage posts={posts} go={go} />;
  } else if (page === 'post') {
    content = <window.PostPage
      postId={pageData}
      posts={posts}
      go={go}
      getComments={getComments}
      addComment={addComment}
      toggleLike={toggleLike}
    />;
  } else if (page === 'historia') {
    content = <window.HistoriaPage go={go} />;
  } else if (page === 'galeria') {
    content = <window.GaleriaPage />;
  } else if (page === 'musica') {
    content = <window.MusicaPage />;
  } else if (page === 'loja') {
    content = <window.LojaPage />;
  } else if (page === 'contato') {
    content = <window.ContatoPage />;
  } else if (page === 'admin') {
    if (user) {
      go('admin-dashboard');
      return null;
    }
    content = <window.AdminLogin onLogin={login} goPublic={() => go('home')} />;
  } else if (page === 'admin-dashboard' || page.startsWith('admin-')) {
    if (!user) {
      go('admin');
      return null;
    }
    content = <window.AdminShell
      user={user}
      onLogout={logout}
      goPublic={() => go('home')}
      posts={posts}
      setPosts={setPosts}
      comments={comments}
      setComments={setComments}
    />;
  }

  return (
    <>
      <Nav />
      {content}
      {!page.startsWith('admin') && <window.Footer go={go} />}
    </>
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);