/**
 * Migration: Add birth_date to clients table
 * Adiciona campo de data de nascimento à tabela de clientes
 */

const sql = `
  ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS birth_date DATE;
`;

module.exports = {
  up: sql,
  name: '010_add_birth_date_to_clients',
};
