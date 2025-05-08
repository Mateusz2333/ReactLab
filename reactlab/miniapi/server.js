require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const users = require("./users");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = process.env.JWT_SECRET; 
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET; 



app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) return res.status(401).json({ message: "Nieprawidłowe dane logowania" });

  const payload = { id: user.id, rola: user.rola };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "15m" });
const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "7d" });


  res.json({ token, refreshToken });
});


app.post("/api/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(400).json({ message: "Brak tokenu" });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const newToken = jwt.sign({ id: payload.id, rola: payload.rola }, SECRET_KEY, { expiresIn: "15m" });
    res.json({ token: newToken });
  } catch {
    res.status(403).json({ message: "Nieprawidłowy token" });
  }
});


app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Brak nagłówka Authorization" });

  const token = auth.split(" ")[1];

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = users.find((u) => u.id === payload.id);
    if (!user) return res.status(404).json({ message: "Nie znaleziono użytkownika" });

    const { password, ...userData } = user;
    res.json(userData);
  } catch {
    res.status(401).json({ message: "Token nieprawidłowy lub wygasł" });
  }
});

app.listen(3001, () => {
  console.log("MiniAPI działa na http://localhost:3001");
});
