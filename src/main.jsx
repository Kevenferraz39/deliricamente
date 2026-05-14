import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

// A ORDEM AQUI É IMPORTANTE! O components e o data precisam carregar antes.
import './components.jsx';
import './data.jsx';
import './pages-public.jsx';
import './pages-admin.jsx';

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

  const [user, setUser] = React.useState(() => {
    const saved = localStorage.getItem('deliricamente_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [page, setPage] = React.useState('home');
  const [pageData, setPageData] = React.useState(null);
  const [mobileNav, setMobileNav] = React.useState(false);

  // Persist to localStorage
  React.useEffect(() => {
    localStorage.setItem('deliricamente_posts', JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    localStorage.setItem('deliricamente_comments', JSON.stringify(comments));
  }, [comments]);

  React.useEffect(() => {
    if (user) {
      localStorage.setItem('deliricamente_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('deliricamente_user');
    }
  }, [user]);

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
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { ...comment, status: 'pending' }]
    }));
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, comments: p.comments + 1 } : p
    ));
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
    setUser(null);
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
              <window.LogoMark size={40} />
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
    content = <window.HomePage posts={posts} go={go} />;
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