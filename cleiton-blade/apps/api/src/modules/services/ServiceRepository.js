
const { query } = require('../../config/database');

/**
 * Repositório de serviços
 * Operações de banco de dados relacionadas a serviços
 */

class ServiceRepository {
  /**
   * Lista todos os serviços
   */
  static async findAll(offset = 0, limit = 20) {
    const sql = `
      SELECT id, name, description, duration_minutes, price, active, created_at, updated_at
      FROM services
      WHERE active = true
      ORDER BY name ASC
      OFFSET $1 LIMIT $2
    `;

    const services = await query(sql, [offset, limit]);
    
    // Contar total sem COUNT
    const countSql = 'SELECT id FROM services WHERE active = true';
    const countResult = await query(countSql, []);

    return {
      services: services.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Busca serviço por ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, name, description, duration_minutes, price, active, created_at, updated_at
      FROM services
      WHERE id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca serviço por nome
   */
  static async findByName(name) {
    const sql = `
      SELECT id, name, description, duration_minutes, price, active, created_at, updated_at
      FROM services
      WHERE LOWER(name) = LOWER($1);
    `;

    const result = await query(sql, [name]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo serviço
   */
  static async create(name, durationMinutes, price, description = null) {
    const sql = `
      INSERT INTO services (name, description, duration_minutes, price, active, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, name, description, duration_minutes, price, active, created_at, updated_at;
    `;

    const result = await query(sql, [
      name,
      description,
      durationMinutes,
      price,
      true
    ]);

    return result.rows[0];
  }

  /**
   * Atualiza serviço
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (data.description) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }

    if (typeof data.durationMinutes !== 'undefined') {
      fields.push(`duration_minutes = $${paramCount++}`);
      values.push(data.durationMinutes);
    }

    if (typeof data.price !== 'undefined') {
      fields.push(`price = $${paramCount++}`);
      values.push(data.price);
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
      UPDATE services
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    await query(sql, values);
    return this.findById(id);
  }

  /**
   * Ativa/desativa serviço
   */
  static async toggleActive(id, active) {
    const sql = `
      UPDATE services
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;

    await query(sql, [active ? true : false, id]);
    return this.findById(id);
  }

  /**
   * Verifica se nome já existe
   */
  static async nameExists(name, exceptId = null) {
    let sql = 'SELECT id FROM services WHERE LOWER(name) = LOWER($1)';
    const params = [name];

    if (exceptId) {
      sql += ' AND id != $2';
      params.push(exceptId);
    }

    sql += ';';

    const result = await query(sql, params);
    return result.rows.length > 0;
  }

  /**
   * Remove serviço
   */
  static async delete(id) {
    const sql = 'DELETE FROM services WHERE id = $1;';
    await query(sql, [id]);
    return true;
  }
}

module.exports = ServiceRepository;
