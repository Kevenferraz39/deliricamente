import React from 'react';
import { getArtist, getArtistAlbums, getArtistTopTracks, embedUrl, ARTIST_IDS, PLAYLIST_ID } from '../spotify.js';

function SpotifyModal({ modal, onClose }) {
  if (!modal) return null;

  React.useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const embedH = modal.type === 'track' ? 152 : modal.type === 'playlist' ? 352 : 380;
  const typeLabel = modal.type === 'track' ? '♪ FAIXA' : modal.type === 'album' ? '◉ ÁLBUM' : '≡ PLAYLIST';

  return (
    <div className="sp-modal-backdrop" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <div className="sp-modal-header">
          <div className="sp-modal-info">
            <span className="sp-modal-type">{typeLabel}</span>
            <div className="sp-modal-title">{modal.name}</div>
            {modal.subtitle && <div className="sp-modal-sub">{modal.subtitle}</div>}
          </div>
          <div className="sp-modal-actions">
            {modal.spotifyUrl && (
              <a href={modal.spotifyUrl} target="_blank" rel="noopener noreferrer" className="sp-open-btn">
                Spotify ↗
              </a>
            )}
            <button className="sp-close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <iframe
          title={modal.name}
          src={embedUrl(modal.type, modal.id)}
          width="100%"
          height={embedH}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{display:'block'}}
        />
      </div>
    </div>
  );
}

export default function MusicaPage() {
  const [artists, setArtists] = React.useState([]);
  const [albums, setAlbums] = React.useState({});
  const [topTracks, setTopTracks] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [modal, setModal] = React.useState(null);
  const openModal = (type, id, name, subtitle, spotifyUrl) =>
    setModal({ type, id, name, subtitle: subtitle || '', spotifyUrl: spotifyUrl || null });

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const artData = await Promise.all(ARTIST_IDS.map(id => getArtist(id)));
        if (cancelled) return;

        const validArtists = artData.filter(Boolean);
        if (validArtists.length === 0) {
          setError('Não foi possível conectar ao Spotify. Verifique as credenciais no .env e reinicie o servidor.');
          setLoading(false);
          return;
        }

        const albData = await Promise.all(ARTIST_IDS.map(id => getArtistAlbums(id, 8)));
        const trkData = await Promise.all(ARTIST_IDS.map(id => getArtistTopTracks(id)));
        if (cancelled) return;

        setArtists(validArtists);
        const albMap = {}; ARTIST_IDS.forEach((id, i) => { albMap[id] = albData[i] || []; });
        const trkMap = {}; ARTIST_IDS.forEach((id, i) => { trkMap[id] = trkData[i] || []; });
        setAlbums(albMap); setTopTracks(trkMap);
      } catch (e) {
        if (!cancelled) setError('Erro ao carregar dados do Spotify: ' + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const fmtMs = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${String(s).padStart(2,'0')}`;
  };

  const albumTypeLabel = (type) => {
    if (type === 'single') return 'SINGLE';
    if (type === 'compilation') return 'COMP.';
    return 'ÁLBUM';
  };

  return (
    <div className="page-enter">
      {/* HEADER */}
      <section className="section tight" style={{paddingTop:112, paddingBottom:40}}>
        <div className="wrap">
          <div className="kicker">// MÚSICA · DELIRICAMENTE</div>
          <h1 style={{fontSize:'clamp(3rem,8vw,7rem)',margin:'8px 0 16px',lineHeight:0.88}}>
            <span style={{color:'var(--red)'}}>SONS</span><br/>
            <span style={{color:'var(--off-white)'}}>DO COLETIVO</span>
          </h1>
          <p style={{color:'var(--text-body)',maxWidth:'50ch',marginBottom:0}}>
            Ouça a playlist oficial, acompanhe os lançamentos e as faixas mais tocadas dos artistas do Deliricamente.
          </p>
        </div>
      </section>

      {/* PLAYLIST OFICIAL */}
      <section className="section tight" style={{paddingTop:0, paddingBottom:56}}>
        <div className="wrap">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div className="kicker" style={{marginBottom:0}}>// PLAYLIST OFICIAL</div>
            <a href={`https://open.spotify.com/playlist/${PLAYLIST_ID}`} target="_blank" rel="noopener noreferrer" className="sp-open-btn">
              Abrir no Spotify ↗
            </a>
          </div>
          <div className="playlist-section">
            <iframe
              title="Playlist Deliricamente"
              src={embedUrl('playlist', PLAYLIST_ID)}
              width="100%"
              height={400}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{display:'block'}}
            />
          </div>
        </div>
      </section>

      {loading && (
        <section className="section tight" style={{paddingTop:0}}>
          <div className="wrap">
            <div className="mono" style={{color:'var(--muted)',textAlign:'center',padding:'4rem 0'}}>
              // CARREGANDO DADOS DO SPOTIFY...
            </div>
          </div>
        </section>
      )}

      {error && !loading && (
        <section className="section tight" style={{paddingTop:0}}>
          <div className="wrap">
            <div style={{
              background:'rgba(225,6,0,0.06)', border:'1px solid rgba(225,6,0,0.25)',
              padding:'20px 24px', display:'flex', flexDirection:'column', gap:10,
            }}>
              <div className="mono" style={{color:'var(--red)',fontSize:'0.75rem'}}>// ERRO · SPOTIFY API</div>
              <p style={{margin:0,color:'var(--text-body)',fontSize:'0.9rem'}}>{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
                style={{
                  alignSelf:'flex-start', background:'transparent',
                  border:'1px solid var(--gray)', color:'var(--muted)',
                  fontFamily:'var(--font-mono)', fontSize:'0.72rem',
                  padding:'6px 14px', cursor:'pointer', marginTop:4,
                  transition:'all 0.15s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--off-white)';e.currentTarget.style.color='var(--off-white)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray)';e.currentTarget.style.color='var(--muted)';}}
              >
                Tentar novamente →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ARTISTAS */}
      {artists.map((artist, ai) => {
        if (!artist) return null;
        const artistAlbums = albums[artist.id] || [];
        const artistTracks = topTracks[artist.id] || [];
        const bannerImg = artist.images?.[0]?.url || '';

        return (
          <section key={artist.id} className="section" style={{paddingTop: ai === 0 ? '2rem' : '5rem'}}>
            <div className="wrap">
              {/* Artist Banner */}
              <div className="artist-banner">
                {bannerImg && (
                  <div className="artist-banner-bg" style={{backgroundImage:`url(${bannerImg})`}} />
                )}
                <div className="artist-banner-content">
                  {bannerImg && (
                    <img src={bannerImg} alt={artist.name}
                      style={{width:88,height:88,borderRadius:'50%',objectFit:'cover',
                        border:'3px solid var(--red)',flexShrink:0,
                        boxShadow:'0 0 0 4px rgba(225,6,0,0.2)'}} />
                  )}
                  <div style={{flex:1,minWidth:0}}>
                    <div className="kicker" style={{marginBottom:4}}>// ARTISTA</div>
                    <h2 style={{fontSize:'clamp(1.8rem,4vw,3rem)',margin:'0 0 6px',lineHeight:0.95,color:'var(--off-white)'}}>
                      {artist.name}
                    </h2>
                    <div className="mono" style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',display:'flex',gap:16,flexWrap:'wrap'}}>
                      {artist.followers?.total && (
                        <span>{artist.followers.total.toLocaleString('pt-BR')} SEGUIDORES</span>
                      )}
                      {artist.genres?.length > 0 && (
                        <span>{artist.genres.slice(0,2).join(' · ').toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <a href={artist.external_urls?.spotify} target="_blank" rel="noopener noreferrer"
                    className="sp-open-btn" style={{fontSize:'0.75rem',padding:'8px 18px'}}>
                    SPOTIFY ↗
                  </a>
                </div>
              </div>

              {/* LANÇAMENTOS */}
              {artistAlbums.length > 0 && (
                <>
                  <div className="kicker" style={{marginBottom:16}}>// LANÇAMENTOS</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:16,marginBottom:48}}>
                    {artistAlbums.map(album => (
                      <div key={album.id} className="album-card"
                        onClick={() => openModal('album', album.id, album.name,
                          `${albumTypeLabel(album.album_type)} · ${album.release_date?.slice(0,4)}`,
                          album.external_urls?.spotify)}>
                        <div style={{aspectRatio:'1',overflow:'hidden',position:'relative'}}>
                          {album.images?.[0]?.url
                            ? <img src={album.images[0].url} alt={album.name}
                                className="album-thumb-img"
                                style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform 0.3s'}} />
                            : <div style={{width:'100%',height:'100%',background:'var(--gray)',
                                display:'flex',alignItems:'center',justifyContent:'center',
                                color:'var(--muted)',fontSize:32}}>♪</div>
                          }
                          <div className="album-play-overlay"
                            style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.55)',
                              display:'flex',alignItems:'center',justifyContent:'center',
                              opacity:0,transition:'opacity 0.2s'}}>
                            <div style={{width:48,height:48,borderRadius:'50%',background:'#1DB954',
                              display:'flex',alignItems:'center',justifyContent:'center',
                              fontSize:20,color:'#000',boxShadow:'0 4px 16px rgba(0,0,0,0.5)'}}>▶</div>
                          </div>
                          <div style={{position:'absolute',top:8,left:8,background:'rgba(0,0,0,0.72)',
                            fontFamily:'var(--font-mono)',fontSize:'0.58rem',color:'#fff',
                            padding:'2px 6px',borderRadius:3,textTransform:'uppercase',letterSpacing:'0.06em'}}>
                            {albumTypeLabel(album.album_type)}
                          </div>
                        </div>
                        <div style={{padding:'10px 12px'}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:13,textTransform:'uppercase',
                            lineHeight:1.2,marginBottom:4,color:'var(--off-white)',
                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {album.name}
                          </div>
                          <div className="mono" style={{fontSize:'0.65rem',color:'var(--muted)'}}>
                            {album.release_date?.slice(0,4)}
                            {album.total_tracks ? ` · ${album.total_tracks} FAIXAS` : ''}
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
                  <div className="kicker" style={{marginBottom:12}}>// TOP FAIXAS</div>
                  <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:16}}>
                    {artistTracks.map((track, ti) => (
                      <div key={track.id} className="track-row"
                        onClick={() => openModal('track', track.id, track.name,
                          track.artists?.map(a => a.name).join(', '),
                          track.external_urls?.spotify)}>
                        <div style={{position:'relative',width:24,flexShrink:0}}>
                          <div className="track-num">{ti + 1}</div>
                          <div className="track-play-icon">▶</div>
                        </div>
                        {track.album?.images?.[0]?.url && (
                          <img src={track.album.images[0].url} alt=""
                            style={{width:44,height:44,objectFit:'cover',flexShrink:0,borderRadius:2}} />
                        )}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontFamily:'var(--font-display)',fontSize:14,textTransform:'uppercase',
                            color:'var(--off-white)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {track.name}
                          </div>
                          <div className="mono" style={{fontSize:'0.7rem',color:'var(--muted)',marginTop:2}}>
                            {track.album?.name}
                          </div>
                        </div>
                        {track.popularity !== undefined && (
                          <div style={{flexShrink:0,display:'flex',alignItems:'center'}}>
                            <div style={{width:40,height:3,background:'var(--gray)',borderRadius:2,overflow:'hidden'}}>
                              <div style={{width:`${track.popularity}%`,height:'100%',
                                background:'#1DB954',borderRadius:2,transition:'width 0.3s'}} />
                            </div>
                          </div>
                        )}
                        <div className="mono" style={{fontSize:'0.75rem',color:'var(--muted)',flexShrink:0,marginLeft:8}}>
                          {fmtMs(track.duration_ms)}
                        </div>
                        <a href={track.external_urls?.spotify} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{color:'#1DB954',fontSize:14,flexShrink:0,textDecoration:'none',
                            opacity:0.5,transition:'opacity 0.2s',marginLeft:6}}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}>
                          ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        );
      })}

      <SpotifyModal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}
