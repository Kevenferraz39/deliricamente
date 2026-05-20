import React from 'react';
import ReactDOM from 'react-dom/client';
import { db, auth } from './firebase.js';
import { doc, collection, addDoc, setDoc, updateDoc, deleteDoc, getDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
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

// UID do desenvolvedor/admin master — acesso total irrestrito
const MASTER_UID = 'ZtQlNzTDa1S9AsuNppbtNfpbVdI3';

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

  // Referencia para controlar migração única
  const migratedPostsRef = React.useRef(false);

  // Sincroniza posts com Firestore — migra automaticamente quando o banco está vazio
  React.useEffect(() => {
    const localPosts = (() => {
      try { const s = localStorage.getItem('deliricamente_posts'); return s ? JSON.parse(s) : window.SEED_POSTS; }
      catch { return window.SEED_POSTS; }
    })();

    try {
      const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
      const unsub = onSnapshot(q, async snap => {
        const firestorePosts = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        if (firestorePosts.length > 0) {
          // Firestore tem posts — usa eles (aparece em todos os devices)
          setPosts(firestorePosts);
        } else if (!migratedPostsRef.current) {
          // Firestore vazio — migra todos os posts locais/seed para o banco
          migratedPostsRef.current = true;
          console.log('Migrando', localPosts.length, 'posts para o Firestore...');
          await Promise.all(
            localPosts.map(post =>
              setDoc(doc(db, 'posts', post.id), { ...post }).catch(e => console.warn('migração post:', e.message))
            )
          );
          console.log('Migração de posts concluída!');
        }
      });
      return () => unsub();
    } catch (e) { console.warn('Posts sync:', e.message); }
  }, []);

  const [comments, setComments] = React.useState(() => {
    const saved = localStorage.getItem('deliricamente_comments');
    return saved ? JSON.parse(saved) : {};
  });

  // Sincroniza comentarios com Firestore
  React.useEffect(() => {
    try {
      const unsub = onSnapshot(query(collection(db, 'comments'), orderBy('date', 'desc')), snap => {
        if (snap.empty) return; // mantém localStorage se Firestore vazio
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
        const isMaster = fbUser.uid === MASTER_UID;
        try {
          // Le role atual do Firestore para nao sobrescrever
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          const existingRole = snap.exists() ? snap.data().role : null;
          const role = isMaster ? 'admin_master' : (existingRole || 'user');

          setUser({
            name: fbUser.displayName || fbUser.email.split('@')[0],
            role,
            email: fbUser.email,
            uid: fbUser.uid,
            isMaster,
          });

          const docData = {
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email.split('@')[0],
            photoUrl: fbUser.photoURL || '',
            lastLogin: serverTimestamp(),
          };
          // So define role se nao existir (preserva roles ja definidos pelo admin)
          if (!existingRole || isMaster) {
            docData.role = isMaster ? 'admin_master' : 'user';
            docData.active = true;
          }
          await setDoc(doc(db, 'users', fbUser.uid), docData, { merge: true });
        } catch (e) {
          setUser({
            name: fbUser.displayName || fbUser.email.split('@')[0],
            role: isMaster ? 'admin_master' : 'user',
            email: fbUser.email,
            uid: fbUser.uid,
            isMaster,
          });
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

  const addComment = async (postId, comment) => {
    const flaggedTerms = detectOffensive(comment.text || '');
    const status = flaggedTerms.length > 0 ? 'flagged' : 'approved';
    const newComment = {
      ...comment,
      postId,
      status,
      date: new Date().toISOString(),
      ...(flaggedTerms.length > 0 ? { flaggedTerms, flaggedAt: new Date().toISOString() } : {}),
    };
    try {
      // Salva no Firestore — aparece em todos os dispositivos
      await addDoc(collection(db, 'comments'), newComment);
      if (status === 'approved') {
        // Incrementa contador de comentarios no post
        setPosts(prev => {
          const next = prev.map(p => p.id === postId ? { ...p, comments: (p.comments||0)+1 } : p);
          const updated = next.find(p => p.id === postId);
          if (updated) updateDoc(doc(db, 'posts', postId), { comments: updated.comments }).catch(() => {});
          return next;
        });
      }
    } catch (e) {
      // Fallback localStorage se Firestore indisponivel
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      if (status === 'approved') {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments||0)+1 } : p));
      }
    }
  };

  // Like/reaction functions — atualiza Firestore e estado local
  const toggleLike = (postId, type, add) => {
    setPosts(prev => {
      const next = prev.map(p => p.id === postId ? { ...p, [type]: p[type] + (add ? 1 : -1) } : p);
      const updated = next.find(p => p.id === postId);
      if (updated) updateDoc(doc(db, 'posts', postId), { [type]: updated[type] }).catch(() => {});
      return next;
    });
  };

  // Auth functions — roteamento por role
  const login = async (userData) => {
    try {
      const snap = await getDoc(doc(db, 'users', userData.uid));
      const firestoreRole = snap.exists() ? snap.data().role : 'user';
      const isActive = snap.exists() ? snap.data().active !== false : true;

      if (!isActive) {
        await signOut(auth);
        alert('Sua conta esta inativa. Entre em contato com o administrador.');
        return;
      }

      const fullUser = { ...userData, role: firestoreRole };
      setUser(fullUser);

      if (userData.isMaster || firestoreRole === 'admin_master' || firestoreRole === 'admin') {
        // Admins vao para o painel
        go('admin-dashboard');
      } else {
        // Users comuns ficam no site publico (logados para comentar, curtir, etc.)
        go('home');
      }
    } catch (e) {
      if (userData.isMaster) { setUser(userData); go('admin-dashboard'); }
      else { setUser(userData); go('home'); }
    }
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
      user={user}
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