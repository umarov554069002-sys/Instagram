import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const isFav = isFavorite(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    addToCart(product);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    toggleFavorite(product);
  };

  return (
    <div className="glass animate-fade-in" style={{
      borderRadius: 'var(--border-radius-md)',
      overflow: 'hidden',
      transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
    }}>
      
      {/* Кнопка "Лайк / Избранное" */}
      <button 
        onClick={handleToggleFavorite}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isFav ? 'var(--accent-pink)' : 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isFav ? "Убрать из избранного" : "Добавить в избранное"}
      >
        <Heart size={18} fill={isFav ? 'var(--accent-pink)' : 'none'} />
      </button>

      {/* Ссылка на детальную страницу */}
      <Link to={`/product/${product.id}`} style={{ display: 'block', overflow: 'hidden', aspectRatio: '1/1', position: 'relative' }}>
        <img 
          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} 
          alt={product.name} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        {/* Категория */}
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(4px)',
          fontSize: '11px',
          fontWeight: '600',
          padding: '4px 8px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)'
        }}>
          {product.category}
        </span>
      </Link>

      {/* Описание товара */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Link to={`/product/${product.id}`}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {product.name}
          </h3>
        </Link>
        
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '16px',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          height: '36px'
        }}>
          {product.description}
        </p>

        {/* Цена и покупка */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            {product.price.toLocaleString('ru-RU')} ₽
          </span>
          <button 
            onClick={handleAddToCart}
            className="gradient-bg"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(225, 48, 108, 0.2)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Добавить в корзину"
          >
            <ShoppingCart size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
