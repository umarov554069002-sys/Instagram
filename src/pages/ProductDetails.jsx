import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, ShieldCheck, Heart, Star, User, MessageSquare, Send } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { useCart } from '../context/CartContext';
import ShareModal from '../components/ShareModal';

// Стартовые отзывы
const SEED_REVIEWS = [
  { id: 'rev-1', author: 'Елена', rating: 5, text: 'Очень понравился товар! Качество ткани потрясающее, сидит супер. Доставили на следующий день!', date: '2026-06-25T10:30:00.000Z' },
  { id: 'rev-2', author: 'Дмитрий', rating: 4, text: 'Хорошее качество, плотный материал. На рост 180 подошел отлично. Слегка оверсайз.', date: '2026-06-28T14:15:00.000Z' }
];

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  
  // Состояния для отзывов
  const [reviews, setReviews] = useState([]);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Состояние модалки репоста
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Находим товар по ID
  const baseProduct = MOCK_PRODUCTS.find(p => p.id === id);

  if (!baseProduct) {
    return (
      <div className="container" style={{ padding: '150px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '16px' }}>Товар не найден</h2>
        <Link to="/catalog" className="btn btn-primary">
          <ArrowLeft size={16} /> Назад в каталог
        </Link>
      </div>
    );
  }

  // Локальная копия товара с динамическим рейтингом
  const [product, setProduct] = useState(baseProduct);

  // Загрузка отзывов
  useEffect(() => {
    const saved = localStorage.getItem(`demo_reviews_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setReviews(parsed);
      recalculateProductRating(parsed);
    } else {
      setReviews(SEED_REVIEWS);
      localStorage.setItem(`demo_reviews_${id}`, JSON.stringify(SEED_REVIEWS));
      recalculateProductRating(SEED_REVIEWS);
    }
  }, [id]);

  const recalculateProductRating = (currentReviews) => {
    if (currentReviews.length === 0) return;
    const totalRating = currentReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = parseFloat((totalRating / currentReviews.length).toFixed(1));
    setProduct(prev => ({
      ...prev,
      rating: avg,
      reviews: currentReviews.length
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) return;

    const newReview = {
      id: 'rev-' + Date.now(),
      author: reviewerName.trim(),
      rating: Number(rating),
      text: reviewText.trim(),
      date: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`demo_reviews_${id}`, JSON.stringify(updatedReviews));
    recalculateProductRating(updatedReviews);

    setReviewerName('');
    setReviewText('');
    setRating(5);
    alert('Отзыв успешно добавлен!');
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
        alignItems: 'start',
        marginBottom: '60px'
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
              background: 'var(--bg-secondary)',
              flexShrink: 0
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

            {/* Кнопка "Репост / Поделиться" */}
            <button 
              onClick={() => setIsShareOpen(true)}
              className="btn btn-secondary"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                flexShrink: 0
              }}
              title="Поделиться товаром"
            >
              <Send size={18} style={{ transform: 'rotate(-45deg)', margin: '0 0 2px 2px' }} />
            </button>
          </div>

          {/* Характеристики товара */}
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

      {/* Раздел отзывов и комментариев */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '48px' }}>
        <h2 style={{ fontSize: '26px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare className="gradient-text" /> Отзывы покупателей ({reviews.length})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.8fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Форма написания отзыва */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Оставить отзыв</h3>
            
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ваше имя</label>
                <input 
                  type="text" 
                  placeholder="Имя или никнейм" 
                  required 
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                />
              </div>

              {/* Звездный рейтинг */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ваша оценка</label>
                <div style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ color: star <= (hoverRating || rating) ? '#ffcc00' : 'var(--text-tertiary)' }}
                    >
                      <Star size={24} fill={star <= (hoverRating || rating) ? '#ffcc00' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Текст отзыва</label>
                <textarea 
                  placeholder="Поделитесь вашим мнением о качестве товара..." 
                  required 
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', borderRadius: 'var(--border-radius-sm)', marginTop: '8px' }}
              >
                Отправить отзыв
              </button>
            </form>
          </div>

          {/* Список опубликованных отзывов */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="glass animate-fade-in" style={{
                  borderRadius: 'var(--border-radius-md)',
                  padding: '20px',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    flexShrink: 0
                  }}>
                    <User size={18} />
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700 }}>{rev.author}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {new Date(rev.date).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px', marginBottom: '8px', color: '#ffcc00' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= rev.rating ? '#ffcc00' : 'none'} strokeWidth={s <= rev.rating ? 0 : 2} />
                      ))}
                    </div>

                    <p style={{ fontSize: '13.5px', lineHeight: '1.5', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {rev.text}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Пока отзывов нет. Будьте первыми, кто оставит свой отзыв!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Модалка репоста */}
      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        item={product}
        type="product"
      />
    </div>
  );
}
