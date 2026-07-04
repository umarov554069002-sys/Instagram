import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import ProductCard from '../components/ProductCard';
import Stories from '../components/Stories';

export default function Home() {
  // Показываем первые 3 товара как рекомендуемые
  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  const categories = [
    { name: 'Одежда', count: 1, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=60' },
    { name: 'Аксессуары', count: 3, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&auto=format&fit=crop&q=60' },
    { name: 'Электроника', count: 1, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=60' },
    { name: 'Косметика', count: 1, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Истории */}
      <div className="container" style={{ borderBottom: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <Stories />
      </div>

      {/* Hero-секция */}
      <section style={{
        position: 'relative',
        padding: '120px 0 80px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 80% 20%, rgba(225, 48, 108, 0.1) 0%, rgba(249, 206, 52, 0.05) 50%, transparent 100%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <span className="gradient-text" style={{
              fontWeight: 800,
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              display: 'inline-block',
              marginBottom: '16px'
            }}>
              Новая коллекция 2026
            </span>
            <h1 style={{
              fontSize: '56px',
              lineHeight: '1.1',
              fontWeight: 800,
              marginBottom: '24px',
              color: 'var(--text-primary)'
            }}>
              Магазин твоих <br />
              <span className="gradient-text">желаний</span> в один клик.
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
              marginBottom: '40px',
              maxWidth: '480px'
            }}>
              Открой для себя трендовую одежду, уникальные аксессуары и передовую технику. Быстрая доставка, премиальный сервис.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/catalog" className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: 'var(--border-radius-full)' }}>
                В каталог <ArrowRight size={18} />
              </Link>
              <a href="#featured" className="btn btn-secondary" style={{ padding: '16px 32px', borderRadius: 'var(--border-radius-full)' }}>
                Популярное
              </a>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Декоративное размытое пятно */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'var(--accent-gradient)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              opacity: 0.3,
              zIndex: 0
            }}></div>
            
            {/* Изображение с эффектом Glassmorphism сзади */}
            <div className="glass" style={{
              padding: '16px',
              borderRadius: 'var(--border-radius-lg)',
              zIndex: 1,
              width: '85%',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80" 
                alt="Fashion Header" 
                style={{
                  width: '100%',
                  borderRadius: 'var(--border-radius-md)',
                  display: 'block',
                  height: '400px',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Раздел категорий */}
      <section style={{ padding: '80px 0 40px' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>
            Популярные категории
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/catalog?category=${cat.name}`}
                className="glass"
                style={{
                  borderRadius: 'var(--border-radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'transform var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  border: '2px solid var(--accent-pink)',
                  padding: '3px'
                }}>
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{cat.name}</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Товаров: {cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Рекомендуемые товары */}
      <section id="featured" style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px'
          }}>
            <div>
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Тренды недели</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Выбор наших покупателей</p>
            </div>
            <Link to="/catalog" className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Все товары <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Особенности магазина */}
      <section style={{ padding: '60px 0 20px' }}>
        <div className="container">
          <div className="glass" style={{
            borderRadius: 'var(--border-radius-lg)',
            padding: '48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="gradient-bg" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Truck size={24} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Быстрая доставка</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Бесплатная курьерская доставка по всей России при заказе от 5000 рублей.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="gradient-bg" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <RotateCcw size={24} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Простой возврат</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Не подошел размер? Верните товар в течение 14 дней без лишних вопросов.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="gradient-bg" style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={24} color="white" />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Оригинальные бренды</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Мы работаем напрямую с производителями и гарантируем 100% подлинность.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
