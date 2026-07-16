const express = require('express');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

function createNotification(userId, type, title, message, link) {
  db.prepare(
    'INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)'
  ).run(userId, type, title, message, link || '');
}

router.get('/', authenticate, (req, res) => {
  try {
    let query, params = [];

    if (req.user.role === 'student') {
      query = `
        SELECT s.*, u.name as teacher_name, tp.price_per_session,
          (SELECT rating FROM reviews WHERE session_id = s.id) as my_rating,
          sc.id as score_id, sc.portion as score_portion,
          sc.tajweed as score_tajweed, sc.memorization as score_memorization,
          sc.fluency as score_fluency, sc.overall as score_overall,
          sc.comments as score_comments
        FROM sessions s
        JOIN users u ON s.teacher_id = u.id
        LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
        LEFT JOIN scores sc ON sc.session_id = s.id
        WHERE s.student_id = ?
        ORDER BY s.scheduled_at DESC
      `;
      params.push(req.user.id);
    } else if (req.user.role === 'teacher') {
      query = `
        SELECT s.*, u.name as student_name,
          (SELECT rating FROM reviews WHERE session_id = s.id) as student_rating,
          sc.id as score_id, sc.portion as score_portion,
          sc.tajweed as score_tajweed, sc.memorization as score_memorization,
          sc.fluency as score_fluency, sc.overall as score_overall,
          sc.comments as score_comments
        FROM sessions s
        JOIN users u ON s.student_id = u.id
        LEFT JOIN scores sc ON sc.session_id = s.id
        WHERE s.teacher_id = ?
        ORDER BY s.scheduled_at DESC
      `;
      params.push(req.user.id);
    } else {
      query = `
        SELECT s.*, ut.name as teacher_name, us.name as student_name
        FROM sessions s
        JOIN users ut ON s.teacher_id = ut.id
        JOIN users us ON s.student_id = us.id
        ORDER BY s.scheduled_at DESC
      `;
    }

    const sessions = db.prepare(query).all(...params);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, authorize('student'), (req, res) => {
  try {
    const { teacher_id, scheduled_at, duration_minutes, student_notes } = req.body;

    if (!teacher_id || !scheduled_at) {
      return res.status(400).json({ error: 'teacher_id and scheduled_at are required' });
    }

    const profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(teacher_id);
    const price = profile ? profile.price_per_session : 0;

    const conflict = db.prepare(`
      SELECT id FROM sessions
      WHERE teacher_id = ? AND scheduled_at = ? AND status IN ('pending','accepted','ongoing')
    `).get(teacher_id, scheduled_at);

    if (conflict) {
      return res.status(409).json({ error: 'Teacher is not available at this time' });
    }

    const result = db.prepare(`
      INSERT INTO sessions (student_id, teacher_id, scheduled_at, duration_minutes, price, student_notes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(req.user.id, teacher_id, scheduled_at, duration_minutes || 30, price, student_notes || '');

    const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(teacher_id);
    const student = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);

    createNotification(
      teacher_id,
      'session_request',
      'New Session Request',
      `${student.name} wants to book a session on ${new Date(scheduled_at).toLocaleString()}`,
      '/sessions.html'
    );

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/accept', authenticate, authorize('teacher'), (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });

    db.prepare("UPDATE sessions SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    createNotification(
      session.student_id,
      'session_accepted',
      'Session Accepted!',
      `${teacher.name} accepted your session on ${new Date(session.scheduled_at).toLocaleString()}`,
      '/sessions.html'
    );

    res.json({ message: 'Session accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reject', authenticate, authorize('teacher'), (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });

    const { reason } = req.body;
    db.prepare("UPDATE sessions SET status = 'rejected', teacher_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(reason || '', req.params.id);

    const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    createNotification(
      session.student_id,
      'session_rejected',
      'Session Declined',
      `${teacher.name} declined your session.${reason ? ' Reason: ' + reason : ''}`,
      '/sessions.html'
    );

    res.json({ message: 'Session rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/link', authenticate, authorize('teacher'), (req, res) => {
  try {
    const { meet_link } = req.body;
    if (!meet_link) return res.status(400).json({ error: 'meet_link is required' });

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });

    db.prepare("UPDATE sessions SET meet_link = ?, status = 'ongoing', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(meet_link, req.params.id);

    const teacher = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    createNotification(
      session.student_id,
      'meet_link',
      'Session Starting!',
      `${teacher.name} shared a Meet link for your session. Join now!`,
      meet_link
    );

    res.json({ message: 'Meet link added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/complete', authenticate, authorize('teacher'), (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.teacher_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });

    const { tajweed, memorization, fluency, portion, comments } = req.body;
    let score = null;

    if (portion && tajweed != null && memorization != null && fluency != null) {
      const overall = Math.round((parseInt(tajweed) + parseInt(memorization) + parseInt(fluency)) / 3);
      const result = db.prepare(`
        INSERT INTO scores (student_id, teacher_id, portion, tajweed, memorization, fluency, overall, comments, session_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(session.student_id, req.user.id, portion, parseInt(tajweed), parseInt(memorization), parseInt(fluency), overall, comments || '', session.id);
      score = db.prepare('SELECT * FROM scores WHERE id = ?').get(result.lastInsertRowid);
    }

    db.prepare("UPDATE sessions SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    const msg = score
      ? `Your session score - ${score.portion}: Tajweed ${score.tajweed}, Memorization ${score.memorization}, Fluency ${score.fluency}, Overall ${score.overall}`
      : 'Your session has been completed. Please leave a review!';

    createNotification(
      session.student_id,
      'session_completed',
      'Session Completed',
      msg,
      '/sessions.html'
    );

    res.json({ message: 'Session completed', score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/cancel', authenticate, (req, res) => {
  try {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (session.student_id !== req.user.id && session.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your session' });
    }

    if (['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({ error: 'Cannot cancel this session' });
    }

    db.prepare("UPDATE sessions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    const canceller = db.prepare('SELECT name, role FROM users WHERE id = ?').get(req.user.id);
    const notifyUserId = canceller.role === 'student' ? session.teacher_id : session.student_id;

    createNotification(
      notifyUserId,
      'session_cancelled',
      'Session Cancelled',
      `${canceller.name} cancelled the session on ${new Date(session.scheduled_at).toLocaleString()}`,
      '/sessions.html'
    );

    res.json({ message: 'Session cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/review', authenticate, authorize('student'), (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }

    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.student_id !== req.user.id) return res.status(403).json({ error: 'Not your session' });
    if (session.status !== 'completed') return res.status(400).json({ error: 'Can only review completed sessions' });

    const existing = db.prepare('SELECT id FROM reviews WHERE session_id = ?').get(req.params.id);
    if (existing) return res.status(409).json({ error: 'Already reviewed' });

    db.prepare('INSERT INTO reviews (session_id, student_id, teacher_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, req.user.id, session.teacher_id, rating, comment || '');

    const student = db.prepare('SELECT name FROM users WHERE id = ?').get(req.user.id);
    createNotification(
      session.teacher_id,
      'review',
      'New Review',
      `${student.name} left a ${rating}-star review`,
      '/sessions.html'
    );

    res.json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
