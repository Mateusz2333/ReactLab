import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;


const JWT_SECRET = 'supersecretjwtkey';
const REFRESH_TOKEN_SECRET = 'supersecretrefreshkey';


const users = [
  { id: 1, login: 'admin', password: 'admin123', imie: 'Jan', nazwisko: 'Kowalski', rola: 'admin' },
  { id: 2, login: 'dev', password: 'dev123', imie: 'Anna', nazwisko: 'Nowak', rola: 'developer' },
  { id: 3, login: 'ops', password: 'ops123', imie: 'Piotr', nazwisko: 'Wiśniewski', rola: 'devops' }
];


let refreshTokens = [];


app.use(cors());
app.use(bodyParser.json());


app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  const user = users.find(u => u.login === login && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Nieprawidłowy login lub hasło' });
  }

  
  const token = jwt.sign({ id: user.id, rola: user.rola }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.id, rola: user.rola }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  refreshTokens.push(refreshToken);
  res.json({ token, refreshToken });
});


app.post('/api/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token niedozwolony' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, userData) => {
    if (err) return res.status(403).json({ message: 'Refresh token nieprawidłowy' });
    const token = jwt.sign({ id: userData.id, rola: userData.rola }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token });
  });
});


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) return res.sendStatus(403);
    req.user = userData;
    next();
  });
}


app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.sendStatus(404);
  
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.listen(PORT, () => {
  console.log(`Serwer API działa na porcie ${PORT}`);
});
