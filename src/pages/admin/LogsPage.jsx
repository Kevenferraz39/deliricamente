/**
 * LogsPage.jsx — Visualizador de audit logs para o admin master.
 * Exibe logs da coleção `logs` com filtros, paginação e exportação CSV.
 * Só renderiza se user.isMaster.
 */

import React from 'react';
import { db } from '../../firebase.js';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { useApp } from '../../context/AppContext';

// ── Cores por severidade ──────────────────────────────────────────────────
const SEVERITY_STYLES = {
  info:     { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.4)',  color: '#22c55e',  label: 'INFO'     },
  warn:     { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', color: '#f59e0b',  label: 'AVISO'    },
  error:    { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)', color: '#f97316',  label: 'ERRO'     },
  critical: { bg: 'rgba(225,6,0,0.14)',    border: 'rgba(225,6,0,0.5)',    color: 'var(--red)', label: 'CRÍTICO' },
};

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
  return (
    <span className="mono" style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: '0.65rem',
      fontWeight: 700,
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

function formatTs(ts) {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  if (isNaN(date)) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function ExpandableDetails({ data }) {
  const [open, setOpen] = React.useState(false);
  const str = data ? JSON.stringify(data, null, 2) : null;
  if (!str || str === '{}') return <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>—</span>;

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="mono"
        style={{
          background: 'transparent', border: '1px solid var(--gray)',
          color: 'var(--muted)', cursor: 'pointer', padding: '2px 8px',
          fontSize: '0.65rem', transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--off-white)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        {open ? 'RECOLHER ▲' : 'VER DETALHES ▼'}
      </button>
      {open && (
        <pre style={{
          marginTop: 6, padding: '8px 12px', background: 'var(--black)',
          border: '1px solid var(--line)', color: 'var(--paper)',
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem', overflowX: 'auto',
          maxWidth: '100%', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {str}
        </pre>
      )}
    </div>
  );
}

// ── Exportação CSV ────────────────────────────────────────────────────────
function exportCsv(logs) {
  const headers = ['Timestamp', 'Severidade', 'Acao', 'Mensagem', 'Usuário Email', 'Usuario ID', 'Session ID'];
  const rows = logs.map(l => [
    formatTs(l.timestamp),
    l.severity || 'info',
    l.action || '',
    l.message || '',
    l.userEmail || '',
    l.userId || '',
    l.sessionId || '',
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Componente principal ──────────────────────────────────────────────────
export default function LogsPage() {
  const { user } = useApp();

  // Só o master pode ver esta página
  if (!user?.isMaster) return null;

  const [logs, setLogs]             = React.useState([]);
  const [loading, setLoading]       = React.useState(true);
  const [filterAction, setFilterAction] = React.useState('');
  const [filterSeverity, setFilterSev]  = React.useState('');
  const [filterEmail, setFilterEmail]   = React.useState('');
  const [filterDate, setFilterDate]     = React.useState('');
  const [lastRefresh, setLastRefresh]   = React.useState(new Date());

  // Busca logs em tempo real com auto-refresh a cada 30 segundos
  React.useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(200));
    const unsub = onSnapshot(q, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLastRefresh(new Date());
      setLoading(false);
    }, () => setLoading(false));

    // Auto-refresh: forçar re-subscribe a cada 30s
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30_000);

    return () => { unsub(); clearInterval(interval); };
  }, []);

  // Listas de valores únicos para os filtros
  const uniqueActions = React.useMemo(
    () => [...new Set(logs.map(l => l.action).filter(Boolean))].sort(),
    [logs]
  );

  // Logs filtrados
  const filtered = React.useMemo(() => logs.filter(l => {
    if (filterAction && l.action !== filterAction) return false;
    if (filterSeverity && l.severity !== filterSeverity) return false;
    if (filterEmail && !(l.userEmail || '').toLowerCase().includes(filterEmail.toLowerCase())) return false;
    if (filterDate) {
      const ts = l.timestamp?.toDate ? l.timestamp.toDate() : new Date(l.timestamp);
      if (isNaN(ts)) return false;
      const dateStr = ts.toISOString().slice(0, 10);
      if (dateStr !== filterDate) return false;
    }
    return true;
  }), [logs, filterAction, filterSeverity, filterEmail, filterDate]);

  const clearFilters = () => {
    setFilterAction(''); setFilterSev(''); setFilterEmail(''); setFilterDate('');
  };

  const hasFilters = filterAction || filterSeverity || filterEmail || filterDate;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="admin-head">
        <div>
          <div className="kicker">// SEGURANÇA · APENAS MASTER</div>
          <h1>Logs de Auditoria</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}
          </span>
          <button
            className="logout"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            EXPORTAR CSV ({filtered.length})
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
        padding: '16px 20px', background: 'var(--panel)', border: '1px solid var(--line)',
        marginBottom: 16,
      }}>
        <div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>TIPO DE AÇÃO</div>
          <select
            className="input"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', minWidth: 180 }}
          >
            <option value="">Todas as ações</option>
            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>SEVERIDADE</div>
          <select
            className="input"
            value={filterSeverity}
            onChange={e => setFilterSev(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', minWidth: 130 }}
          >
            <option value="">Todas</option>
            <option value="info">Info</option>
            <option value="warn">Aviso</option>
            <option value="error">Erro</option>
            <option value="critical">Crítico</option>
          </select>
        </div>

        <div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>E-MAIL DO USUÁRIO</div>
          <input
            className="input"
            type="text"
            placeholder="Buscar por e-mail..."
            value={filterEmail}
            onChange={e => setFilterEmail(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', minWidth: 200 }}
          />
        </div>

        <div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: 4 }}>DATA</div>
          <input
            className="input"
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
          />
        </div>

        {hasFilters && (
          <button
            className="logout"
            onClick={clearFilters}
            style={{ alignSelf: 'flex-end' }}
          >
            LIMPAR FILTROS
          </button>
        )}
      </div>

      {/* Contagem */}
      <div className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12, paddingLeft: 4 }}>
        Exibindo <b style={{ color: 'var(--off-white)' }}>{filtered.length}</b> de <b style={{ color: 'var(--off-white)' }}>{logs.length}</b> registros
        {hasFilters && <span style={{ color: 'var(--red)' }}> (filtros ativos)</span>}
      </div>

      {/* Tabela */}
      <div className="admin-table">
        {/* Cabeçalho */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '160px 80px 180px 1fr 160px 120px',
          gap: 12,
          padding: '10px 20px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--black)',
        }}>
          {['TIMESTAMP', 'SEV.', 'AÇÃO', 'MENSAGEM / DETALHES', 'USUÁRIO', 'SESSION'].map(h => (
            <span key={h} className="mono" style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700 }}>{h}</span>
          ))}
        </div>

        {loading && (
          <div style={{ padding: '3rem', textAlign: 'center' }} className="mono">
            <span style={{ color: 'var(--muted)' }}>Carregando logs...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center' }} className="mono">
            <span style={{ color: 'var(--muted)' }}>
              {hasFilters ? '// Nenhum log encontrado com esses filtros.' : '// Nenhum log registrado ainda.'}
            </span>
          </div>
        )}

        {filtered.map((log, i) => (
          <div
            key={log.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 80px 180px 1fr 160px 120px',
              gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid var(--line)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
              alignItems: 'start',
            }}
          >
            {/* Timestamp */}
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {formatTs(log.timestamp)}
            </span>

            {/* Severidade */}
            <div><SeverityBadge severity={log.severity} /></div>

            {/* Ação */}
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--red)', wordBreak: 'break-all' }}>
              {log.action || '—'}
            </span>

            {/* Mensagem + detalhes */}
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--off-white)', marginBottom: 6, lineHeight: 1.4 }}>
                {log.message || log.action}
              </div>
              <ExpandableDetails data={log.data} />
            </div>

            {/* Usuário */}
            <div>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--paper)', wordBreak: 'break-all' }}>
                {log.userEmail || <span style={{ color: 'var(--muted)' }}>anônimo</span>}
              </div>
              {log.userRole && (
                <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', marginTop: 2 }}>
                  {log.userRole.toUpperCase()}
                </div>
              )}
            </div>

            {/* Session ID */}
            <span className="mono" style={{ fontSize: '0.62rem', color: 'var(--muted)', wordBreak: 'break-all' }}>
              {log.sessionId ? log.sessionId.slice(0, 10) + '…' : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
