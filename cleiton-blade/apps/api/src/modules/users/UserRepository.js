const { query } = require('../../config/database');

/**
 * Repositório de usuários
 * Operações de banco de dados relacionadas a usuários
 */

class UserRepository {
  /**
   * Lista todos os usuários com paginação
   */
  static async findAll(offset = 0, limit = 20) {
    const sql = `
      SELECT id, name, email, role, active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      OFFSET $1 LIMIT $2
    `;

    const users = await query(sql, [offset, limit]);
    
    // Contar total sem COUNT
    const countSql = 'SELECT id FROM users';
    const countResult = await query(countSql, []);

    return {
      users: users.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Busca usuário por ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, name, email, role, active, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca usuários por role
   */
  static async findByRole(role, offset = 0, limit = 20) {
    const sql = `
      SELECT id, name, email, role, active, created_at, updated_at
      FROM users
      WHERE role = $1
      ORDER BY created_at DESC
      OFFSET $2 LIMIT $3
    `;

    const users = await query(sql, [role, offset, limit]);
    
    // Contar total sem COUNT
    const countSql = 'SELECT id FROM users WHERE role = $1';
    const countResult = await query(countSql, [role]);

    return {
      users: users.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Atualiza usuário
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(data.email);
    }

    if (typeof data.active !== 'undefined') {
      fields.push(`active = $${paramCount++}`);
      values.push(data.active ? true : false);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    await query(sql, values);
    return this.findById(id);
  }

  /**
   * Deleta usuário
   */
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1;';
    await query(sql, [id]);
  }

  /**
   * Verifica se email já existe (exceto para um ID específico)
   */
  static async emailExists(email, exceptId = null) {
    let sql = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1)';
    const params = [email];

    if (exceptId) {
      sql += ' AND id != $2';
      params.push(exceptId);
    }

    sql += ';';

    const result = await query(sql, params);
    return result.rows.length > 0;
  }
}

module.exports = UserRepository;
