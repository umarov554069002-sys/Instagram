import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';

// Защищенный роут для админки
const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Загрузка...</div>;
  
  return currentUser?.isAdmin ? children : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <div className="page-wrapper">
      <Header />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <footer>
        <div className="container">
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>InstaStore Clone</p>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} Все права защищены. Построено на React, Node.js Serverless и Firebase.
          </p>
        </div>
      </footer>
    </div>
  );
}
