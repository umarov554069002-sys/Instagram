import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Heart, Film } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import ProductCard from '../components/ProductCard';
import Stories from '../components/Stories';
import { useFollowing } from '../context/FollowingContext';

// Обложки по умолчанию для рилсов на случай отсутствия в localStorage
const FALLBACK_REELS = [
  {
    id: 'reel-1',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    caption: 'Новый взгляд на качественный звук 🎧 Обзор SoundFlow!',
    likes: 342
  },
  {
    id: 'reel-2',
    coverUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    caption: 'Минималистичный дизайн и натуральная кожа. Идеально под любой образ 👜',
    likes: 189
  },
  {
    id: 'reel-3',
    coverUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
    caption: 'Качество в каждой детали. Узнайте характеристики в каталоге! ✨',
    likes: 512
  }
];

// Рекомендованные профили для подписок
const SUGGESTED_PROFILES = [
  { 
    id: 'chat-maria', 
    name: 'maria_style', 
    desc: 'Мария • Блогер / Обзоры', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' 
  },
  { 
    id: 'chat-seller-1', 
    name: 'anna_sales', 
    desc: 'Анна • Консультант магазина', 
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' 
  },
  { 
    id: 'chat-logistic', 
    name: 'sergey_logistic', 
    desc: 'Сергей • Служба доставки', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' 
  },
  { 
    id: 'chat-sales', 
    name: 'instastore_sales', 
    desc: 'Оптовый отдел продаж', 
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60' 
  }
];

export default function Home() {
  const [reelsList, setReelsList] = useState([]);
  const { isFollowing, toggleFollow } = useFollowing();

  // Загрузка популярных рилсов
  useEffect(() => {
    const saved = localStorage.getItem('demo_reels');
    if (saved) {
      setReelsList(JSON.parse(saved));
    } else {
      setReelsList(FALLBACK_REELS);
    }
  }, []);

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
      <section style={{ padding: '80px 0 40px', borderBottom: '1px solid var(--border-color)' }}>
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

      {/* Раздел Рекомендованные профили (Suggested Accounts) */}
      <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Рекомендации для вас</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Интересные аккаунты, на которые можно подписаться</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {SUGGESTED_PROFILES.map((profile) => {
              const isFollowingProfile = isFollowing(profile.id);
              return (
                <div 
                  key={profile.id}
                  className="glass animate-fade-in"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      border: '2px solid var(--border-color)'
                    }}>
                      <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>@{profile.name}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'block' }}>
                      {profile.desc}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleFollow(profile.id)}
                    className={isFollowingProfile ? "btn btn-secondary" : "btn btn-primary"}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isFollowingProfile ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    {isFollowingProfile ? 'Вы подписаны' : 'Подписаться'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Раздел Популярные Рилсы (Reels Discovery) */}
      {reelsList.length > 0 && (
        <section style={{ padding: '60px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '40px'
            }}>
              <div>
                <h2 style={{ fontSize: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film className="gradient-text" size={28} /> Популярные Рилсы
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>Смотрите обзоры на товары в видеоформате</p>
              </div>
              <Link to="/reels" className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                Смотреть все <ArrowRight size={16} />
              </Link>
            </div>

            {/* Сетка обложек рилсов */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px'
            }}>
              {reelsList.slice(0, 3).map((reel, idx) => (
                <Link 
                  key={reel.id} 
                  to={`/reels?index=${idx}`}
                  className="glass"
                  style={{
                    borderRadius: 'var(--border-radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    aspectRatio: '3/4',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {/* Обложка */}
                  <img 
                    src={reel.coverUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'} 
                    alt="" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />

                  {/* Оверлей приглушения */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px',
                    color: 'white'
                  }}>
                    {/* Кнопка Play по центру */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                    }}>
                      <Film size={20} color="white" />
                    </div>

                    {/* Верхняя строка - Лайки */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: '4px 10px',
                        borderRadius: 'var(--border-radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ❤️ {reel.likes}
                      </span>
                    </div>

                    {/* Нижняя строка - Текст */}
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      lineHeight: '1.4',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {reel.caption}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Рекомендуемые товары */}
      <section id="featured" style={{ padding: '60px 0', borderBottom: '1px solid var(--border-color)' }}>
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
