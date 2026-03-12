/**
 * Utilitários gerais da aplicação
 */

/**
 * Formata resposta padrão para a API
 * @param {Object} data - Dados a retornar
 * @param {string} message - Mensagem opcional
 * @returns {Object} Resposta formatada
 */
const formatSuccess = (data, message = null) => {
  return {
    success: true,
    data,
    ...(message && { message }),
    error: null,
  };
};

/**
 * Formata resposta de erro padrão para a API
 * @param {string} message - Mensagem de erro
 * @param {string} code - Código do erro
 * @param {string} errorId - ID único do erro para tracking (opcional)
 * @returns {Object} Resposta de erro formatada
 */
const formatError = (message, code, errorId = null) => {
  return {
    success: false,
    data: null,
    error: {
      message,
      code,
      ...(errorId && { id: errorId }),
    },
  };
};

/**
 * Valida se um valor é um UUID válido
 * @param {string} uuid - UUID a validar
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida telefone (formato brasileiro)
 * @param {string} phone - Telefone a validar
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^(?:\+?55)?[\s.-]?(?:11|[1-9][0-9])[\s.-]?9?[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Sanitiza string removendo caracteres perigosos
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');
};

/**
 * Calcula hash de senha
 * @param {string} password - Senha a hashear
 * @returns {Promise<string>} Hash da senha
 */
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const config = require('../../config/env');
  return await bcrypt.hash(password, config.bcrypt.rounds);
};

/**
 * Compara senha com hash
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Extrai número de página e número de itens
 * @param {number} page - Página (1-based)
 * @param {number} pageSize - Tamanho da página
 * @returns {Object}
 */
const getPaginationParams = (page = 1, pageSize = 20) => {
  const p = Math.max(1, parseInt(page) || 1);
  const size = Math.max(1, parseInt(pageSize) || 20);
  
  return {
    page: p,
    pageSize: size,
    offset: (p - 1) * size,
    limit: size,
  };
};

/**
 * Formata resposta com paginação
 * @param {Array} items - Itens da página
 * @param {number} total - Total de itens
 * @param {number} page - Página atual
 * @param {number} pageSize - Tamanho da página
 * @returns {Object}
 */
const formatPaginatedResponse = (items, total, page, pageSize) => {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data: items,
    pagination: {
      current: page,
      total: totalPages,
      pageSize,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

/**
 * Gera um ID único aleatório
 * @returns {string}
 */
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

module.exports = {
  formatSuccess,
  formatError,
  isValidUUID,
  isValidEmail,
  isValidPhone,
  sanitizeString,
  hashPassword,
  comparePassword,
  getPaginationParams,
  formatPaginatedResponse,
  generateId,
};
