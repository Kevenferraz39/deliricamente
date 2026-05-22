import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { db, auth } from './firebase.js';
import { doc, collection, addDoc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './styles/global.css';
import { useSessionTimeout } from './hooks/useSessionTimeout.js';
import { logAuth, LOG_ACTIONS } from './security/auditLogger.js';

import { AppContext } from './context/AppContext';
import { SEED_POSTS } from './data';
import { LogoMark, Icon } from './components';

import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import PostPage from './pages/PostPage';
import HistoriaPage from './pages/HistoriaPage';
import GaleriaPage from './pages/GaleriaPage';
import MusicaPage from './pages/MusicaPage';
import LojaPage from './pages/LojaPage';
import ContatoPage from './pages/ContatoPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminShell from './pages/admin/AdminShell';
import NotFoundPage from './pages/NotFoundPage';
import EventoPage from './pages/EventoPage';
import UserProfilePage from './pages/UserProfilePage';
import ErrorPage from './pages/ErrorPage';
import Footer from './components/Footer';

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

const MASTER_UID = 'ZtQlNzTDa1S9AsuNppbtNfpbVdI3';

function loadGoogleFont(name) {
  const id = `gfont-${name.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id; link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

// ============================================================
// NAV
// ============================================================
function Nav() {
  const { user, navLogoUrl } = React.useContext(AppContext);
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) return null;

  const isAdmin = (u) => u && (u.isMaster || u.role === 'admin' || u.role === 'admin_master');
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="nav">
      <div className="wrap nav-inner">
        <Link className="nav-brand" to="/" style={{ textDecoration: 'none' }}>
          {navLogoUrl
            ? <img src={navLogoUrl} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain', display: 'block' }} />
            : <LogoMark size={40} />
          }
          <div>
            Deliricamente
            <small>// CAIEIRAS · SP</small>
          </div>
        </Link>

        <div className="nav-links">
          <Link className={'nav-link ' + (isActive('/') && location.pathname === '/' ? 'active' : '')} to="/">Início</Link>
          <Link className={'nav-link ' + (isActive('/historia') ? 'active' : '')} to="/historia">História</Link>
          <Link className={'nav-link ' + (isActive('/blog') ? 'active' : '')} to="/blog">Blog</Link>
          <Link className={'nav-link ' + (isActive('/galeria') ? 'active' : '')} to="/galeria">Galeria</Link>
          <Link className={'nav-link ' + (isActive('/musica') ? 'active' : '')} to="/musica">Música</Link>
          <Link className={'nav-link ' + (isActive('/loja') ? 'active' : '')} to="/loja">Loja</Link>
          <Link className={'nav-link ' + (isActive('/contato') ? 'active' : '')} to="/contato">Contato</Link>
          {isAdmin(user)
            ? <Link className="nav-cta" to="/admin/dashboard">Admin</Link>
            : <Link to={user ? '/perfil' : '/admin'} className="nav-user-btn" title={user ? user.name : 'Entrar'}>
                {user
                  ? <span className="nav-user-avatar">{(user.name || '?')[0].toUpperCase()}</span>
                  : <Icon.User />
                }
              </Link>
          }
        </div>

        {/* Ícone do usuário visível apenas no mobile (nav-links fica oculto) */}
        <div className="nav-mobile-right">
          {isAdmin(user)
            ? <Link className="nav-cta" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} to="/admin/dashboard">Admin</Link>
            : <Link to={user ? '/perfil' : '/admin'} className="nav-user-btn" title={user ? user.name : 'Entrar'}>
                {user
                  ? <span className="nav-user-avatar">{(user.name || '?')[0].toUpperCase()}</span>
                  : <Icon.User />
                }
              </Link>
          }
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// PROTECTED ROUTE — apenas admins
// ============================================================
const isAdminUser = (u) => u && (u.isMaster || u.role === 'admin' || u.role === 'admin_master');

function ProtectedRoute({ children }) {
  const { user } = React.useContext(AppContext);
  if (!user) return <Navigate to="/admin" replace />;
  if (!isAdminUser(user)) return <Navigate to="/perfil" replace />;
  return children;
}

// ============================================================
// FOOTER WRAPPER
// ============================================================
function FooterWrapper() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <Footer />;
}

// ============================================================
// MOBILE BOTTOM NAV
// ============================================================
const MobIcon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" {...p}>
      <path d="M3 12L12 3l9 9" /><path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
    </svg>
  ),
  Blog: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  Galeria: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Musica: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" {...p}>
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  ),
  DotsGrid: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" {...p}>
      <circle cx="5" cy="5" r="1.6" /><circle cx="12" cy="5" r="1.6" /><circle cx="19" cy="5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
      <circle cx="5" cy="19" r="1.6" /><circle cx="12" cy="19" r="1.6" /><circle cx="19" cy="19" r="1.6" />
    </svg>
  ),
  Historia: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  ),
  Loja: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24" {...p}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><path d="M3 6h18M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  Contato: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24" {...p}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  Perfil: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="24" height="24" {...p}>
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

function MobileBottomNav() {
  const [showMais, setShowMais] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = React.useContext(AppContext);

  if (location.pathname.startsWith('/admin')) return null;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const go = (path) => { navigate(path); setShowMais(false); };

  return (
    <>
      {showMais && (
        <>
          <div className="mais-overlay" onClick={() => setShowMais(false)} />
          <div className="mais-sheet">
            <div className="mais-handle" />
            <div className="mais-grid">
              <button className="mais-item" onClick={() => go('/historia')}>
                <MobIcon.Historia /><span>História</span>
              </button>
              <button className="mais-item" onClick={() => go('/loja')}>
                <MobIcon.Loja /><span>Loja</span>
              </button>
              <button className="mais-item" onClick={() => go('/contato')}>
                <MobIcon.Contato /><span>Contato</span>
              </button>
              <button className="mais-item" onClick={() => go(user ? '/perfil' : '/admin')}>
                <MobIcon.Perfil />
                <span>{user ? (user.name || 'Perfil').split(' ')[0] : 'Entrar'}</span>
              </button>
            </div>
          </div>
        </>
      )}
      <nav className="mobile-bottom-nav">
        <button className={'mobile-tab' + (isActive('/') ? ' active' : '')} onClick={() => go('/')}>
          <MobIcon.Home /><span>Início</span>
        </button>
        <button className={'mobile-tab' + (isActive('/blog') ? ' active' : '')} onClick={() => go('/blog')}>
          <MobIcon.Blog /><span>Blog</span>
        </button>
        <button className={'mobile-tab' + (isActive('/galeria') ? ' active' : '')} onClick={() => go('/galeria')}>
          <MobIcon.Galeria /><span>Galeria</span>
        </button>
        <button className={'mobile-tab' + (isActive('/musica') ? ' active' : '')} onClick={() => go('/musica')}>
          <MobIcon.Musica /><span>Música</span>
        </button>
        <button className={'mobile-tab' + (showMais ? ' active' : '')} onClick={() => setShowMais(s => !s)}>
          <MobIcon.DotsGrid /><span>Mais</span>
        </button>
      </nav>
    </>
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  const [posts, setPosts] = React.useState(() => {
    try { const saved = localStorage.getItem('deliricamente_posts'); return saved ? JSON.parse(saved) : SEED_POSTS; }
    catch { return SEED_POSTS; }
  });

  const migratedPostsRef = React.useRef(false);

  React.useEffect(() => {
    const localPosts = (() => {
      try { const s = localStorage.getItem('deliricamente_posts'); return s ? JSON.parse(s) : SEED_POSTS; }
      catch { return SEED_POSTS; }
    })();
    try {
      const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
      const unsub = onSnapshot(q, async snap => {
        const firestorePosts = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        if (firestorePosts.length > 0) {
          setPosts(firestorePosts);
        } else if (!migratedPostsRef.current) {
          migratedPostsRef.current = true;
          await Promise.all(localPosts.map(post => setDoc(doc(db, 'posts', post.id), { ...post }).catch(e => console.warn('migração post:', e.message))));
        }
      });
      return () => unsub();
    } catch (e) { console.warn('Posts sync:', e.message); }
  }, []);

  const [comments, setComments] = React.useState(() => {
    try { const saved = localStorage.getItem('deliricamente_comments'); return saved ? JSON.parse(saved) : {}; }
    catch { return {}; }
  });

  React.useEffect(() => {
    try {
      const unsub = onSnapshot(query(collection(db, 'comments'), orderBy('date', 'desc')), snap => {
        if (snap.empty) return;
        const byPost = {};
        snap.docs.forEach(d => {
          const c = { id: d.id, ...d.data() };
          if (!byPost[c.postId]) byPost[c.postId] = [];
          byPost[c.postId].push(c);
        });
        setComments(byPost);
      });
      return () => unsub();
    } catch (e) { console.warn('Comments sync:', e.message); }
  }, []);

  const [user, setUser] = React.useState(null);
  const [bgConfig, setBgConfig] = React.useState({ style: 'blobs', speed: 1, density: 15, opacity: 0.85 });
  const [carouselConfig, setCarouselConfig] = React.useState({ enabled: false, slides: [], autoPlay: true, interval: 5 });
  const [heroLogoUrl, setHeroLogoUrl] = React.useState('');
  const [navLogoUrl, setNavLogoUrl] = React.useState('https://i.ibb.co/nM8qGYxn/images-removebg-preview.png');

  React.useEffect(() => { localStorage.setItem('deliricamente_posts', JSON.stringify(posts)); }, [posts]);
  React.useEffect(() => { localStorage.setItem('deliricamente_comments', JSON.stringify(comments)); }, [comments]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const isMaster = fbUser.uid === MASTER_UID;
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          const existingRole = snap.exists() ? snap.data().role : null;
          const role = isMaster ? 'admin_master' : (existingRole || 'user');
          setUser({ name: fbUser.displayName || fbUser.email.split('@')[0], role, email: fbUser.email, uid: fbUser.uid, isMaster });
          const docData = { email: fbUser.email, displayName: fbUser.displayName || fbUser.email.split('@')[0], photoUrl: fbUser.photoURL || '', lastLogin: serverTimestamp() };
          if (!existingRole || isMaster) { docData.role = isMaster ? 'admin_master' : 'user'; docData.active = true; }
          await setDoc(doc(db, 'users', fbUser.uid), docData, { merge: true });
        } catch (e) {
          setUser({ name: fbUser.displayName || fbUser.email.split('@')[0], role: isMaster ? 'admin_master' : 'user', email: fbUser.email, uid: fbUser.uid, isMaster });
          console.warn('User doc:', e.message);
        }
      } else { setUser(null); }
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, 'config', 'theme'), (snap) => {
        if (!snap.exists()) return;
        const t = snap.data(); const r = document.documentElement;
        if (t.accent)      r.style.setProperty('--red',        t.accent);
        if (t.background)  r.style.setProperty('--black',      t.background);
        if (t.offWhite)    r.style.setProperty('--off-white',  t.offWhite);
        if (t.panel)       r.style.setProperty('--panel',      t.panel);
        if (t.gray)        r.style.setProperty('--gray',       t.gray);
        if (t.muted)       r.style.setProperty('--muted',      t.muted);
        if (t.paper)       r.style.setProperty('--paper',      t.paper);
        if (t.textBody)    r.style.setProperty('--text-body',  t.textBody);
        if (t.heroLogoUrl !== undefined) setHeroLogoUrl(t.heroLogoUrl || '');
        if (t.navLogoUrl !== undefined) setNavLogoUrl(t.navLogoUrl || 'https://i.ibb.co/nM8qGYxn/images-removebg-preview.png');
        if (t.fontDisplay) { loadGoogleFont(t.fontDisplay); r.style.setProperty('--font-display', `'${t.fontDisplay}', sans-serif`); }
        if (t.fontBody)    { loadGoogleFont(t.fontBody);    r.style.setProperty('--font-body',    `'${t.fontBody}', sans-serif`); }
        if (t.fontMono)    { loadGoogleFont(t.fontMono);    r.style.setProperty('--font-mono',    `'${t.fontMono}', monospace`); }
      });
      return () => unsub();
    } catch (e) { console.warn('Theme sync:', e.message); }
  }, []);

  React.useEffect(() => {
    try {
      const u1 = onSnapshot(doc(db, 'config', 'background'), (snap) => { if (snap.exists()) setBgConfig(c => ({ ...c, ...snap.data() })); });
      const u2 = onSnapshot(doc(db, 'config', 'carousel'), (snap) => { if (snap.exists()) setCarouselConfig(c => ({ ...c, ...snap.data() })); });
      return () => { u1(); u2(); };
    } catch (e) { console.warn('Config sync:', e.message); }
  }, []);

  const getComments = (postId) => (comments[postId] || []).filter(c => c.status === 'approved');

  const addComment = async (postId, comment) => {
    const flaggedTerms = detectOffensive(comment.text || '');
    const status = flaggedTerms.length > 0 ? 'flagged' : 'approved';
    const newComment = { ...comment, postId, status, date: new Date().toISOString(), ...(flaggedTerms.length > 0 ? { flaggedTerms, flaggedAt: new Date().toISOString() } : {}) };
    try {
      await addDoc(collection(db, 'comments'), newComment);
      if (status === 'approved') {
        setPosts(prev => {
          const next = prev.map(p => p.id === postId ? { ...p, comments: (p.comments||0)+1 } : p);
          const updated = next.find(p => p.id === postId);
          if (updated) updateDoc(doc(db, 'posts', postId), { comments: updated.comments }).catch(() => {});
          return next;
        });
      }
    } catch (e) {
      setComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), newComment] }));
      if (status === 'approved') setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments||0)+1 } : p));
    }
  };

  const toggleLike = (postId, type, add) => {
    setPosts(prev => {
      const next = prev.map(p => p.id === postId ? { ...p, [type]: p[type] + (add ? 1 : -1) } : p);
      const updated = next.find(p => p.id === postId);
      if (updated) updateDoc(doc(db, 'posts', postId), { [type]: updated[type] }).catch(() => {});
      return next;
    });
  };

  // login — usado pelo AdminLogin
  const login = async (userData) => {
    try {
      const snap = await getDoc(doc(db, 'users', userData.uid));
      const firestoreRole = snap.exists() ? snap.data().role : 'user';
      const isActive = snap.exists() ? snap.data().active !== false : true;
      if (!isActive) {
        await signOut(auth);
        alert('Sua conta esta inativa.');
        await logAuth(LOG_ACTIONS.auth_login_failed, userData.email, userData.uid, false, 'Conta inativa');
        return;
      }
      const fullUser = { ...userData, role: firestoreRole };
      setUser(fullUser);
      await logAuth(LOG_ACTIONS.auth_login, userData.email, userData.uid, true, null);
    } catch (e) {
      setUser(userData);
      await logAuth(LOG_ACTIONS.auth_login, userData.email, userData.uid, true, null);
    }
  };

  const logout = async (reason = 'manual') => {
    if (user) {
      await logAuth(LOG_ACTIONS.auth_logout, user.email, user.uid, true, reason === 'timeout' ? 'Sessão expirada por inatividade' : null);
    }
    signOut(auth);
    setUser(null);
  };

  // ── Session ID único por aba (para audit logs) ───────────────────
  const sessionIdRef = React.useRef((() => {
    try {
      const key = 'app_session_id';
      let id = sessionStorage.getItem(key);
      if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(key, id); }
      return id;
    } catch { return Math.random().toString(36).slice(2); }
  })());

  // ── Aviso de sessão prestes a expirar ────────────────────────────
  const [sessionWarning, setSessionWarning] = React.useState(false);

  // ── Session timeout: 30 minutos de inatividade ───────────────────
  useSessionTimeout({
    isAuthenticated: !!user,
    timeoutMs: 30 * 60 * 1000,
    onTimeout: () => {
      setSessionWarning(false);
      logout('timeout');
    },
    onWarning: () => setSessionWarning(true),
  });

  const contextValue = {
    posts, setPosts,
    comments, setComments,
    user,
    bgConfig,
    carouselConfig,
    heroLogoUrl,
    navLogoUrl,

    login, logout,
    getComments, addComment, toggleLike,
    sessionId: sessionIdRef.current,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {/* Aviso de sessão prestes a expirar por inatividade */}
        {sessionWarning && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: 'rgba(245,158,11,0.95)', color: '#000',
            padding: '10px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem', fontWeight: 700, gap: 16,
          }}>
            <span>Sua sessão expira em 5 minutos por inatividade.</span>
            <button
              onClick={() => setSessionWarning(false)}
              style={{ background: 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', padding: '4px 12px', fontFamily: 'inherit', fontWeight: 700 }}
            >
              OK, continuar
            </button>
          </div>
        )}
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:postId" element={<PostPage />} />
          <Route path="/historia" element={<HistoriaPage />} />
          <Route path="/galeria" element={<GaleriaPage />} />
          <Route path="/musica" element={<MusicaPage />} />
          <Route path="/loja" element={<LojaPage />} />
          <Route path="/contato" element={<ContatoPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute><AdminShell /></ProtectedRoute>
          } />
          <Route path="/agenda/:id" element={<EventoPage />} />
          <Route path="/perfil" element={<UserProfilePage />} />
          <Route path="/error/:code" element={<ErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <FooterWrapper />
        <MobileBottomNav />
      </BrowserRouter>
    </AppContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
