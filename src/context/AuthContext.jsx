import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, isMockFirebase } from '../firebase';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Локальные моки для демо-режима
  const loginMock = async (email, password) => {
    setLoading(true);
    // Имитируем сетевую задержку
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser = {
      uid: 'demo-user-123',
      email: email,
      displayName: email.split('@')[0],
      isDemo: true,
      isAdmin: email.includes('admin') // Простой хак для демо-админки
    };
    setCurrentUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    setLoading(false);
    return mockUser;
  };

  const signupMock = async (email, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockUser = {
      uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: email.split('@')[0],
      isDemo: true,
      isAdmin: false
    };
    setCurrentUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    setLoading(false);
    return mockUser;
  };

  const logoutMock = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setCurrentUser(null);
    localStorage.removeItem('demo_user');
    setLoading(false);
  };

  // Выбор методов в зависимости от режима
  const login = (email, password) => {
    if (isMockFirebase) {
      return loginMock(email, password);
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    if (isMockFirebase) {
      return signupMock(email, password);
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (isMockFirebase) {
      return logoutMock();
    }
    return firebaseSignOut(auth);
  };

  useEffect(() => {
    if (isMockFirebase) {
      // Инициализация демо-пользователя из localStorage
      const savedUser = localStorage.getItem('demo_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      // Реальный Firebase Auth слушатель
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          // Для простоты, админ — это пользователь с определенной почтой, либо проверяем кастомные claims в будущем
          const enrichedUser = {
            ...user,
            isAdmin: user.email === 'admin@store.com' || user.email === 'admin@admin.com'
          };
          setCurrentUser(enrichedUser);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    isDemo: isMockFirebase
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
