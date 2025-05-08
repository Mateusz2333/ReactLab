const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('../users');
const router = express.Router();

router.post('/login', (req, res) => {
  const { login, haslo } = req.body;
  const user = users.find(u => u.username === login && u.password === haslo);
  if (!user) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET);

  res.json({ token, refreshToken });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Brak refresh tokenu' });

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Nieprawidłowy refresh token' });
    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ token: newToken });
  });
});

module.exports = router;
