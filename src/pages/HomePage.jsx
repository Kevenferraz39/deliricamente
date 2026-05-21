import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogoMark, Placeholder, Marquee, Btn, AnimatedBackground, HeroCarousel } from '../components';
import { AGENDA, COLLECTIVES } from '../data';

// formats "2024-11-23" -> ["23","NOV","2024"]
export function fmtDate(iso) {
  const meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
  const d = new Date(iso + "T12:00:00");
  return [String(d.getDate()).padStart(2,"0"), meses[d.getMonth()], d.getFullYear()];
}

// ============================================================
// HERO + MARQUEE
// ============================================================
function Hero({ bgConfig = {}, heroLogoUrl = "" }) {
  const navigate = useNavigate();
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
              <Btn variant="red" arrow onClick={() => navigate("/blog")}>Últimos posts</Btn>
              <Btn variant="ghost" arrow onClick={() => navigate("/historia")}>Nossa história</Btn>
              <Btn variant="ghost" onClick={() => navigate("/contato")}>Booking · Contato</Btn>
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
function LatestPosts({ posts }) {
  const navigate = useNavigate();
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
            <Btn arrow onClick={() => navigate("/blog")}>Ver todos</Btn>
          </div>
        </div>

        <div className="posts-grid">
          <a className="post-card featured" onClick={() => navigate("/blog/" + a.id)} style={{cursor:"pointer"}}>
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
          <a className="post-card standard" onClick={() => navigate("/blog/" + b.id)} style={{cursor:"pointer"}}>
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
          <a className="post-card third" onClick={() => navigate("/blog/" + c.id)} style={{cursor:"pointer"}}>
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
          <a className="post-card third" onClick={() => navigate("/blog/" + d.id)} style={{cursor:"pointer"}}>
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
          <a className="post-card third" onClick={() => navigate("/blog")} style={{cursor:"pointer"}}>
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
function AGCSection() {
  const navigate = useNavigate();
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
              <Btn variant="red" arrow onClick={() => navigate("/historia")}>Conhecer a história</Btn>
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
// HOME PAGE
// ============================================================
export default function HomePage() {
  const { posts, bgConfig = {}, carouselConfig = {}, heroLogoUrl = "" } = useApp();
  const published = posts.filter(p => p.status === 'published');
  const showCarousel = carouselConfig.enabled && (carouselConfig.slides || []).length > 0;
  return (
    <div className="page-enter">
      <Hero bgConfig={bgConfig} heroLogoUrl={heroLogoUrl} />
      {showCarousel && (
        <HeroCarousel
          slides={carouselConfig.slides}
          autoPlay={carouselConfig.autoPlay !== false}
          interval={carouselConfig.interval || 5}
        />
      )}
      {published.length >= 4 && <LatestPosts posts={published.slice(0, 4)} />}
      <AGCSection />
      <Agenda />
    </div>
  );
}
