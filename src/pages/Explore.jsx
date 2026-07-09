import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Heart, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { useFollowing } from '../context/FollowingContext';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

// Статические аккаунты для глобального поиска (синхронно с Direct)
const BASE_ACCOUNTS = [
  {
    id: 'chat-maria',
    name: 'maria_style',
    fullName: 'Мария ✨',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    desc: 'Fashion блогер • Обзоры'
  },
  {
    id: 'chat-seller-1',
    name: 'anna_sales',
    fullName: 'Анна 👜',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    desc: 'Официальный представитель'
  },
  {
    id: 'chat-logistic',
    name: 'sergey_logistic',
    fullName: 'Сергей 🚚',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    desc: 'Логистика и путешествия'
  },
  {
    id: 'chat-sales',
    name: 'instagram_sales',
    fullName: 'Отдел продаж 📈',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
    desc: 'Оптовые закупки и сотрудничество'
  },
  {
    id: 'chat-support',
    name: 'instagram_official',
    fullName: 'Instagram Support 🛠️',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    desc: 'Официальный аккаунт поддержки'
  }
];

export default function Explore() {
  const navigate = useNavigate();
  const { isFollowing, toggleFollow } = useFollowing();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, people, posts
  const [allAccounts, setAllAccounts] = useState(BASE_ACCOUNTS);
  
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const isDemo = !db;

  // Синхронизация данных с Firestore или локальными хранилищами
  useEffect(() => {
    setLoading(true);
    if (isDemo) {
      const savedPosts = localStorage.getItem('ig_feed_posts');
      const savedReels = localStorage.getItem('demo_reels');
      if (savedPosts) setPosts(JSON.parse(savedPosts));
      if (savedReels) setReels(JSON.parse(savedReels));
      setLoading(false);
    } else {
      try {
        const unsubscribePosts = onSnapshot(collection(db, 'posts'), 
          (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(fetched);
          },
          (err) => console.error("Ошибка при чтении постов в Explore:", err)
        );

        const unsubscribeReels = onSnapshot(collection(db, 'reels'), 
          (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReels(fetched);
          },
          (err) => console.error("Ошибка при чтении рилсов в Explore:", err)
        );

        setLoading(false);
        return () => {
          unsubscribePosts();
          unsubscribeReels();
        };
      } catch (err) {
        console.error("Ошибка инициализации Firestore в Explore:", err);
        setLoading(false);
      }
    }
  }, [isDemo]);

  // Загружаем список контактов для поиска
  useEffect(() => {
    const saved = localStorage.getItem('demo_chats_list');
    if (saved) {
      try {
        const customContacts = JSON.parse(saved);
        const uniqueMap = {};
        [...BASE_ACCOUNTS, ...customContacts].forEach(acc => {
          uniqueMap[acc.id] = {
            id: acc.id,
            name: acc.name,
            fullName: acc.fullName || acc.name,
            avatar: acc.avatar,
            desc: acc.desc || acc.subtitle || 'Пользователь'
          };
        });
        setAllAccounts(Object.values(uniqueMap));
      } catch (e) {}
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const query = searchQuery.trim().toLowerCase();
  
  // Фильтрация аккаунтов
  const filteredAccounts = allAccounts.filter(acc => 
    acc.name.toLowerCase().includes(query) || 
    acc.fullName.toLowerCase().includes(query)
  );

  // Фильтрация публикаций (по описанию или автору)
  const filteredPosts = posts.filter(post => 
    (post.caption && post.caption.toLowerCase().includes(query)) ||
    (post.authorName && post.authorName.toLowerCase().includes(query))
  );

  const showPeople = activeTab === 'all' || activeTab === 'people';
  const showPostsTab = activeTab === 'all' || activeTab === 'posts';

  const hasResults = (query === '') || (filteredAccounts.length > 0 && showPeople) || (filteredPosts.length > 0 && showPostsTab);

  // Генерируем мозаичную сетку контента Explore (смесь Reels и Posts)
  const getExploreGridItems = () => {
    const mixed = [];
    const maxLen = Math.max(posts.length, reels.length);
    for (let i = 0; i < maxLen; i++) {
      if (reels[i]) {
        mixed.push({
          id: reels[i].id,
          type: 'reel',
          mediaUrl: reels[i].coverUrl,
          title: reels[i].caption || 'Reels video',
          likes: reels[i].likes || 0,
          comments: reels[i].comments ? reels[i].comments.length : 0,
          index: i
        });
      }
      if (posts[i]) {
        mixed.push({
          id: posts[i].id,
          type: 'post',
          mediaUrl: posts[i].image,
          title: posts[i].caption || 'Post image',
          likes: posts[i].likesCount || 0,
          comments: posts[i].comments ? posts[i].comments.length : 0,
          index: i
        });
      }
    }
    return mixed.slice(0, 8); // ограничиваем 8 элементами
  };

  const exploreGridItems = getExploreGridItems();

  if (loading) {
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
        <span style={{ marginTop: '12px' }}>Загрузка результатов...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '100px 0 60px', minHeight: 'calc(100vh - var(--header-height))', position: 'relative' }}>
      
      {/* Декоративное пятно */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'var(--accent-gradient)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        opacity: 0.05,
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
        
        {/* Поисковая панель */}
        <div className="glass" style={{
          borderRadius: 'var(--border-radius-md)',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Поиск людей, публикаций или хэштегов..." 
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border-color)',
                padding: '0 16px 0 46px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '13px', color: 'var(--text-secondary)' }} />
          </div>

          {/* Вкладки фильтрации */}
          {searchQuery.trim() !== '' && (
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <button 
                onClick={() => setActiveTab('all')}
                className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: 'var(--border-radius-full)' }}
              >
                Все
              </button>
              <button 
                onClick={() => setActiveTab('people')}
                className={`btn ${activeTab === 'people' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: 'var(--border-radius-full)' }}
              >
                Люди
              </button>
              <button 
                onClick={() => setActiveTab('posts')}
                className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: 'var(--border-radius-full)' }}
              >
                Публикации
              </button>
            </div>
          )}
        </div>

        {/* Результаты поиска */}
        {searchQuery.trim() !== '' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Результаты: Люди */}
            {showPeople && filteredAccounts.length > 0 && (
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--border-radius-md)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Люди ({filteredAccounts.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredAccounts.map(acc => {
                    const isF = isFollowing(acc.id);
                    return (
                      <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div 
                          onClick={() => navigate(`/profile/${acc.id}`)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        >
                          <img src={acc.avatar} alt={acc.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>@{acc.name}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{acc.desc}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => toggleFollow(acc.id)}
                            style={{
                              background: isF ? 'var(--bg-tertiary)' : 'var(--accent-pink)',
                              border: isF ? '1px solid var(--border-color)' : 'none',
                              color: isF ? 'var(--text-primary)' : 'white',
                              fontSize: '12px',
                              fontWeight: 700,
                              padding: '6px 12px',
                              borderRadius: 'var(--border-radius-sm)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isF ? 'Подписки' : 'Подписаться'}
                          </button>
                          
                          <button 
                            onClick={() => navigate('/messages', { state: { selectChatId: acc.id } })}
                            style={{
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: 700,
                              padding: '6px 10px',
                              borderRadius: 'var(--border-radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Написать сообщение"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Результаты: Публикации */}
            {showPostsTab && filteredPosts.length > 0 && (
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--border-radius-md)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Публикации ({filteredPosts.length})
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  {filteredPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => navigate('/')}
                      onMouseEnter={() => setHoveredItemId(post.id)}
                      onMouseLeave={() => setHoveredItemId(null)}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 'var(--border-radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {hoveredItemId === post.id && (
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
                          gap: '12px',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '13px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Heart size={14} fill="white" />
                            <span>{post.likesCount}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageSquare size={14} fill="white" />
                            <span>{post.comments ? post.comments.length : 0}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasResults && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <h3>Ничего не найдено</h3>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        ) : (
          /* Лента рекомендаций Explore при пустом поиске */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Рекомендуемые профили */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Интересные авторы</h3>
              <div style={{
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none'
              }}>
                {allAccounts.slice(0, 4).map(acc => {
                  const isF = isFollowing(acc.id);
                  return (
                    <div 
                      key={`explore-rec-${acc.id}`}
                      className="glass"
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--border-radius-md)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '130px',
                        flexShrink: 0
                      }}
                    >
                      <div 
                        onClick={() => navigate(`/profile/${acc.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={acc.avatar} alt={acc.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} />
                        <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          @{acc.name}
                        </h4>
                      </div>
                      <button 
                        onClick={() => toggleFollow(acc.id)}
                        style={{
                          background: isF ? 'var(--bg-tertiary)' : 'var(--accent-pink)',
                          border: isF ? '1px solid var(--border-color)' : 'none',
                          color: isF ? 'var(--text-primary)' : 'white',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 'var(--border-radius-sm)',
                          cursor: 'pointer',
                          width: '100%'
                        }}
                      >
                        {isF ? 'Подписки' : 'Подписаться'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Мозаичная сетка Explore (Смесь постов и рилсов) */}
            {exploreGridItems.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Исследовать (Explore)</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  {exploreGridItems.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (item.type === 'reel') {
                          navigate(`/reels?index=${item.index}`);
                        } else {
                          navigate('/');
                        }
                      }}
                      className="glass"
                      style={{
                        borderRadius: 'var(--border-radius-md)',
                        overflow: 'hidden',
                        aspectRatio: '1',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        setHoveredItemId(item.id);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        setHoveredItemId(null);
                      }}
                    >
                      <img src={item.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        padding: '12px',
                        color: 'white'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)', maxWidth: '80%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </span>
                        {item.type === 'reel' ? (
                          <Film size={14} color="white" />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px' }}>
                              <Heart size={10} fill="white" />
                              <span>{item.likes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
