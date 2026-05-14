import React from 'react';

// Pegando componentes do window
const { LogoMark, Splatter, Placeholder, Marquee, Btn, Icon } = window;
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
function Hero({ go }) {
  return (
    <>
      <section className="hero">
        <Splatter color="#E10600" opacity={0.85} />
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
              <LogoMark size={300} color="#0A0A0A" accent="#E10600" />
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
              <Placeholder label={a.cover.label} variant={a.cover.variant} />
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
              <Placeholder label={b.cover.label} variant={b.cover.variant} />
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
              <Placeholder label={c.cover.label} variant={c.cover.variant} />
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
              <Placeholder label={d.cover.label} variant={d.cover.variant} />
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
function HomePage({ posts, go }) {
  return (
    <div className="page-enter">
      <Hero go={go} />
      <LatestPosts posts={posts.filter(p => p.status === "published").slice(0, 4)} go={go} />
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
                  <Placeholder label={p.cover.label} variant={p.cover.variant} />
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
function PostPage({ postId, posts, go, getComments, addComment, toggleLike }) {
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return <div className="wrap" style={{padding:80}}><p>Post não encontrado.</p></div>;
  }
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [text, setText] = React.useState("");
  const [liked, setLiked] = React.useState(false);
  const [fired, setFired] = React.useState(false);
  const comments = getComments(post.id);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name || !text) return;
    addComment(post.id, { name, email, text, date: new Date().toISOString().slice(0,10) });
    setText(""); setName(""); setEmail("");
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

        <div className="post-cover-big">
          <Placeholder label={post.cover.label} variant={post.cover.variant} />
        </div>

        <div className="post-content">
          <article>
            {post.body.map((blk, i) => {
              if (blk.kind === "p") return <p key={i}>{blk.text}</p>;
              if (blk.kind === "h2") return <h2 key={i}>{blk.text}</h2>;
              if (blk.kind === "quote") return <blockquote key={i}>“{blk.text}”</blockquote>;
              if (blk.kind === "ul") return <ul key={i}>{blk.items.map((it,j)=><li key={j}>{it}</li>)}</ul>;
              if (blk.kind === "embed") return (
                <div className="embed" key={i}>
                  <Placeholder label={blk.label || "VIDEO · YOUTUBE EMBED"} />
                </div>
              );
              return null;
            })}

            <div className="comments">
              <h3>{comments.length} comentários</h3>
              <form className="comment-form" onSubmit={onSubmit}>
                <div className="row">
                  <input className="input" placeholder="SEU NOME" value={name} onChange={(e)=>setName(e.target.value)} />
                  <input className="input" placeholder="E-MAIL (NÃO PUBLICADO)" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <textarea className="input textarea" placeholder="ESCREVE AÍ — RIMA, RESENHA, ELOGIO, CRÍTICA..." value={text} onChange={(e)=>setText(e.target.value)} />
                <div style={{display:"flex",gap:10}}>
                  <Btn variant="red" arrow type="submit">Publicar comentário</Btn>
                  <span className="mono" style={{color:"var(--muted)",alignSelf:"center"}}>
                    // COMENTÁRIO VAI PRA MODERAÇÃO ANTES DE APARECER
                  </span>
                </div>
              </form>

              {comments.map((c,i) => (
                <div className="comment" key={i}>
                  <div className="comment-avatar">{(c.name||"?")[0]}</div>
                  <div className="comment-body">
                    <div className="comment-head">
                      <b>{c.name}</b>
                      <span>{c.date}</span>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="post-aside">
            <div className="reaction-bar">
              <button className={"reaction-btn " + (liked ? "active" : "")} onClick={()=>{setLiked(!liked); toggleLike(post.id,"likes",!liked);}}>
                <Icon.Heart />
                <span className="num">{post.likes + (liked ? 1 : 0)}</span>
                <span className="lbl">CURTIR</span>
              </button>
              <button className={"reaction-btn " + (fired ? "active" : "")} onClick={()=>{setFired(!fired); toggleLike(post.id,"fires",!fired);}}>
                <Icon.Fire />
                <span className="num">{post.fires + (fired ? 1 : 0)}</span>
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
  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Trajetória</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            NOSSA<br/><span style={{color:"var(--red)"}}>HISTÓRIA</span>
          </h1>
          <p style={{maxWidth:"60ch",fontSize:18,color:"#bbb",lineHeight:1.55}}>
            Da primeira roda informal no Centro Cultural até as duas edições da EPIFANIA —
            uma linha do tempo do que a quebrada construiu junta.
          </p>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <div className="timeline">
            {TIMELINE.map((t, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-year">{t.year}</div>
                <div className="tl-body">
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                  <div className="tl-tags">
                    {t.tags.map(g => <span key={g}>{g}</span>)}
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
                <p style={{color:"#ddd",fontStyle:"italic"}}>“{p.quote}”</p>
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
  const [filter, setFilter] = React.useState("Todos");
  const [open, setOpen] = React.useState(null);
  const filters = ["Todos", "EPIFANIA 2024", "EPIFANIA 2022", "Batalhas", "Oficinas", "Bastidores"];

  return (
    <div className="page-enter">
      <section className="section tight" style={{paddingTop:64}}>
        <div className="wrap">
          <div className="kicker">// Memória do coletivo</div>
          <h1 className="display" style={{fontSize:"clamp(56px,9vw,130px)",lineHeight:0.85,margin:"12px 0 32px",textTransform:"uppercase"}}>
            GALE<span style={{color:"var(--red)"}}>RIA</span>
          </h1>

          <div className="tag-chips" style={{marginBottom:32}}>
            {filters.map(f => (
              <button key={f} className={"chip " + (filter === f ? "active" : "")} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {GALLERY.map((g, i) => (
              <div key={i} className={"gallery-item " + g.size} onClick={() => setOpen(g)}>
                <Placeholder label={g.label} variant={g.variant} />
                <div className="gallery-overlay">
                  <div>{g.label}<br/><small style={{opacity:.8}}>CLIQUE PARA AMPLIAR →</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)}>
          <div className="lightbox-content" onClick={(e)=>e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setOpen(null)}>✕</button>
            <Placeholder label={open.label} variant={open.variant} />
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
  const produtos = [
    { name:"Camiseta Logo Deliricamente",   var:"Preta · Estampa branca", price:"R$ 65" },
    { name:"Moletom AGC",                   var:"Cinza · Bordado vermelho", price:"R$ 180" },
    { name:"Boné EPIFANIA",                 var:"Preto · Trucker", price:"R$ 50" },
    { name:"Fanzine #03 — Delírio em Coletivo", var:"40 págs · A5", price:"R$ 20" },
    { name:"Vinil Selo AGC vol. 1",         var:"180g · Edição limitada", price:"R$ 120" },
  ];
  return (
    <div className="page-enter">
      <section className="loja-section">
        <Splatter color="#0A0A0A" opacity={0.55} />
        <div className="wrap loja-grid">
          <div>
            <div className="kicker" style={{color:"#fff"}}>// Produtos oficiais</div>
            <h2>VESTE A <em>CAMISA</em><br/>DA QUEBRADA</h2>
            <p>
              Camisetas, moletons, bonés, fanzines e vinis do selo independente do AGC. Cada
              compra ajuda a financiar a próxima EPIFANIA, as oficinas e as ações de
              arrecadação. Loja externa, redirecionamento seguro.
            </p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <Btn variant="paper" arrow>Ir pra loja externa</Btn>
              <Btn variant="ghost" style={{borderColor:"#fff",color:"#fff"}}>Pedidos no DM</Btn>
            </div>
            <div className="mono" style={{marginTop:24,color:"rgba(255,255,255,.8)"}}>
              // FRETE PRA TODO BRASIL · ENVIO EM ATÉ 7 DIAS ÚTEIS
            </div>
          </div>

          <div className="product-stack">
            {produtos.map((p, i) => (
              <div className="product-card" key={i} style={{"--r": (i % 2 ? "1.5deg" : "-1.5deg")}}>
                <div className="product-thumb">
                  <Placeholder label={p.name.split(" ")[0]} variant="paper" />
                </div>
                <div>
                  <h4>{p.name}</h4>
                  <small>{p.var}</small>
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

Object.assign(window, {
  HomePage, BlogPage, PostPage, HistoriaPage, GaleriaPage, LojaPage, ContatoPage, Footer, fmtDate,
});