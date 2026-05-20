import React from 'react';
import { db, auth } from './firebase.js';
import { doc, collection, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Helper compartilhado de upload via imgbb
const uploadImg = async (file) => {
  const key = import.meta.env.VITE_IMGBB_KEY;
  if (!key || key === 'SUA_CHAVE_IMGBB_AQUI') throw new Error('Configure VITE_IMGBB_KEY no .env e reinicie o servidor');
  const form = new FormData();
  form.append('image', file);
  form.append('key', key);
  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Upload falhou');
  return json.data.url;
};

// Ajustado para extrair também o Placeholder, fmtDate e GALLERY do window
const { LogoMark, Btn, Icon, Placeholder, fmtDate, GALLERY } = window;

/* ============================================================
   ADMIN — login + dashboard + editor + moderação
   ============================================================ */

// ---------- LOGIN ----------
function AdminLogin({ onLogin, goPublic }) {
  const [mode, setMode] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [pwd, setPwd] = React.useState('');
  const [name, setName] = React.useState('');
  const [err, setErr] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const doLogin = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pwd);
      onLogin({ name: cred.user.displayName || cred.user.email.split('@')[0], role: 'editor', email: cred.user.email, uid: cred.user.uid });
    } catch (e) { setErr('Credenciais invalidas. Verifique e-mail e senha.'); }
    setLoading(false);
  };

  const doRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setErr('Nome obrigatorio.'); return; }
    if (pwd.length < 6) { setErr('Senha deve ter ao menos 6 caracteres.'); return; }
    setErr(''); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pwd);
      await updateProfile(cred.user, { displayName: name.trim() });
      // Novo usuario criado como leitor inativo — aguarda aprovacao do admin master
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        displayName: name.trim(),
        role: 'user',
        active: false,
        photoUrl: '',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      await signOut(auth);
      setErr('');
      setMode('login');
      // Show success via a temporary state
      setEmail('');
      setPwd('');
      setName('');
      alert('Conta criada! Aguarde o administrador ativar seu acesso. Voce sera notificado.');
    } catch (e) {
      setErr(e.code === 'auth/email-already-in-use' ? 'Este e-mail ja esta cadastrado.' : 'Erro: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <LogoMark size={64} />
        <div className="kicker" style={{marginTop:18}}>// PAINEL ADMINISTRATIVO</div>
        <h2 style={{marginTop:8}}>{mode === 'login' ? 'Entrar no' : 'Criar'}<br/>{mode === 'login' ? 'dashboard' : 'sua conta'}</h2>
        <p>{mode === 'login' ? 'Acesso restrito ao coletivo.' : 'Preencha os dados. Sua conta sera ativada pelo Admin.'}</p>

        <form onSubmit={mode === 'login' ? doLogin : doRegister}>
          {mode === 'register' && (
            <input className="input" type="text" placeholder="SEU NOME" value={name} onChange={e=>setName(e.target.value)} />
          )}
          <input className="input" type="email" placeholder="E-MAIL" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="SENHA (min. 6 caracteres)" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <Btn variant="red" arrow type="submit" style={{marginTop:8,width:'100%',justifyContent:'center'}} disabled={loading}>
            {loading ? (mode === 'login' ? 'ENTRANDO...' : 'CRIANDO...') : (mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA')}
          </Btn>
        </form>

        {err && <div className="mono" style={{color:'var(--red)',marginTop:14}}>{err}</div>}

        <div style={{marginTop:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <a className="mono" style={{color:'var(--muted)',cursor:'pointer'}} onClick={goPublic}>← VOLTAR AO SITE</a>
          <a className="mono" style={{color:'var(--muted)',cursor:'pointer',fontSize:'0.78rem'}} onClick={()=>{setMode(m=>m==='login'?'register':'login');setErr('');}}>
            {mode === 'login' ? 'Criar conta' : 'Ja tenho conta'}
          </a>
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
                <div className="title-thumb" style={{overflow:'hidden'}}>{p.cover?.url ? <img src={p.cover.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <Placeholder label="" variant={p.cover?.variant} />}</div>
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
function AdminPosts({ posts, onEdit, onNew, onDelete, onToggleStatus, onUpdateCover }) {
  const [uploadingId, setUploadingId] = React.useState(null);
  const [hoverThumb, setHoverThumb] = React.useState(null);
  const fileRef = React.useRef(null);
  const pendingId = React.useRef(null);

  const handleThumbClick = (postId) => {
    pendingId.current = postId;
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const postId = pendingId.current;
    if (!file || !postId) return;
    setUploadingId(postId);
    try {
      const url = await uploadImg(file);
      onUpdateCover(postId, url);
    } catch (err) { alert('Erro: ' + err.message); }
    setUploadingId(null);
    e.target.value = '';
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange} />
      <div className="admin-head">
        <div>
          <div className="kicker">// CONTEUDO</div>
          <h1>Posts</h1>
        </div>
        <Btn variant="red" arrow onClick={onNew}><Icon.Plus /> Novo post</Btn>
      </div>

      <div className="admin-table">
        <div className="admin-table-head">
          <span>TITULO</span>
          <span>AUTOR</span>
          <span>STATUS</span>
          <span>CURTIDAS</span>
          <span>COMENT.</span>
          <span>ACOES</span>
        </div>
        {posts.map(p => (
          <div className="admin-table-row" key={p.id}>
            <div className="title-cell">
              <div className="title-thumb"
                style={{overflow:'hidden',cursor:'pointer',position:'relative',flexShrink:0}}
                onClick={()=>handleThumbClick(p.id)}
                onMouseEnter={()=>setHoverThumb(p.id)}
                onMouseLeave={()=>setHoverThumb(null)}
                title="Clique para trocar a imagem de capa">
                {uploadingId === p.id
                  ? <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray)',fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'var(--muted)'}}>...</div>
                  : p.cover?.url
                    ? <img src={p.cover.url} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                    : <Placeholder label="" variant={p.cover?.variant} />
                }
                {hoverThumb === p.id && uploadingId !== p.id && (
                  <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:'0.55rem',color:'white'}}>
                    TROCAR
                  </div>
                )}
              </div>
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
  const [coverUploading, setCoverUploading] = React.useState(false);
  const coverRef = React.useRef(null);
  const bodyRef = React.useRef(null);

  // Insere texto antes/depois da seleção no textarea
  const wrap = (before, after = '') => {
    const ta = bodyRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = bodyText.slice(s, e);
    const next = bodyText.slice(0, s) + before + sel + after + bodyText.slice(e);
    setBodyText(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); }, 0);
  };

  // Insere prefixo no início da linha atual
  const line = (prefix) => {
    const ta = bodyRef.current; if (!ta) return;
    const s = ta.selectionStart;
    const lineStart = bodyText.lastIndexOf('\n', s - 1) + 1;
    const next = bodyText.slice(0, lineStart) + prefix + bodyText.slice(lineStart);
    setBodyText(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + prefix.length, s + prefix.length); }, 0);
  };

  // Insere um bloco na linha seguinte vazia
  const block = (txt) => {
    const ta = bodyRef.current; if (!ta) return;
    const s = ta.selectionStart;
    const before = bodyText.slice(0, s);
    const after = bodyText.slice(s);
    const sep = before.length && !before.endsWith('\n\n') ? '\n\n' : '';
    const next = before + sep + txt + '\n\n' + after;
    setBodyText(next);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + sep.length + txt.length + 2, s + sep.length + txt.length + 2); }, 0);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadImg(file);
      setDraft(d => ({ ...d, cover: { ...d.cover, url } }));
    } catch (err) { alert('Erro no upload: ' + err.message); }
    setCoverUploading(false);
    e.target.value = '';
  };
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
      else if (t.match(/^\[VIDEO/i)) {
        const url = t.replace(/^\[VIDEO:\s*/i,'').replace(/\]$/,'').trim();
        blocks.push({ kind: "embed", url, label: t.replace(/\[|\]/g,"") });
      }
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
            <button title="Negrito" onClick={()=>wrap('**','**')}><b>B</b></button>
            <button title="Italico" onClick={()=>wrap('*','*')}><i>I</i></button>
            <button title="Riscado" onClick={()=>wrap('~~','~~')}><s>S</s></button>
            <span className="sep" />
            <button title="Titulo H2" onClick={()=>line('## ')}>H2</button>
            <button title="Citacao/Quote" onClick={()=>line('> ')}>&gt;</button>
            <button title="Item de lista" onClick={()=>line('- ')}>• LISTA</button>
            <span className="sep" />
            <button title="Adicionar video embed" onClick={()=>block('[VIDEO: cole-o-link-aqui]')}>+ VIDEO</button>
            <span style={{flex:1}} />
            <span className="mono" style={{color:"var(--muted)",alignSelf:"center",fontSize:'0.72rem'}}>
              **negrito** · *italico* · ## H2 · &gt; quote · - item
            </span>
          </div>

          <textarea
            ref={bodyRef}
            className="editor-body"
            value={bodyText}
            onChange={e=>setBodyText(e.target.value)}
            placeholder="Escreve o conteudo aqui..."
          />

          <div style={{marginTop:24,padding:20,background:"var(--black)",border:"1px solid var(--line)"}}>
            <div className="kicker" style={{marginBottom:12}}>// PRÉ-VISUALIZAÇÃO</div>
            <h2 style={{fontFamily:"var(--display)",fontSize:36,lineHeight:0.95,textTransform:"uppercase",margin:"0 0 16px"}}>
              {draft.title || "TÍTULO DO POST..."}
            </h2>
            <p style={{color:"var(--text-body)"}}>{draft.excerpt || "Resumo do post aparece aqui."}</p>
            <div style={{borderTop:"1px solid var(--line)",marginTop:16,paddingTop:16}}>
              {parseBody(bodyText).slice(0,3).map((b,i)=>{
                // Renderiza **bold**, *italic*, ~~strike~~ no preview
                const mdPrev = (txt) => {
                  if (!txt) return txt;
                  const parts = []; const re = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~)/g;
                  let last = 0, m;
                  while ((m = re.exec(txt)) !== null) {
                    if (m.index > last) parts.push(txt.slice(last, m.index));
                    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
                    else if (m[3]) parts.push(<em key={m.index} style={{fontStyle:'italic',color:'inherit'}}>{m[3]}</em>);
                    else if (m[4]) parts.push(<s key={m.index}>{m[4]}</s>);
                    last = m.index + m[0].length;
                  }
                  if (last < txt.length) parts.push(txt.slice(last));
                  return parts.length > 1 ? parts : txt;
                };
                if (b.kind === "h2") return <h3 key={i} style={{fontFamily:"var(--display)",fontSize:22,textTransform:"uppercase",margin:"12px 0 8px"}}>{b.text}</h3>;
                if (b.kind === "quote") return <blockquote key={i} style={{borderLeft:"3px solid var(--red)",paddingLeft:14,fontStyle:"italic",color:"var(--paper)",margin:"12px 0"}}>{mdPrev(b.text)}</blockquote>;
                if (b.kind === "ul") return <ul key={i} style={{color:"var(--text-body)"}}>{b.items.map((it,j)=><li key={j}>{mdPrev(it)}</li>)}</ul>;
                if (b.kind === "embed") {
                  const raw = b.url || b.label || '';
                  const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
                  const ytId = ytMatch ? ytMatch[1] : null;
                  return ytId
                    ? <div key={i} style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',margin:'8px 0'}}>
                        <iframe src={'https://www.youtube.com/embed/'+ytId} style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}} allowFullScreen />
                      </div>
                    : <div key={i} className="mono" style={{padding:12,background:"var(--panel)",textAlign:"center",color:"var(--muted)",margin:"8px 0",fontSize:'0.8rem'}}>// VIDEO: {raw}</div>;
                }
                return <p key={i} style={{color:"var(--text-body)",margin:"8px 0"}}>{mdPrev(b.text)}</p>;
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
            <input ref={coverRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleCoverUpload} />
            <div className="upload-zone" style={{marginBottom:10,cursor:'pointer',padding:0,overflow:'hidden',minHeight:80}}
              onClick={()=>coverRef.current?.click()}>
              {coverUploading
                ? <div style={{padding:24,fontFamily:'var(--font-mono)',fontSize:'0.8rem'}}>Enviando...</div>
                : draft.cover?.url
                  ? <img src={draft.cover.url} alt="capa" style={{width:'100%',height:120,objectFit:'cover',display:'block'}} />
                  : <div style={{padding:24}}><Icon.Upload /><br/>CLIQUE PARA SUBIR<br/><span style={{fontSize:'0.65rem',opacity:0.5}}>JPG · PNG · WEBP</span></div>
              }
            </div>
            {draft.cover?.url && (
              <>
                {/* Controle de posicao do corte nos cards */}
                <div style={{marginBottom:8}}>
                  <div className="mono" style={{fontSize:'0.68rem',color:'var(--muted)',marginBottom:6}}>POSICAO DO CORTE NO CARD</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,marginBottom:10}}>
                    {['top','center','bottom'].map(pos => (
                      <button key={pos} onClick={()=>setDraft(d=>({...d,cover:{...d.cover,position:pos}}))}
                        style={{padding:'4px',fontFamily:'var(--font-mono)',fontSize:'0.68rem',cursor:'pointer',border:'none',borderRadius:2,background:draft.cover?.position===pos?'var(--red)':'var(--gray)',color:draft.cover?.position===pos?'var(--black)':'var(--muted)'}}>
                        {pos==='top'?'CIMA':pos==='center'?'CENTRO':'BAIXO'}
                      </button>
                    ))}
                  </div>

                  {/* Preview CARD (16:9) */}
                  <div className="mono" style={{fontSize:'0.65rem',color:'var(--muted)',marginBottom:4}}>CARD (16:9)</div>
                  <div style={{aspectRatio:'16/9',overflow:'hidden',position:'relative',marginBottom:8,border:'1px solid var(--line)'}}>
                    <img src={draft.cover.url} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`center ${draft.cover?.position||'top'}`,display:'block'}} />
                  </div>

                  {/* Preview PAGINA DO POST (com blur) */}
                  <div className="mono" style={{fontSize:'0.65rem',color:'var(--muted)',marginBottom:4}}>PAGINA DO POST</div>
                  <div style={{aspectRatio:'21/9',overflow:'hidden',position:'relative',border:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--black)'}}>
                    <img aria-hidden="true" src={draft.cover.url} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(20px) brightness(0.35)',transform:'scale(1.1)',zIndex:0}} />
                    <img src={draft.cover.url} style={{position:'relative',zIndex:1,maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:'block'}} />
                  </div>
                </div>
                <button className="logout" style={{width:'100%',marginBottom:8}} onClick={()=>setDraft(d=>({...d,cover:{...d.cover,url:''}}))}>REMOVER IMAGEM</button>
              </>
            )}
            <input className="input" style={{width:"100%"}} placeholder="LEGENDA DA CAPA" value={draft.cover.label} onChange={e=>setDraft({...draft,cover:{...draft.cover,label:e.target.value}})} />
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
  const pending  = all.filter(c => c.status === "pending");
  const approved = all.filter(c => c.status === "approved");
  const flagged  = all.filter(c => c.status === "flagged");
  const [tab, setTab] = React.useState("pending");
  const list = tab === "pending" ? pending : tab === "approved" ? approved : flagged;

  const CommentRow = ({ c, showFlagInfo = false }) => (
    <div style={{padding:"20px 24px",borderBottom:"1px solid var(--line)",display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"start",
      background: showFlagInfo ? 'rgba(225,6,0,0.04)' : 'transparent'}}>
      <div>
        <div className="comment-head" style={{marginBottom:8,flexWrap:'wrap',gap:'0.5rem'}}>
          <b>{c.name}</b>
          <span className="mono" style={{color:'var(--muted)',fontSize:'0.78rem'}}>{c.email}</span>
          <span className="mono" style={{color:'var(--muted)',fontSize:'0.78rem'}}>{c.date}</span>
          <span className="mono" style={{fontSize:'0.78rem'}}>post <b style={{color:"var(--red)"}}>{c.postId.toUpperCase()}</b></span>
        </div>
        <div className="comment-text" style={{fontStyle: showFlagInfo ? 'italic' : 'normal'}}>{c.text}</div>
        {showFlagInfo && c.flaggedTerms && (
          <div style={{marginTop:8,padding:'6px 10px',background:'rgba(225,6,0,0.12)',border:'1px solid rgba(225,6,0,0.3)',borderRadius:4}}>
            <span className="mono" style={{fontSize:'0.72rem',color:'var(--red)'}}>
              TERMOS DETECTADOS: {c.flaggedTerms.join(', ')}
            </span>
            {c.flaggedAt && (
              <span className="mono" style={{fontSize:'0.68rem',color:'var(--muted)',marginLeft:12}}>
                bloqueado em {new Date(c.flaggedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="row-actions" style={{flexDirection:'column',gap:4}}>
        {c.status === "pending" && (
          <button className="icon-btn" title="Aprovar" onClick={()=>onModerate(c.postId,c.idx,"approved")} style={{borderColor:"#22c55e",color:"#22c55e"}}>&#10003;</button>
        )}
        <button className="icon-btn danger" title="Deletar" onClick={()=>onModerate(c.postId,c.idx,"deleted")}>&#10005;</button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// MODERAÇÃO</div>
          <h1>Comentários</h1>
        </div>
        <div className="tag-chips">
          <button className={"chip " + (tab === "pending"  ? "active" : "")} onClick={()=>setTab("pending")}>Pendentes · {pending.length}</button>
          <button className={"chip " + (tab === "approved" ? "active" : "")} onClick={()=>setTab("approved")}>Aprovados · {approved.length}</button>
          <button className={"chip " + (tab === "flagged"  ? "active" : "")} onClick={()=>setTab("flagged")}
            style={{borderColor: flagged.length ? 'var(--red)' : '', color: flagged.length ? 'var(--red)' : ''}}>
            Bloqueados · {flagged.length}
          </button>
        </div>
      </div>

      {tab === "flagged" && flagged.length > 0 && (
        <div style={{padding:'0.75rem 1.5rem',background:'rgba(225,6,0,0.08)',border:'1px solid rgba(225,6,0,0.25)',fontFamily:'var(--font-mono)',fontSize:'0.8rem',color:'var(--red)',marginBottom:16}}>
          Os comentarios abaixo foram bloqueados automaticamente por conterem termos ofensivos.
          Informacoes completas disponíveis para denuncias. O admin pode deletar definitivamente.
        </div>
      )}

      <div className="admin-table">
        {list.length === 0 && (
          <div style={{padding:40,textAlign:"center",color:"var(--muted)"}} className="mono">
            // NENHUM COMENTÁRIO {tab === "pending" ? "PENDENTE" : tab === "approved" ? "APROVADO" : "BLOQUEADO"}
          </div>
        )}
        {list.map((c) => (
          <CommentRow key={c.postId+"-"+c.idx} c={c} showFlagInfo={tab === "flagged"} />
        ))}
      </div>
    </div>
  );
}

// ---------- MEDIA ----------
// ---------- GALERIA ----------
function AdminGaleria() {
  const EMPTY = { url: '', label: '', size: '', type: 'photo' };
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(EMPTY);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImg(file); setForm(f => ({ ...f, url })); }
    catch (err) { alert('Erro: ' + err.message); }
    setUploading(false); e.target.value = '';
  };

  const addItem = async () => {
    if (!form.url) return;
    setSaving(true);
    await addDoc(collection(db, 'gallery'), { ...form, order: items.length, createdAt: serverTimestamp() });
    setForm(EMPTY); setSaving(false);
    setMsg('Item adicionado!'); setTimeout(() => setMsg(''), 3000);
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Remover esta foto?')) return;
    await deleteDoc(doc(db, 'gallery', id));
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="admin-head">
        <div><div className="kicker">// FOTOS E VIDEOS</div><h1>Galeria</h1></div>
      </div>
      {msg && <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* GRID DE FOTOS */}
        <div>
          {items.length === 0 && <div style={{ border: '1px dashed var(--gray)', padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Nenhuma foto ainda. Adicione ao lado.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {items.map(g => (
              <div key={g.id} style={{ position: 'relative', aspectRatio: '4/3', background: 'var(--panel)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                {g.url ? <img src={g.url} alt={g.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Placeholder label={g.label} />}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--off-white)', textAlign: 'center', padding: '0 8px' }}>{g.label}</div>
                  <button className="icon-btn danger" onClick={() => deleteItem(g.id)}>&#10005;</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="editor-side">
          <div className="box">
            <h4>ADICIONAR FOTO</h4>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
            <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed var(--gray)', cursor: 'pointer', marginBottom: 10, overflow: 'hidden', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading ? <span className="mono" style={{ fontSize: '0.8rem' }}>Enviando...</span>
                : form.url ? <img src={form.url} alt="" style={{ width: '100%', maxHeight: 140, objectFit: 'cover' }} />
                : <div style={{ padding: 20, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--muted)' }}>Clique para subir imagem</div>}
            </div>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>OU URL EXTERNA</div>
            <input className="input" placeholder="https://..." value={form.url} onChange={e => setF('url', e.target.value)} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 8, width: '100%' }} />
            <input className="input" placeholder="Legenda (ex: EPIFANIA 2024)" value={form.label} onChange={e => setF('label', e.target.value)} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 8, width: '100%' }} />
            <select className="input" value={form.size} onChange={e => setF('size', e.target.value)} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 4, width: '100%' }}>
              <option value="">Normal</option>
              <option value="wide">Largo (2 colunas)</option>
              <option value="tall">Alto (2 linhas)</option>
              <option value="wide tall">Destaque (largo + alto)</option>
            </select>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>
              {!form.size && 'Tamanho ideal: 800 × 600px (proporcao 4:3)'}
              {form.size === 'wide' && 'Tamanho ideal: 1200 × 600px (proporcao 2:1 — paisagem)'}
              {form.size === 'tall' && 'Tamanho ideal: 600 × 1200px (proporcao 1:2 — retrato/poster)'}
              {form.size === 'wide tall' && 'Tamanho ideal: 1200 × 1200px (proporcao 1:1 — quadrado destaque)'}
            </div>
            <Btn variant="red" arrow onClick={addItem} disabled={saving || !form.url} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'SALVANDO...' : 'ADICIONAR'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- TIMELINE ----------
function AdminTimeline() {
  const EMPTY = { year: '', title: '', body: '', tags: '', imageUrl: '' };
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(EMPTY);
  const [editId, setEditId] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const q = query(collection(db, 'timeline'), orderBy('year', 'asc'));
    return onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (docs.length > 0) {
        setItems(docs);
      } else {
        // Firestore vazio: exibe dados base do site como referencia
        const seed = (window.TIMELINE || []).map((t, i) => ({ ...t, id: 'seed-' + i, _isSeed: true }));
        setItems([...seed].sort((a, b) => b.year - a.year));
      }
    });
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImg(file); setForm(f => ({ ...f, imageUrl: url })); }
    catch (err) { alert('Erro: ' + err.message); }
    setUploading(false); e.target.value = '';
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveItem = async () => {
    if (!form.year || !form.title) return;
    setSaving(true);
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], order: parseInt(form.year) || 0 };
    if (editId) await updateDoc(doc(db, 'timeline', editId), data);
    else await addDoc(collection(db, 'timeline'), { ...data, createdAt: serverTimestamp() });
    setForm(EMPTY); setEditId(null); setSaving(false);
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setForm({ year: item.year || '', title: item.title || '', body: item.body || '', tags: (item.tags || []).join(', '), imageUrl: item.imageUrl || '' });
  };

  const deleteItem = async (id) => {
    if (window.confirm('Remover este item da timeline?')) await deleteDoc(doc(db, 'timeline', id));
  };

  return (
    <div>
      <div className="admin-head">
        <div><div className="kicker">// HISTORIA DO COLETIVO</div><h1>Timeline</h1></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* LISTA */}
        <div>
          {items.length === 0 && <div style={{ border: '1px dashed var(--gray)', padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Nenhum item. Adicione ao lado.</div>}
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 16, padding: '1rem', background: 'var(--panel)', border: `1px solid ${item._isSeed ? 'rgba(255,255,255,0.05)' : 'var(--line)'}`, marginBottom: 8, alignItems: 'flex-start', opacity: item._isSeed ? 0.6 : 1 }}>
              {item.imageUrl && <img src={item.imageUrl} alt="" style={{ width: 80, height: 60, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--gray)' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', fontSize: 20 }}>{item.year}</span>
                  {item._isSeed && <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', border: '1px solid var(--gray)', padding: '1px 5px' }}>DADO BASE</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 4 }}>{item.title}</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{(item.body || '').slice(0, 80)}</div>
              </div>
              {!item._isSeed && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="icon-btn" onClick={() => startEdit(item)}>&#9998;</button>
                  <button className="icon-btn danger" onClick={() => deleteItem(item.id)}>&#10005;</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="editor-side">
          <div className="box">
            <h4>{editId ? 'EDITAR ITEM' : 'NOVO ITEM'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="input" placeholder="ANO (ex: 2024)" value={form.year} onChange={e => setF('year', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }} />
              <input className="input" placeholder="TITULO DO EVENTO" value={form.title} onChange={e => setF('title', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase' }} />
              <textarea className="input textarea" placeholder="Descricao do acontecimento..." value={form.body} onChange={e => setF('body', e.target.value)} style={{ padding: '0.5rem', minHeight: 90, fontFamily: 'var(--font-body)', fontSize: '0.85rem' }} />
              <input className="input" placeholder="Tags separadas por virgula" value={form.tags} onChange={e => setF('tags', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
              <div>
                <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 4 }}>IMAGEM (OPCIONAL)</div>
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                <div onClick={() => imgRef.current?.click()} style={{ border: '1px dashed var(--gray)', cursor: 'pointer', overflow: 'hidden', minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                  {uploading ? <span className="mono" style={{ fontSize: '0.8rem' }}>Enviando...</span>
                    : form.imageUrl ? <img src={form.imageUrl} alt="" style={{ width: '100%', maxHeight: 100, objectFit: 'cover' }} />
                    : <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Upload imagem</span>}
                </div>
                <input className="input" placeholder="Ou URL da imagem" value={form.imageUrl} onChange={e => setF('imageUrl', e.target.value)} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="red" arrow onClick={saveItem} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'SALVANDO...' : editId ? 'ATUALIZAR' : 'ADICIONAR'}</Btn>
                {editId && <button className="logout" onClick={() => { setEditId(null); setForm(EMPTY); }}>CANCELAR</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- LOJA ----------
function AdminLoja() {
  const EMPTY = { name: '', description: '', price: '', imageUrl: '', link: '', active: true };
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(EMPTY);
  const [editId, setEditId] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    return onSnapshot(q, snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImg(file); setForm(f => ({ ...f, imageUrl: url })); }
    catch (err) { alert('Erro: ' + err.message); }
    setUploading(false); e.target.value = '';
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveItem = async () => {
    if (!form.name) return;
    setSaving(true);
    if (editId) await updateDoc(doc(db, 'products', editId), form);
    else await addDoc(collection(db, 'products'), { ...form, order: items.length, createdAt: serverTimestamp() });
    setForm(EMPTY); setEditId(null); setSaving(false);
  };

  const startEdit = (item) => { setEditId(item.id); setForm({ name: item.name || '', description: item.description || '', price: item.price || '', imageUrl: item.imageUrl || '', link: item.link || '', active: item.active !== false }); };

  const deleteItem = async (id) => {
    if (window.confirm('Remover produto?')) await deleteDoc(doc(db, 'products', id));
  };

  const toggleActive = async (item) => {
    await updateDoc(doc(db, 'products', item.id), { active: !item.active });
  };

  return (
    <div>
      <div className="admin-head">
        <div><div className="kicker">// PRODUTOS DO COLETIVO</div><h1>Loja</h1></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* LISTA */}
        <div>
          {items.length === 0 && <div style={{ border: '1px dashed var(--gray)', padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>Nenhum produto. Adicione ao lado.</div>}
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', gap: 14, padding: '1rem', background: 'var(--panel)', border: `1px solid ${item.active !== false ? 'var(--line)' : 'rgba(225,6,0,0.3)'}`, marginBottom: 8, alignItems: 'center', opacity: item.active === false ? 0.6 : 1 }}>
              <div style={{ width: 70, height: 70, flexShrink: 0, background: 'var(--gray)', overflow: 'hidden' }}>
                {item.imageUrl ? <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted)' }}>SEM FOTO</div>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginBottom: 2 }}>{item.name}</div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 2 }}>{item.description}</div>
                <div style={{ fontFamily: 'var(--font-display)', color: 'var(--red)', fontSize: 18 }}>{item.price}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexDirection: 'column' }}>
                <button className="icon-btn" onClick={() => startEdit(item)}>&#9998;</button>
                <button className="icon-btn" onClick={() => toggleActive(item)} title={item.active !== false ? 'Ocultar' : 'Exibir'} style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>{item.active !== false ? 'ON' : 'OFF'}</button>
                <button className="icon-btn danger" onClick={() => deleteItem(item.id)}>&#10005;</button>
              </div>
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="editor-side">
          <div className="box">
            <h4>{editId ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
              <div onClick={() => imgRef.current?.click()} style={{ border: '1px dashed var(--gray)', cursor: 'pointer', overflow: 'hidden', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {uploading ? <span className="mono" style={{ fontSize: '0.8rem' }}>Enviando...</span>
                  : form.imageUrl ? <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Foto do produto</span>}
              </div>
              <input className="input" placeholder="URL da imagem" value={form.imageUrl} onChange={e => setF('imageUrl', e.target.value)} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }} />
              <input className="input" placeholder="Nome do produto" value={form.name} onChange={e => setF('name', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase' }} />
              <input className="input" placeholder="Variacao (ex: Preta · M)" value={form.description} onChange={e => setF('description', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              <input className="input" placeholder="Preco (ex: R$ 65)" value={form.price} onChange={e => setF('price', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1rem' }} />
              <input className="input" placeholder="Link externo (loja, WhatsApp...)" value={form.link} onChange={e => setF('link', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="red" arrow onClick={saveItem} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'SALVANDO...' : editId ? 'ATUALIZAR' : 'ADICIONAR'}</Btn>
                {editId && <button className="logout" onClick={() => { setEditId(null); setForm(EMPTY); }}>CANCELAR</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- USERS / SETTINGS ----------
const MASTER_ADMIN_UID = 'ZtQlNzTDa1S9AsuNppbtNfpbVdI3';

function ProfileEditor({ user, users }) {
  const myDoc = users.find(u => u.email === user?.email) || {};
  const [form, setForm] = React.useState({ displayName: '', bio: '', phone: '', photoUrl: '' });
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const imgRef = React.useRef(null);

  React.useEffect(() => {
    if (myDoc.email) setForm({ displayName: myDoc.displayName || user?.name || '', bio: myDoc.bio || '', phone: myDoc.phone || '', photoUrl: myDoc.photoUrl || '' });
  }, [myDoc.email]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImg(file); setForm(f => ({ ...f, photoUrl: url })); }
    catch (err) { alert('Erro: ' + err.message); }
    setUploading(false); e.target.value = '';
  };

  const save = async () => {
    if (!user?.uid) return;
    setSaving(true);
    // setDoc com merge:true cria o documento se nao existir, atualiza se existir
    await setDoc(doc(db, 'users', user.uid), { ...form, updatedAt: serverTimestamp() }, { merge: true });
    setSaving(false); setEditing(false);
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="box">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h4>// SEU PERFIL</h4>
        {!editing && <button className="logout" style={{ padding: '4px 10px' }} onClick={() => setEditing(true)}>EDITAR</button>}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--red)', flexShrink: 0, cursor: 'pointer' }} onClick={() => imgRef.current?.click()}>
              {form.photoUrl
                ? <img src={form.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray)', fontFamily: 'var(--font-display)', fontSize: 22 }}>{(form.displayName || '?')[0]}</div>
              }
            </div>
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {uploading ? 'Enviando...' : 'Clique na foto para trocar'}
            </div>
          </div>
          <input className="input" placeholder="Nome de exibicao" value={form.displayName} onChange={e => setF('displayName', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
          <input className="input" placeholder="Funcao (ex: MC · Artista)" value={form.bio} onChange={e => setF('bio', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
          <input className="input" placeholder="Telefone / WhatsApp" value={form.phone} onChange={e => setF('phone', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }} />
          <input className="input" placeholder="URL da foto (ou use o upload acima)" value={form.photoUrl} onChange={e => setF('photoUrl', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="red" arrow onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'SALVANDO...' : 'SALVAR'}</Btn>
            <button className="logout" onClick={() => setEditing(false)}>CANCELAR</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gray)', flexShrink: 0 }}>
              {(myDoc.photoUrl || form.photoUrl)
                ? <img src={myDoc.photoUrl || form.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--panel)', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--red)' }}>{(user?.name || '?')[0].toUpperCase()}</div>
              }
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{myDoc.displayName || user?.name}</div>
              {myDoc.bio && <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 2 }}>{myDoc.bio}</div>}
              <div className="mono" style={{ color: 'var(--red)', marginTop: 4, fontSize: '0.78rem' }}>{(user?.role || 'USUARIO').toUpperCase()}</div>
              <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.68rem', marginTop: 2 }}>{user?.email}</div>
              {myDoc.phone && <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.68rem', marginTop: 2 }}>{myDoc.phone}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const ROLES = ['user', 'admin', 'admin_master'];
const ROLE_LABELS = { user: 'USUARIO', admin: 'ADMIN', admin_master: 'ADMIN MASTER' };

function AdminSettings({ user }) {
  const [users, setUsers] = React.useState([]);
  const [editingUid, setEditingUid] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const isMaster = user?.uid === MASTER_ADMIN_UID;

  React.useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('lastLogin', 'desc'));
    return onSnapshot(q, snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))));
  }, []);

  const saveUser = async (uid) => {
    await updateDoc(doc(db, 'users', uid), editForm);
    setEditingUid(null);
  };

  const toggleActive = async (u) => {
    if (!isMaster || u.uid === MASTER_ADMIN_UID) return;
    await updateDoc(doc(db, 'users', u.uid), { active: !u.active });
  };

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// EQUIPE</div>
          <h1>Usuarios & Ajustes</h1>
        </div>
        {isMaster && (
          <div className="mono" style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
            Voce e o Admin Master — pode definir funcoes e status de todos os membros.
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div className="admin-table">
          <div className="admin-table-head" style={{ gridTemplateColumns: '1.5fr 1.2fr 1fr 90px 80px' }}>
            <span>NOME</span><span>E-MAIL</span><span>FUNCAO</span><span>STATUS</span><span>ACOES</span>
          </div>
          {users.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
              Nenhum usuario ainda. Os usuarios aparecem aqui apos o primeiro login.
            </div>
          )}
          {users.map(u => (
            <div key={u.uid}>
              {editingUid === u.uid ? (
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(225,6,0,0.04)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input className="input" placeholder="Nome" value={editForm.displayName || ''} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
                    <input className="input" placeholder="URL da foto (imgbb)" value={editForm.photoUrl || ''} onChange={e => setEditForm(f => ({ ...f, photoUrl: e.target.value }))} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
                  </div>
                  {u.uid !== MASTER_ADMIN_UID && (
                    <select className="input" value={editForm.role || 'editor'} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={{ padding: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 8, width: '100%' }}>
                      {ROLES.filter(r => r !== 'admin_master').map(r => <option key={r} value={r}>{ROLE_LABELS[r] || r.toUpperCase()}</option>)}
                    </select>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="red" arrow onClick={() => saveUser(u.uid)}>SALVAR</Btn>
                    <button className="logout" onClick={() => setEditingUid(null)}>CANCELAR</button>
                  </div>
                </div>
              ) : (
                <div className="admin-table-row" style={{ gridTemplateColumns: '1.5fr 1.2fr 1fr 90px 80px' }}>
                  <div className="title-cell">
                    <div className="comment-avatar" style={{ width: 36, height: 36, fontSize: 14, overflow: 'hidden', padding: 0 }}>
                      {u.photoUrl
                        ? <img src={u.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (u.displayName || u.email || '?')[0].toUpperCase()
                      }
                    </div>
                    <div>
                      {u.displayName || u.email?.split('@')[0]}
                      {u.uid === MASTER_ADMIN_UID && <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--red)', marginLeft: 6 }}>MASTER</span>}
                    </div>
                  </div>
                  <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{u.email}</span>
                  <span className="mono" style={{ color: 'var(--red)', fontSize: '0.78rem' }}>{ROLE_LABELS[u.role] || 'USUARIO'}</span>
                  <span className={'status-pill ' + (u.active !== false ? 'published' : 'draft')}>{u.active !== false ? 'ATIVO' : 'INATIVO'}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {isMaster && u.uid !== MASTER_ADMIN_UID && (
                      <>
                        <button className="icon-btn" onClick={() => { setEditingUid(u.uid); setEditForm({ displayName: u.displayName, role: u.role || 'editor', photoUrl: u.photoUrl || '' }); }} title="Editar">&#9998;</button>
                        <button className="icon-btn" onClick={() => toggleActive(u)} title={u.active !== false ? 'Desativar' : 'Ativar'}
                          style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: u.active !== false ? '#22c55e' : 'var(--muted)' }}>
                          {u.active !== false ? 'ON' : 'OFF'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="editor-side">
          <ProfileEditor user={user} users={users} />
          <div className="box">
            <h4>// SITE</h4>
            <div className="mono" style={{ lineHeight: 1.7, color: 'var(--paper)' }}>
              VERSAO · v1.0<br/>
              MEMBROS · {users.length}
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
              Novos membros: peca para se cadastrarem na tela de login do admin clicando em "Criar conta".
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- ADMIN SHELL ----------
// Lista de fontes Google Fonts — fallback quando não há API key configurada
const GOOGLE_FONTS_LIST = [
  // DISPLAY / IMPACT
  'Anton','Bebas Neue','Oswald','Barlow Condensed','Black Han Sans','Fjalla One',
  'Righteous','Russo One','Teko','Lilita One','Fredoka One','Lobster','Pacifico',
  'Alfa Slab One','Black Ops One','Permanent Marker','Bangers','Audiowide','Tourney',
  'Syncopate','Gugi','Monoton','Faster One','Rajdhani','Exo 2','Prosto One',
  'Syne','Bungee','Bungee Inline','Bungee Shade','Graduate','Squada One',
  'Saira Condensed','Chakra Petch','Orbitron','Nova Square','Michroma',
  // SANS-SERIF
  'Inter','Roboto','Open Sans','Lato','Poppins','Nunito','Raleway','Ubuntu',
  'Montserrat','Source Sans 3','PT Sans','Cabin','Mulish','Rubik','Karla','Jost',
  'DM Sans','Plus Jakarta Sans','Outfit','Sora','Manrope','Figtree',
  'Be Vietnam Pro','Lexend','Barlow','Nunito Sans','Hind','Overpass','Noto Sans',
  'Fira Sans','IBM Plex Sans','Work Sans','Asap','Libre Franklin','Maven Pro',
  'Dosis','Josefin Sans','Quicksand','Titillium Web','Varela Round','Exo',
  'Questrial','Encode Sans','Kanit','Oxanium','Space Grotesk','Yanone Kaffeesatz',
  'Arimo','Archivo','Albert Sans','Instrument Sans','Bricolage Grotesque',
  'Geist','Geist Mono','Onest','Urbanist','Wix Madefor Display','Anta',
  // SERIF
  'Merriweather','Playfair Display','Lora','PT Serif','Libre Baskerville',
  'Cormorant Garamond','EB Garamond','Crimson Text','Alegreya','Cardo',
  'Spectral','Bitter','Domine','Neuton','Zilla Slab','Noto Serif',
  'IBM Plex Serif','Source Serif 4','Frank Ruhl Libre','Volkhov','Tinos',
  'DM Serif Display','Playfair Display SC','Cormorant','Fraunces',
  'Young Serif','Instrument Serif',
  // MONO
  'JetBrains Mono','Fira Code','Source Code Pro','IBM Plex Mono','Roboto Mono',
  'Inconsolata','Space Mono','Anonymous Pro','Courier Prime','Overpass Mono',
  'Share Tech Mono','Nova Mono','Cutive Mono','VT323','Azeret Mono',
  'Chivo Mono','Sono','Fragment Mono','Commit Mono',
  // HANDWRITING
  'Dancing Script','Satisfy','Sacramento','Great Vibes','Kaushan Script',
  'Courgette','Caveat','Indie Flower','Patrick Hand','Shadows Into Light',
  'Architects Daughter','Bad Script','Parisienne','Pinyon Script',
  'Alex Brush','Allura','Italianno','Yellowtail',
  // DECORATIVO
  'Abril Fatface','Playfair Display SC','Cinzel','Cinzel Decorative',
  'Poiret One','Philosopher','Cormorant Upright','Spectral SC',
].sort();

// Seletor de fonte com busca e prévia
function FontPicker({ value, onChange, label, allFonts }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState(value);
  const ref = React.useRef(null);

  React.useEffect(() => { setSearch(value); }, [value]);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = React.useMemo(() =>
    allFonts.filter(f => f.toLowerCase().includes(search.toLowerCase())).slice(0, 40),
  [allFonts, search]);

  const select = (font) => { onChange(font); setSearch(font); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
      <input
        type="text" className="input" value={search} placeholder="Buscar fonte..."
        onChange={e => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter' && filtered.length) select(filtered[0]); if (e.key === 'Escape') setOpen(false); }}
        style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', zIndex: 200, width: '100%', top: '100%',
          background: 'var(--panel)', border: '1px solid var(--gray)',
          maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.6)',
        }}>
          {filtered.map(f => (
            <div key={f} onClick={() => select(f)}
              style={{
                padding: '7px 12px', cursor: 'pointer', fontSize: 14,
                color: f === value ? 'var(--red)' : 'var(--off-white)',
                background: f === value ? 'rgba(225,6,0,0.08)' : 'transparent',
                borderBottom: '1px solid var(--line)',
                fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray)'}
              onMouseLeave={e => e.currentTarget.style.background = f === value ? 'rgba(225,6,0,0.08)' : 'transparent'}
            >{f}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- EDITOR DE TEMA ----------
function AdminThemeEditor({ user }) {
  const DEFAULTS = {
    accent: '#E10600', background: '#0A0A0A', offWhite: '#F4F8EB',
    panel: '#1A1A1A', gray: '#2A2A2A', muted: '#888888', paper: '#E5E0D8',
    textBody: '#bbbbbb', heroLogoUrl: '',
    navLogoUrl: 'https://i.ibb.co/nM8qGYxn/images-removebg-preview.png',
    fontDisplay: 'Anton', fontBody: 'Space Grotesk', fontMono: 'JetBrains Mono',
  };
  const [allFonts, setAllFonts] = React.useState(GOOGLE_FONTS_LIST);

  const [theme, setTheme] = React.useState(DEFAULTS);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState({ text: '', ok: true });

  // Carrega tema atual do Firestore em tempo real
  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'theme'), (snap) => {
      if (snap.exists()) setTheme(t => ({ ...DEFAULTS, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  // Busca lista completa do Google Fonts API se VITE_GOOGLE_FONTS_KEY estiver definida
  React.useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_FONTS_KEY;
    if (!key) return;
    fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${key}&sort=popularity`)
      .then(r => r.json())
      .then(data => { if (data.items) setAllFonts(data.items.map(f => f.family)); })
      .catch(() => {});
  }, []);

  // Carrega fontes no Google Fonts para a prévia
  React.useEffect(() => {
    [theme.fontDisplay, theme.fontBody, theme.fontMono].forEach(name => {
      if (!name) return;
      const id = `gfont-${name.replace(/\s+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [theme.fontDisplay, theme.fontBody, theme.fontMono]);

  const set = (k, v) => setTheme(prev => ({ ...prev, [k]: v }));

  const notify = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'theme'), {
        ...theme,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email || 'admin',
      });
      notify('Tema salvo! Todos os usuários já estão vendo as mudanças.');
    } catch (e) {
      notify('Erro ao salvar: ' + e.message, false);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!window.confirm('Restaurar o tema padrão do sistema?')) return;
    setTheme(DEFAULTS);
    await setDoc(doc(db, 'config', 'theme'), {
      ...DEFAULTS, updatedAt: serverTimestamp(), updatedBy: user?.email || 'admin',
    });
    notify('Tema padrão restaurado.');
  };

  const colorFields = [
    { key: 'accent',     label: 'Cor de Destaque',       desc: '--red'        },
    { key: 'background', label: 'Fundo Principal',        desc: '--black'      },
    { key: 'offWhite',   label: 'Texto Principal',        desc: '--off-white'  },
    { key: 'textBody',   label: 'Texto de Parágrafos',    desc: '--text-body'  },
    { key: 'panel',      label: 'Cards e Painéis',        desc: '--panel'      },
    { key: 'gray',       label: 'Bordas e Cinza',         desc: '--gray'       },
    { key: 'muted',      label: 'Texto Secundário/Tags',  desc: '--muted'      },
    { key: 'paper',      label: 'Fundo Claro',            desc: '--paper'      },
  ];

  const fontFields = [
    { key: 'fontDisplay', label: 'FONTE DE TÍTULOS' },
    { key: 'fontBody',    label: 'FONTE DE TEXTOS'  },
    { key: 'fontMono',    label: 'FONTE MONO/TAGS'  },
  ];

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// APARÊNCIA DO SISTEMA</div>
          <h1>Tema</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="logout" onClick={handleReset}>RESTAURAR PADRÃO</button>
          <Btn variant="red" arrow onClick={handleSave} disabled={saving}>
            {saving ? 'SALVANDO...' : 'SALVAR E APLICAR'}
          </Btn>
        </div>
      </div>

      {msg.text && (
        <div style={{
          background: msg.ok ? 'rgba(34,197,94,0.08)' : 'rgba(225,6,0,0.08)',
          border: `1px solid ${msg.ok ? 'rgba(34,197,94,0.3)' : 'rgba(225,6,0,0.3)'}`,
          color: msg.ok ? '#22c55e' : 'var(--red)',
          padding: '1rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: 24,
        }}>
          {msg.ok ? '✓' : '✕'} {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* PALETA DE CORES */}
        <div className="editor-side">
          <div className="box">
            <h4>PALETA DE CORES</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {colorFields.map(({ key, label, desc }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                    <div style={{ width: 44, height: 44, background: theme[key], border: '1px solid var(--line)', borderRadius: 4 }} />
                    <input type="color" value={theme[key]} onChange={e => set(key, e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--off-white)' }}>{label}</span>
                      <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{desc}</span>
                    </div>
                    <input type="text" className="input" value={theme[key]} onChange={e => set(key, e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* TIPOGRAFIA */}
          <div className="editor-side">
            <div className="box">
              <h4>TIPOGRAFIA</h4>
              {/* Imagem do hero */}
              <div style={{ marginBottom: 16 }}>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>IMAGEM DO HERO (substitui o logo SVG)</div>
                <input type="text" className="input" placeholder="URL da imagem (imgbb, etc.)" value={theme.heroLogoUrl || ''} onChange={e => set('heroLogoUrl', e.target.value)}
                  style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 6 }} />
                {theme.heroLogoUrl && (
                  <img src={theme.heroLogoUrl} alt="hero preview" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', display: 'block', border: '1px solid var(--line)' }} />
                )}
                {theme.heroLogoUrl && (
                  <button className="logout" style={{ marginTop: 4, width: '100%' }} onClick={() => set('heroLogoUrl', '')}>REMOVER IMAGEM DO HERO</button>
                )}
              </div>

              {/* Logo da navbar */}
              <div style={{ marginBottom: 16 }}>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>LOGO DA NAVBAR</div>
                <input type="text" className="input" placeholder="URL da imagem do logo" value={theme.navLogoUrl || ''} onChange={e => set('navLogoUrl', e.target.value)}
                  style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: 6 }} />
                {theme.navLogoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={theme.navLogoUrl} alt="" style={{ height: 40, objectFit: 'contain' }} />
                    <button className="logout" style={{ flex: 1 }} onClick={() => set('navLogoUrl', '')}>REMOVER</button>
                  </div>
                )}
              </div>

              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 12 }}>
                Digite para buscar entre {allFonts.length}+ fontes Google Fonts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {fontFields.map(({ key, label }) => (
                  <div key={key}>
                    <FontPicker
                      value={theme[key]}
                      onChange={v => set(key, v)}
                      label={label}
                      allFonts={allFonts}
                    />
                    <div style={{
                      marginTop: 6, padding: '8px 12px', background: 'var(--black)', border: '1px solid var(--line)',
                      fontFamily: `'${theme[key]}', sans-serif`, fontSize: 18, color: 'var(--off-white)',
                    }}>
                      Deliricamente
                    </div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 14, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                // Para acessar 1500+ fontes: crie VITE_GOOGLE_FONTS_KEY no .env
              </div>
            </div>
          </div>

          {/* PRÉVIA */}
          <div className="editor-side">
            <div className="box">
              <h4>PRÉVIA EM TEMPO REAL</h4>
              <div style={{ background: theme.background, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontFamily: `'${theme.fontDisplay}', sans-serif`, fontSize: 28, color: theme.accent, textTransform: 'uppercase', lineHeight: 1, marginBottom: 6 }}>
                  Deliricamente
                </div>
                <div style={{ fontFamily: `'${theme.fontDisplay}', sans-serif`, fontSize: 16, color: theme.offWhite, textTransform: 'uppercase', marginBottom: 10 }}>
                  Coletivo Cultural — Caieiras SP
                </div>
                <div style={{ fontFamily: `'${theme.fontBody}', sans-serif`, fontSize: 13, color: theme.muted, marginBottom: 12, lineHeight: 1.6 }}>
                  Texto de exemplo para verificar a aparência da fonte principal em parágrafos do site.
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: theme.accent, color: theme.background, fontFamily: `'${theme.fontMono}', monospace`, fontSize: 11, padding: '3px 8px' }}>EVENTO</span>
                  <span style={{ background: theme.panel, color: theme.offWhite, fontFamily: `'${theme.fontMono}', monospace`, fontSize: 11, padding: '3px 8px', border: `1px solid ${theme.gray}` }}>CARD</span>
                  <span style={{ background: theme.paper, color: theme.background, fontFamily: `'${theme.fontMono}', monospace`, fontSize: 11, padding: '3px 8px' }}>PAPER</span>
                </div>
              </div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>
                // Clique em "Salvar e Aplicar" para propagar a todos os usuários
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ---------- FUNDO ANIMADO ----------
function AdminBackground({ user }) {
  const DEFAULTS = { style: 'blobs', speed: 1, density: 15, opacity: 0.85 };
  const [cfg, setCfg] = React.useState(DEFAULTS);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'background'), snap => {
      if (snap.exists()) setCfg(c => ({ ...DEFAULTS, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  const save = async (updated) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'background'), { ...updated, updatedAt: serverTimestamp(), updatedBy: user?.email });
      setMsg('Salvo! Todos os usuarios viram a mudanca em tempo real.');
    } catch (e) { setMsg('Erro: ' + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(''), 4000);
  };

  const set = (k, v) => setCfg(prev => ({ ...prev, [k]: v }));

  const styles = [
    { id: 'blobs',    label: 'Manchas',    icon: 'O',  desc: 'Circulos flutuantes pulsantes' },
    { id: 'rede',     label: 'Rede',       icon: '+',  desc: 'Particulas conectadas (Linkin Park)' },
    { id: 'geo',      label: 'Geometrico', icon: '^',  desc: 'Formas wireframe rotacionando' },
    { id: 'glitch',   label: 'Glitch',     icon: '#',  desc: 'Corrupcao digital, scanlines, RGB' },
    { id: 'chuva',    label: 'Chuva',      icon: '|',  desc: 'Chuva de caracteres urbanos' },
    { id: 'spray',    label: 'Spray',      icon: '.',  desc: 'Tinta em spray caindo' },
    { id: 'pichacao', label: 'Pichacao',   icon: '/',  desc: 'Identidade do site — tags em movimento' },
    { id: 'off',      label: 'Desligado',  icon: 'X',  desc: 'Fundo solido sem animacao' },
  ];

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// APARENCIA</div>
          <h1>Fundo Animado</h1>
        </div>
        <Btn variant="red" arrow onClick={() => save(cfg)} disabled={saving}>
          {saving ? 'SALVANDO...' : 'SALVAR E APLICAR'}
        </Btn>
      </div>

      {msg && (
        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '1rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: 24 }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="editor-side">
          <div className="box">
            <h4>ESTILO DE ANIMACAO</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
              {styles.map(s => (
                <div key={s.id} onClick={() => set('style', s.id)}
                  style={{ padding: '1rem', border: `1px solid ${cfg.style === s.id ? 'var(--red)' : 'var(--line)'}`, background: cfg.style === s.id ? 'rgba(225,6,0,0.08)' : 'var(--black)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: cfg.style === s.id ? 'var(--red)' : 'var(--off-white)', textTransform: 'uppercase' }}>{s.label}</div>
                  <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: 4 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="editor-side">
            <div className="box">
              <h4>PARAMETROS</h4>
              {[
                { key: 'speed',   label: 'VELOCIDADE',  min: 0.1, max: 3, step: 0.1 },
                { key: 'density', label: 'DENSIDADE',   min: 3,   max: 40, step: 1 },
                { key: 'opacity', label: 'OPACIDADE',   min: 0.1, max: 1,  step: 0.05 },
              ].map(({ key, label, min, max, step }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{label}</span>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--red)' }}>{cfg[key]}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={cfg[key]}
                    onChange={e => set(key, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--red)' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="editor-side">
            <div className="box">
              <h4>SOBRE</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                A animacao usa Canvas 2D e reage automaticamente ao tema de cores definido em
                <em> Tema do Site</em>. Ao salvar, todos os usuarios verao a mudanca instantaneamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- CARROSSEL ----------
function AdminCarousel({ user }) {
  const SLIDE_EMPTY = { imageUrl: '', kicker: '', title: '', subtitle: '', ctaText: '', ctaPage: 'blog' };
  const [cfg, setCfg] = React.useState({ enabled: false, autoPlay: true, interval: 5, slides: [] });
  const [form, setForm] = React.useState(SLIDE_EMPTY);
  const [editIdx, setEditIdx] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadErr, setUploadErr] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const fileRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const key = import.meta.env.VITE_IMGBB_KEY;
    if (!key || key === 'SUA_CHAVE_IMGBB_AQUI') {
      setUploadErr('Adicione sua chave imgbb no arquivo .env (VITE_IMGBB_KEY)');
      e.target.value = '';
      return;
    }
    setUploading(true);
    setUploadErr('');
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('key', key);
      const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || 'Falha no upload');
      setF('imageUrl', json.data.url);
    } catch (err) {
      setUploadErr('Erro: ' + err.message);
    }
    setUploading(false);
    e.target.value = '';
  };

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'carousel'), snap => {
      if (snap.exists()) setCfg(c => ({ ...c, ...snap.data() }));
    });
    return () => unsub();
  }, []);

  const persist = async (updated) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'carousel'), { ...updated, updatedAt: serverTimestamp(), updatedBy: user?.email });
      setMsg('Salvo!');
    } catch (e) { setMsg('Erro: ' + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const toggleEnabled = () => { const next = { ...cfg, enabled: !cfg.enabled }; setCfg(next); persist(next); };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveSlide = () => {
    if (!form.title.trim()) return;
    const slides = editIdx !== null
      ? cfg.slides.map((s, i) => i === editIdx ? { ...form, id: s.id } : s)
      : [...cfg.slides, { ...form, id: Date.now().toString() }];
    const next = { ...cfg, slides };
    setCfg(next); persist(next);
    setForm(SLIDE_EMPTY); setEditIdx(null);
  };

  const deleteSlide = (idx) => {
    if (!window.confirm('Remover este slide?')) return;
    const slides = cfg.slides.filter((_, i) => i !== idx);
    const next = { ...cfg, slides };
    setCfg(next); persist(next);
  };

  const moveSlide = (idx, dir) => {
    const slides = [...cfg.slides];
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    [slides[idx], slides[target]] = [slides[target], slides[idx]];
    const next = { ...cfg, slides };
    setCfg(next); persist(next);
  };

  const startEdit = (idx) => { setEditIdx(idx); setForm({ ...SLIDE_EMPTY, ...cfg.slides[idx] }); };

  const PAGES = ['home', 'blog', 'historia', 'galeria', 'loja', 'contato'];

  return (
    <div>
      <div className="admin-head">
        <div>
          <div className="kicker">// NOVIDADES EM DESTAQUE</div>
          <h1>Carrossel</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.8rem', color: cfg.enabled ? '#22c55e' : 'var(--muted)' }}>
            {cfg.enabled ? 'VISIVEL' : 'OCULTO'}
          </span>
          <button onClick={toggleEnabled}
            style={{ padding: '0.6rem 1.4rem', fontFamily: 'var(--font-display)', fontSize: '1rem', textTransform: 'uppercase', cursor: 'pointer', background: cfg.enabled ? 'rgba(225,6,0,0.1)' : 'var(--red)', color: cfg.enabled ? 'var(--red)' : 'var(--black)', border: `1px solid ${cfg.enabled ? 'var(--red)' : 'transparent'}` }}>
            {cfg.enabled ? 'OCULTAR CARROSSEL' : 'ATIVAR CARROSSEL'}
          </button>
        </div>
      </div>

      {msg && <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', padding: '0.75rem 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: 16 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>

        {/* SLIDES EXISTENTES */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Slides ({cfg.slides.length})</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={cfg.autoPlay !== false} onChange={e => { const next = { ...cfg, autoPlay: e.target.checked }; setCfg(next); persist(next); }} style={{ accentColor: 'var(--red)' }} />
                AUTO-PLAY
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                INTERVALO:
                <input type="number" min="2" max="30" value={cfg.interval || 5}
                  onChange={e => { const next = { ...cfg, interval: parseInt(e.target.value) }; setCfg(next); persist(next); }}
                  style={{ width: 50, background: 'var(--black)', border: '1px solid var(--gray)', color: 'var(--off-white)', padding: '2px 6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
                s
              </div>
            </div>
          </div>

          {cfg.slides.length === 0 && (
            <div style={{ border: '1px dashed var(--gray)', padding: '3rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: '0.85rem' }}>
              Nenhum slide ainda. Adicione o primeiro ao lado.
            </div>
          )}

          {cfg.slides.map((sl, i) => (
            <div key={sl.id || i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '1rem', background: 'var(--panel)', border: '1px solid var(--line)', marginBottom: 8 }}>
              {sl.imageUrl && (
                <div style={{ width: 80, height: 55, flexShrink: 0, backgroundImage: `url(${sl.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--gray)' }} />
              )}
              {!sl.imageUrl && (
                <div style={{ width: 80, height: 55, flexShrink: 0, background: 'var(--gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>SEM IMG</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                {sl.kicker && <div className="kicker" style={{ marginBottom: 2 }}>{sl.kicker}</div>}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, textTransform: 'uppercase', color: 'var(--off-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sl.title}</div>
                {sl.ctaText && <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>CTA: {sl.ctaText} → {sl.ctaPage}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="icon-btn" onClick={() => moveSlide(i, -1)} disabled={i === 0} title="Mover para cima">&#8679;</button>
                  <button className="icon-btn" onClick={() => moveSlide(i, 1)} disabled={i === cfg.slides.length - 1} title="Mover para baixo">&#8681;</button>
                  <button className="icon-btn" onClick={() => startEdit(i)} title="Editar">&#9998;</button>
                  <button className="icon-btn danger" onClick={() => deleteSlide(i)} title="Deletar">&#10005;</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="editor-side">
          <div className="box">
            <h4>{editIdx !== null ? 'EDITAR SLIDE' : 'NOVO SLIDE'}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>IMAGEM DO SLIDE</div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: '1px dashed var(--gray)', padding: '0.75rem 1rem', cursor: 'pointer', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: uploading ? 'var(--red)' : 'var(--muted)', transition: 'all 0.2s', marginBottom: 6 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray)'}>
                  {uploading ? 'Enviando para imgbb...' : 'Clique para fazer upload da maquina'}
                </div>
                {uploadErr && <div className="mono" style={{ color: 'var(--red)', fontSize: '0.72rem', marginBottom: 6 }}>{uploadErr}</div>}
                {form.imageUrl && (
                  <div style={{ width: '100%', height: 80, backgroundImage: 'url(' + form.imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--gray)', marginBottom: 6 }} />
                )}
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>OU cole uma URL (imgbb, imgur, etc.)</div>
                <input className="input" placeholder="https://i.ibb.co/..." value={form.imageUrl} onChange={e => setF('imageUrl', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>KICKER (opcional)</div>
                <input className="input" placeholder="// NOVIDADE" value={form.kicker} onChange={e => setF('kicker', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>TITULO *</div>
                <input className="input" placeholder="Titulo do slide" value={form.title} onChange={e => setF('title', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.1rem', textTransform: 'uppercase' }} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>SUBTITULO (opcional)</div>
                <textarea className="input textarea" placeholder="Descricao breve..." value={form.subtitle} onChange={e => setF('subtitle', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.85rem', minHeight: 70 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>TEXTO DO BOTAO</div>
                  <input className="input" placeholder="Ver mais" value={form.ctaText} onChange={e => setF('ctaText', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>DESTINO</div>
                  <select className="input" value={form.ctaPage} onChange={e => setF('ctaPage', e.target.value)} style={{ padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                    {PAGES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Btn variant="red" arrow onClick={saveSlide} style={{ flex: 1, justifyContent: 'center' }}>
                  {editIdx !== null ? 'ATUALIZAR' : 'ADICIONAR SLIDE'}
                </Btn>
                {editIdx !== null && (
                  <button className="logout" onClick={() => { setEditIdx(null); setForm(SLIDE_EMPTY); }}>CANCELAR</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminShell({ user, onLogout, goPublic, posts, setPosts, comments, setComments }) {
  const [section, setSection] = React.useState("dashboard");
  const [editingId, setEditingId] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const moderate = async (postId, idx, status) => {
    const commentList = comments[postId] || [];
    const comment = commentList[idx];
    if (comment?.id) {
      // Comentario no Firestore — atualiza via API
      try {
        if (status === 'deleted') await deleteDoc(doc(db, 'comments', comment.id));
        else await updateDoc(doc(db, 'comments', comment.id), { status });
        return;
      } catch (e) { console.warn('moderate error:', e.message); }
    }
    // Fallback localStorage
    setComments(prev => {
      const next = { ...prev };
      const list = [...(next[postId] || [])];
      if (status === 'deleted') list.splice(idx, 1);
      else list[idx] = { ...list[idx], status };
      next[postId] = list;
      return next;
    });
  };

  // CRUD de posts — grava no Firestore (aparece em todos os dispositivos)
  const savePost = async (post) => {
    try {
      await setDoc(doc(db, 'posts', post.id), { ...post, updatedAt: serverTimestamp() });
    } catch (e) {
      // fallback localStorage
      setPosts(prev => {
        const exists = prev.find(p => p.id === post.id);
        if (exists) return prev.map(p => p.id === post.id ? post : p);
        return [post, ...prev];
      });
    }
    setEditingId(null); setSection("posts");
  };

  const deletePost = async (id) => {
    if (window.confirm("Deletar este post? Essa acao nao pode ser desfeita.")) {
      try {
        await deleteDoc(doc(db, 'posts', id));
      } catch (e) {
        setPosts(prev => prev.filter(p => p.id !== id));
      }
    }
  };

  const updatePostCover = async (id, url) => {
    const post = posts.find(p => p.id === id);
    const newCover = { ...(post?.cover || {}), url };
    try {
      await updateDoc(doc(db, 'posts', id), { cover: newCover });
    } catch (e) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, cover: newCover } : p));
    }
  };

  const toggleStatus = async (id) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      await updateDoc(doc(db, 'posts', id), { status: newStatus });
    } catch (e) {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  let content;
  if (section === "dashboard") content = <AdminDashboard posts={posts} comments={comments} user={user} />;
  else if (section === "posts") content = <AdminPosts posts={posts}
    onEdit={(id)=>{setEditingId(id); setSection("editor");}}
    onNew={()=>{setEditingId(null); setSection("editor");}}
    onDelete={deletePost}
    onToggleStatus={toggleStatus}
    onUpdateCover={updatePostCover}
  />;
  else if (section === "editor") content = <AdminEditor
    post={editingId ? posts.find(p => p.id === editingId) : null}
    onSave={savePost}
    onCancel={()=>{setEditingId(null); setSection("posts");}}
  />;
  else if (section === "comments") content = <AdminComments comments={comments} onModerate={moderate} />;
  else if (section === "media") content = <AdminMedia />;
  else if (section === "settings") content = <AdminSettings user={user} />;
  else if (section === "theme")      content = <AdminThemeEditor user={user} />;
  else if (section === "background") content = <AdminBackground user={user} />;
  else if (section === "carousel")   content = <AdminCarousel user={user} />;
  else if (section === "galeria")    content = <AdminGaleria />;
  else if (section === "timeline")   content = <AdminTimeline />;
  else if (section === "loja")       content = <AdminLoja />;

  const navItems = [
    { id:"dashboard",  label:"Dashboard" },
    { id:"posts",      label:"Posts" },
    { id:"comments",   label:"Comentarios" },
    { id:"galeria",    label:"Galeria" },
    { id:"timeline",   label:"Timeline / Historia" },
    { id:"loja",       label:"Loja / Produtos" },
    { id:"settings",   label:"Equipe" },
    { id:"theme",      label:"Tema do Site" },
    { id:"background", label:"Fundo Animado" },
    { id:"carousel",   label:"Carrossel" },
  ];

  const SidebarContent = ({ onNav }) => (
    <>
      <div className="brand" style={{marginBottom:'2rem'}}>
        <LogoMark size={40} />
        <div><b>Deliricamente</b><small>// PAINEL ADMIN</small></div>
      </div>
      <nav className="admin-nav">
        {navItems.map(n => (
          <button key={n.id}
            className={section === n.id || (n.id==="posts" && section==="editor") ? "active" : ""}
            onClick={()=>{ setSection(n.id); if (n.id !== "editor") setEditingId(null); onNav?.(); }}>
            <span className="dot" /> {n.label}
          </button>
        ))}
      </nav>
      <button className="logout" onClick={goPublic}>← VOLTAR AO SITE</button>
      <button className="logout" onClick={onLogout}>SAIR DA CONTA</button>
    </>
  );

  return (
    <div className="admin-shell">
      {/* Sidebar desktop */}
      <aside className="admin-sidebar"><SidebarContent /></aside>

      {/* Header mobile com hamburguer */}
      <div className="admin-mobile-header">
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <LogoMark size={32} />
          <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',letterSpacing:'0.05em'}}>DELIRICAMENTE</div>
        </div>
        <button onClick={()=>setSidebarOpen(true)} style={{background:'transparent',border:'1px solid var(--line)',color:'var(--off-white)',padding:'6px 12px',cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:'0.75rem'}}>
          MENU &#9776;
        </button>
      </div>

      {/* Overlay + Drawer sidebar para mobile */}
      {sidebarOpen && (
        <>
          <div className="admin-sidebar-overlay" style={{display:'block'}} onClick={()=>setSidebarOpen(false)} />
          <div className="admin-sidebar-drawer" style={{display:'flex'}}>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1rem'}}>
              <button onClick={()=>setSidebarOpen(false)} style={{background:'transparent',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'1.2rem'}}>&#10005;</button>
            </div>
            <SidebarContent onNav={()=>setSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className="admin-main page-enter">
        {content}
      </main>
    </div>
  );
}

Object.assign(window, { AdminLogin, AdminShell });