/**
 * useSessionTimeout.js — Auto-logout por inatividade do usuário.
 *
 * Monitora eventos de atividade (mouse, teclado, scroll, touch) e dispara:
 *  - onWarning() quando restar 5 minutos para o timeout
 *  - onTimeout() quando o tempo de inatividade for atingido
 *
 * Não roda para usuários não autenticados.
 */

import { useEffect, useRef, useCallback } from 'react';

const EVENTS = ['mousedown', 'keypress', 'scroll', 'touchstart', 'mousemove'];
const WARNING_BEFORE_MS = 5 * 60 * 1000; // avisa 5 minutos antes

/**
 * @param {object} options
 * @param {boolean} options.isAuthenticated   - Se false, o hook não faz nada
 * @param {number}  [options.timeoutMs]       - Inatividade em ms (default: 30min)
 * @param {Function} options.onTimeout        - Chamado quando expira
 * @param {Function} [options.onWarning]      - Chamado 5 min antes de expirar
 */
export function useSessionTimeout({
  isAuthenticated,
  timeoutMs = 30 * 60 * 1000,
  onTimeout,
  onWarning,
}) {
  const timeoutRef  = useRef(null);
  const warningRef  = useRef(null);
  const warnedRef   = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current)  clearTimeout(timeoutRef.current);
    if (warningRef.current)  clearTimeout(warningRef.current);
    timeoutRef.current  = null;
    warningRef.current  = null;
    warnedRef.current   = false;
  }, []);

  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    clearTimers();
    warnedRef.current = false;

    // Agenda o aviso de "vai expirar"
    const warningDelay = timeoutMs - WARNING_BEFORE_MS;
    if (warningDelay > 0 && typeof onWarning === 'function') {
      warningRef.current = setTimeout(() => {
        if (!warnedRef.current) {
          warnedRef.current = true;
          onWarning();
        }
      }, warningDelay);
    }

    // Agenda o logout por inatividade
    timeoutRef.current = setTimeout(() => {
      if (typeof onTimeout === 'function') {
        onTimeout();
      }
    }, timeoutMs);
  }, [isAuthenticated, timeoutMs, onTimeout, onWarning, clearTimers]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    // Inicia os timers ao montar / ao autenticar
    resetTimers();

    // Reseta timers a cada evento de atividade
    const handleActivity = () => resetTimers();

    EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimers, clearTimers]);
}
