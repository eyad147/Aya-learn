const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get teacher's own availability slots
router.get('/my', authenticate, authorize('teacher'), (req, res) => {
  try {
    const slots = db.prepare(
      'SELECT * FROM teacher_availability WHERE teacher_id = ? ORDER BY date, start_time'
    ).all(req.user.id);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add availability slot
router.post('/', authenticate, authorize('teacher'), (req, res) => {
  try {
    const { day_of_week, date, start_time, end_time } = req.body;

    if (!start_time || !end_time) {
      return res.status(400).json({ error: 'start_time and end_time are required' });
    }

    const result = db.prepare(`
      INSERT INTO teacher_availability (teacher_id, day_of_week, date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, day_of_week || null, date || null, start_time, end_time);

    const slot = db.prepare('SELECT * FROM teacher_availability WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete availability slot
router.delete('/:id', authenticate, authorize('teacher'), (req, res) => {
  try {
    const slot = db.prepare('SELECT * FROM teacher_availability WHERE id = ? AND teacher_id = ?').get(req.params.id, req.user.id);
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    db.prepare('DELETE FROM teacher_availability WHERE id = ?').run(req.params.id);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available slots for a specific teacher (public - students browse)
router.get('/:teacherId', authenticate, (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 10);
    const slots = db.prepare(`
      SELECT * FROM teacher_availability
      WHERE teacher_id = ? AND is_available = 1
        AND (date IS NULL OR date >= ?)
      ORDER BY date, start_time
    `).all(req.params.teacherId, now);
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
