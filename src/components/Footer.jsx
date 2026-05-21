import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMark } from '../components';

export default function Footer() {
  const navigate = useNavigate();

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
              <li><a onClick={() => navigate("/")} style={{cursor:"pointer"}}>Início</a></li>
              <li><a onClick={() => navigate("/historia")} style={{cursor:"pointer"}}>Nossa história</a></li>
              <li><a onClick={() => navigate("/blog")} style={{cursor:"pointer"}}>Blog</a></li>
              <li><a onClick={() => navigate("/galeria")} style={{cursor:"pointer"}}>Galeria</a></li>
              <li><a onClick={() => navigate("/loja")} style={{cursor:"pointer"}}>Loja</a></li>
              <li><a onClick={() => navigate("/contato")} style={{cursor:"pointer"}}>Contato</a></li>
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
              <li><a onClick={() => navigate("/admin")} style={{cursor:"pointer"}}>Painel admin</a></li>
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
