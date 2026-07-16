const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { role, search } = req.query;
    let query = 'SELECT id, name, email, role, status, phone, created_at FROM users WHERE 1=1';
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const users = db.prepare(query).all(...params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, role, phone, bio, daily_goal, created_at FROM users WHERE id = ?'
    ).get(req.params.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, hash, role);

    const user = db.prepare(
      'SELECT id, name, email, role FROM users WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const { name, email, role, phone, bio } = req.body;
    db.prepare(
      'UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role), phone = COALESCE(?, phone), bio = COALESCE(?, bio) WHERE id = ?'
    ).run(name, email, role, phone, bio, req.params.id);

    const user = db.prepare(
      'SELECT id, name, email, role, phone, bio FROM users WHERE id = ?'
    ).get(req.params.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
