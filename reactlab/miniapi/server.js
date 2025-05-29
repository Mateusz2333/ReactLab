require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

// Połączenie z MongoDB
const connectDB = require('./db');
connectDB();

const users = require('./users');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
let refreshTokens = [];

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET;
const REFRESH_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET;

// Google OAuth
app.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = users.find(u => u.login === email);
    if (!user) {
      user = {
        id: users.length + 1,
        login: email,
        password: null,
        imie: name,
        nazwisko: '',
        rola: 'guest'
      };
      users.push(user);
    }

    const token = jwt.sign(
      { id: user.id, rola: user.rola },
      SECRET_KEY,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, rola: user.rola },
      REFRESH_SECRET_KEY,
      { expiresIn: '7d' }
    );
    refreshTokens.push(refreshToken);

    return res.json({ token, refreshToken });
  } catch (err) {
    console.error('Google auth error:', err);
    return res.status(401).json({ message: 'Invalid Google ID token' });
  }
});

// Standard login
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  const user = users.find(u => u.login === login && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Nieprawidłowe dane logowania' });
  }
  const payload = { id: user.id, rola: user.rola };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);
  res.json({ token, refreshToken });
});

// Refresh token
app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token niedozwolony' });
  }
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const newToken = jwt.sign({ id: payload.id, rola: payload.rola }, SECRET_KEY, { expiresIn: '15m' });
    res.json({ token: newToken });
  } catch {
    res.status(403).json({ message: 'Nieprawidłowy refresh token' });
  }
});

// Fetch current user
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'Brak nagłówka Authorization' });

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = users.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ message: 'Nie znaleziono użytkownika' });
    const { password, ...userData } = user;
    res.json(userData);
  } catch {
    res.status(401).json({ message: 'Token nieprawidłowy lub wygasł' });
  }
});

// Nowe routy CRUD dla projektów / historii / zadań
app.use('/api/projects', require('./routes/projects'));
app.use('/api/stories',  require('./routes/stories'));
app.use('/api/tasks',    require('./routes/tasks'));

// Start serwera
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`MiniAPI działa na http://localhost:${PORT}`);
});
