const { query } = require('../../config/database');

/**
 * Repositório de autenticação
 * Operações de banco de dados relacionadas a autenticação
 */

class AuthRepository {
  /**
   * Busca usuário por email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, name, email, password_hash, role, active, verified_at, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1);
    `;

    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Busca usuário por ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, name, email, password_hash, role, active, verified_at, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo usuário (versão ativa, sem verificação de email)
   */
  static async create(name, email, passwordHash, role = 'professional') {
    const sql = `
      INSERT INTO users (name, email, password_hash, role, active, verified_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role, active, verified_at, created_at
    `;

    const result = await query(sql, [name, email, passwordHash, role, true]);
    return result.rows[0];
  }

  /**
   * Cria novo usuário COM verified_at = NULL (requer verificação de email)
   */
  static async createUnverified(name, email, passwordHash, role = 'client') {
    const sql = `
      INSERT INTO users (name, email, password_hash, role, active, verified_at)
      VALUES ($1, $2, $3, $4, $5, NULL)
      RETURNING id, name, email, role, active, verified_at, created_at
    `;

    const result = await query(sql, [name, email, passwordHash, role, true]);
    return result.rows[0];
  }

  /**
   * Marca email como verificado
   */
  static async markEmailVerified(userId) {
    const sql = `
      UPDATE users
      SET verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, role, active, verified_at, created_at, updated_at
    `;

    const result = await query(sql, [userId]);
    return result.rows[0];
  }

  /**
   * Atualiza senha do usuário
   */
  static async updatePassword(userId, passwordHash) {
    const sql = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, password_hash, role, active, created_at, updated_at
    `;

    const result = await query(sql, [passwordHash, userId]);
    return result.rows[0];
  }

  /**
   * Verifica se email já existe
   */
  static async emailExists(email) {
    const sql = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1);';
    const result = await query(sql, [email]);
    return result.rows.length > 0;
  }
}

module.exports = AuthRepository;
