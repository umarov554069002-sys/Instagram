import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { currentUser, login, signup, signInWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Произошла ошибка при входе через Google.');
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

        {/* Разделитель */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', textTransform: 'uppercase', fontWeight: 600 }}>Или</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Кнопка входа через Google */}
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="btn btn-secondary"
          disabled={loading}
          style={{
            width: '100%',
            height: '48px',
            borderRadius: 'var(--border-radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Войти через Google
        </button>

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
