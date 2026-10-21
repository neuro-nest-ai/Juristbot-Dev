const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const env = require('../config/env');

let db = null;

function sanitize(params = []) {
  return params.map((p) => {
    if (p === undefined) return null;
    if (typeof p === 'boolean') return p ? 1 : 0;
    if (p instanceof Date) return p.toISOString();
    return p;
  });
}

function isRead(sql) {
  return /^\s*(select|with|pragma)/i.test(sql);
}

function getDb() {
  if (!db) {
    const file = path.join(__dirname, '..', '..', env.db.sqliteFile);
    db = new DatabaseSync(file);
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

function runOn(handle, sql, params) {
  const stmt = handle.prepare(sql);
  const safe = sanitize(params);
  if (isRead(sql)) {
    return stmt.all(...safe);
  }
  const info = stmt.run(...safe);
  return { insertId: Number(info.lastInsertRowid), affectedRows: info.changes };
}

async function query(sql, params = []) {
  return runOn(getDb(), sql, params);
}

async function init() {
  const handle = getDb();
  const schemaPath = path.join(__dirname, 'schema.sqlite.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  handle.exec(schema);
}

async function withTransaction(fn) {
  const handle = getDb();
  handle.exec('BEGIN');
  try {
    const result = await fn({ query: async (sql, params = []) => runOn(handle, sql, params) });
    handle.exec('COMMIT');
    return result;
  } catch (err) {
    handle.exec('ROLLBACK');
    throw err;
  }
}

async function close() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { client: 'sqlite', query, init, withTransaction, close };
