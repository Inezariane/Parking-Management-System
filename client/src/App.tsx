import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';

interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  plate_number: string | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route
            path="/dashboard"
            element={user && user.role === 'user' && token ? <UserDashboard token={token} user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' && token ? <AdminDashboard token={token} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;