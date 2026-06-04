import { describe, it, expect, vi } from 'vitest';
import { getDaysTogether, getRelationshipProgress, getAnniversaryMessage } from '../utils/dateUtils';

describe('dateUtils', () => {
  it('deve calcular corretamente os dias juntos', () => {
    const startDate = new Date('2024-01-01');
    const currentDate = new Date('2024-01-02');
    const days = getDaysTogether(startDate, currentDate);
    expect(days).toBe(1);
  });

  it('deve calcular corretamente o progresso do relacionamento', () => {
    const startDate = new Date('2024-01-01');
    const currentDate = new Date('2024-07-01'); // 6 meses depois
    const progress = getRelationshipProgress(startDate, currentDate);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('deve retornar mensagem de aniversário correto', () => {
    const message = getAnniversaryMessage(365);
    expect(message).toContain('365');
  });

  it('deve retornar mensagem de aniversário para 1 ano', () => {
    const message = getAnniversaryMessage(365);
    expect(message).toContain('ano');
  });
});
