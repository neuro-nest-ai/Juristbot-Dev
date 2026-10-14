
const { getPool } = require('../../database/db');

async function q(sql, params = []) {
  const [rows] = await getPool().promise().query(sql, params);
  return rows;
}

async function tx(fn) {
  const conn = await getPool().promise().getConnection();
  try {
    await conn.beginTransaction();
    const out = await fn(conn);
    await conn.commit();
    return out;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

const parseJson = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

module.exports = { q, tx, parseJson };
