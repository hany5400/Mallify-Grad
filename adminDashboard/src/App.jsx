import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './appRoutes/AppRoutes';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <AppRoutes 
        token={token} 
        user={user} 
        onLoginSuccess={handleLoginSuccess} 
        onLogout={handleLogout} 
      />
    </BrowserRouter>
  );
}

export default App;
