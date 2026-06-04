import { describe, it, expect } from 'vitest';
import { hasRole, hasAnyRole, hasAllRoles } from '../services/roleService';

describe('roleService', () => {
  it('deve retornar true quando o usuário tem a role especificada', () => {
    const user = { role: 'admin' };
    expect(hasRole(user, 'admin')).toBe(true);
  });

  it('deve retornar false quando o usuário não tem a role especificada', () => {
    const user = { role: 'user' };
    expect(hasRole(user, 'admin')).toBe(false);
  });

  it('deve retornar false quando o usuário não tem role', () => {
    const user = {};
    expect(hasRole(user, 'admin')).toBe(false);
  });

  it('deve retornar true quando o usuário tem pelo menos uma das roles especificadas', () => {
    const user = { role: 'admin' };
    expect(hasAnyRole(user, ['admin', 'raissa'])).toBe(true);
  });

  it('deve retornar false quando o usuário não tem nenhuma das roles especificadas', () => {
    const user = { role: 'user' };
    expect(hasAnyRole(user, ['admin', 'raissa'])).toBe(false);
  });

  it('deve retornar true quando o usuário tem todas as roles especificadas', () => {
    const user = { roles: ['admin', 'user'] };
    expect(hasAllRoles(user, ['admin', 'user'])).toBe(true);
  });

  it('deve retornar false quando o usuário não tem todas as roles especificadas', () => {
    const user = { roles: ['admin'] };
    expect(hasAllRoles(user, ['admin', 'user'])).toBe(false);
  });
});
