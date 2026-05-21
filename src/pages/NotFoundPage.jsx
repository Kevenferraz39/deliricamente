import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Splatter, Btn } from '../components';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <Splatter color="var(--red)" opacity={0.07} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 80 }}>
        <div className="kicker">// ERRO · PÁGINA NÃO ENCONTRADA</div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(8rem, 22vw, 18rem)',
          lineHeight: 0.85,
          color: 'var(--red)',
          margin: '12px 0 0',
          letterSpacing: '-0.04em',
        }}>
          404
        </h1>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 6vw, 5rem)',
          color: 'var(--off-white)',
          lineHeight: 0.9,
          margin: '8px 0 28px',
          textTransform: 'uppercase',
        }}>
          ESSA PÁGINA<br />
          <span style={{ color: 'var(--red)' }}>NÃO EXISTE</span>
        </h2>

        <p style={{ maxWidth: '48ch', color: 'var(--text-body)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 36 }}>
          O link que você tentou acessar não existe ou foi movido.
          Pode ser que a URL esteja errada ou a página foi removida.
        </p>

        <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 36, padding: '10px 14px', background: 'var(--panel)', border: '1px solid var(--line)', display: 'inline-block' }}>
          // {location.pathname}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Btn variant="red" arrow onClick={() => navigate('/')}>Voltar ao início</Btn>
          <Btn variant="ghost" onClick={() => navigate(-1)}>← Página anterior</Btn>
        </div>
      </div>
    </div>
  );
}
