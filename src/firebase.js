import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Проверяем, настроены ли реальные ключи Firebase
export const isMockFirebase = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey === 'mock_key' || 
  firebaseConfig.apiKey.includes('your_api_key');

let app;
let auth = null;
let db = null;

if (!isMockFirebase) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase успешно инициализирован.");
  } catch (error) {
    console.error("Ошибка при инициализации Firebase. Включается демо-режим.", error);
  }
} else {
  console.log("Запущен демо-режим (Firebase не настроен). Используются локальные заглушки.");
}

export { auth, db };
