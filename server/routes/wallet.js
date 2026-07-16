const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/balance', authenticate, authorize('student'), (req, res) => {
  try {
    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);
    res.json({ balance: user.balance || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/topup', authenticate, authorize('student'), (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const validMethods = ['fawry', 'vodafone_cash', 'visa', 'mastercard'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    let referenceNumber = '';
    if (method === 'fawry') {
      referenceNumber = 'FRW-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    } else if (method === 'vodafone_cash') {
      referenceNumber = 'VFC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    } else if (method === 'visa' || method === 'mastercard') {
      referenceNumber = (method === 'visa' ? 'VISA' : 'MC') + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, req.user.id);

    const description = `Top-up via ${method.replace('_', ' ')}`;
    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, method, reference_number, status, description)
      VALUES (?, ?, 'topup', ?, ?, 'completed', ?)
    `).run(req.user.id, amount, method, referenceNumber, description);

    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);

    res.json({
      message: 'Payment successful',
      balance: user.balance,
      reference: referenceNumber,
      amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/transactions', authenticate, authorize('student'), (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
    `).all(req.user.id);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
