import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5433),
  database: process.env.DB_NAME || 'nbank',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export async function fetchOne(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

export async function fetchAll(sql, params = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function execute(sql, params = []) {
  return await pool.query(sql, params);
}

export async function closePool() {
  await pool.end();
}
