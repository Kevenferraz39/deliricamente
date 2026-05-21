import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Placeholder, Btn, Icon } from '../components';
import { fmtDate } from './HomePage';

export default function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts, getComments, addComment, toggleLike, user } = useApp();

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return <div className="wrap" style={{padding:80}}><p>Post nao encontrado.</p></div>;
  }
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [text, setText] = React.useState("");
  const [liked, setLiked] = React.useState(false);
  const [fired, setFired] = React.useState(false);
  const comments = getComments(post.id);

  // Atualiza campos quando user mudar (login/logout)
  React.useEffect(() => {
    if (user) { setName(user.name || ""); setEmail(user.email || ""); }
  }, [user]);

  // Tempo relativo estilo Instagram
  const relTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T12:00:00');
    const diff = Date.now() - d.getTime();
    if (isNaN(diff)) return dateStr;
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return Math.floor(diff/60000) + 'min';
    if (diff < 86400000) return Math.floor(diff/3600000) + 'h';
    if (diff < 604800000) return Math.floor(diff/86400000) + 'd';
    return d.toLocaleDateString('pt-BR', {day:'2-digit',month:'short'});
  };

  const submit = (e) => {
    e && e.preventDefault();
    if (!text.trim()) return;
    const commentName = name.trim() || (user?.name) || 'Anonimo';
    const commentEmail = email.trim() || (user?.email) || '';
    addComment(post.id, {
      name: commentName, email: commentEmail, text: text.trim(),
      date: new Date().toISOString(),
    });
    setText("");
  };

  return (
    <div className="page-enter">
      <div className="wrap">
        <div className="post-hero">
          <a className="back" onClick={() => navigate("/blog")} style={{cursor:"pointer"}}>← Voltar ao arquivo</a>
          <div className="kicker">// {post.type} · {post.id.toUpperCase()}</div>
          <h1>{post.title}</h1>
          <div className="meta-row">
            <span>POR <b>{post.author}</b></span>
            <span>PUBLICADO <b>{fmtDate(post.date).join(" · ")}</b></span>
            <span><Icon.Eye /> <b>{post.views}</b> VISUALIZAÇÕES</span>
            <span>TAGS · <b>{post.tags.join(", ")}</b></span>
          </div>
        </div>

        <div className="post-cover-big" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
          {post.cover?.url ? (
            <>
              {/* Fundo embaçado preenche o espaco sem cortar o conteudo principal */}
              <img aria-hidden="true" src={post.cover.url} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(28px) brightness(0.35)',transform:'scale(1.12)',zIndex:0}} />
              {/* Imagem principal em tamanho real, sem distorcao */}
              <img src={post.cover.url} alt={post.title} style={{position:'relative',zIndex:1,maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:'block'}} />
            </>
          ) : (
            <Placeholder label={post.cover?.label} variant={post.cover?.variant} />
          )}
        </div>

        <div className="post-content">
          <article>
            {post.body.map((blk, i) => {
              // Renderiza inline markdown: **bold**, *italic*, ~~strike~~
              const md = (txt) => {
                if (!txt) return txt;
                const parts = []; let rest = txt;
                const re = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~)/g;
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
              if (blk.kind === "p") return <p key={i}>{md(blk.text)}</p>;
              if (blk.kind === "h2") return <h2 key={i}>{blk.text}</h2>;
              if (blk.kind === "quote") return <blockquote key={i}>{md(blk.text)}</blockquote>;
              if (blk.kind === "ul") return <ul key={i}>{blk.items.map((it,j)=><li key={j}>{md(it)}</li>)}</ul>;
              if (blk.kind === "embed") {
                const raw = blk.url || blk.label || '';
                const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
                const ytId = ytMatch ? ytMatch[1] : null;
                return (
                  <div className="embed" key={i} style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',margin:'2rem 0'}}>
                    {ytId
                      ? <iframe
                          src={'https://www.youtube.com/embed/' + ytId}
                          title="Video embed"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                        />
                      : <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--panel)',fontFamily:'var(--font-mono)',color:'var(--muted)',fontSize:'0.85rem'}}>
                          // URL inválida: {raw}
                        </div>
                    }
                  </div>
                );
              }
              return null;
            })}

            {/* ── COMENTARIOS estilo Instagram ── */}
            <div className="comments" style={{marginTop:'3rem',paddingTop:'2rem',borderTop:'1px solid var(--line)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
                <h3 style={{margin:0,fontSize:'1.2rem'}}>{comments.length} {comments.length === 1 ? 'Comentario' : 'Comentarios'}</h3>
              </div>

              {/* Lista de comentarios */}
              {comments.length === 0 && (
                <div className="mono" style={{color:'var(--muted)',fontSize:'0.85rem',marginBottom:24}}>
                  Nenhum comentario ainda. Seja o primeiro!
                </div>
              )}
              {comments.map((c,i) => (
                <div key={i} style={{display:'flex',gap:12,marginBottom:20,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'var(--panel)',border:'1px solid var(--gray)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:18,color:'var(--red)',flexShrink:0}}>
                    {(c.name||'?')[0].toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--off-white)',fontSize:'0.88rem'}}>{c.name}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.72rem',color:'var(--muted)'}}>{relTime(c.date)}</span>
                    </div>
                    <p style={{margin:0,color:'var(--text-body)',lineHeight:1.55,fontSize:'0.95rem'}}>{c.text}</p>
                  </div>
                </div>
              ))}

              {/* Formulario de comentario */}
              <div style={{borderTop:'1px solid var(--line)',paddingTop:20,marginTop:8}}>
                {/* Campos nome/email — so mostra se nao logado */}
                {!user && (
                  <div style={{display:'flex',gap:10,marginBottom:12}}>
                    <input style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid var(--gray)',color:'var(--off-white)',fontFamily:'var(--font-mono)',fontSize:'0.85rem',padding:'8px 0',outline:'none'}}
                      placeholder="Seu nome *" value={name} onChange={e=>setName(e.target.value)} />
                    <input style={{flex:1.5,background:'transparent',border:'none',borderBottom:'1px solid var(--gray)',color:'var(--off-white)',fontFamily:'var(--font-mono)',fontSize:'0.85rem',padding:'8px 0',outline:'none'}}
                      placeholder="E-mail (privado)" value={email} onChange={e=>setEmail(e.target.value)} />
                  </div>
                )}
                {/* Linha do input principal */}
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'var(--panel)',border:`1px solid ${user ? 'var(--red)' : 'var(--gray)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:18,color:'var(--red)',flexShrink:0}}>
                    {user ? (user.name||'?')[0].toUpperCase() : '?'}
                  </div>
                  <div style={{flex:1}}>
                    {user && <div className="mono" style={{fontSize:'0.72rem',color:'var(--muted)',marginBottom:6}}>{user.name} · {user.email}</div>}
                    <textarea
                      style={{width:'100%',background:'transparent',border:'none',borderBottom:'1px solid var(--gray)',color:'var(--off-white)',fontFamily:'var(--font-body)',fontSize:'0.95rem',padding:'8px 0',resize:'none',outline:'none',minHeight:56,lineHeight:1.5}}
                      placeholder="Adicione um comentario — rima, resenha, elogio, critica..."
                      value={text} onChange={e=>setText(e.target.value)}
                      onKeyDown={e=>{ if (e.key==='Enter' && e.ctrlKey) submit(); }}
                    />
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                      <span className="mono" style={{fontSize:'0.7rem',color:'var(--muted)'}}>Ctrl+Enter para publicar</span>
                      <Btn variant="red" arrow onClick={submit} disabled={!text.trim()}>Publicar</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <aside className="post-aside">
            <div className="reaction-bar">
              <button className={"reaction-btn " + (liked ? "active" : "")} onClick={()=>{ if (!liked) { setLiked(true); toggleLike(post.id,"likes",true); } }}>
                <Icon.Heart />
                <span className="num">{post.likes}</span>
                <span className="lbl">CURTIR</span>
              </button>
              <button className={"reaction-btn " + (fired ? "active" : "")} onClick={()=>{ if (!fired) { setFired(true); toggleLike(post.id,"fires",true); } }}>
                <Icon.Fire />
                <span className="num">{post.fires}</span>
                <span className="lbl">FOGO</span>
              </button>
              <button className="reaction-btn">
                <Icon.Comment />
                <span className="num">{comments.length}</span>
                <span className="lbl">COMENTAR</span>
              </button>
            </div>

            <div className="share-box">
              <h4>// COMPARTILHAR</h4>
              <div className="share-icons">
                <a className="share-icon" title="Instagram"><Icon.Insta /></a>
                <a className="share-icon" title="WhatsApp"><Icon.Whats /></a>
                <a className="share-icon" title="Twitter / X"><Icon.Tw /></a>
                <a className="share-icon" title="Facebook"><Icon.Fb /></a>
                <a className="share-icon" title="Copiar link"><Icon.Link /></a>
              </div>
            </div>

            <div className="share-box">
              <h4>// TAGS</h4>
              <div className="tag-chips" style={{flexWrap:"wrap"}}>
                {post.tags.map(t => <span key={t} className="chip">{t}</span>)}
              </div>
            </div>

            <div className="share-box">
              <h4>// AUTOR</h4>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="comment-avatar">{(post.author||"?")[0]}</div>
                <div>
                  <div style={{fontWeight:600}}>{post.author}</div>
                  <div className="mono" style={{color:"var(--muted)",marginTop:4}}>// COLETIVO DELIRICAMENTE</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
