import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, ShoppingBag, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import { useFollowing } from '../context/FollowingContext';

// Статические аккаунты для глобального поиска (синхронно с Direct)
const BASE_ACCOUNTS = [
  {
    id: 'chat-seller-1',
    name: 'Анна (Менеджер по продажам) 👜',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    desc: 'Менеджер • Консультации'
  },
  {
    id: 'chat-support',
    name: 'Техподдержка InstaStore 🛠️',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    desc: 'Официальный аккаунт поддержки'
  },
  {
    id: 'chat-buyer-1',
    name: 'Алексей (Клиент) 🤝',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    desc: 'Постоянный клиент'
  },
  {
    id: 'chat-logistic',
    name: 'Сергей (Служба доставки/Логистика) 🚚',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    desc: 'Логист • Доставка посылок'
  },
  {
    id: 'chat-sales',
    name: 'instastore_sales (Оптовый отдел) 📈',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
    desc: 'Оптовые закупки и сотрудничество'
  },
  {
    id: 'chat-maria',
    name: 'Мария (Блогер / Инфлюенсер) ✨',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    desc: 'Fashion инфлюенсер • Обзоры'
  }
];

// Рекомендации Explore Grid (объединенные Рилсы и товары)
const EXPLORE_ITEMS = [
  { id: 'reel-1', type: 'reel', index: 0, mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', title: 'Обзор SoundFlow 🎧' },
  { id: 'prod-1', type: 'product', productId: 'prod-1', mediaUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', title: 'Смарт-часы Pulse' },
  { id: 'reel-2', type: 'reel', index: 1, mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', title: 'Кожаная сумка 👜' },
  { id: 'prod-2', type: 'product', productId: 'prod-2', mediaUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', title: 'Кожаная сумка' },
  { id: 'reel-3', type: 'reel', index: 2, mediaUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500', title: 'Характеристики свитшота ✨' },
  { id: 'prod-3', type: 'product', productId: 'prod-3', mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', title: 'Наушники SoundFlow' }
];

export default function Explore() {
  const navigate = useNavigate();
  const { isFollowing, toggleFollow } = useFollowing();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, people, products
  const [allAccounts, setAllAccounts] = useState(BASE_ACCOUNTS);
  const [loading, setLoading] = useState(false);

  // Загружаем список контактов из localStorage, чтобы подтянуть кастомные
  useEffect(() => {
    const saved = localStorage.getItem('demo_chats_list');
    if (saved) {
      const customContacts = JSON.parse(saved);
      const uniqueMap = {};
      [...BASE_ACCOUNTS, ...customContacts].forEach(acc => {
        uniqueMap[acc.id] = {
          id: acc.id,
          name: acc.name,
          avatar: acc.avatar,
          desc: acc.desc || acc.subtitle || 'Пользователь'
        };
      });
      setAllAccounts(Object.values(uniqueMap));
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Фильтрация результатов поиска
  const query = searchQuery.trim().toLowerCase();
  
  const filteredAccounts = allAccounts.filter(acc => 
    acc.name.toLowerCase().includes(query) || acc.id.toLowerCase().includes(query)
  );

  const filteredProducts = MOCK_PRODUCTS.filter(prod => 
    prod.name.toLowerCase().includes(query) || prod.description.toLowerCase().includes(query)
  );

  const showPeople = activeTab === 'all' || activeTab === 'people';
  const showProducts = activeTab === 'all' || activeTab === 'products';

  const hasResults = (query === '') || (filteredAccounts.length > 0 && showPeople) || (filteredProducts.length > 0 && showProducts);

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
              placeholder="Поиск людей, товаров или обзоров..." 
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
                onClick={() => setActiveTab('products')}
                className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 16px', fontSize: '12px', borderRadius: 'var(--border-radius-full)' }}
              >
                Товары
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={acc.avatar} alt={acc.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{acc.name}</h4>
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

            {/* Результаты: Товары */}
            {showProducts && filteredProducts.length > 0 && (
              <div className="glass" style={{ padding: '20px', borderRadius: 'var(--border-radius-md)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Товары ({filteredProducts.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      onClick={() => navigate(`/product/${prod.id}`)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={prod.image} alt={prod.name} style={{ width: '44px', height: '44px', borderRadius: 'var(--border-radius-sm)', objectFit: 'cover' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{prod.name}</h4>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-pink)' }}>{prod.price.toLocaleString()} ₽</span>
                        </div>
                      </div>
                      <button className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        Купить <ArrowRight size={14} />
                      </button>
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
                        onClick={() => navigate('/messages', { state: { selectChatId: acc.id } })}
                        style={{ cursor: 'pointer' }}
                      >
                        <img src={acc.avatar} alt={acc.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} />
                        <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {acc.name.split(' ')[0]}
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

            {/* Мозаичная сетка Explore (Товары + Рилсы) */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Исследовать (Explore)</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {EXPLORE_ITEMS.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'reel') {
                        navigate(`/reels?index=${item.index}`);
                      } else {
                        navigate(`/product/${item.productId}`);
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
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                      <span style={{ fontSize: '11px', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                        {item.title}
                      </span>
                      {item.type === 'reel' ? (
                        <Film size={14} color="white" />
                      ) : (
                        <ShoppingBag size={14} color="white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
