import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { currentUser, login, signup } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Если уже залогинен, перенаправляем на главную
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Произошла ошибка при аутентификации.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--header-height) - 100px)',
      padding: '120px 24px 80px',
      position: 'relative'
    }}>
      {/* Декоративное пятно */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'var(--accent-gradient)',
        borderRadius: '50%',
        filter: 'blur(100px)',
        opacity: 0.15,
        zIndex: 0
      }}></div>

      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: 'var(--border-radius-md)',
        padding: '40px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1
      }}>
        {/* Хедер формы */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Добро пожаловать обратно!' : 'Создайте новый аккаунт'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(225, 48, 108, 0.1)',
            color: 'var(--accent-pink)',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid rgba(225, 48, 108, 0.2)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                placeholder="example@mail.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
              <Mail size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
          </div>

          {/* Пароль */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px' }}
              />
              <Lock size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
          </div>

          {/* Кнопка отправки */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--border-radius-sm)',
              marginTop: '10px'
            }}
          >
            {loading ? 'Загрузка...' : (
              isLogin ? (
                <>Войти <LogIn size={16} /></>
              ) : (
                <>Зарегистрироваться <UserPlus size={16} /></>
              )
            )}
          </button>
        </form>

        {/* Переключатель Вход/Регистрация */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="btn-text"
            style={{ fontSize: '13px' }}
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>

        {/* Подсказка для демо-режима */}
        <div style={{ 
          marginTop: '32px', 
          padding: '16px', 
          backgroundColor: 'var(--bg-tertiary)', 
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}>
          💡 <strong>Демо-совет:</strong> Вы можете ввести любой email и пароль. Чтобы протестировать панель администратора, используйте email, содержащий слово <code>admin</code> (например, <code>admin@store.com</code>).
        </div>
      </div>
    </div>
  );
}
