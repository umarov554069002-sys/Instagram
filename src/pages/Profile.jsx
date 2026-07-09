import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, Grid, Heart, MessageSquare, User, Check, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFollowing } from '../context/FollowingContext';
import { useFavorites } from '../context/FavoritesContext';
import { MOCK_PRODUCTS } from '../mockData';

// База публичных профилей
const PUBLIC_PROFILES = {
  'chat-maria': {
    id: 'chat-maria',
    name: 'maria_style',
    fullName: 'Мария ✨',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    bio: 'Fashion Блогер 🌟 | Обзоры на стильную одежду и аксессуары. По вопросам сотрудничества пишите в Direct ✉️',
    baseFollowers: 12400,
    following: 342,
    products: ['prod-3'], // SoundFlow headphones
    reels: [{ id: 'reel-1', index: 0, coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' }]
  },
  'chat-seller-1': {
    id: 'chat-seller-1',
    name: 'anna_sales',
    fullName: 'Анна 👜',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    bio: 'Официальный представитель Instagram. Помогаю с подбором размеров и оформлением заказов 🛍️',
    baseFollowers: 8900,
    following: 154,
    products: ['prod-2'], // Leather handbag
    reels: [{ id: 'reel-2', index: 1, coverUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300' }]
  },
  'chat-logistic': {
    id: 'chat-logistic',
    name: 'sergey_logistic',
    fullName: 'Сергей 🚚',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    bio: 'Логистика Instagram. Быстрая доставка по всей стране. Вопросы по доставке пишите сюда 📦',
    baseFollowers: 3200,
    following: 89,
    products: [],
    reels: []
  },
  'chat-sales': {
    id: 'chat-sales',
    name: 'instagram_sales',
    fullName: 'Отдел продаж 📈',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
    bio: 'Оптовые закупки и спецпредложения для дилеров. Пишите по сотрудничеству!',
    baseFollowers: 4500,
    following: 23,
    products: [],
    reels: []
  },
  'chat-support': {
    id: 'chat-support',
    name: 'instagram_official',
    fullName: 'Instagram',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60',
    bio: 'Добро пожаловать в Instagram — платформа для общения, фотографии и видео. Делитесь моментами! ✨',
    baseFollowers: 450000000,
    following: 12,
    products: ['prod-1', 'prod-2', 'prod-3'],
    reels: [{ id: 'reel-3', index: 2, coverUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300' }],
    verified: true
  }
};

const formatFollowers = (count) => {
  if (count >= 1e12) return (count / 1e12).toFixed(1).replace('.0', '') + ' трлн';
  if (count >= 1e9) return (count / 1e9).toFixed(1).replace('.0', '') + ' млрд';
  if (count >= 1e6) return (count / 1e6).toFixed(1).replace('.0', '') + ' млн';
  if (count >= 1e3) return (count / 1e3).toFixed(1).replace('.0', '') + ' тыс.';
  return count.toLocaleString();
};

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow, followingList } = useFollowing();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState('posts'); // posts, reels, saved

  const isMe = !id || id === 'me';
  
  // Профиль для рендеринга
  const profile = isMe 
    ? {
        id: 'me',
        name: currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'guest_user',
        fullName: currentUser ? currentUser.email : 'Гость',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
        bio: 'Пользователь Instagram 📸. Обожаю стильные фотографии и качественный звук.',
        baseFollowers: 298000000000, // 298 млрд
        following: followingList.length,
        products: [],
        reels: [],
        verified: true
      }
    : PUBLIC_PROFILES[id] || PUBLIC_PROFILES['chat-support']; // fallback на официальный профиль

  const isFollowingProfile = isFollowing(profile.id);
  const followersCount = profile.baseFollowers + (isFollowingProfile ? 1 : 0);

  // Фильтруем товары для вкладок
  const profileProducts = MOCK_PRODUCTS.filter(p => profile.products.includes(p.id));
  const savedProducts = MOCK_PRODUCTS.filter(p => favorites.includes(p.id));

  return (
    <div className="animate-fade-in" style={{ padding: '100px 0 60px', minHeight: 'calc(100vh - var(--header-height))', position: 'relative' }}>
      
      {/* Декоративное пятно */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'var(--accent-gradient)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
        
        {/* Шапка Профиля */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '44px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '44px'
        }}>
          {/* Аватар */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="gradient-bg" style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--bg-primary)'
                }}
              />
            </div>
          </div>

          {/* Информация о профиле */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Никнейм и Кнопки действий */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>@{profile.name}</h2>
                {profile.verified && (
                  <span 
                    title="Подтвержденный аккаунт" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#0095f6',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      padding: '2px',
                      flexShrink: 0
                    }}
                  >
                    <Check size={12} strokeWidth={4} color="white" />
                  </span>
                )}
              </div>
              
              {!isMe ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => toggleFollow(profile.id)}
                    className={isFollowingProfile ? "btn btn-secondary" : "btn btn-primary"}
                    style={{
                      padding: '6px 20px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: isFollowingProfile ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    {isFollowingProfile ? 'Подписки' : 'Подписаться'}
                  </button>
                  <button
                    onClick={() => navigate('/messages', { state: { selectChatId: profile.id } })}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={14} /> Сообщение
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="btn btn-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  Выйти из аккаунта
                </button>
              )}
            </div>

            {/* Счетчики активности */}
            <div style={{ display: 'flex', gap: '40px', fontSize: '15px' }}>
              <span>
                <strong>{!isMe ? profileProducts.length + profile.reels.length : 0}</strong> публикаций
              </span>
              <span>
                <strong>{formatFollowers(followersCount)}</strong> подписчиков
              </span>
              <span>
                <strong>{formatFollowers(profile.following)}</strong> подписок
              </span>
            </div>

            {/* Биография (Bio) */}
            <div>
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>{profile.fullName}</strong>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {profile.bio}
              </p>
            </div>

          </div>
        </div>

        {/* Вкладки (Tabs) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '60px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('posts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '16px 0',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'posts' ? '1px solid var(--text-primary)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Grid size={16} /> Публикации
          </button>
          
          <button
            onClick={() => setActiveTab('reels')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '16px 0',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: activeTab === 'reels' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === 'reels' ? '1px solid var(--text-primary)' : 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Film size={16} /> Reels
          </button>

          {isMe && (
            <button
              onClick={() => setActiveTab('saved')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '16px 0',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: activeTab === 'saved' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottom: activeTab === 'saved' ? '1px solid var(--text-primary)' : 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Bookmark size={16} /> Сохраненное
            </button>
          )}
        </div>

        {/* Сетка Контента (Grid) */}
        <div>
          {/* Публикации (Товары) */}
          {activeTab === 'posts' && (
            profileProducts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {profileProducts.map(prod => (
                  <div 
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="glass"
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--border-radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {prod.price.toLocaleString()} ₽
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                <Grid size={40} style={{ marginBottom: '12px' }} />
                <h3>Публикаций пока нет</h3>
              </div>
            )
          )}

          {/* Reels */}
          {activeTab === 'reels' && (
            profile.reels.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {profile.reels.map(reel => (
                  <div 
                    key={reel.id}
                    onClick={() => navigate(`/reels?index=${reel.index}`)}
                    className="glass"
                    style={{
                      aspectRatio: '3/4',
                      borderRadius: 'var(--border-radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={reel.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      color: 'white'
                    }}>
                      <Film size={18} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                <Film size={40} style={{ marginBottom: '12px' }} />
                <h3>Видео Reels пока нет</h3>
              </div>
            )
          )}

          {/* Сохраненное (Избранное) */}
          {activeTab === 'saved' && isMe && (
            savedProducts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {savedProducts.map(prod => (
                  <div 
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="glass"
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--border-radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {prod.price.toLocaleString()} ₽
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                <Bookmark size={40} style={{ marginBottom: '12px' }} />
                <h3>Сохраненного пока нет</h3>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Все товары, которые вы лайкнете, появятся здесь</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
