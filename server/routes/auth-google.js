const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const callbackURL = process.env.NGROK_DOMAIN
  ? 'https://' + process.env.NGROK_DOMAIN + '/api/auth/google/callback'
  : '/api/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL,
}, (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(null, false, { message: 'No email from Google' });

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      const name = profile.displayName || email.split('@')[0];
      const result = db.prepare(
        "INSERT INTO users (name, email, password, role, status) VALUES (?, ?, '', 'student', 'active')"
      ).run(name, email);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    if (user.status === 'pending') {
      return done(null, false, { message: 'Account pending approval' });
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  done(null, user || null);
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login.html?error=google_auth_failed',
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...safeUser } = user;
    const encoded = Buffer.from(JSON.stringify({ user: safeUser, token })).toString('base64');
    res.redirect('/login.html?google_auth=' + encoded);
  }
);

module.exports = router;
