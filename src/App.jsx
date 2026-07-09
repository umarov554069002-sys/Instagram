import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Messages from './pages/Messages';
import Reels from './pages/Reels';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

export default function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }} className="gradient-text">Instagram</p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} Instagram. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  );
}
