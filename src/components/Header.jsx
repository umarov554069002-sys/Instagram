import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, Sun, Moon, LogOut, Send, Film, Search, Home, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { currentUser, logout, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Управление темой оформления (темная/светлая)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error("Ошибка при выходе:", e);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navIconStyle = (path) => ({
    position: 'relative',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isActive(path) ? 'var(--bg-tertiary)' : 'transparent',
    color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
    transition: 'all 0.15s'
  });

  return (
    <header className="glass" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      borderBottom: '1px solid var(--border-color)',
    }}>
      {/* Логотип Instagram */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div className="gradient-bg" style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(225, 48, 108, 0.25)'
        }}>
          <Camera size={18} color="white" />
        </div>
        <span style={{
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        }}>
          <span className="gradient-text">Instagram</span>
        </span>
      </Link>

      {/* Центральная навигация — иконки как в настоящем Instagram */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link to="/" style={navIconStyle('/')} title="Главная"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive('/') ? 'var(--bg-tertiary)' : 'transparent'}
        >
          <Home size={22} />
        </Link>

        <Link to="/explore" style={navIconStyle('/explore')} title="Поиск"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive('/explore') ? 'var(--bg-tertiary)' : 'transparent'}
        >
          <Compass size={22} />
        </Link>

        <Link to="/reels" style={navIconStyle('/reels')} title="Reels"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive('/reels') ? 'var(--bg-tertiary)' : 'transparent'}
        >
          <Film size={22} />
        </Link>

        <Link to="/messages" style={navIconStyle('/messages')} title="Сообщения"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive('/messages') ? 'var(--bg-tertiary)' : 'transparent'}
        >
          <Send size={20} style={{ transform: 'rotate(-45deg)', margin: '0 0 2px 2px' }} />
        </Link>
      </nav>

      {/* Правое меню: Тема + Профиль */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Переключатель темы */}
        <button
          onClick={toggleTheme}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            transition: 'background-color 0.2s'
          }}
          title="Сменить тему"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Профиль / Вход */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none'
              }}
              title="Мой профиль"
            >
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: isActive('/profile') ? '2px solid var(--accent-pink)' : '2px solid var(--border-color)',
                transition: 'border-color 0.2s'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ display: 'none' }}>{currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'user')}</span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(225, 48, 108, 0.08)',
                color: 'var(--accent-pink)',
                transition: 'all 0.2s'
              }}
              title="Выйти"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="btn btn-primary"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={14} /> Войти
          </Link>
        )}
      </div>

      {/* Демо-баннер */}
      {isDemo && (
        <div style={{
          position: 'absolute',
          bottom: '-28px',
          left: 0,
          width: '100%',
          backgroundColor: '#ffcc00',
          color: '#333',
          fontSize: '11px',
          fontWeight: '700',
          textAlign: 'center',
          padding: '4px 0',
          zIndex: -1,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          ⚠️ Демо-режим. Настройте Firebase в .env
        </div>
      )}
    </header>
  );
}
