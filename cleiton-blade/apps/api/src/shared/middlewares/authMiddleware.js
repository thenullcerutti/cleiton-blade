/**
 * Middleware de Autenticação
 * 
 * Valida JWT tokens e adiciona user info ao request
 */

const { extractToken, verifyToken } = require('../../shared/utils/jwt');

/**
 * Middleware que valida JWT
 * Se válido, adiciona decoded token a req.user
 * Se inválido, continua mesmo assim (permite rotas públicas)
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      req.isAuthenticated = true;
    }
  }

  next();
};

/**
 * Middleware que REQUER autenticação
 * Retorna 401 se não houver token válido
 */
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization token required'
    });
  }
  next();
};

/**
 * Middleware de autenticação requerida (alias para requireAuth)
 * Usado em rotas que precisam de autenticação
 */
const authenticate = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação requerida',
      error: 'UNAUTHORIZED'
    });
  }
  next();
};

/**
 * Middleware de autorização baseado em roles
 * @param {string[]} allowedRoles - Array de roles permitidos (e.g. ['admin', 'professional'])
 * @returns {Function} Middleware que valida a role do usuário
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação requerida',
        error: 'UNAUTHORIZED'
      });
    }

    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Role não encontrado no token',
        error: 'FORBIDDEN'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Roles permitidas: ${allowedRoles.join(', ')}`,
        error: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireAuth,
  authenticate,
  authorize
};
