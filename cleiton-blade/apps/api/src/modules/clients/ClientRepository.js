const { query } = require('../../config/database');

/**
 * Repositório de clientes
 * Operações de banco de dados relacionadas a clientes
 */

class ClientRepository {
  /**
   * Lista todos os clientes
   */
  static async findAll(offset = 0, limit = 20) {
    const sql = `
      SELECT id, name, phone, email, birth_date, loyalty_points, blocked, created_at, updated_at
      FROM clients
      WHERE blocked = false
      ORDER BY created_at DESC
      OFFSET $1 LIMIT $2
    `;

    const clients = await query(sql, [offset, limit]);
    
    // Contar total sem COUNT
    const countSql = 'SELECT id FROM clients WHERE blocked = false';
    const countResult = await query(countSql);

    return {
      clients: clients.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Busca cliente por ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, name, phone, email, birth_date, loyalty_points, blocked, created_at, updated_at
      FROM clients
      WHERE id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca cliente por telefone
   */
  static async findByPhone(phone) {
    const sql = `
      SELECT id, name, phone, email, birth_date, loyalty_points, blocked, created_at, updated_at
      FROM clients
      WHERE phone = $1;
    `;

    const result = await query(sql, [phone]);
    return result.rows[0] || null;
  }

  /**
   * Busca cliente por email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT id, name, phone, email, birth_date, loyalty_points, blocked, created_at, updated_at
      FROM clients
      WHERE LOWER(email) = LOWER($1);
    `;

    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo cliente
   */
  static async create(name, phone, email = null, birthDate = null) {
    const sql = `
      INSERT INTO clients (name, phone, email, birth_date, loyalty_points, blocked, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, name, phone, email, birth_date, loyalty_points, blocked, created_at, updated_at;
    `;

    const result = await query(sql, [
      name,
      phone,
      email,
      birthDate,
      0,
      false
    ]);

    return result.rows[0];
  }

  /**
   * Atualiza cliente
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

    if (data.birthDate) {
      fields.push(`birth_date = $${paramCount++}`);
      values.push(data.birthDate);
    }

    if (typeof data.loyaltyPoints !== 'undefined') {
      fields.push(`loyalty_points = $${paramCount++}`);
      values.push(data.loyaltyPoints);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE clients
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    await query(sql, values);
    return this.findById(id);
  }

  /**
   * Toggle bloqueio de cliente
   */
  static async toggleBlocked(id, blocked) {
    const sql = `
      UPDATE clients
      SET blocked = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;

    await query(sql, [blocked ? true : false, id]);
    return this.findById(id);
  }

  /**
   * Adiciona pontos de lealdade
   */
  static async addLoyaltyPoints(id, points) {
    const sql = `
      UPDATE clients
      SET loyalty_points = loyalty_points + $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;

    await query(sql, [points, id]);
    return this.findById(id);
  }

  /**
   * Verifica se telefone já existe
   */
  static async phoneExists(phone, exceptId = null) {
    let sql = 'SELECT id FROM clients WHERE phone = $1';
    const params = [phone];

    if (exceptId) {
      sql += ' AND id != $2';
      params.push(exceptId);
    }

    sql += ';';

    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  /**
   * Verifica se email já existe
   */
  static async emailExists(email, exceptId = null) {
    let sql = 'SELECT id FROM clients WHERE LOWER(email) = LOWER($1)';
    const params = [email];

    if (exceptId) {
      sql += ' AND id != $2';
      params.push(exceptId);
    }

    sql += ';';

    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  /**
   * Deleta cliente
   */
  static async delete(id) {
    const sql = 'DELETE FROM clients WHERE id = $1;';
    await query(sql, [id]);
    return true;
  }
}

module.exports = ClientRepository;
