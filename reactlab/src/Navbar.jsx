import React from 'react';

export default function Navbar() {
  const isLoggedIn = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.reload();
  };

  return (
    <div className="navbar mt-[-40px] bg-base-100 shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="/" className="btn btn-ghost text-5xl font-extrabold tracking-widest text-primary">
          REACTLAB
        </a>

        <div className="flex items-center space-x-7">
          {isLoggedIn && (
            <button onClick={handleLogout} className="btn btn-outline btn-error text-lg">
              Wyloguj się
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
