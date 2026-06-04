import { useEffect } from 'react';

/**
 * Hook para gerenciar atalhos de teclado globais
 * @param {Object} shortcuts - Objeto com atalhos e callbacks
 * @param {Object} shortcuts.music - Atalhos do player de música
 * @param {Function} shortcuts.music.toggle - Toggle play/pause
 * @param {Function} shortcuts.music.next - Próxima faixa
 * @param {Function} shortcuts.music.previous - Faixa anterior
 * @param {Object} shortcuts.calendar - Atalhos do calendário
 * @param {Function} shortcuts.calendar.toggle - Toggle modal de calendário
 * @param {Object} shortcuts.settings - Atalhos de configurações
 * @param {Function} shortcuts.settings.toggle - Toggle modal de configurações
 * @param {Object} shortcuts.admin - Atalhos de admin
 * @param {Function} shortcuts.admin.toggle - Toggle modal de admin
 * @param {Object} shortcuts.travel - Atalhos de mapa de viagens
 * @param {Function} shortcuts.travel.toggle - Toggle modal de mapa
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verificar se o usuário está em um input/textarea (não disparar atalhos)
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, key } = event;
      const isModKey = ctrlKey || metaKey;

      // Atalhos do player de música
      if (shortcuts?.music) {
        // Ctrl+M: Toggle play/pause
        if (isModKey && key === 'm' && shortcuts.music.toggle) {
          event.preventDefault();
          shortcuts.music.toggle();
        }
        // Ctrl+Right Arrow: Próxima faixa
        if (isModKey && key === 'ArrowRight' && shortcuts.music.next) {
          event.preventDefault();
          shortcuts.music.next();
        }
        // Ctrl+Left Arrow: Faixa anterior
        if (isModKey && key === 'ArrowLeft' && shortcuts.music.previous) {
          event.preventDefault();
          shortcuts.music.previous();
        }
      }

      // Atalhos do calendário
      if (shortcuts?.calendar) {
        // Ctrl+C: Toggle modal de calendário
        if (isModKey && key === 'c' && shortcuts.calendar.toggle) {
          event.preventDefault();
          shortcuts.calendar.toggle();
        }
      }

      // Atalhos de configurações
      if (shortcuts?.settings) {
        // Ctrl+S: Toggle modal de configurações
        if (isModKey && key === 's' && shortcuts.settings.toggle) {
          event.preventDefault();
          shortcuts.settings.toggle();
        }
      }

      // Atalhos de admin
      if (shortcuts?.admin) {
        // Ctrl+A: Toggle modal de admin
        if (isModKey && key === 'a' && shortcuts.admin.toggle) {
          event.preventDefault();
          shortcuts.admin.toggle();
        }
      }

      // Atalhos de mapa de viagens
      if (shortcuts?.travel) {
        // Ctrl+T: Toggle modal de mapa
        if (isModKey && key === 't' && shortcuts.travel.toggle) {
          event.preventDefault();
          shortcuts.travel.toggle();
        }
      }

      // Atalhos gerais
      // Escape: Fechar modais
      if (key === 'Escape' && shortcuts?.close) {
        event.preventDefault();
        shortcuts.close();
      }

      // Ctrl+K: Focar na busca
      if (isModKey && key === 'k' && shortcuts?.search) {
        event.preventDefault();
        shortcuts.search();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

/**
 * Hook simplificado para atalhos de teclado
 * @param {string} key - Tecla ou combinação de teclas
 * @param {Function} callback - Função a ser executada
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.ctrl - Requer Ctrl/Cmd
 * @param {boolean} options.shift - Requer Shift
 * @param {boolean} options.alt - Requer Alt
 */
export const useKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrl = false, shift = false, alt = false } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Verificar se o usuário está em um input/textarea
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        return;
      }

      const isModKey = event.ctrlKey || event.metaKey;
      const isShiftKey = event.shiftKey;
      const isAltKey = event.altKey;

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isModKey === ctrl &&
        isShiftKey === shift &&
        isAltKey === alt
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrl, shift, alt]);
};
