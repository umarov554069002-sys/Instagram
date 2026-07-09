import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Heart, Film, MessageCircle, Send, Bookmark, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import Stories from '../components/Stories';
import { useFollowing } from '../context/FollowingContext';
import { useFavorites } from '../context/FavoritesContext';
import ShareModal from '../components/ShareModal';

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

// Данные постов в ленте
const DEFAULT_FEED_POSTS = [
  {
    id: 'post-1',
    productId: 'prod-1',
    authorId: 'chat-support',
    authorName: 'instastore_official',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    location: 'Москва, Россия',
    likesCount: 1420,
    liked: false,
    caption: 'Умные часы Pulse — это идеальный баланс стиля и функционала! Мониторинг пульса, шагомер, и до 14 дней автономной работы. В наличии во всех цветах! ⌚🔥',
    comments: [
      { id: 'c-1', author: 'ivan_style', text: 'Часы супер! Пользуюсь уже месяц 👍' },
      { id: 'c-2', author: 'dmitry_cool', text: 'Есть доставка в Питер?' }
    ]
  },
  {
    id: 'post-2',
    productId: 'prod-2',
    authorId: 'chat-seller-1',
    authorName: 'anna_sales',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    location: 'Казань, Россия',
    likesCount: 890,
    liked: false,
    caption: 'Минималистичный дизайн и натуральная кожа. Идеально под любой образ. Лимитированная серия сумок! 👜✨',
    comments: [
      { id: 'c-3', author: 'maria_style', text: 'Она прекрасна! Хочу такую себе 😍' }
    ]
  },
  {
    id: 'post-3',
    productId: 'post-3',
    productIdLink: 'prod-3',
    authorId: 'chat-maria',
    authorName: 'maria_style',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    location: 'Сочи, Россия',
    likesCount: 2450,
    liked: false,
    caption: 'Новый взгляд на качественный звук! Беспроводные наушники SoundFlow с активным шумоподавлением. Чистый бас и кристальный звук! 🎧💙',
    comments: [
      { id: 'c-4', author: 'instastore_official', text: 'Спасибо за отзыв, Маша!' }
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [reelsList, setReelsList] = useState([]);
  const { isFollowing, toggleFollow } = useFollowing();
  const { favorites, toggleFavorite } = useFavorites();

  // Состояния для постов ленты (лайки, комментарии, инпуты)
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('demo_feed_posts');
    return saved ? JSON.parse(saved) : DEFAULT_FEED_POSTS;
  });
  const [commentInputs, setCommentInputs] = useState({});

  // Состояние модалки репоста
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);

  // Загрузка популярных рилсов
  useEffect(() => {
    const saved = localStorage.getItem('demo_reels');
    if (saved) {
      setReelsList(JSON.parse(saved));
    } else {
      setReelsList(FALLBACK_REELS);
    }
  }, []);

  const handleLikePost = (postId) => {
    setPosts(prev => {
      const next = prev.map(post => {
        if (post.id === postId) {
          const isL = !post.liked;
          return {
            ...post,
            liked: isL,
            likesCount: isL ? post.likesCount + 1 : post.likesCount - 1
          };
        }
        return post;
      });
      localStorage.setItem('demo_feed_posts', JSON.stringify(next));
      return next;
    });
  };

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId] || '';
    if (!commentText.trim()) return;

    setPosts(prev => {
      const next = prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: 'c-' + Date.now(),
                author: 'Покупатель',
                text: commentText.trim()
              }
            ]
          };
        }
        return post;
      });
      localStorage.setItem('demo_feed_posts', JSON.stringify(next));
      return next;
    });

    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }));
  };

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
              <a href="#featured-feed" className="btn btn-secondary" style={{ padding: '16px 32px', borderRadius: 'var(--border-radius-full)' }}>
                Лента новостей
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
                    <div 
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        marginBottom: '14px',
                        border: '2px solid var(--border-color)',
                        cursor: 'pointer'
                      }}
                    >
                      <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h3 
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', cursor: 'pointer' }}
                    >
                      @{profile.name}
                    </h3>
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

      {/* Лента новостей в стиле Instagram (Home Feed) */}
      <section id="featured-feed" style={{ padding: '60px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Лента новостей</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Новые посты и обзоры товаров от продавцов</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {posts.map(post => {
              const product = MOCK_PRODUCTS.find(p => p.id === (post.productIdLink || post.productId));
              const isFav = favorites.includes(product?.id);
              
              return (
                <div key={post.id} className="glass" style={{
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  
                  {/* Пост Хедер */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div 
                        onClick={() => navigate(`/profile/${post.authorId}`)}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', border: '1.5px solid var(--border-color)' }}
                      >
                        <img src={post.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <strong 
                          onClick={() => navigate(`/profile/${post.authorId}`)}
                          style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'block' }}
                        >
                          {post.authorName}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{post.location}</span>
                      </div>
                    </div>
                    <button style={{ color: 'var(--text-secondary)' }}><MoreHorizontal size={18} /></button>
                  </div>

                  {/* Картинка поста (изображение товара) */}
                  <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', position: 'relative', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <img 
                      src={product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    
                    {/* Плавающий ценник */}
                    {product && (
                      <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '20px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-full)',
                        fontSize: '12px',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)'
                      }}>
                        {product.price.toLocaleString()} ₽
                      </div>
                    )}
                  </div>

                  {/* Панель иконок действий */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px 8px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        style={{ color: post.liked ? 'var(--accent-pink)' : 'var(--text-primary)', transition: 'transform 0.1s' }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.8)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Heart size={20} fill={post.liked ? 'var(--accent-pink)' : 'none'} />
                      </button>
                      <button style={{ color: 'var(--text-primary)' }}>
                        <MessageCircle size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          if (product) {
                            setShareItem(product);
                            setIsShareOpen(true);
                          }
                        }}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Send size={20} style={{ transform: 'rotate(-45deg)' }} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => product && toggleFavorite(product.id)}
                      style={{ color: isFav ? 'var(--accent-pink)' : 'var(--text-primary)' }}
                    >
                      <Bookmark size={20} fill={isFav ? 'var(--accent-pink)' : 'none'} />
                    </button>
                  </div>

                  {/* Лайки */}
                  <div style={{ padding: '0 18px 4px', fontSize: '13px', fontWeight: 700 }}>
                    Нравится: {post.likesCount.toLocaleString()}
                  </div>

                  {/* Подпись к посту (Caption) */}
                  <div style={{ padding: '0 18px 8px', fontSize: '13px', lineHeight: '1.4' }}>
                    <strong style={{ marginRight: '6px' }}>{post.authorName}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{post.caption}</span>
                  </div>

                  {/* Список комментариев */}
                  {post.comments.length > 0 && (
                    <div style={{ padding: '0 18px 8px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                      {post.comments.map(c => (
                        <div key={c.id} style={{ fontSize: '12px' }}>
                          <strong style={{ marginRight: '6px' }}>{c.author}</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Кнопка "Купить" и Форма ввода комментария */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    padding: '8px 12px'
                  }}>
                    {product && (
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="gradient-bg"
                        style={{
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '8px 14px',
                          borderRadius: 'var(--border-radius-full)',
                          marginRight: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(225,48,108,0.2)'
                        }}
                      >
                        <ShoppingCart size={12} /> В магазин
                      </button>
                    )}
                    
                    <form 
                      onSubmit={(e) => handleAddComment(post.id, e)}
                      style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}
                    >
                      <input 
                        type="text" 
                        placeholder="Добавьте комментарий..." 
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCommentInputs(prev => ({ ...prev, [post.id]: val }));
                        }}
                        style={{
                          flexGrow: 1,
                          height: '32px',
                          border: 'none',
                          outline: 'none',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button 
                        type="submit" 
                        disabled={!(commentInputs[post.id] || '').trim()}
                        className="btn-text"
                        style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-pink)', opacity: !(commentInputs[post.id] || '').trim() ? 0.5 : 1 }}
                      >
                        Опубликовать
                      </button>
                    </form>
                  </div>

                </div>
              );
            })}
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

      {/* Модалка репоста */}
      {shareItem && (
        <ShareModal 
          isOpen={isShareOpen}
          onClose={() => { setIsShareOpen(false); setShareItem(null); }}
          item={shareItem}
          type="product"
        />
      )}
    </div>
  );
}
