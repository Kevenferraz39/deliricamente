import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Splatter, Btn } from '../components';

const ERRORS = {
  // ── 4xx — Erro do cliente ──────────────────────────────────
  400: {
    name: 'Bad Request',
    label: 'Requisição Inválida',
    category: '4xx',
    color: '#f59e0b',
    desc: 'O servidor não entendeu a requisição. A sintaxe está incorreta, algum dado obrigatório está faltando ou o formato enviado é inválido.',
    tip: 'Verifique os dados e tente novamente.',
  },
  401: {
    name: 'Unauthorized',
    label: 'Não Autorizado',
    category: '4xx',
    color: '#f59e0b',
    desc: 'A requisição exige autenticação. Você precisa fazer login ou fornecer credenciais válidas para acessar este recurso.',
    tip: 'Faça login e tente novamente.',
  },
  403: {
    name: 'Forbidden',
    label: 'Proibido',
    category: '4xx',
    color: '#ef4444',
    desc: 'O servidor entendeu o pedido, mas você não tem permissão de acesso. Diferente do 401, aqui sua identidade é conhecida — mas seu nível de acesso é insuficiente.',
    tip: 'Solicite acesso ao administrador.',
  },
  404: {
    name: 'Not Found',
    label: 'Não Encontrado',
    category: '4xx',
    color: '#ef4444',
    desc: 'O endpoint, página ou recurso que você procura não existe no servidor. A URL pode estar errada ou o conteúdo foi removido.',
    tip: 'Verifique a URL ou volte ao início.',
  },
  405: {
    name: 'Method Not Allowed',
    label: 'Método Não Permitido',
    category: '4xx',
    color: '#f59e0b',
    desc: 'O endpoint existe, mas o método HTTP utilizado não é permitido. Por exemplo: tentar um POST em uma rota que só aceita GET.',
    tip: 'Verifique o método HTTP correto para este endpoint.',
  },
  408: {
    name: 'Request Timeout',
    label: 'Tempo Limite da Requisição',
    category: '4xx',
    color: '#f59e0b',
    desc: 'O cliente demorou muito para enviar a requisição completa e o servidor encerrou a conexão por tempo limite.',
    tip: 'Verifique sua conexão e tente novamente.',
  },
  429: {
    name: 'Too Many Requests',
    label: 'Excesso de Requisições',
    category: '4xx',
    color: '#f59e0b',
    desc: 'Você ultrapassou o limite de requisições permitidas em um determinado período (rate limit). O servidor está te freando para proteger o sistema.',
    tip: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  // ── 5xx — Erro do servidor ─────────────────────────────────
  500: {
    name: 'Internal Server Error',
    label: 'Erro Interno do Servidor',
    category: '5xx',
    color: '#ef4444',
    desc: 'Ocorreu uma falha inesperada no código ou na infraestrutura do servidor. Você fez tudo certo — o problema está no sistema.',
    tip: 'Tente novamente em instantes. Se persistir, contate o suporte.',
  },
  502: {
    name: 'Bad Gateway',
    label: 'Gateway Inválido',
    category: '5xx',
    color: '#ef4444',
    desc: 'O servidor intermediário (proxy ou load balancer) recebeu uma resposta inválida ou vazia de outro servidor ao tentar repassar o pedido.',
    tip: 'Aguarde e tente novamente. Pode ser instabilidade temporária.',
  },
  503: {
    name: 'Service Unavailable',
    label: 'Serviço Indisponível',
    category: '5xx',
    color: '#ef4444',
    desc: 'O servidor não pode processar a requisição no momento — está sobrecarregado ou em manutenção. O serviço ficará disponível em breve.',
    tip: 'Aguarde alguns minutos e tente novamente.',
  },
  504: {
    name: 'Gateway Timeout',
    label: 'Tempo Limite do Gateway',
    category: '5xx',
    color: '#ef4444',
    desc: 'O servidor intermediário não recebeu uma resposta a tempo do servidor principal (upstream). A operação excedeu o tempo limite configurado.',
    tip: 'Tente novamente. Se o problema persistir, verifique o status do serviço.',
  },
};

const ALL_CODES = Object.keys(ERRORS).map(Number);

export default function ErrorPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const num = parseInt(code, 10);
  const error = ERRORS[num];

  // Código desconhecido — mostra lista de todos
  if (!error) {
    return (
      <div className="page-enter">
        <section className="section tight" style={{ paddingTop: 112, paddingBottom: 80 }}>
          <div className="wrap">
            <div className="kicker">// CÓDIGOS DE RESPOSTA HTTP</div>
            <h1 style={{ fontSize: 'clamp(2.5rem,6vw,5rem)', margin: '8px 0 40px', lineHeight: 0.9 }}>
              REFERÊNCIA<br /><span style={{ color: 'var(--red)' }}>DE ERROS</span>
            </h1>

            {[['4xx — Erro do Cliente', '#f59e0b'], ['5xx — Erro do Servidor', '#ef4444']].map(([title, color]) => (
              <div key={title} style={{ marginBottom: 40 }}>
                <div className="mono" style={{ color, fontSize: '0.8rem', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                  // {title}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                  {ALL_CODES.filter(c => ERRORS[c].category === title.slice(0, 3)).map(c => (
                    <div key={c}
                      style={{ background: 'var(--panel)', border: '1px solid var(--line)', padding: '14px 16px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                      onClick={() => navigate('/error/' + c)}
                      onMouseEnter={e => e.currentTarget.style.borderColor = ERRORS[c].color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                    >
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: ERRORS[c].color, lineHeight: 1 }}>{c}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', textTransform: 'uppercase', marginTop: 4 }}>{ERRORS[c].label}</div>
                      <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 4 }}>{ERRORS[c].name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Btn variant="ghost" arrow onClick={() => navigate('/')}>Voltar ao início</Btn>
          </div>
        </section>
      </div>
    );
  }

  const is5xx = error.category === '5xx';

  return (
    <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <Splatter color={error.color} opacity={0.05} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 112, paddingBottom: 80 }}>

        {/* Badge de categoria */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: is5xx ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${error.color}33`,
          padding: '4px 12px', marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: error.color, display: 'inline-block' }} />
          <span className="mono" style={{ fontSize: '0.7rem', color: error.color, textTransform: 'uppercase' }}>
            {error.category} · {is5xx ? 'Erro do Servidor' : 'Erro do Cliente'}
          </span>
        </div>

        {/* Código */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(7rem,20vw,16rem)',
          lineHeight: 0.85,
          color: error.color,
          margin: '0 0 4px',
          letterSpacing: '-0.04em',
        }}>
          {num}
        </div>

        {/* Nome */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem,4vw,3.5rem)',
          color: 'var(--off-white)',
          textTransform: 'uppercase',
          lineHeight: 0.95,
          margin: '8px 0 32px',
        }}>
          {error.label}<br />
          <span className="mono" style={{ fontSize: '0.5em', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            HTTP {num} · {error.name}
          </span>
        </h1>

        {/* Descrição */}
        <p style={{ maxWidth: '56ch', color: 'var(--text-body)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 20 }}>
          {error.desc}
        </p>

        {/* Dica */}
        <div style={{
          display: 'inline-flex', alignItems: 'flex-start', gap: 10,
          background: 'var(--panel)', border: '1px solid var(--line)',
          padding: '12px 16px', marginBottom: 36, maxWidth: '52ch',
        }}>
          <span className="mono" style={{ color: error.color, fontSize: '0.75rem', flexShrink: 0 }}>→</span>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--off-white)', lineHeight: 1.5 }}>{error.tip}</span>
        </div>

        {/* Navegação entre erros */}
        <div style={{ marginBottom: 32 }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 10 }}>// OUTROS CÓDIGOS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_CODES.filter(c => c !== num).map(c => (
              <button key={c}
                onClick={() => navigate('/error/' + c)}
                style={{
                  background: 'transparent', border: `1px solid ${num === c ? ERRORS[c].color : 'var(--gray)'}`,
                  color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = ERRORS[c].color; e.currentTarget.style.color = ERRORS[c].color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray)'; e.currentTarget.style.color = 'var(--muted)'; }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Btn variant="red" arrow onClick={() => navigate('/')}>Voltar ao início</Btn>
          <Btn variant="ghost" onClick={() => navigate(-1)}>← Página anterior</Btn>
        </div>
      </div>
    </div>
  );
}
