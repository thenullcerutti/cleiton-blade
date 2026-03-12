const { createClient } = require('@supabase/supabase-js');

/**
 * Cliente Supabase REST API
 * Conecta via HTTPS (porta 443) - Funciona em qualquer rede!
 * 
 * ⚠️  Se SUPABASE_SERVICE_ROLE_KEY estiver definida, ela será usada para fazer bypass de RLS
 * Caso contrário, usa SUPABASE_ANON_KEY (requer policies públicas)
 * 
 * 🔑 Credenciais vêm de:
 *   1. Variáveis de ambiente do Windows (PRIORIDADE MÁXIMA)
 *   2. Arquivo .env
 *   3. Valores padrão (apenas para desenvolvimento)
 */

// Obter URL do Supabase de variáveis de ambiente ou .env
const supabaseUrl = process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co';

// Preferir Service Role Key (admin) se disponível, senão usar Anon Key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;
const supabaseKey = serviceRoleKey || anonKey;

const isServiceRole = !!serviceRoleKey;

// Validação básica
if (!supabaseUrl || supabaseUrl.includes('seu-projeto')) {
  console.error('❌ ERRO CRÍTICO: SUPABASE_URL não configurada!');
  console.error('📖 Veja ENV_SETUP_WINDOWS.md para instruções');
  console.error(`   SUPABASE_URL = ${supabaseUrl}`);
}

if (!supabaseKey || supabaseKey.includes('your_') || supabaseKey.includes('your-')) {
  console.error('❌ ERRO CRÍTICO: Chaves do Supabase não configuradas!');
  console.error('📖 Veja ENV_SETUP_WINDOWS.md para instruções');
  console.error(`   SUPABASE_SERVICE_ROLE_KEY = ${serviceRoleKey ? '***' : 'NÃO DEFINIDA'}`);
  console.error(`   SUPABASE_ANON_KEY = ${anonKey ? '***' : 'NÃO DEFINIDA'}`);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log('✅ Supabase REST API inicializado');
console.log(`🌐 URL: ${supabaseUrl}`);
console.log(`🔑 Modo: ${isServiceRole ? '🔴 SERVICE ROLE (Admin - faz bypass de RLS)' : '🟢 ANON KEY (requer policies públicas)'}`);
console.log(`📝 Chaves obtidas de: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY (Windows env)' : process.env.SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY (Windows env)' : '.env arquivo'}`);

/**
 * Parser robusto para queries SQL → Supabase
 * Suporta: SELECT, INSERT, UPDATE, DELETE, COUNT, JOINs
 */
const query = async (sql, values = []) => {
  try {
    // Remove comentários SQL:
    // 1. Comentários de linha (-- comentário)
    // 2. Comentários inline apos semicolon (comando; -- comentário)
    let cleanSql = sql
      .split('\n')
      .map(line => {
        // Remove inline comments (-- comentário no final)
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .filter(line => line.trim() !== '')
      .join('\n')
      .trim();

    // Split por `;` para processar múltiplas statements
    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let allResults = [];

    for (const stmt of statements) {
      let result;

      // CREATE POLICY / DROP POLICY - tentar processar
      if (stmt.match(/^\s*(CREATE|DROP)\s+POLICY/i)) {
        console.log(`⚠️  Policy statement encontrado (requer SQL Editor manual):`);
        console.log(`   ${stmt.substring(0, 80)}...`);
        // Pular pois REST API não suporta DDL
        result = {
          rows: [],
          rowCount: 0,
          command: 'POLICY_SKIPPED'
        };
      }
      // DDL statements (CREATE TABLE, ALTER TABLE, DROP) - pular
      else if (stmt.match(/^\s*(CREATE|ALTER|DROP)\s+(TABLE|INDEX|VIEW|FUNCTION|SCHEMA|DOMAIN|TYPE)/i)) {
        console.log(`⏭️  Pulando DDL: ${stmt.substring(0, 50)}...`);
        result = {
          rows: [],
          rowCount: 0,
          command: 'DDL_SKIPPED'
        };
      }
      // DML statements (SELECT, INSERT, UPDATE, DELETE)
      else {
        // Preprocessar SQL: substituir CURRENT_TIMESTAMP por ISO timestamp
        const now = new Date().toISOString();
        let processedSql = stmt.replace(/CURRENT_TIMESTAMP/gi, `'${now}'`);

        // Se é SELECT, usar handler específico
        if (processedSql.match(/^\s*SELECT/i)) {
          result = await handleSelect(processedSql, values);
        }

        // Se é INSERT
        else if (processedSql.match(/^\s*INSERT/i)) {
          result = await handleInsert(processedSql, values);
        }

        // Se é UPDATE
        else if (processedSql.match(/^\s*UPDATE/i)) {
          result = await handleUpdate(processedSql, values);
        }

        // Se é DELETE
        else if (processedSql.match(/^\s*DELETE/i)) {
          result = await handleDelete(processedSql, values);
        }

        else {
          throw new Error(`SQL type not supported: ${processedSql.substring(0, 50)}`);
        }
      }

      allResults.push(result);
    }

    // Retornar último resultado se múltiplas statements
    return allResults[allResults.length - 1] || { rows: [], rowCount: 0, command: 'SUCCESS' };
  } catch (error) {
    // Log melhorado com detalhes do erro
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.status,
      hint: error.hint,
      details: error.details,
      timestamp: new Date().toISOString(),
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
    };
    
    console.error('❌ ERRO NA QUERY DO BANCO');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('📌 Mensagem:', error.message);
    console.error('📌 Código:', error.code || 'N/A');
    console.error('📌 Status HTTP:', error.status || 'N/A');
    console.error('📌 SQL:', sql.substring(0, 150) + (sql.length > 150 ? '...' : ''));
    
    if (error.hint) console.error('💡 Sugestão:', error.hint);
    if (error.details) console.error('📋 Detalhes:', error.details);
    if (error.code === 'PGRST000') console.error('⚠️  Erro de RLS: Verifique permissões do usuário');
    if (error.code === 'PGRST116') console.error('⚠️  Erro de RLS: Chave de API sem permissão');
    if (error.message.includes('fetch')) console.error('⚠️  Erro de conexão: Verifique SUPABASE_URL e credenciais');
    
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    throw error;
  }
};

/**
 * Handler para SELECT queries
 */
const handleSelect = async (sql, values = []) => {
  // Extrair nome da tabela
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch) throw new Error('No table found in SELECT');

  const [, table] = tableMatch;
  let query_obj = supabase.from(table).select('*');

  // Parse WHERE
  const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+ORDER|\s+LIMIT|\s+OFFSET|GROUP|;|$)/i);
  if (whereMatch) {
    let whereClause = whereMatch[1].trim();
    
    // Substituir $1, $2, etc pelos values
    let paramIndex = 1;
    while (whereClause.includes(`$${paramIndex}`) && paramIndex <= values.length) {
      const value = values[paramIndex - 1];
      const escapedValue = typeof value === 'string' 
        ? `'${value.replace(/'/g, "''")}'` 
        : value;
      whereClause = whereClause.replace(`$${paramIndex}`, escapedValue);
      paramIndex++;
    }
    
    // Pattern: active = true
    const eqLiteralMatch = whereClause.match(/(\w+)\s*=\s*(true|false)/i);
    if (eqLiteralMatch) {
      const [, col, val] = eqLiteralMatch;
      query_obj = query_obj.eq(col, val.toLowerCase() === 'true');
    }
    
    // Pattern: LOWER(name) = LOWER('value')
    const ilMatch = whereClause.match(/LOWER\((\w+)\)\s*=\s*LOWER\('([^']+)'\)/i);
    if (ilMatch) {
      const [, col, val] = ilMatch;
      query_obj = query_obj.ilike(col, val);
    }
    
    // Pattern: status = 'value'
    const eqMatch = whereClause.match(/(\w+)\s*=\s*'([^']+)'/);
    if (eqMatch) {
      const [, col, val] = eqMatch;
      query_obj = query_obj.eq(col, val);
    }

    // Pattern: id != value
    const neqMatch = whereClause.match(/id\s+!=\s+(\d+)/);
    if (neqMatch) {
      const [, val] = neqMatch;
      query_obj = query_obj.neq('id', parseInt(val));
    }

    // Pattern: true AND status = 'value'
    const andMatch = whereClause.match(/AND\s+(\w+)\s*=\s*'([^']+)'/);
    if (andMatch) {
      const [, col, val] = andMatch;
      query_obj = query_obj.eq(col, val);
    }
  }

  // Parse OFFSET
  const offsetMatch = sql.match(/OFFSET\s+(\d+)/i);
  const offset = offsetMatch ? parseInt(offsetMatch[1]) : 0;

  // Parse LIMIT
  const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
  const limit = limitMatch ? parseInt(limitMatch[1]) : null;

  if (limit) {
    query_obj = query_obj.range(offset, offset + limit - 1);
  }

  // Parse ORDER BY
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch) {
    const [, col, direction] = orderMatch;
    const ascending = !direction || direction.toUpperCase() === 'ASC';
    query_obj = query_obj.order(col, { ascending });
  }

  const { data, error } = await query_obj;
  if (error) throw error;

  return {
    rows: data || [],
    rowCount: data?.length || 0,
    command: 'SELECT'
  };
};

/**
 * Handler para INSERT queries
 */
const handleInsert = async (sql, values = []) => {
  // Parse: INSERT INTO table (col1, col2, ...) VALUES ($1, $2, ...)
  const insertMatch = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
  if (!insertMatch) throw new Error('Invalid INSERT syntax');

  const [, table, colsStr, valsStr] = insertMatch;
  const cols = colsStr.split(',').map(c => c.trim());
  
  // Parse values - podem ser $1, $2 ou literais
  const valsArray = valsStr.split(',').map(v => v.trim());
  const data = {};

  cols.forEach((col, idx) => {
    let val = valsArray[idx];
    
    // Se é $1, $2, pegar do array values
    const paramMatch = val.match(/\$(\d+)/);
    if (paramMatch) {
      const paramIdx = parseInt(paramMatch[1]) - 1;
      data[col] = values[paramIdx];
    } else {
      // Literal value
      if (val.startsWith("'") && val.endsWith("'")) {
        data[col] = val.slice(1, -1);
      } else if (val === 'true') {
        data[col] = true;
      } else if (val === 'false') {
        data[col] = false;
      } else if (!isNaN(val)) {
        data[col] = Number(val);
      } else {
        data[col] = val;
      }
    }
  });

  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;

  return {
    rows: result || [],
    rowCount: result?.length || 0,
    command: 'INSERT'
  };
};

/**
 * Handler para UPDATE queries
 */
const handleUpdate = async (sql, values = []) => {
  // Parse: UPDATE table SET col1 = $1, col2 = $2 WHERE id = $3
  const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]*?)\s+WHERE\s+([\s\S]*?)(?:RETURNING|;|$)/i);
  if (!updateMatch) throw new Error('Invalid UPDATE syntax');

  const [, table, setClause, whereClause] = updateMatch;
  
  // Parse SET
  const data = {};
  const setPairs = setClause.split(',');
  let paramIndex = 1;

  setPairs.forEach(pair => {
    const [col, val] = pair.split('=').map(s => s.trim());
    
    const paramMatch = val.match(/\$(\d+)/);
    if (paramMatch) {
      const paramIdx = parseInt(paramMatch[1]) - 1;
      data[col] = values[paramIdx];
    } else {
      let cleanVal = val;
      if (val.startsWith("'") && val.endsWith("'")) {
        cleanVal = val.slice(1, -1);
      }
      data[col] = cleanVal;
    }
  });

  // Parse WHERE
  let whereMatch = whereClause.match(/(\w+)\s+IS\s+(NULL|NOT\s+NULL)/i);
  
  if (!whereMatch) {
    whereMatch = whereClause.match(/(\w+)\s*=\s*(\$\d+|\d+|'[^']+');?/);
  }
  
  if (!whereMatch) throw new Error('WHERE clause required for UPDATE');

  const [, col, val] = whereMatch;
  
  let whereVal = val;
  const paramMatch = val && val.match ? val.match(/\$(\d+)/) : null;
  if (paramMatch) {
    const paramIdx = parseInt(paramMatch[1]) - 1;
    whereVal = values[paramIdx];
  } else if (val.startsWith("'") && val.endsWith("'")) {
    whereVal = val.slice(1, -1);
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq(col, whereVal)
    .select();

  if (error) throw error;

  return {
    rows: result || [],
    rowCount: result?.length || 0,
    command: 'UPDATE'
  };
};

/**
 * Handler para DELETE queries
 */
const handleDelete = async (sql, values = []) => {
  // Parse: DELETE FROM table WHERE id = $1
  const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.*?)(?:;|$)/i);
  if (!deleteMatch) throw new Error('Invalid DELETE syntax');

  const [, table, whereClause] = deleteMatch;
  
  // Parse WHERE
  const whereMatch = whereClause.match(/(\w+)\s*=\s*(\$\d+|\d+|'[^']+');?/);
  if (!whereMatch) throw new Error('WHERE clause required for DELETE');

  const [, col, val] = whereMatch;
  
  let whereVal = val;
  const paramMatch = val.match(/\$(\d+)/);
  if (paramMatch) {
    const paramIdx = parseInt(paramMatch[1]) - 1;
    whereVal = values[paramIdx];
  } else if (val.startsWith("'") && val.endsWith("'")) {
    whereVal = val.slice(1, -1);
  }

  const { data: result, error } = await supabase
    .from(table)
    .delete()
    .eq(col, whereVal)
    .select();

  if (error) throw error;

  return {
    rows: result || [],
    rowCount: result?.length || 0,
    command: 'DELETE'
  };
};

module.exports = {
  supabase,
  query
};
