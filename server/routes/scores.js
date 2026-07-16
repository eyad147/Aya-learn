const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    const { student_id, class_id } = req.query;
    let query;
    const params = [];

    if (req.user.role === 'student') {
      query = `
        SELECT s.*, u.name as teacher_name
        FROM scores s
        JOIN users u ON s.teacher_id = u.id
        WHERE s.student_id = ?
      `;
      params.push(req.user.id);
    } else {
      query = `
        SELECT s.*, us.name as student_name, ut.name as teacher_name
        FROM scores s
        JOIN users us ON s.student_id = us.id
        JOIN users ut ON s.teacher_id = ut.id
        WHERE 1=1
      `;

      if (student_id) {
        query += ' AND s.student_id = ?';
        params.push(student_id);
      }

      if (req.user.role === 'teacher') {
        query += ' AND s.teacher_id = ?';
        params.push(req.user.id);
      }
    }

    if (class_id) {
      query += ' AND s.class_id = ?';
      params.push(class_id);
    }

    query += ' ORDER BY s.created_at DESC';
    const scores = db.prepare(query).all(...params);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/:studentId', authenticate, (req, res) => {
  try {
    const studentId = req.params.studentId;

    if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const total = db.prepare('SELECT COUNT(*) as c FROM scores WHERE student_id = ?').get(studentId).c;

    const avg = db.prepare(`
      SELECT
        ROUND(AVG(tajweed)) as avg_tajweed,
        ROUND(AVG(memorization)) as avg_memorization,
        ROUND(AVG(fluency)) as avg_fluency,
        ROUND(AVG(overall)) as avg_overall
      FROM scores WHERE student_id = ?
    `).get(studentId);

    const juzCount = db.prepare(
      "SELECT COUNT(*) as c FROM juz_progress WHERE student_id = ? AND status = 'memorized'"
    ).get(studentId).c;

    const streak = db.prepare(`
      SELECT COUNT(DISTINCT DATE(created_at)) as c
      FROM scores
      WHERE student_id = ? AND created_at >= DATE('now', '-30 days')
    `).get(studentId).c;

    res.json({
      total_scores: total,
      averages: avg,
      juz_memorized: juzCount,
      active_days: streak
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { student_id, class_id, portion, tajweed, memorization, fluency, comments } = req.body;

    if (!student_id || !portion || tajweed == null || memorization == null || fluency == null) {
      return res.status(400).json({ error: 'student_id, portion, tajweed, memorization, and fluency are required' });
    }

    const overall = Math.round((parseInt(tajweed) + parseInt(memorization) + parseInt(fluency)) / 3);

    const result = db.prepare(`
      INSERT INTO scores (student_id, teacher_id, class_id, portion, tajweed, memorization, fluency, overall, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(student_id, req.user.id, class_id || null, portion, tajweed, memorization, fluency, overall, comments || '');

    const score = db.prepare('SELECT * FROM scores WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM scores WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Score not found' });

    if (req.user.role === 'teacher' && existing.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your score' });
    }

    db.prepare('DELETE FROM scores WHERE id = ?').run(req.params.id);
    res.json({ message: 'Score deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
