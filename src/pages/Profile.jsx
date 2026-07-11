import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Film, Grid, Heart, MessageSquare, Check, Bookmark, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFollowing } from '../context/FollowingContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

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
    reels: [{ id: 'reel-1', index: 0, coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' }]
  },
  'chat-seller-1': {
    id: 'chat-seller-1',
    name: 'anna_sales',
    fullName: 'Анна 👜',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    bio: 'Официальный представитель Instagram. Помогаю с подбором размеров и контентом 🛍️',
    baseFollowers: 8900,
    following: 154,
    reels: [{ id: 'reel-2', index: 1, coverUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300' }]
  },
  'chat-logistic': {
    id: 'chat-logistic',
    name: 'sergey_logistic',
    fullName: 'Сергей 🚚',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    bio: 'Логистика Instagram. Быстрая доставка по всей стране. Вопросы пишите сюда 📦',
    baseFollowers: 3200,
    following: 89,
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
  const { isFollowing, toggleFollow, followedIds } = useFollowing();
  
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // posts, reels, saved
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMe = !id || id === 'me';
  const profileId = isMe ? 'me' : id;
  const isDemo = !db;

  const getLocalProfile = (pid) => {
    if (pid === 'me') {
      return {
        id: 'me',
        name: currentUser ? (currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'user')) : 'guest_user',
        fullName: currentUser ? (currentUser.email || currentUser.displayName || 'Гость') : 'Гость',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
        bio: 'Пользователь Instagram 📸. Обожаю стильные фотографии и качественный звук.',
        baseFollowers: 298000000000, // 298 млрд
        following: followedIds.length,
        reels: [],
        verified: true
      };
    }
    return PUBLIC_PROFILES[pid] || PUBLIC_PROFILES['chat-support'];
  };

  // Загрузка и синхронизация профиля с Firestore
  useEffect(() => {
    setLoading(true);
    if (isDemo) {
      setProfileData(getLocalProfile(profileId));
      setLoading(false);
    } else {
      const docRef = doc(db, 'profiles', profileId);
      const unsubscribe = onSnapshot(docRef, 
        async (snapshot) => {
          try {
            if (snapshot.exists()) {
              setProfileData(snapshot.data());
            } else {
              // Если профиля нет в бд, создаем его
              const defaultProfile = getLocalProfile(profileId);
              await setDoc(docRef, defaultProfile);
              setProfileData(defaultProfile);
            }
            setLoading(false);
          } catch (err) {
            console.error("[Firestore] Ошибка при инициализации/загрузке профиля:", err);
            setProfileData(getLocalProfile(profileId));
            setLoading(false);
          }
        },
        (error) => {
          console.error("Ошибка при чтении профиля из Firestore:", error);
          setProfileData(getLocalProfile(profileId));
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [profileId, isDemo, currentUser, followedIds.length]);

  const handleToggleFollow = async () => {
    if (!profileData) return;
    const isFollowingProfile = isFollowing(profileData.id);

    // Обновляем подписки локально
    toggleFollow(profileData.id);

    if (!isDemo) {
      try {
        const nextFollowers = isFollowingProfile
          ? Math.max(0, profileData.baseFollowers - 1)
          : profileData.baseFollowers + 1;
        
        await updateDoc(doc(db, 'profiles', profileData.id), {
          baseFollowers: nextFollowers
        });
      } catch (e) {
        console.error("Ошибка при изменении подписки в Firestore:", e);
      }
    }
  };

  // Загружаем посты из localStorage
  const [feedPosts] = useState(() => {
    const saved = localStorage.getItem('ig_feed_posts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Фильтруем посты автора
  const profilePosts = feedPosts.filter(p => p.authorId === (profileData?.id));
  // Фильтруем сохраненные посты
  const savedPosts = feedPosts.filter(p => p.saved);

  if (loading || !profileData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-pink)' }} />
        <span style={{ marginTop: '12px' }}>Загрузка профиля...</span>
      </div>
    );
  }

  const isFollowingProfile = isFollowing(profileData.id);

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
                src={profileData.avatar} 
                alt={profileData.name} 
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
                <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>@{profileData.name}</h2>
                {profileData.verified && (
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
                    onClick={handleToggleFollow}
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
                    onClick={() => navigate('/messages', { state: { selectChatId: profileData.id } })}
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
                <strong>{profilePosts.length + (profileData.reels ? profileData.reels.length : 0)}</strong> публикаций
              </span>
              <span>
                <strong>{formatFollowers(profileData.baseFollowers)}</strong> подписчиков
              </span>
              <span>
                <strong>{formatFollowers(profileData.following)}</strong> подписок
              </span>
            </div>

            {/* Биография (Bio) */}
            <div>
              <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>{profileData.fullName}</strong>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                {profileData.bio}
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
          {/* Публикации */}
          {activeTab === 'posts' && (
            profilePosts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {profilePosts.map(post => (
                  <div 
                    key={post.id}
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onMouseLeave={() => setHoveredPostId(null)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--border-radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {hoveredPostId === post.id && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart size={20} fill="white" />
                          <span>{post.likesCount}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageSquare size={20} fill="white" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </div>
                      </div>
                    )}
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
            profileData.reels && profileData.reels.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {profileData.reels.map(reel => (
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
            savedPosts.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px'
              }}>
                {savedPosts.map(post => (
                  <div 
                    key={post.id}
                    onMouseEnter={() => setHoveredPostId(post.id)}
                    onMouseLeave={() => setHoveredPostId(null)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--border-radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {hoveredPostId === post.id && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Heart size={20} fill="white" />
                          <span>{post.likesCount}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageSquare size={20} fill="white" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
                <Bookmark size={40} style={{ marginBottom: '12px' }} />
                <h3>Сохраненного пока нет</h3>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Все публикации, которые вы добавите в закладки, появятся здесь</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
