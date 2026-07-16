const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  try {
    let classes;

    if (req.user.role === 'admin') {
      classes = db.prepare(`
        SELECT c.*, u.name as teacher_name,
          (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
        FROM classes c
        JOIN users u ON c.teacher_id = u.id
        ORDER BY c.created_at DESC
      `).all();
    } else if (req.user.role === 'teacher') {
      classes = db.prepare(`
        SELECT c.*,
          (SELECT COUNT(*) FROM class_students cs WHERE cs.class_id = c.id) as student_count
        FROM classes c WHERE c.teacher_id = ?
        ORDER BY c.created_at DESC
      `).all(req.user.id);
    } else {
      classes = db.prepare(`
        SELECT c.*, u.name as teacher_name
        FROM classes c
        JOIN users u ON c.teacher_id = u.id
        JOIN class_students cs ON cs.class_id = c.id
        WHERE cs.student_id = ?
        ORDER BY c.created_at DESC
      `).all(req.user.id);
    }

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, (req, res) => {
  try {
    const cls = db.prepare(`
      SELECT c.*, u.name as teacher_name
      FROM classes c JOIN users u ON c.teacher_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const students = db.prepare(`
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN class_students cs ON cs.student_id = u.id
      WHERE cs.class_id = ?
    `).all(req.params.id);

    res.json({ ...cls, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { name, schedule, time, max_students } = req.body;

    if (!name) return res.status(400).json({ error: 'Class name is required' });

    const result = db.prepare(
      'INSERT INTO classes (name, teacher_id, schedule, time, max_students) VALUES (?, ?, ?, ?, ?)'
    ).run(name, req.user.id, schedule || '', time || '', max_students || 30);

    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { name, schedule, time, max_students, status } = req.body;

    const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Class not found' });

    if (req.user.role === 'teacher' && existing.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your class' });
    }

    db.prepare(
      'UPDATE classes SET name = COALESCE(?, name), schedule = COALESCE(?, schedule), time = COALESCE(?, time), max_students = COALESCE(?, max_students), status = COALESCE(?, status) WHERE id = ?'
    ).run(name, schedule, time, max_students, status, req.params.id);

    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    res.json(cls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Class not found' });

    if (req.user.role === 'teacher' && existing.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your class' });
    }

    db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/enroll', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });

    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const count = db.prepare('SELECT COUNT(*) as c FROM class_students WHERE class_id = ?').get(req.params.id).c;
    if (count >= cls.max_students) {
      return res.status(400).json({ error: 'Class is full' });
    }

    try {
      db.prepare('INSERT INTO class_students (class_id, student_id) VALUES (?, ?)').run(req.params.id, student_id);
    } catch (e) {
      return res.status(409).json({ error: 'Student already enrolled' });
    }

    res.json({ message: 'Student enrolled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/unenroll', authenticate, authorize('admin', 'teacher'), (req, res) => {
  try {
    const { student_id } = req.body;
    const result = db.prepare(
      'DELETE FROM class_students WHERE class_id = ? AND student_id = ?'
    ).run(req.params.id, student_id);

    if (result.changes === 0) return res.status(404).json({ error: 'Enrollment not found' });
    res.json({ message: 'Student unenrolled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
