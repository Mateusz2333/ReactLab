const express = require('express');
const users = require('../users');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/me', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });

  const { password, ...userData } = user;
  res.json(userData);
});

module.exports = router;
