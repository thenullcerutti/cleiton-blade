/**
 * Utilitários para JWT
 * 
 * Gera e valida tokens JWT para autenticação
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

/**
 * Gera um JWT token
 * @param {object} payload - Dados a serem codificados (user_id, email, role, etc)
 * @returns {string} Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
};

/**
 * Valida um JWT token
 * @param {string} token - Token a ser validado
 * @returns {object|null} Payload decodificado ou null se inválido
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Extrai o token do header Authorization
 * @param {string} authHeader - Header "Authorization: Bearer <token>"
 * @returns {string|null} Token ou null
 */
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
