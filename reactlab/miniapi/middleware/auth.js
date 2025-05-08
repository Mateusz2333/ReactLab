const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu' });
  }

  try {
    // Callback na asynchroniczną
    const user = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;  
    next();  
  } catch (err) {
    return res.status(403).json({ error: 'Nieprawidłowy token' });
  }
};

module.exports = authMiddleware;
