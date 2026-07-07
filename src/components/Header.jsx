import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Sun, Moon, LogOut, Package2, Shield, Send, Film, Heart, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Header() {
  const { getItemsCount } = useCart();
  const { currentUser, logout, isDemo } = useAuth();
  const { getFavoritesCount } = useFavorites();
  const navigate = useNavigate();
  
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
      {/* Логотип */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="gradient-bg" style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(225, 48, 108, 0.2)'
        }}>
          <ShoppingBag size={20} color="white" />
        </div>
        <span style={{
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}>
          Insta<span className="gradient-text">Store</span>
        </span>
      </Link>

      {/* Навигация */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ fontWeight: 500, fontSize: '14px' }}>Главная</Link>
        <Link to="/catalog" style={{ fontWeight: 500, fontSize: '14px' }}>Каталог</Link>
        {currentUser?.isAdmin && (
          <Link to="/admin" style={{ 
            fontWeight: 500, 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: 'var(--accent-pink)'
          }}>
            <Shield size={14} /> Админ
          </Link>
        )}
      </nav>

      {/* Пользовательское меню */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            transition: 'background-color 0.2s',
            color: 'var(--text-primary)'
          }}
          title="Сменить тему"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Рилсы (Reels) */}
        <Link 
          to="/reels" 
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Рилсы (Reels)"
        >
          <Film size={18} />
        </Link>

        {/* Глобальный поиск (Explore) */}
        <Link 
          to="/explore" 
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Поиск и исследования"
        >
          <Search size={18} />
        </Link>

        {/* Сообщения (Direct) */}
        <Link 
          to="/messages" 
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Сообщения (Direct)"
        >
          <Send size={18} style={{ transform: 'rotate(-45deg)', margin: '0 0 2px 2px' }} />
        </Link>

        {/* Избранное */}
        <Link 
          to="/favorites" 
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Избранное"
        >
          <Heart size={18} />
          {getFavoritesCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(225, 48, 108, 0.3)'
            }}>
              {getFavoritesCount()}
            </span>
          )}
        </Link>

        {/* Корзина */}
        <Link 
          to="/cart" 
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)'
          }}
          title="Корзина"
        >
          <Package2 size={18} />
          {getItemsCount() > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--accent-gradient)',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(225, 48, 108, 0.3)'
            }}>
              {getItemsCount()}
            </span>
          )}
        </Link>

        {/* Профиль / Вход */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)'
            }}>
              {currentUser.displayName || currentUser.email}
              {currentUser.isDemo && ' (Демо)'}
            </span>
            <button 
              onClick={handleLogout}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(225, 48, 108, 0.1)',
                color: 'var(--accent-pink)',
                transition: 'all 0.2s'
              }}
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link 
            to="/auth" 
            className="btn btn-secondary" 
            style={{ 
              padding: '8px 16px',
              borderRadius: 'var(--border-radius-full)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={14} /> Войти
          </Link>
        )}
      </div>
      
      {/* Демо-баннер, если Firebase не настроен */}
      {isDemo && (
        <div style={{
          position: 'absolute',
          bottom: '-32px',
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
          ⚠️ Запущен Демо-режим. Настройте ключи Firebase в файле .env для полноценной работы!
        </div>
      )}
    </header>
  );
}
