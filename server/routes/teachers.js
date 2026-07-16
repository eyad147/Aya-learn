const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { specialization, max_price } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.bio, u.created_at,
        tp.price_per_session, tp.currency, tp.specializations,
        tp.years_experience, tp.languages, tp.is_available,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM users u
      JOIN teacher_profiles tp ON tp.user_id = u.id
      LEFT JOIN (
        SELECT teacher_id, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as review_count
        FROM reviews GROUP BY teacher_id
      ) r ON r.teacher_id = u.id
      WHERE u.role = 'teacher' AND tp.is_available = 1
    `;
    const params = [];

    if (specialization) {
      query += ' AND tp.specializations LIKE ?';
      params.push('%' + specialization + '%');
    }
    if (max_price) {
      query += ' AND tp.price_per_session <= ?';
      params.push(parseFloat(max_price));
    }

    query += ' ORDER BY avg_rating DESC, r.review_count DESC';
    const teachers = db.prepare(query).all(...params);
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const teacher = db.prepare(`
      SELECT u.id, u.name, u.email, u.bio, u.created_at,
        tp.price_per_session, tp.currency, tp.specializations,
        tp.years_experience, tp.languages, tp.is_available,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(r.review_count, 0) as review_count
      FROM users u
      JOIN teacher_profiles tp ON tp.user_id = u.id
      LEFT JOIN (
        SELECT teacher_id, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as review_count
        FROM reviews GROUP BY teacher_id
      ) r ON r.teacher_id = u.id
      WHERE u.id = ?
    `).get(req.params.id);

    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const reviews = db.prepare(`
      SELECT rv.*, u.name as student_name
      FROM reviews rv
      JOIN users u ON rv.student_id = u.id
      WHERE rv.teacher_id = ?
      ORDER BY rv.created_at DESC
      LIMIT 10
    `).all(req.params.id);

    res.json({ ...teacher, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/availability', (req, res) => {
  try {
    const existing = db.prepare(`
      SELECT scheduled_at, duration_minutes FROM sessions
      WHERE teacher_id = ? AND status IN ('pending','accepted','ongoing')
      ORDER BY scheduled_at ASC
    `).all(req.params.id);

    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', authenticate, authorize('teacher'), (req, res) => {
  try {
    const { price_per_session, specializations, years_experience, languages, is_available } = req.body;

    db.prepare(`
      INSERT INTO teacher_profiles (user_id, price_per_session, specializations, years_experience, languages, is_available)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET
        price_per_session = COALESCE(?, price_per_session),
        specializations = COALESCE(?, specializations),
        years_experience = COALESCE(?, years_experience),
        languages = COALESCE(?, languages),
        is_available = COALESCE(?, is_available)
    `).run(
      req.user.id, price_per_session || 0, specializations || '', years_experience || 0, languages || 'English,Arabic', is_available != null ? is_available : 1,
      price_per_session, specializations, years_experience, languages, is_available
    );

    const profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/me', authenticate, authorize('teacher'), (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(req.user.id);
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
