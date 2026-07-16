const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

const router = express.Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Role must be teacher or student' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const status = role === 'teacher' ? 'pending' : 'active';
    const result = db.prepare(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, hash, role, status);

    const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(result.lastInsertRowid);

    if (role === 'teacher') {
      // Notify admins
      const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
      const notif = db.prepare(
        'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
      );
      admins.forEach(a => notif.run(a.id, 'session_request', 'New Teacher Registration',
        `${name} registered as a teacher and needs approval`, '/admin-dashboard.html'));

      return res.status(201).json({ message: 'Registration successful. Your account is pending admin approval.', user });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is pending admin approval. Please wait for an administrator to activate your account.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, role, status, phone, bio, daily_goal, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', authenticate, (req, res) => {
  try {
    const { name, phone, bio, daily_goal } = req.body;
    db.prepare(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), bio = COALESCE(?, bio), daily_goal = COALESCE(?, daily_goal) WHERE id = ?'
    ).run(name, phone, bio, daily_goal, req.user.id);

    const user = db.prepare(
      'SELECT id, name, email, role, status, phone, bio, daily_goal FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pending-teachers', authenticate, authorize('admin'), (req, res) => {
  try {
    const teachers = db.prepare(
      "SELECT id, name, email, phone, bio, created_at FROM users WHERE role = 'teacher' AND status = 'pending' ORDER BY created_at DESC"
    ).all();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/approve/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const user = db.prepare("SELECT id, name, email FROM users WHERE id = ? AND role = 'teacher' AND status = 'pending'").get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Teacher not found or already processed' });

    db.prepare("UPDATE users SET status = 'active' WHERE id = ?").run(req.params.id);

    // Create teacher profile if not exists
    const profile = db.prepare('SELECT id FROM teacher_profiles WHERE user_id = ?').get(req.params.id);
    if (!profile) {
      db.prepare('INSERT INTO teacher_profiles (user_id) VALUES (?)').run(req.params.id);
    }

    db.prepare(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.id, 'session_accepted', 'Account Approved',
      'Your teacher account has been approved! You can now log in and start teaching.', '/login.html');

    res.json({ message: 'Teacher approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/reject/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const user = db.prepare("SELECT id, name FROM users WHERE id = ? AND role = 'teacher' AND status = 'pending'").get(req.params.id);
    if (!user) return res.status(404).json({ error: 'Teacher not found or already processed' });

    db.prepare("UPDATE users SET status = 'rejected' WHERE id = ?").run(req.params.id);

    db.prepare(
      'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
    ).run(req.params.id, 'session_rejected', 'Account Declined',
      'Your teacher account has been declined. Please contact support for more information.', '/login.html');

    res.json({ message: 'Teacher rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
