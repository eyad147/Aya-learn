require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');

const authRoutes = require('./server/routes/auth');
const authGoogleRoutes = require('./server/routes/auth-google');
const userRoutes = require('./server/routes/users');
const classRoutes = require('./server/routes/classes');
const scoreRoutes = require('./server/routes/scores');
const progressRoutes = require('./server/routes/progress');
const teacherRoutes = require('./server/routes/teachers');
const sessionRoutes = require('./server/routes/sessions');
const notificationRoutes = require('./server/routes/notifications');
const availabilityRoutes = require('./server/routes/availability');
const walletRoutes = require('./server/routes/wallet');

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use(express.static(path.join(__dirname)));

app.use('/api/auth', authRoutes);
app.use('/api/auth', authGoogleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Aya Learn server running on http://localhost:${PORT}`);
});
