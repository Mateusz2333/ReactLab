// src/loginForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

function LoginForm({ onLoginSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login: authLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: login, password })
      });
      if (!res.ok) {
        setError('Błędny login lub hasło');
        return;
      }
      const data = await res.json();
      authLogin(data.token, data.refreshToken);
      onLoginSuccess(data);
    } catch {
      setError('Wystąpił błąd');
    }
  };

  return (
    <form
  onSubmit={handleSubmit}
  className="max-w-sm mx-auto mt-[-400px] space-y-5 p-6 bg-base-100 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold text-center">Zaloguj się</h2>
  <div className="form-control">
    <label className="label"><span className="label-text">Login</span></label>
    <input
      type="text"
      placeholder="Twój login"
      className="input input-bordered w-full"
      value={login}
      onChange={e => setLogin(e.target.value)}
      required
    />
  </div>
  <div className="form-control">
    <label className="label"><span className="label-text">Hasło</span></label>
    <input
      type="password"
      placeholder="********"
      className="input input-bordered w-full"
      value={password}
      onChange={e => setPassword(e.target.value)}
      required
    />
  </div>
  <button type="submit" className="btn btn-primary w-full">Zaloguj się</button>
  {error && <p className="alert alert-warning">{error}</p>}
  
</form>
  );
}

export default LoginForm;
