import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';

export default function Favorites() {
  const { favoriteItems } = useFavorites();

  if (favoriteItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '150px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-tertiary)' }}>
          <Heart size={72} />
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>Список избранного пуст</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Добавляйте понравившиеся товары в избранное, чтобы вернуться к ним позже.
        </p>
        <Link to="/catalog" className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 'var(--border-radius-full)' }}>
          В каталог <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '120px 24px 80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Избранное</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Вы сохранили товаров: {favoriteItems.length}
        </p>
      </div>

      {/* Сетка избранных товаров */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px'
      }}>
        {favoriteItems.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
