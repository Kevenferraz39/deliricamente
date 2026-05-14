import React from 'react';

// Ajustado para extrair também o Placeholder, fmtDate e GALLERY do window
const { LogoMark, Btn, Icon, Placeholder, fmtDate, GALLERY } = window;

/* ============================================================
   ADMIN — login + dashboard + editor + moderação
   ============================================================ */

// ---------- LOGIN ----------
function AdminLogin({ onLogin, goPublic }) {
  const [email, setEmail] = React.useState("admin@deliricamente.com.br");
  const [pwd, setPwd] = React.useState("epifania2024");
  const [err, setErr] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    if (email.includes("@") && pwd.length >= 4) {
      onLogin({ name: "MC Roma", role: "admin master", email });
    } else {
      setErr("Credenciais inválidas. Tenta de novo.");
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <LogoMark size={64} />
        <div className="kicker" style={{marginTop:18}}>// PAINEL ADMINISTRATIVO</div>
        <h2 style={{marginTop:8}}>Entrar no<br/>dashboard</h2>
        <p>Acesso restrito ao coletivo. Use seu e-mail @deliricamente.</p>
        <form onSubmit={submit}>
          <input className="input" type="email" placeholder="E-MAIL" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="SENHA" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <Btn variant="red" arrow type="submit" style={{marginTop:8,width:"100%",justifyContent:"center"}}>Entrar</Btn>
        </form>
        {err && <div className="mono" style={{color:"var(--red)",marginTop:14}}>{err}</div>}
        <div className="hint">
          // DEMO · QUALQUER E-MAIL VÁLIDO + SENHA 4+ CARACTERES ENTRA
        </div>
        <div style={{marginTop:24, display:"flex", justifyContent:"space-between"}}>
          <a className="mono" style={{color:"var(--muted)",cursor:"pointer"}} onClick={goPublic}>← VOLTAR AO SITE</a>
          <a className="mono" style={{color:"var(--muted)",cursor:"pointer"}}>ESQUECI A SENHA</a>
        </div>
      </div>
    </div>
  );
}

// ---------- DASHBOARD HOME ----------
function AdminDashboard({ posts, comments, user }) {
  const published = posts.filter(p => p.status === "published");
  const drafts = posts.filter(p => p.status === "draft");
  const totalLikes = posts.reduce((s,p)=>s+(p.likes||0),0);
  const pending = Object.values(comments).flat().filter(c => c.status === "pending").length;

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// VISÃO GERAL</div>
          <h1>Dashboard</h1>
        </div>
        <div className="user">LOGADO COMO <b>{user.name}</b> · {user.role.toUpperCase()}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="lbl">POSTS PUBLICADOS</div>
          <div className="val">{published.length}</div>
          <div className="trend">+2 ESSE MÊS</div>
        </div>
        <div className="stat-card">
          <div className="lbl">RASCUNHOS</div>
          <div className="val">{drafts.length}</div>
          <div className="trend" style={{color:"var(--muted)"}}>AGUARDANDO</div>
        </div>
        <div className="stat-card">
          <div className="lbl">TOTAL DE CURTIDAS</div>
          <div className="val">{totalLikes}</div>
          <div className="trend">+18% NA SEMANA</div>
        </div>
        <div className="stat-card">
          <div className="lbl">COMENTÁRIOS PENDENTES</div>
          <div className="val" style={{color: pending ? "var(--red)" : "var(--paper)"}}>{pending}</div>
          <div className="trend" style={{color: pending ? "var(--red)" : "var(--muted)"}}>{pending ? "REVISAR →" : "TUDO EM DIA"}</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div className="admin-table">
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <h3 style={{margin:0,fontFamily:"var(--display)",fontSize:24,textTransform:"uppercase"}}>Posts recentes</h3>
            <span className="mono" style={{color:"var(--muted)"}}>// ÚLTIMAS 5 ENTRADAS</span>
          </div>
          {posts.slice(0,5).map(p => (
            <div className="admin-table-row" key={p.id} style={{gridTemplateColumns:"1.6fr 100px 80px 80px 1fr"}}>
              <div className="title-cell">
                <div className="title-thumb"><Placeholder label="" variant={p.cover.variant} /></div>
                <div>
                  <div>{p.title}</div>
                  <div className="mono" style={{color:"var(--muted)",marginTop:4}}>{p.id.toUpperCase()} · {p.type}</div>
                </div>
              </div>
              <span className={"status-pill " + (p.status === "published" ? "published" : "draft")}>
                {p.status === "published" ? "PUBLICADO" : "RASCUNHO"}
              </span>
              <span className="mono" style={{color:"var(--muted)"}}>♥ {p.likes}</span>
              <span className="mono" style={{color:"var(--muted)"}}>💬 {p.comments}</span>
              <span className="mono" style={{color:"var(--muted)"}}>{fmtDate(p.date).join(" · ")}</span>
            </div>
          ))}
        </div>

        <div className="admin-table">
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--line)"}}>
            <h3 style={{margin:0,fontFamily:"var(--display)",fontSize:24,textTransform:"uppercase"}}>Atividade</h3>
          </div>
          {[
            { t:"Novo comentário em EPIFANIA", who:"theoeste.wav", when:"há 12min" },
            { t:"Post 'Show Deliricamente' publicado", who:"Hery", when:"há 2h" },
            { t:"3 curtidas em Arrecadação", who:"—", when:"há 3h" },
            { t:"Comentário aprovado", who:"MC Roma", when:"ontem" },
            { t:"Rascunho salvo: 'EPIFANIA 2025'", who:"GuLírico", when:"ontem" },
          ].map((e,i)=>(
            <div key={i} style={{padding:"16px 20px",borderBottom:"1px solid var(--line)"}}>
              <div style={{fontSize:13,marginBottom:6}}>{e.t}</div>
              <div className="mono" style={{color:"var(--muted)"}}>{e.who} · {e.when}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- POSTS LIST ----------
function AdminPosts({ posts, onEdit, onNew, onDelete, onToggleStatus }) {
  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// CONTEÚDO</div>
          <h1>Posts</h1>
        </div>
        <Btn variant="red" arrow onClick={onNew}><Icon.Plus /> Novo post</Btn>
      </div>

      <div className="admin-table">
        <div className="admin-table-head">
          <span>TÍTULO</span>
          <span>AUTOR</span>
          <span>STATUS</span>
          <span>CURTIDAS</span>
          <span>COMENT.</span>
          <span>AÇÕES</span>
        </div>
        {posts.map(p => (
          <div className="admin-table-row" key={p.id}>
            <div className="title-cell">
              <div className="title-thumb"><Placeholder label="" variant={p.cover.variant} /></div>
              <div>
                <div>{p.title}</div>
                <div className="mono" style={{color:"var(--muted)",marginTop:4}}>{p.type} · {fmtDate(p.date).join(" · ")}</div>
              </div>
            </div>
            <span className="mono" style={{color:"var(--paper)"}}>{p.author}</span>
            <span className={"status-pill " + (p.status === "published" ? "published" : "draft")} onClick={()=>onToggleStatus(p.id)} style={{cursor:"pointer"}}>
              {p.status === "published" ? "PUBLICADO" : "RASCUNHO"}
            </span>
            <span className="mono" style={{color:"var(--muted)"}}>♥ {p.likes}</span>
            <span className="mono" style={{color:"var(--muted)"}}>💬 {p.comments}</span>
            <div className="row-actions">
              <button className="icon-btn" title="Visualizar"><Icon.Eye /></button>
              <button className="icon-btn" title="Editar" onClick={()=>onEdit(p.id)}><Icon.Edit /></button>
              <button className="icon-btn danger" title="Deletar" onClick={()=>onDelete(p.id)}><Icon.Trash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- EDITOR ----------
function AdminEditor({ post, onSave, onCancel }) {
  const isNew = !post;
  const [draft, setDraft] = React.useState(post || {
    id: "p" + String(Math.floor(Math.random()*900)+100),
    type: "EVENTO",
    title: "",
    excerpt: "",
    cover: { label: "NOVA CAPA", variant: "red" },
    date: new Date().toISOString().slice(0,10),
    author: "MC Roma",
    likes: 0, fires: 0, comments: 0, views: 0,
    tags: [],
    status: "draft",
    body: [{ kind: "p", text: "" }],
  });
  const [tagInput, setTagInput] = React.useState("");
  const [bodyText, setBodyText] = React.useState(
    (post?.body || []).map(b => {
      if (b.kind === "p") return b.text;
      if (b.kind === "h2") return "## " + b.text;
      if (b.kind === "quote") return "> " + b.text;
      if (b.kind === "ul") return b.items.map(i => "- " + i).join("\n");
      if (b.kind === "embed") return "[VIDEO: " + (b.label || "youtube") + "]";
      return "";
    }).join("\n\n")
  );

  const parseBody = (txt) => {
    const blocks = [];
    txt.split(/\n{2,}/).forEach(chunk => {
      const t = chunk.trim();
      if (!t) return;
      if (t.startsWith("## ")) blocks.push({ kind: "h2", text: t.slice(3) });
      else if (t.startsWith("> ")) blocks.push({ kind: "quote", text: t.slice(2) });
      else if (t.match(/^\[VIDEO/i)) blocks.push({ kind: "embed", label: t.replace(/\[|\]/g,"") });
      else if (t.split("\n").every(l => l.startsWith("- "))) {
        blocks.push({ kind: "ul", items: t.split("\n").map(l => l.slice(2)) });
      }
      else blocks.push({ kind: "p", text: t });
    });
    return blocks;
  };

  const save = (status) => {
    onSave({ ...draft, body: parseBody(bodyText), status });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags.includes(t)) {
      setDraft({ ...draft, tags: [...draft.tags, t] });
    }
    setTagInput("");
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// {isNew ? "NOVO POST" : "EDITANDO " + draft.id.toUpperCase()}</div>
          <h1>{isNew ? "Criar post" : "Editar post"}</h1>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onCancel}>Cancelar</Btn>
          <Btn onClick={()=>save("draft")}>Salvar rascunho</Btn>
          <Btn variant="red" arrow onClick={()=>save("published")}>Publicar</Btn>
        </div>
      </div>

      <div className="editor-shell">
        <div className="editor-main">
          <input
            className="editor-title"
            placeholder="TÍTULO DO POST..."
            value={draft.title}
            onChange={e=>setDraft({...draft,title:e.target.value})}
          />
          <input
            className="input"
            style={{width:"100%",marginBottom:16}}
            placeholder="RESUMO (APARECE NA LISTA DE POSTS)"
            value={draft.excerpt}
            onChange={e=>setDraft({...draft,excerpt:e.target.value})}
          />

          <div className="editor-toolbar">
            <button title="Negrito"><b>B</b></button>
            <button title="Itálico"><i>I</i></button>
            <button title="Sublinhado"><u>U</u></button>
            <span className="sep" />
            <button title="Título">H2</button>
            <button title="Citação">"</button>
            <button title="Lista">• LISTA</button>
            <button title="Link">LINK</button>
            <span className="sep" />
            <button title="Imagem">+ IMG</button>
            <button title="Vídeo">+ VIDEO</button>
            <span style={{flex:1}} />
            <span className="mono" style={{color:"var(--muted)",alignSelf:"center"}}>
              MARKDOWN: ## H2, &gt; QUOTE, - ITEM
            </span>
          </div>

          <textarea
            className="editor-body"
            value={bodyText}
            onChange={e=>setBodyText(e.target.value)}
            placeholder="Escreve o conteúdo aqui..."
          />

          <div style={{marginTop:24,padding:20,background:"#0f0f0f",border:"1px solid var(--line)"}}>
            <div className="kicker" style={{marginBottom:12}}>// PRÉ-VISUALIZAÇÃO</div>
            <h2 style={{fontFamily:"var(--display)",fontSize:36,lineHeight:0.95,textTransform:"uppercase",margin:"0 0 16px"}}>
              {draft.title || "TÍTULO DO POST..."}
            </h2>
            <p style={{color:"#bbb"}}>{draft.excerpt || "Resumo do post aparece aqui."}</p>
            <div style={{borderTop:"1px solid var(--line)",marginTop:16,paddingTop:16}}>
              {parseBody(bodyText).slice(0,3).map((b,i)=>{
                if (b.kind === "h2") return <h3 key={i} style={{fontFamily:"var(--display)",fontSize:22,textTransform:"uppercase",margin:"12px 0 8px"}}>{b.text}</h3>;
                if (b.kind === "quote") return <blockquote key={i} style={{borderLeft:"3px solid var(--red)",paddingLeft:14,fontStyle:"italic",color:"var(--paper)",margin:"12px 0"}}>{b.text}</blockquote>;
                if (b.kind === "ul") return <ul key={i} style={{color:"#ccc"}}>{b.items.map((it,j)=><li key={j}>{it}</li>)}</ul>;
                if (b.kind === "embed") return <div key={i} className="mono" style={{padding:24,background:"#1a1a1a",textAlign:"center",color:"var(--muted)",margin:"12px 0"}}>// {b.label}</div>;
                return <p key={i} style={{color:"#ccc",margin:"8px 0"}}>{b.text}</p>;
              })}
            </div>
          </div>
        </div>

        <div className="editor-side">
          <div className="box">
            <h4>// TIPO DE POST</h4>
            <select className="input" style={{width:"100%"}} value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}>
              <option>EVENTO</option>
              <option>SHOW</option>
              <option>NOTÍCIA</option>
              <option>CULTURA</option>
              <option>ANÚNCIO</option>
            </select>
          </div>

          <div className="box">
            <h4>// PUBLICAÇÃO</h4>
            <input className="input" style={{width:"100%",marginBottom:8}} type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})} />
            <input className="input" style={{width:"100%"}} placeholder="AUTOR" value={draft.author} onChange={e=>setDraft({...draft,author:e.target.value})} />
          </div>

          <div className="box">
            <h4>// IMAGEM DE CAPA</h4>
            <div className="upload-zone" style={{marginBottom:10}}>
              <Icon.Upload />
              ARRASTE OU CLIQUE<br/>PARA SUBIR
            </div>
            <input className="input" style={{width:"100%"}} placeholder="LEGENDA DA CAPA" value={draft.cover.label} onChange={e=>setDraft({...draft,cover:{...draft.cover,label:e.target.value}})} />
          </div>

          <div className="box">
            <h4>// GALERIA</h4>
            <div className="upload-zone">
              <Icon.Upload />
              + IMAGENS / VÍDEOS<br/>YOUTUBE · VIMEO · UPLOAD
            </div>
          </div>

          <div className="box">
            <h4>// TAGS</h4>
            <div className="tag-input">
              {draft.tags.map(t => (
                <span className="t" key={t} onClick={() => setDraft({...draft, tags: draft.tags.filter(x => x !== t)})}>
                  {t} <Icon.Close />
                </span>
              ))}
              <input
                placeholder="+ TAG"
                value={tagInput}
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{ if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- MODERATION ----------
function AdminComments({ comments, onModerate }) {
  const all = [];
  Object.entries(comments).forEach(([postId, list]) => {
    list.forEach((c, idx) => all.push({ ...c, postId, idx }));
  });
  const pending = all.filter(c => c.status === "pending");
  const approved = all.filter(c => c.status === "approved");
  const [tab, setTab] = React.useState("pending");
  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// MODERAÇÃO</div>
          <h1>Comentários</h1>
        </div>
        <div className="tag-chips">
          <button className={"chip " + (tab === "pending" ? "active" : "")} onClick={()=>setTab("pending")}>
            Pendentes · {pending.length}
          </button>
          <button className={"chip " + (tab === "approved" ? "active" : "")} onClick={()=>setTab("approved")}>
            Aprovados · {approved.length}
          </button>
        </div>
      </div>

      <div className="admin-table">
        {list.length === 0 && (
          <div style={{padding:40,textAlign:"center",color:"var(--muted)"}} className="mono">
            // NENHUM COMENTÁRIO {tab === "pending" ? "PENDENTE" : "APROVADO"}
          </div>
        )}
        {list.map((c) => (
          <div key={c.postId+"-"+c.idx} style={{padding:"20px 24px",borderBottom:"1px solid var(--line)",display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start"}}>
            <div>
              <div className="comment-head" style={{marginBottom:10}}>
                <b>{c.name}</b>
                <span>{c.email}</span>
                <span>{c.date}</span>
                <span>em <b style={{color:"var(--red)"}}>{c.postId.toUpperCase()}</b></span>
              </div>
              <div className="comment-text">{c.text}</div>
            </div>
            <div className="row-actions">
              {c.status === "pending" && (
                <button className="icon-btn" title="Aprovar" onClick={()=>onModerate(c.postId,c.idx,"approved")} style={{borderColor:"#22c55e",color:"#22c55e"}}>✓</button>
              )}
              <button className="icon-btn danger" title="Deletar" onClick={()=>onModerate(c.postId,c.idx,"deleted")}><Icon.Trash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- MEDIA ----------
function AdminMedia() {
  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// BIBLIOTECA</div>
          <h1>Mídia</h1>
        </div>
        <Btn variant="red" arrow><Icon.Upload /> Upload</Btn>
      </div>

      <div className="upload-zone" style={{padding:48, marginBottom:24}}>
        <Icon.Upload />
        ARRASTE FOTOS OU VÍDEOS AQUI<br/>
        <span style={{fontSize:9,opacity:.6,marginTop:8,display:"inline-block"}}>
          OU CLIQUE PARA SELECIONAR · JPG · PNG · MP4 · MOV · ATÉ 50MB
        </span>
      </div>

      <div className="gallery-grid">
        {GALLERY.slice(0,8).map((g,i) => (
          <div key={i} className="gallery-item" style={{gridColumn:"span 1",gridRow:"span 1"}}>
            <Placeholder label={g.label} variant={g.variant} />
            <div className="gallery-overlay">
              <div>{g.label}<br/><small>2.4MB · JPG</small></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- USERS / SETTINGS ----------
function AdminSettings({ user }) {
  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// EQUIPE</div>
          <h1>Usuários & ajustes</h1>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:24}}>
        <div className="admin-table">
          <div className="admin-table-head" style={{gridTemplateColumns:"1.4fr 1fr 1fr 100px"}}>
            <span>NOME</span><span>E-MAIL</span><span>FUNÇÃO</span><span>STATUS</span>
          </div>
          {[
            { n:"MC Roma", e:"roma@deliricamente.com.br", r:"ADMIN MASTER", s:"ATIVO" },
            { n:"Hery", e:"hery@deliricamente.com.br", r:"EDITOR", s:"ATIVO" },
            { n:"GuLírico", e:"gulirico@deliricamente.com.br", r:"EDITOR", s:"ATIVO" },
            { n:"Léo Braga", e:"leo@mangueio.com.br", r:"MODERADOR", s:"ATIVO" },
            { n:"DJ Champola", e:"champola@deliricamente.com.br", r:"MODERADOR", s:"INATIVO" },
          ].map((u,i)=>(
            <div key={i} className="admin-table-row" style={{gridTemplateColumns:"1.4fr 1fr 1fr 100px"}}>
              <div className="title-cell">
                <div className="comment-avatar" style={{width:36,height:36,fontSize:14}}>{u.n[0]}</div>
                <div>{u.n}</div>
              </div>
              <span className="mono" style={{color:"var(--muted)"}}>{u.e}</span>
              <span className="mono" style={{color:"var(--red)"}}>{u.r}</span>
              <span className={"status-pill " + (u.s === "ATIVO" ? "published" : "draft")}>{u.s}</span>
            </div>
          ))}
        </div>

        <div className="editor-side">
          <div className="box">
            <h4>// SEU PERFIL</h4>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div className="comment-avatar" style={{width:56,height:56,fontSize:22}}>{user.name[0]}</div>
              <div>
                <div style={{fontWeight:600}}>{user.name}</div>
                <div className="mono" style={{color:"var(--red)",marginTop:4}}>{user.role.toUpperCase()}</div>
              </div>
            </div>
            <Btn arrow style={{width:"100%",justifyContent:"center"}}>Editar perfil</Btn>
          </div>
          <div className="box">
            <h4>// SITE</h4>
            <div className="mono" style={{lineHeight:1.7,color:"var(--paper)"}}>
              VERSÃO · v1.0<br/>
              POSTS · 87<br/>
              MÍDIA · 412 ARQUIVOS<br/>
              DISCO · 4.2 GB / 10 GB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- ADMIN SHELL ----------
function AdminShell({ user, onLogout, goPublic, posts, setPosts, comments, setComments }) {
  const [section, setSection] = React.useState("dashboard");
  const [editingId, setEditingId] = React.useState(null);

  const moderate = (postId, idx, status) => {
    setComments(prev => {
      const next = { ...prev };
      const list = [...(next[postId] || [])];
      if (status === "deleted") list.splice(idx, 1);
      else list[idx] = { ...list[idx], status };
      next[postId] = list;
      return next;
    });
  };

  const savePost = (post) => {
    setPosts(prev => {
      const exists = prev.find(p => p.id === post.id);
      if (exists) return prev.map(p => p.id === post.id ? post : p);
      return [post, ...prev];
    });
    setEditingId(null);
    setSection("posts");
  };

  const deletePost = (id) => {
    if (window.confirm("Deletar este post? Essa ação não pode ser desfeita.")) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p));
  };

  let content;
  if (section === "dashboard") content = <AdminDashboard posts={posts} comments={comments} user={user} />;
  else if (section === "posts") content = <AdminPosts posts={posts}
    onEdit={(id)=>{setEditingId(id); setSection("editor");}}
    onNew={()=>{setEditingId(null); setSection("editor");}}
    onDelete={deletePost}
    onToggleStatus={toggleStatus}
  />;
  else if (section === "editor") content = <AdminEditor
    post={editingId ? posts.find(p => p.id === editingId) : null}
    onSave={savePost}
    onCancel={()=>{setEditingId(null); setSection("posts");}}
  />;
  else if (section === "comments") content = <AdminComments comments={comments} onModerate={moderate} />;
  else if (section === "media") content = <AdminMedia />;
  else if (section === "settings") content = <AdminSettings user={user} />;

  const navItems = [
    { id:"dashboard", label:"Dashboard" },
    { id:"posts",     label:"Posts" },
    { id:"comments",  label:"Comentários" },
    { id:"media",     label:"Mídia" },
    { id:"settings",  label:"Equipe" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <LogoMark size={40} />
          <div>
            <b>Deliricamente</b>
            <small>// PAINEL ADMIN</small>
          </div>
        </div>
        <nav className="admin-nav">
          {navItems.map(n => (
            <button
              key={n.id}
              className={section === n.id || (n.id==="posts" && section==="editor") ? "active" : ""}
              onClick={()=>{ setSection(n.id); if (n.id !== "editor") setEditingId(null); }}
            >
              <span className="dot" /> {n.label}
            </button>
          ))}
        </nav>
        <button className="logout" onClick={goPublic}>← VOLTAR AO SITE</button>
        <button className="logout" onClick={onLogout}>SAIR DA CONTA</button>
      </aside>
      <main className="admin-main page-enter">
        {content}
      </main>
    </div>
  );
}

Object.assign(window, { AdminLogin, AdminShell });