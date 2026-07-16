const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ========================
// PORTIONS
// ========================
router.get('/portions', authenticate, (req, res) => {
  try {
    const { class_id, student_id } = req.query;
    let query;
    const params = [];

    if (req.user.role === 'student') {
      query = `
        SELECT p.*, c.name as class_name
        FROM portions p
        JOIN classes c ON p.class_id = c.id
        WHERE p.student_id = ?
      `;
      params.push(req.user.id);
    } else {
      query = `
        SELECT p.*, c.name as class_name, u.name as student_name
        FROM portions p
        JOIN classes c ON p.class_id = c.id
        JOIN users u ON p.student_id = u.id
        WHERE 1=1
      `;

      if (req.user.role === 'teacher') {
        query += ' AND c.teacher_id = ?';
        params.push(req.user.id);
      }
    }

    if (class_id) { query += ' AND p.class_id = ?'; params.push(class_id); }
    if (student_id) { query += ' AND p.student_id = ?'; params.push(student_id); }

    query += ' ORDER BY p.due_date ASC, p.created_at DESC';
    const portions = db.prepare(query).all(...params);
    res.json(portions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/portions', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { class_id, student_id, title, description, due_date } = req.body;

    if (!class_id || !student_id || !title) {
      return res.status(400).json({ error: 'class_id, student_id, and title are required' });
    }

    const result = db.prepare(
      'INSERT INTO portions (class_id, student_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)'
    ).run(class_id, student_id, title, description || '', due_date || null);

    const portion = db.prepare('SELECT * FROM portions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(portion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/portions/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { title, description, due_date, status } = req.body;
    db.prepare(
      'UPDATE portions SET title = COALESCE(?, title), description = COALESCE(?, description), due_date = COALESCE(?, due_date), status = COALESCE(?, status) WHERE id = ?'
    ).run(title, description, due_date, status, req.params.id);

    const portion = db.prepare('SELECT * FROM portions WHERE id = ?').get(req.params.id);
    if (!portion) return res.status(404).json({ error: 'Portion not found' });
    res.json(portion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/portions/:id/complete', authenticate, (req, res) => {
  try {
    db.prepare("UPDATE portions SET status = 'completed' WHERE id = ?").run(req.params.id);
    const portion = db.prepare('SELECT * FROM portions WHERE id = ?').get(req.params.id);
    if (!portion) return res.status(404).json({ error: 'Portion not found' });
    res.json(portion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/portions/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const result = db.prepare('DELETE FROM portions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Portion not found' });
    res.json({ message: 'Portion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// JUZ PROGRESS
// ========================
router.get('/:studentId', authenticate, (req, res) => {
  try {
    const studentId = req.params.studentId;

    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let progress = db.prepare(
      'SELECT * FROM juz_progress WHERE student_id = ? ORDER BY juz_number ASC'
    ).all(studentId);

    if (progress.length === 0) {
      const insert = db.prepare(
        'INSERT OR IGNORE INTO juz_progress (student_id, juz_number, status) VALUES (?, ?, ?)'
      );
      for (let i = 1; i <= 30; i++) {
        insert.run(studentId, i, 'not_started');
      }
      progress = db.prepare(
        'SELECT * FROM juz_progress WHERE student_id = ? ORDER BY juz_number ASC'
      ).all(studentId);
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:studentId/:juz', authenticate, (req, res) => {
  try {
    const { studentId, juz } = req.params;
    const { status } = req.body;

    if (!['not_started', 'in_progress', 'memorized'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare(`
      INSERT INTO juz_progress (student_id, juz_number, status, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(student_id, juz_number)
      DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP
    `).run(studentId, juz, status, status);

    const progress = db.prepare(
      'SELECT * FROM juz_progress WHERE student_id = ? AND juz_number = ?'
    ).get(studentId, juz);

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// DASHBOARD STATS
// ========================
router.get('/stats/overview', authenticate, (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'teacher') {
      stats.total_students = db.prepare(`
        SELECT COUNT(DISTINCT cs.student_id) as c
        FROM class_students cs
        JOIN classes c ON cs.class_id = c.id
        WHERE c.teacher_id = ?
      `).get(req.user.id).c;

      stats.active_students = stats.total_students;

      stats.avg_score = db.prepare(`
        SELECT ROUND(AVG(overall)) as avg
        FROM scores WHERE teacher_id = ?
      `).get(req.user.id).avg || 0;

      stats.total_classes = db.prepare(
        'SELECT COUNT(*) as c FROM classes WHERE teacher_id = ?'
      ).get(req.user.id).c;

      stats.recent_scores = db.prepare(`
        SELECT s.*, u.name as student_name
        FROM scores s
        JOIN users u ON s.student_id = u.id
        WHERE s.teacher_id = ?
        ORDER BY s.created_at DESC LIMIT 5
      `).all(req.user.id);

    } else if (req.user.role === 'student') {
      stats.juz_memorized = db.prepare(
        "SELECT COUNT(*) as c FROM juz_progress WHERE student_id = ? AND status = 'memorized'"
      ).get(req.user.id).c;

      stats.avg_score = db.prepare(
        'SELECT ROUND(AVG(overall)) as avg FROM scores WHERE student_id = ?'
      ).get(req.user.id).avg || 0;

      stats.total_scores = db.prepare(
        'SELECT COUNT(*) as c FROM scores WHERE student_id = ?'
      ).get(req.user.id).c;

      stats.pending_portions = db.prepare(
        "SELECT COUNT(*) as c FROM portions WHERE student_id = ? AND status = 'pending'"
      ).get(req.user.id).c;

      stats.recent_scores = db.prepare(`
        SELECT * FROM scores WHERE student_id = ?
        ORDER BY created_at DESC LIMIT 5
      `).all(req.user.id);

    } else if (req.user.role === 'admin') {
      stats.total_users = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
      stats.total_teachers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'teacher'").get().c;
      stats.total_students = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'student'").get().c;
      stats.total_classes = db.prepare('SELECT COUNT(*) as c FROM classes').get().c;

      stats.recent_users = db.prepare(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
      ).all();
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
