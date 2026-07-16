const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const PAYMOB_API = 'https://accept.paymob.com/api';
const PAYMOB_IFRAME_API = 'https://accept.paymob.com/api/acceptance/iframes';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET || '';
const PAYMOB_CARD_INTEGRATION_ID = parseInt(process.env.PAYMOB_CARD_INTEGRATION_ID || '0');
const PAYMOB_FAWRY_INTEGRATION_ID = parseInt(process.env.PAYMOB_FAWRY_INTEGRATION_ID || '0');
const PAYMOB_WALLET_INTEGRATION_ID = parseInt(process.env.PAYMOB_WALLET_INTEGRATION_ID || '0');
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';

const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function paymobAuth() {
  const res = await fetch(`${PAYMOB_API}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY })
  });
  const data = await res.json();
  if (!data.token) throw new Error('Paymob auth failed');
  return data.token;
}

function getIntegrationId(method) {
  const map = {
    visa: PAYMOB_CARD_INTEGRATION_ID,
    mastercard: PAYMOB_CARD_INTEGRATION_ID,
    fawry: PAYMOB_FAWRY_INTEGRATION_ID,
    vodafone_cash: PAYMOB_WALLET_INTEGRATION_ID
  };
  return map[method] || PAYMOB_CARD_INTEGRATION_ID;
}

router.post('/create-order', authenticate, authorize('student'), async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const validMethods = ['fawry', 'vodafone_cash', 'visa', 'mastercard'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const amountCents = Math.round(amount * 100);

    const authToken = await paymobAuth();

    const user = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.user.id);
    const nameParts = (user.name || 'Student').split(' ');
    const firstName = nameParts[0] || 'Student';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    const merchantOrderId = `TOPUP-${req.user.id}-${Date.now()}`;

    const orderRes = await fetch(`${PAYMOB_API}/ecommerce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: 'EGP',
        merchant_order_id: merchantOrderId,
        items: [],
        callback_url: `${SITE_URL}/student-dashboard.html?payment=callback`
      })
    });
    const orderData = await orderRes.json();
    if (!orderData.id) {
      return res.status(500).json({ error: 'Failed to create Paymob order' });
    }

    const integrationId = getIntegrationId(method);

    const billingData = {
      apartment: 'NA',
      email: user.email || 'student@ayalearn.com',
      floor: 'NA',
      first_name: firstName,
      last_name: lastName,
      street: 'NA',
      building: 'NA',
      phone_number: '01000000000',
      shipping_method: 'NA',
      postal_code: 'NA',
      city: 'Cairo',
      country: 'EG',
      state: 'Cairo'
    };

    const keyRes = await fetch(`${PAYMOB_API}/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: billingData,
        currency: 'EGP',
        integration_id: integrationId,
        lock_order_when_paid: true
      })
    });
    const keyData = await keyRes.json();
    if (!keyData.token) {
      return res.status(500).json({ error: 'Failed to create payment key' });
    }

    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, method, reference_number, status, description, paymob_order_id)
      VALUES (?, ?, 'topup', ?, ?, 'pending', ?, ?)
    `).run(req.user.id, amount, method, `TOPUP-${orderData.id}`, `Top-up via ${method.replace('_', ' ')}`, orderData.id);

    const checkoutUrl = `${PAYMOB_IFRAME_API}/${PAYMOB_IFRAME_ID}?payment_token=${keyData.token}`;

    res.json({
      checkout_url: checkoutUrl,
      order_id: orderData.id,
      amount,
      method
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    let payload = req.body;

    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) {}
    }

    if (payload.obj) {
      payload = payload.obj;
    }

    const hmacHeader = req.headers['hmac'] || req.headers['HMAC'] || payload.hmac || '';
    const success = payload.success;
    const orderId = payload.order?.id || payload.order_id || payload.id;
    const txnId = payload.id || payload.transaction_id || 0;

    if (!orderId) {
      return res.status(400).json({ error: 'No order ID' });
    }

    const txn = db.prepare('SELECT * FROM transactions WHERE paymob_order_id = ? AND status = ?').get(orderId, 'pending');

    if (!txn) {
      return res.json({ status: 'no_pending_transaction' });
    }

    if (success) {
      db.prepare('UPDATE transactions SET status = ?, paymob_txn_id = ?, reference_number = ? WHERE id = ?')
        .run('completed', txnId, `PAYMOB-${txnId}`, txn.id);

      db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?')
        .run(txn.amount, txn.user_id);

      console.log(`Payment confirmed: user ${txn.user_id}, amount ${txn.amount}, order ${orderId}`);
    } else {
      db.prepare('UPDATE transactions SET status = ? WHERE id = ?')
        .run('failed', txn.id);

      console.log(`Payment failed: order ${orderId}`);
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/:orderId', authenticate, authorize('student'), async (req, res) => {
  try {
    const txn = db.prepare('SELECT * FROM transactions WHERE paymob_order_id = ? AND user_id = ?')
      .get(req.params.orderId, req.user.id);

    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const user = db.prepare('SELECT balance FROM users WHERE id = ?').get(req.user.id);

    res.json({
      status: txn.status,
      amount: txn.amount,
      balance: user.balance,
      paymob_txn_id: txn.paymob_txn_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
