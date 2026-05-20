import React from 'react';
import { db } from './firebase.js';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getArtist, getArtistAlbums, getArtistTopTracks, embedUrl, ARTIST_IDS, PLAYLIST_ID } from './spotify.js';

// Pegando componentes do window
const { LogoMark, Splatter, Placeholder, Marquee, Btn, Icon, AnimatedBackground, HeroCarousel } = window;
const { SEED_POSTS, TIMELINE, GALLERY, AGENDA, COLLECTIVES } = window;

/* ============================================================
   Public-facing pages
   ============================================================ */

// formats "2024-11-23" -> ["23","NOV","2024"]
function fmtDate(iso) {
  const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const d = new Date(iso + "T12:00:00");
  return [String(d.getDate()).padStart(2,"0"), meses[d.getMonth()], d.getFullYear()];
}

// ============================================================
// HERO + MARQUEE
// ============================================================
function Hero({ go, bgConfig = {}, heroLogoUrl = "" }) {
  const { style = 'blobs', speed = 1, density = 15, opacity = 0.85 } = bgConfig;
  return (
    <>
      <section className="hero">
        <AnimatedBackground style={style} speed={speed} density={density} opacity={opacity} />
        <div className="wrap hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span>Caieiras · São Paulo</span>
              <b>· Coletivo desde 2019</b>
            </div>
            <h1 className="display">
              <span className="delirica">DELÍRICA</span>
              <span className="mente">MENTE</span>
            </h1>
            <p className="hero-tag">
              Coletivo de hip-hop, literatura periférica e intervenção urbana.
              Som, palavra e ação na quebrada — pela <b>revolução cultural e interna</b>.
              Parte do movimento <b>AGC — Arte, Guerrilha e Conhecimento</b>.
            </p>

            <div className="hero-meta">
              <div><span>FORMADO POR</span><b>3 COLETIVOS</b></div>
              <div><span>SEDE</span><b>CAIEIRAS · SP</b></div>
              <div><span>SEGUIDORES</span><b>1.049</b></div>
              <div><span>EVENTOS</span><b>+ 40 / ANO</b></div>
            </div>

            <div className="hero-actions">
              <Btn variant="red" arrow onClick={() => go("blog")}>Últimos posts</Btn>
              <Btn variant="ghost" arrow onClick={() => go("historia")}>Nossa história</Btn>
              <Btn variant="ghost" onClick={() => go("contato")}>Booking · Contato</Btn>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-logo-bg">
              <LogoMark size={300} imageUrl={heroLogoUrl} />
              <div className="hero-stamp">
                EPIFANIA<small>23 · 11 · 2024</small>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Marquee items={[
        "VIVA A NASCENÇA",
        "CULTURA UNDERGROUND",
        "ATITUDE & REVOLUÇÃO",
        "ARTE GUERRILHA & CONHECIMENTO",
        "DELÍRIO EM COLETIVO",
        "CAIEIRAS — SP",
      ]} />
    </>
  );
}

// ============================================================
// LATEST POSTS BLOCK
// ============================================================
function LatestPosts({ posts, go }) {
  const [a, b, c, d] = posts;
  return (
    <section className="section">
      <div className="wrap">
        <div className="row-head">
          <div>
            <div className="kicker">// Últimos posts</div>
            <h2 className="display">EM <em>DESTAQUE</em></h2>
          </div>
          <div className="right">
            <Btn arrow onClick={() => go("blog")}>Ver todos</Btn>
          </div>
        </div>

        <div className="posts-grid">
          <a className="post-card featured" onClick={() => go("post", a.id)}>
            <div className="post-cover">
              <span className="badge">{a.type}</span>
              <span className="date">{fmtDate(a.date).join(" · ")}</span>
              {a.cover?.url ? <img src={a.cover.url} alt={a.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(a.cover?.position ? 'center '+a.cover.position : 'center top'),display:'block'}} /> : <Placeholder label={a.cover?.label} variant={a.cover?.variant} />}
            </div>
            <div className="post-body">
              <div className="kicker">// post #{a.id.toUpperCase()}</div>
              <h3>{a.title}</h3>
              <p>{a.excerpt}</p>
              <div className="meta">
                <span>♥ <b>{a.likes}</b></span>
                <span>🔥 <b>{a.fires}</b></span>
                <span>💬 <b>{a.comments}</b></span>
                <span>POR <b>{a.author}</b></span>
              </div>
            </div>
          </a>
          <a className="post-card standard" onClick={() => go("post", b.id)}>
            <div className="post-cover">
              <span className="badge">{b.type}</span>
              <span className="date">{fmtDate(b.date).join(" · ")}</span>
              {b.cover?.url ? <img src={b.cover.url} alt={b.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(b.cover?.position ? 'center '+b.cover.position : 'center top'),display:'block'}} /> : <Placeholder label={b.cover?.label} variant={b.cover?.variant} />}
            </div>
            <div className="post-body">
              <div className="kicker">// post #{b.id.toUpperCase()}</div>
              <h3>{b.title}</h3>
              <p>{b.excerpt}</p>
              <div className="meta">
                <span>♥ <b>{b.likes}</b></span>
                <span>💬 <b>{b.comments}</b></span>
                <span>POR <b>{b.author}</b></span>
              </div>
            </div>
          </a>
          <a className="post-card third" onClick={() => go("post", c.id)}>
            <div className="post-cover">
              <span className="badge">{c.type}</span>
              <span className="date">{fmtDate(c.date).join(" · ")}</span>
              {c.cover?.url ? <img src={c.cover.url} alt={c.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(c.cover?.position ? 'center '+c.cover.position : 'center top'),display:'block'}} /> : <Placeholder label={c.cover?.label} variant={c.cover?.variant} />}
            </div>
            <div className="post-body">
              <h3>{c.title}</h3>
              <div className="meta">
                <span>♥ <b>{c.likes}</b></span>
                <span>💬 <b>{c.comments}</b></span>
              </div>
            </div>
          </a>
          <a className="post-card third" onClick={() => go("post", d.id)}>
            <div className="post-cover">
              <span className="badge">{d.type}</span>
              <span className="date">{fmtDate(d.date).join(" · ")}</span>
              {d.cover?.url ? <img src={d.cover.url} alt={d.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(d.cover?.position ? 'center '+d.cover.position : 'center top'),display:'block'}} /> : <Placeholder label={d.cover?.label} variant={d.cover?.variant} />}
            </div>
            <div className="post-body">
              <h3>{d.title}</h3>
              <div className="meta">
                <span>♥ <b>{d.likes}</b></span>
                <span>💬 <b>{d.comments}</b></span>
              </div>
            </div>
          </a>
          <a className="post-card third" onClick={() => go("blog")}>
            <div className="post-cover" style={{background:"var(--red)"}}>
              <Placeholder label="VER ARQUIVO COMPLETO →" variant="red" />
            </div>
            <div className="post-body">
              <h3>+ 80 posts no arquivo</h3>
              <div className="meta"><span>EVENTOS · SHOWS · OFICINAS</span></div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// AGC SECTION
// ============================================================
function AGCSection({ go }) {
  return (
    <section className="section agc-section">
      <div className="wrap">
        <div className="agc-grid">
          <div>
            <div className="kicker">// O movimento</div>
            <h2>ARTE,<br/><em>GUERRILHA</em><br/>& CONHECIMENTO</h2>
          </div>
          <div>
            <p>
              AGC é a aliança entre três coletivos da quebrada que decidiram trampar juntos
              ao invés de competir por palco, mídia e edital. Cada um tem sua frente —
              som, texto e imagem — mas as ações grandes, festivais e campanhas saem assinadas
              em coletivo.
            </p>
            <p>
              Não é selo, não é produtora, não é ONG. É movimento. Atitude e revolução
              dentro e fora do som. A quebrada cuidando da quebrada, sem pedir licença pra
              ninguém.
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}>
              <Btn variant="red" arrow onClick={() => go("historia")}>Conhecer a história</Btn>
            </div>
          </div>
        </div>

        <div className="collectives">
          {COLLECTIVES.map((c,i) => (
            <div className="collective" key={i}>
              <div className="num">{c.num}/03</div>
              <div className="role">{c.role}</div>
              <h3>{c.name}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// AGENDA
// ============================================================
function Agenda() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="row-head">
          <div>
            <div className="kicker">// Próximos rolês</div>
            <h2 className="display">NA <em>AGENDA</em></h2>
          </div>
        </div>
        <div className="agenda-list">
          {AGENDA.map((e, i) => (
            <div className="agenda-row" key={i}>
              <div className="agenda-date">
                {e.dia}<small>{e.mes} · {e.ano}</small>
              </div>
              <div className="agenda-title">{e.title}</div>
              <div className="agenda-meta">{e.local}</div>
              <div className="agenda-meta" style={{color:"var(--red)"}}>{e.tipo} →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <LogoMark size={56} />
              <div>
                <div style={{fontFamily:"var(--display)",fontSize:24,textTransform:"uppercase",letterSpacing:".02em"}}>Deliricamente</div>
                <div className="mono" style={{color:"var(--red)"}}>// CAIEIRAS · SP</div>
              </div>
            </div>
            <p className="footer-tag">
              Coletivo de hip-hop, literatura periférica e intervenção urbana. Parte
              do movimento AGC — Arte, Guerrilha e Conhecimento.
            </p>
          </div>
          <div>
            <h4>Site</h4>
            <ul>
              <li><a onClick={() => go("home")}>Início</a></li>
              <li><a onClick={() => go("historia")}>Nossa história</a></li>
              <li><a onClick={() => go("blog")}>Blog</a></li>
              <li><a onClick={() => go("galeria")}>Galeria</a></li>
              <li><a onClick={() => go("loja")}>Loja</a></li>
              <li><a onClick={() => go("contato")}>Contato</a></li>
            </ul>
          </div>
          <div>
            <h4>Movimento AGC</h4>
            <ul>
              <li><a>Deliricamente</a></li>
              <li><a>Prelúdio</a></li>
              <li><a>Mangueio Filmes</a></li>
            </ul>
          </div>
          <div>
            <h4>Redes</h4>
            <ul>
              <li><a>@deliricamente_</a></li>
              <li><a>YouTube · Deliricamente</a></li>
              <li><a>Spotify · Selo AGC</a></li>
              <li><a onClick={() => go("admin")}>Painel admin</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© DELIRICAMENTE · 2019 — 2025 · TODOS OS DIREITOS DA QUEBRADA</span>
          <span>VIVA A NASCENÇA DA CULTURA UNDERGROUND</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// HOME PAGE
// ============================================================
function HomePage({ posts, go, bgConfig = {}, carouselConfig = {}, heroLogoUrl = "" }) {
  const published = posts.filter(p => p.status === 'published');
  const showCarousel = carouselConfig.enabled && (carouselConfig.slides || []).length > 0;
  return (
    <div className="page-enter">
      <Hero go={go} bgConfig={bgConfig} heroLogoUrl={heroLogoUrl} />
      {showCarousel && (
        <HeroCarousel
          slides={carouselConfig.slides}
          autoPlay={carouselConfig.autoPlay !== false}
          interval={carouselConfig.interval || 5}
          go={go}
        />
      )}
      <LatestPosts posts={published.slice(0, 4)} go={go} />
      <AGCSection go={go} />
      <Agenda />
    </div>
  );
}

// ============================================================
// BLOG / ARCHIVE
// ============================================================
function BlogPage({ posts, go }) {
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState("Todos");
  const tags = ["Todos", "EVENTO", "SHOW", "NOTÍCIA", "CULTURA", "ANÚNCIO"];

  const filtered = posts.filter(p => p.status === "published")
    .filter(p => tag === "Todos" || p.type === tag)
    .filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Arquivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            BLOG &<br/><span style={{color:"var(--red)"}}>POSTS</span>
          </h1>

          <div className="blog-tools">
            <div className="tag-chips">
              {tags.map(t => (
                <button key={t} className={"chip " + (tag === t ? "active" : "")} onClick={() => setTag(t)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="search-input">
              <Icon.Search />
              <input placeholder="BUSCAR..." value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
          </div>

          <div className="blog-grid">
            {filtered.map(p => (
              <a key={p.id} className="post-card" onClick={() => go("post", p.id)}>
                <div className="post-cover">
                  <span className="badge">{p.type}</span>
                  <span className="date">{fmtDate(p.date).join(" · ")}</span>
                  {p.cover?.url ? <img src={p.cover.url} alt={p.title} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:(p.cover?.position ? 'center '+p.cover.position : 'center top'),display:'block'}} /> : <Placeholder label={p.cover?.label} variant={p.cover?.variant} />}
                </div>
                <div className="post-body">
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="meta">
                    <span>♥ <b>{p.likes}</b></span>
                    <span>🔥 <b>{p.fires}</b></span>
                    <span>💬 <b>{p.comments}</b></span>
                  </div>
                </div>
              </a>
            ))}
            {filtered.length === 0 && (
              <div className="mono" style={{padding:40, color:"var(--muted)", gridColumn:"1/-1", textAlign:"center"}}>
                NENHUM POST ENCONTRADO PARA ESSES FILTROS.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// POST DETAIL PAGE
// ============================================================
function PostPage({ postId, posts, go, getComments, addComment, toggleLike, user }) {
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
          <a className="back" onClick={() => go("blog")}>← Voltar ao arquivo</a>
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

// ============================================================
// HISTORIA / TIMELINE
// ============================================================
function HistoriaPage({ go }) {
  const [timeline, setTimeline] = React.useState(TIMELINE);

  React.useEffect(() => {
    const q = query(collection(db, 'timeline'), orderBy('year', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) setTimeline(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Trajetória</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            NOSSA<br/><span style={{color:"var(--red)"}}>HISTÓRIA</span>
          </h1>
          <p style={{maxWidth:"60ch",fontSize:18,color:"var(--text-body)",lineHeight:1.55}}>
            Da primeira roda informal no Centro Cultural até as duas edições da EPIFANIA —
            uma linha do tempo do que a quebrada construiu junta.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <div className="timeline">
            {[...timeline].sort((a, b) => (b.year || 0) - (a.year || 0)).map((t, i) => (
              <div className="tl-item" key={t.id || i}>
                <div className="tl-year">{t.year}</div>
                <div className="tl-body">
                  {t.imageUrl && <img src={t.imageUrl} alt={t.title} style={{width:'100%',height:200,objectFit:'cover',marginBottom:16,display:'block'}} />}
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                  <div className="tl-tags">
                    {(t.tags || []).map(g => <span key={g}>{g}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section agc-section">
        <div className="wrap">
          <div className="kicker">// O movimento</div>
          <h2 className="display" style={{fontSize:"clamp(48px,7vw,110px)",lineHeight:0.86,margin:"12px 0 24px",textTransform:"uppercase",color:"var(--ink)"}}>
            ARTE, <em style={{fontStyle:"normal",color:"var(--red)"}}>GUERRILHA</em><br/>& CONHECIMENTO
          </h2>
          <div className="collectives">
            {COLLECTIVES.map((c,i) => (
              <div className="collective" key={i}>
                <div className="num">{c.num}/03</div>
                <div className="role">{c.role}</div>
                <h3>{c.name}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="row-head">
            <div>
              <div className="kicker">// Memória viva</div>
              <h2 className="display">DEPOIMENTOS<br/><em>DOS MEMBROS</em></h2>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
            {[
              { name:"MC Roma", role:"Voz · Composição", quote:"Coletivo é onde o som vira ação e a ação vira som. Sem isso é só playlist." },
              { name:"GuLírico", role:"MC · Produção", quote:"A Deliricamente me ensinou que rima sem comunidade é só barulho organizado." },
              { name:"Leo Braga", role:"Voz · Letras", quote:"A gente fala de quebrada com a quebrada do lado, não pra ela ouvir de longe." },
            ].map((p,i)=>(
              <div key={i} className="collective" style={{background:"var(--panel)"}}>
                <div className="role">{p.role}</div>
                <h3>{p.name}</h3>
                <p style={{color:"var(--text-body)",fontStyle:"italic"}}>&ldquo;{p.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// GALERIA
// ============================================================
function GaleriaPage() {
  const [gallery, setGallery] = React.useState(GALLERY);
  const [open, setOpen] = React.useState(null);

  React.useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (items.length > 0) setGallery(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Memória do coletivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            GALE<span style={{color:"var(--red)"}}>RIA</span>
          </h1>

          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <div key={g.id || i} className={"gallery-item " + (g.size || '')} onClick={() => setOpen(g)}>
                {g.url
                  ? <img src={g.url} alt={g.label || ''} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',display:'block'}} />
                  : <Placeholder label={g.label} variant={g.variant} />
                }
                <div className="gallery-overlay">
                  <div>{g.label || ''}<br/><small style={{opacity:.8}}>CLIQUE PARA AMPLIAR</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div onClick={e=>e.stopPropagation()} style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}}>
            <button onClick={() => setOpen(null)} style={{position:'absolute',top:-40,right:0,background:'transparent',border:'none',color:'var(--off-white)',fontSize:24,cursor:'pointer'}}>✕</button>
            {open.url
              ? <img src={open.url} alt={open.label || ''} style={{maxWidth:'90vw',maxHeight:'90vh',objectFit:'contain',display:'block'}} />
              : <Placeholder label={open.label} variant={open.variant} />
            }
            {open.label && <div className="mono" style={{marginTop:12,textAlign:'center',fontSize:'0.8rem',color:'var(--muted)'}}>{open.label}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LOJA
// ============================================================
function LojaPage() {
  const STATIC_PRODUTOS = [
    { name:"Camiseta Logo Deliricamente", description:"Preta · Estampa branca", price:"R$ 65" },
    { name:"Moletom AGC", description:"Cinza · Bordado vermelho", price:"R$ 180" },
    { name:"Fanzine #03", description:"40 págs · A5", price:"R$ 20" },
  ];
  const [produtos, setProdutos] = React.useState(STATIC_PRODUTOS);

  React.useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active !== false);
      if (items.length > 0) setProdutos(items);
    });
    return () => unsub();
  }, []);

  return (
    <div className="page-enter">
      <section className="loja-section">
        <Splatter color="var(--black)" opacity={0.55} />
        <div className="wrap loja-grid">
          <div>
            <div className="kicker" style={{color:"var(--off-white)"}}>// Produtos oficiais</div>
            <h2>VESTE A <em>CAMISA</em><br/>DA QUEBRADA</h2>
            <p>
              Camisetas, moletons, bonés, fanzines e vinis do selo independente do AGC. Cada
              compra ajuda a financiar a próxima EPIFANIA, as oficinas e as ações de
              arrecadação.
            </p>
            <div className="mono" style={{marginTop:24,color:"rgba(255,255,255,.8)"}}>
              // FRETE PRA TODO BRASIL · ENVIO EM ATÉ 7 DIAS ÚTEIS
            </div>
          </div>

          <div className="product-stack">
            {produtos.map((p, i) => (
              <div className="product-card" key={p.id || i} style={{"--r": (i % 2 ? "1.5deg" : "-1.5deg")}}
                onClick={() => p.link && window.open(p.link, '_blank')}>
                <div className="product-thumb" style={{overflow:'hidden'}}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    : <Placeholder label={p.name.split(" ")[0]} variant="paper" />
                  }
                </div>
                <div style={{flex:1}}>
                  <h4>{p.name}</h4>
                  <small>{p.description || p.var}</small>
                </div>
                <div className="product-price">{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// CONTATO
// ============================================================
function ContatoPage() {
  const [form, setForm] = React.useState({ nome:"", email:"", assunto:"booking", msg:"" });
  const [sent, setSent] = React.useState(false);

  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Fala com o coletivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            CON<span style={{color:"var(--red)"}}>TATO</span>
          </h1>
          <div className="contato-grid">
            <div>
              {sent ? (
                <div className="share-box" style={{padding:32}}>
                  <h4>// MENSAGEM ENVIADA</h4>
                  <p style={{fontSize:18, lineHeight:1.5}}>
                    Recebemos a sua mensagem, <b>{form.nome.split(" ")[0] || "parceiro"}</b>.
                    A gente responde em até 48h por e-mail. Enquanto isso, segue a gente no
                    Insta — <b>@deliricamente_</b>.
                  </p>
                  <Btn arrow onClick={()=>{setSent(false); setForm({nome:"",email:"",assunto:"booking",msg:""});}}>Enviar outra</Btn>
                </div>
              ) : (
                <form className="comment-form" onSubmit={submit}>
                  <div className="row">
                    <input className="input" placeholder="SEU NOME" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} required />
                    <input className="input" placeholder="E-MAIL" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                  </div>
                  <select className="input" value={form.assunto} onChange={e=>setForm({...form,assunto:e.target.value})}>
                    <option value="booking">BOOKING · SHOW</option>
                    <option value="parceria">PARCERIA · COLABORAÇÃO</option>
                    <option value="oficina">OFICINA · WORKSHOP</option>
                    <option value="imprensa">IMPRENSA · ENTREVISTA</option>
                    <option value="outro">OUTRO</option>
                  </select>
                  <textarea className="input textarea" placeholder="CONTA O QUE PRECISA — DATA, LOCAL, ORÇAMENTO, CONTEXTO..." value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} required />
                  <Btn variant="red" arrow type="submit">Enviar mensagem</Btn>
                </form>
              )}
            </div>

            <div className="contato-info">
              <h3>// REDES</h3>
              <p>
                <b>Instagram</b> · <a>@deliricamente_</a><br/>
                <b>YouTube</b> · <a>Deliricamente Oficial</a><br/>
                <b>Spotify</b> · <a>Selo AGC</a>
              </p>

              <h3>// BOOKING & PARCERIAS</h3>
              <p>
                <a>booking@deliricamente.com.br</a><br/>
                <a>contato@agc.coletivo</a>
              </p>

              <h3>// BASE</h3>
              <p>
                Caieiras · Grande São Paulo<br/>
                Atende a região metropolitana e shows fora pra todo Brasil.
              </p>

              <h3>// SIGA</h3>
              <div className="socials">
                <a className="share-icon"><Icon.Insta /></a>
                <a className="share-icon"><Icon.Whats /></a>
                <a className="share-icon"><Icon.Yt /></a>
                <a className="share-icon"><Icon.Tw /></a>
                <a className="share-icon"><Icon.Fb /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================
// MUSICA — Spotify: playlist, albuns e novidades
// ============================================================
function SpotifyToast({ toast, onClose }) {
  if (!toast) return null;
  const h = toast.type === 'track' ? 80 : toast.type === 'playlist' ? 380 : 232;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      width: 340, maxWidth: 'calc(100vw - 32px)',
      background: '#0f0f0f',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      boxShadow: '0 20px 60px rgba(0,0,0,0.95)',
      overflow: 'hidden',
      animation: 'slideUp 0.25s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: '#1a1a1a',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
          <span style={{color:'#1DB954',fontSize:16,flexShrink:0}}>&#9834;</span>
          <span style={{fontFamily:'var(--font-mono)',fontSize:'0.75rem',color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
            {toast.name}
          </span>
          {toast.subtitle && (
            <span style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'rgba(255,255,255,0.4)',flexShrink:0}}>{toast.subtitle}</span>
          )}
        </div>
        <button onClick={onClose} style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.45)',cursor:'pointer',fontSize:16,flexShrink:0,marginLeft:8,lineHeight:1}}>&#10005;</button>
      </div>
      <iframe
        title={toast.name}
        src={embedUrl(toast.type, toast.id)}
        width="100%" height={h}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{display:'block'}}
      />
    </div>
  );
}

function MusicaPage() {
  const [artists, setArtists] = React.useState([]);
  const [albums, setAlbums] = React.useState({});
  const [topTracks, setTopTracks] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState(null);
  const openToast = (type, id, name, subtitle) => setToast({ type, id, name, subtitle: subtitle || '' });

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const artData = await Promise.all(ARTIST_IDS.map(id => getArtist(id)));
      const albData = await Promise.all(ARTIST_IDS.map(id => getArtistAlbums(id, 8)));
      const trkData = await Promise.all(ARTIST_IDS.map(id => getArtistTopTracks(id)));
      if (cancelled) return;
      setArtists(artData.filter(Boolean));
      const albMap = {}; ARTIST_IDS.forEach((id, i) => { albMap[id] = albData[i] || []; });
      const trkMap = {}; ARTIST_IDS.forEach((id, i) => { trkMap[id] = trkData[i] || []; });
      setAlbums(albMap); setTopTracks(trkMap); setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fmtMs = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2,'0')}`;
  };

  return (
    <div className="page-enter">
      {/* HEADER */}
      <section className="section tight" style={{paddingTop:80, paddingBottom:0}}>
        <div className="wrap">
          <div className="kicker">// MUSICA · DELIRICAMENTE</div>
          <h1 style={{fontSize:'clamp(3rem,8vw,7rem)',margin:'8px 0 8px',lineHeight:0.88}}>
            <span style={{color:'var(--red)'}}>SONS</span><br/>
            <span style={{color:'var(--off-white)'}}>DO COLETIVO</span>
          </h1>
          <p style={{color:'var(--text-body)',maxWidth:'50ch',marginBottom:'2rem'}}>
            Ouva a playlist oficial, acompanhe os lancamentos e as faixas mais tocadas dos artistas do Deliricamente.
          </p>
        </div>
      </section>

      {/* PLAYLIST EMBED */}

      {loading && (
        <section className="section tight">
          <div className="wrap">
            <div className="mono" style={{color:'var(--muted)',textAlign:'center',padding:'4rem 0'}}>
              Carregando dados do Spotify...
            </div>
          </div>
        </section>
      )}

      {/* ARTISTAS — NOVIDADES E TOP TRACKS */}
      {artists.map((artist, ai) => {
        if (!artist) return null;
        const artistAlbums = albums[artist.id] || [];
        const artistTracks = topTracks[artist.id] || [];

        return (
          <section key={artist.id} className="section" style={{paddingTop: ai === 0 ? '2rem' : '4rem'}}>
            <div className="wrap">
              {/* Cabecalho do artista */}
              <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32,paddingBottom:20,borderBottom:'1px solid var(--line)'}}>
                {artist.images?.[0]?.url && (
                  <img src={artist.images[0].url} alt={artist.name}
                    style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',border:'2px solid var(--red)',flexShrink:0}} />
                )}
                <div>
                  <div className="kicker">// ARTISTA</div>
                  <h2 style={{fontSize:'clamp(1.8rem,4vw,3rem)',margin:'2px 0 4px',lineHeight:0.95}}>{artist.name}</h2>
                  <div className="mono" style={{fontSize:'0.78rem',color:'var(--muted)'}}>
                    {artist.followers?.total?.toLocaleString('pt-BR')} SEGUIDORES
                    {artist.genres?.length > 0 && ' · ' + artist.genres.slice(0,2).join(', ').toUpperCase()}
                  </div>
                </div>
                <a href={artist.external_urls?.spotify} target="_blank" rel="noopener noreferrer"
                  style={{marginLeft:'auto',background:'#1DB954',color:'#000',padding:'8px 16px',borderRadius:20,fontFamily:'var(--font-mono)',fontSize:'0.75rem',fontWeight:700,textDecoration:'none',whiteSpace:'nowrap',flexShrink:0}}>
                  ABRIR NO SPOTIFY
                </a>
              </div>

              {/* LANCAMENTOS */}
              {artistAlbums.length > 0 && (
                <>
                  <div className="kicker" style={{marginBottom:16}}>// LANCAMENTOS</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:16,marginBottom:40}}>
                    {artistAlbums.map(album => (
                      <div key={album.id}
                        style={{background:'var(--panel)',border:'1px solid var(--line)',cursor:'pointer',transition:'border-color 0.2s',borderColor: 'var(--line)'}}
                        onClick={() => openToast("album", album.id, album.name, album.release_date?.slice(0,4))}>
                        <div style={{aspectRatio:'1',overflow:'hidden',position:'relative'}}>
                          {album.images?.[0]?.url
                            ? <img src={album.images[0].url} alt={album.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                            : <div style={{width:'100%',height:'100%',background:'var(--gray)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>&#9834;</div>
                          }
                          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0,transition:'opacity 0.2s'}} className="album-play-overlay">
                            <span style={{color:'#1DB954',fontSize:28,filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.8))'}}>&#9654;</span>
                          </div>
                        </div>
                        <div style={{padding:'10px 12px'}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:13,textTransform:'uppercase',lineHeight:1.2,marginBottom:4,color:'var(--off-white)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{album.name}</div>
                          <div className="mono" style={{fontSize:'0.65rem',color:'var(--muted)'}}>
                            {album.album_type?.toUpperCase()} · {album.release_date?.slice(0,4)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* TOP TRACKS */}
              {artistTracks.length > 0 && (
                <>
                  <div className="kicker" style={{marginBottom:16}}>// TOP FAIXAS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:16}}>
                    {artistTracks.map((track, ti) => (
                      <div key={track.id}
                        style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background: 'var(--panel)',border:'1px solid',borderColor: 'var(--line)',cursor:'pointer',transition:'all 0.2s'}}
                        onClick={() => openToast("track", track.id, track.name, track.artists?.map(a=>a.name).join(", "))}>
                        <div style={{fontFamily:'var(--font-display)',fontSize:20,color:'var(--muted)',width:24,textAlign:'center',flexShrink:0}}>{ti+1}</div>
                        {track.album?.images?.[0]?.url && (
                          <img src={track.album.images[0].url} alt="" style={{width:44,height:44,objectFit:'cover',flexShrink:0}} />
                        )}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:14,textTransform:'uppercase',color:'var(--off-white)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{track.name}</div>
                          <div className="mono" style={{fontSize:'0.7rem',color:'var(--muted)',marginTop:2}}>{track.album?.name}</div>
                        </div>
                        <div className="mono" style={{fontSize:'0.75rem',color:'var(--muted)',flexShrink:0}}>{fmtMs(track.duration_ms)}</div>
                        <a href={track.external_urls?.spotify} target="_blank" rel="noopener noreferrer"
                          onClick={e=>e.stopPropagation()}
                          style={{color:'#1DB954',fontSize:16,flexShrink:0,textDecoration:'none'}}>&#9654;</a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })}
      {/* Toast flutuante do Spotify */}
      <SpotifyToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, {
  HomePage, BlogPage, PostPage, HistoriaPage, GaleriaPage, LojaPage, ContatoPage, MusicaPage, Footer, fmtDate,
});
