import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Heart, Star } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  // Находим товар по ID
  const product = MOCK_PRODUCTS.find(p => p.id === id);

  if (!product) {
    return (
      <div className="container" style={{ padding: '150px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Товар не найден</h2>
        <Link to="/catalog" className="btn btn-primary">
          <ArrowLeft size={16} /> Назад в каталог
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '120px 24px 80px' }}>
      {/* Кнопка назад */}
      <Link to="/catalog" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        marginBottom: '32px'
      }}>
        <ArrowLeft size={16} /> Назад в каталог
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'start'
      }}>
        {/* Левая колонка - Изображение */}
        <div className="glass" style={{
          padding: '16px',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative'
        }}>
          <img 
            src={product.image} 
            alt={product.name} 
            style={{
              width: '100%',
              borderRadius: 'var(--border-radius-md)',
              display: 'block',
              maxHeight: '500px',
              objectFit: 'cover'
            }}
          />
          {/* Сердечко */}
          <button 
            onClick={() => setLiked(!liked)}
            style={{
              position: 'absolute',
              top: '32px',
              right: '32px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--glass-border)',
              color: liked ? 'var(--accent-pink)' : 'var(--text-primary)'
            }}
          >
            <Heart size={20} fill={liked ? 'var(--accent-pink)' : 'none'} />
          </button>
        </div>

        {/* Правая колонка - Информация */}
        <div>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '8px'
          }}>
            {product.category}
          </span>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: '1.2',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            {product.name}
          </h1>

          {/* Рейтинг */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffcc00' }}>
              <Star size={16} fill="#ffcc00" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{product.rating}</span>
            </div>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {product.reviews} отзывов
            </span>
          </div>

          {/* Цена */}
          <div style={{
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}>
            {product.price.toLocaleString('ru-RU')} ₽
          </div>

          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>
            {product.description}
          </p>

          {/* Управление количеством и покупка */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius-sm)',
              overflow: 'hidden',
              height: '48px',
              background: 'var(--bg-secondary)'
            }}>
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={{ padding: '0 16px', height: '100%', fontSize: '18px', fontWeight: 600 }}
              >
                -
              </button>
              <span style={{ padding: '0 8px', minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                style={{ padding: '0 16px', height: '100%', fontSize: '18px', fontWeight: 600 }}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{
                flexGrow: 1,
                height: '48px',
                borderRadius: 'var(--border-radius-sm)'
              }}
            >
              <ShoppingCart size={18} /> Добавить в корзину
            </button>
          </div>

          {/* Особенности товара */}
          {product.features && (
            <div className="glass" style={{
              borderRadius: 'var(--border-radius-md)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Характеристики:</h4>
              {product.features.map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <ShieldCheck size={16} color="var(--accent-pink)" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
