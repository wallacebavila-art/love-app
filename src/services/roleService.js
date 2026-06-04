import { ADMIN_EMAILS, RAISSA_EMAILS } from '../constants/appConfig';

/**
 * Tipos de usuário disponíveis
 */
export const USER_TYPES = {
  ADMIN: 'admin',
  RAISSA: 'raissa',
  USER: 'user',
  GUEST: 'guest'
};

/**
 * Determina o tipo de usuário baseado no email
 * @param {string|null} email - Email do usuário
 * @returns {string} Tipo de usuário (admin, raissa, user, guest)
 */
export const getUserRole = (email) => {
  if (!email) return USER_TYPES.GUEST;
  
  const emailLower = email.toLowerCase();
  
  if (ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === emailLower)) {
    return USER_TYPES.ADMIN;
  }
  
  if (RAISSA_EMAILS.some(raissaEmail => raissaEmail.toLowerCase() === emailLower)) {
    return USER_TYPES.RAISSA;
  }
  
  return USER_TYPES.USER;
};

/**
 * Verifica se o usuário é admin
 * @param {string|null} email - Email do usuário
 * @returns {boolean} True se for admin
 */
export const isAdmin = (email) => {
  return getUserRole(email) === USER_TYPES.ADMIN;
};

/**
 * Verifica se o usuário é Raíssa
 * @param {string|null} email - Email do usuário
 * @returns {boolean} True se for Raíssa
 */
export const isRaissa = (email) => {
  return getUserRole(email) === USER_TYPES.RAISSA;
};

/**
 * Verifica se o usuário tem permissão de admin (admin ou Raíssa)
 * @param {string|null} email - Email do usuário
 * @returns {boolean} True se tiver permissão de admin
 */
export const hasAdminPermission = (email) => {
  const role = getUserRole(email);
  return role === USER_TYPES.ADMIN || role === USER_TYPES.RAISSA;
};

/**
 * Cria objeto de usuário com flags de permissão
 * @param {Object} firebaseUser - Objeto de usuário do Firebase
 * @returns {Object} Objeto de usuário com permissões
 */
export const createUserWithPermissions = (firebaseUser) => {
  if (!firebaseUser) return null;
  
  const role = getUserRole(firebaseUser.email);
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    isAdmin: role === USER_TYPES.ADMIN,
    isRaissa: role === USER_TYPES.RAISSA,
    userType: role,
    hasAdminPermission: hasAdminPermission(firebaseUser.email)
  };
};
