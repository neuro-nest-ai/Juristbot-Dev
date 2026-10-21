const bcrypt = require('bcryptjs');
const { query } = require('../database/pool');
const { signToken } = require('../utils/jwt');
const { badRequest, unauthorized, conflict } = require('../utils/http');

const ALLOWED_SIGNUP_ROLES = ['buyer', 'advocate'];

function sanitize(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, mobile, password } = req.body || {};
    let { role } = req.body || {};

    if (!name || !email || !password) {
      throw badRequest('name, email and password are required');
    }
    if (password.length < 6) {
      throw badRequest('password must be at least 6 characters');
    }
    role = role || 'buyer';
    if (!ALLOWED_SIGNUP_ROLES.includes(role)) {
      throw badRequest(`role must be one of: ${ALLOWED_SIGNUP_ROLES.join(', ')}`);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await query('SELECT id FROM marketplace_users WHERE email = ?', [normalizedEmail]);
    if (existing.length) {
      throw conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO marketplace_users (name, email, mobile, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), normalizedEmail, mobile || null, passwordHash, role]
    );

    const [user] = await query('SELECT * FROM marketplace_users WHERE id = ?', [result.insertId]);
    const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name });
    res.status(201).json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      throw badRequest('email and password are required');
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const rows = await query('SELECT * FROM marketplace_users WHERE email = ?', [normalizedEmail]);
    if (!rows.length) {
      throw unauthorized('Invalid email or password');
    }
    const user = rows[0];
    if (user.status !== 'active') {
      throw unauthorized('Account is blocked');
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw unauthorized('Invalid email or password');
    }
    const token = signToken({ id: user.id, role: user.role, email: user.email, name: user.name });
    res.json({ token, user: sanitize(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const rows = await query('SELECT * FROM marketplace_users WHERE id = ?', [req.user.id]);
    if (!rows.length) {
      throw unauthorized('User no longer exists');
    }
    res.json({ user: sanitize(rows[0]) });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.json({ message: 'Logged out' });
}

module.exports = { signup, login, me, logout };
