import { useCallback } from 'react';

/**
 * Hook para haptic feedback em dispositivos móveis
 * Suporta Vibration API para Android e iOS
 */
export const useHapticFeedback = () => {
  /**
   * Verifica se o dispositivo suporta haptic feedback
   */
  const isSupported = useCallback(() => {
    return 'vibrate' in navigator;
  }, []);

  /**
   * Feedback de impacto leve (toque suave)
   */
  const light = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(10);
    }
  }, [isSupported]);

  /**
   * Feedback de impacto médio (toque padrão)
   */
  const medium = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(25);
    }
  }, [isSupported]);

  /**
   * Feedback de impacto forte (toque forte)
   */
  const heavy = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(50);
    }
  }, [isSupported]);

  /**
   * Feedback de sucesso (padrão curto-curto)
   */
  const success = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([10, 50, 10]);
    }
  }, [isSupported]);

  /**
   * Feedback de erro (padrão longo)
   */
  const error = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }, [isSupported]);

  /**
   * Feedback de aviso (padrão médio)
   */
  const warning = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([30, 20, 30]);
    }
  }, [isSupported]);

  /**
   * Feedback de seleção (toque muito curto)
   */
  const selection = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(5);
    }
  }, [isSupported]);

  /**
   * Feedback customizado com padrão específico
   * @param {number|Array<number>} pattern - Padrão de vibração em ms
   */
  const custom = useCallback((pattern) => {
    if (isSupported()) {
      navigator.vibrate(pattern);
    }
  }, [isSupported]);

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    selection,
    custom
  };
};

export default useHapticFeedback;
