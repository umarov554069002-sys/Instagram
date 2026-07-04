import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Volume2, VolumeX, ShoppingBag, Music, ChevronUp, ChevronDown, Loader2, MessageCircle, X, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../mockData';

// Стартовые демо-рилсы с вертикальными видео (Mixkit)
const DEFAULT_REELS = [
  {
    id: 'reel-1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-camera-34280-large.mp4',
    caption: 'Новый взгляд на качественный звук 🎧 Обзор наушников SoundFlow! #sound #neon #style',
    productId: 'prod-3',
    likes: 342,
    liked: false,
    song: 'SoundFlow - Original Audio'
  },
  {
    id: 'reel-2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-leather-handbag-40292-large.mp4',
    caption: 'Минималистичный дизайн и натуральная кожа. Идеально под любой образ 👜 #accessories #cream',
    productId: 'prod-2',
    likes: 189,
    liked: false,
    song: 'Creamy - Accessories Collection'
  },
  {
    id: 'reel-3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-in-neon-lighting-34302-large.mp4',
    caption: 'Качество в каждой детали. Узнайте характеристики в каталоге! ✨ #electronics #unbox',
    productId: 'prod-3',
    likes: 512,
    liked: false,
    song: 'Neon Beats - Gadgets'
  }
];

// Стартовые комментарии для рилсов
const SEED_COMMENTS = {
  'reel-1': [
    { id: 'c-1', author: 'Мария', text: 'Наушники просто космос! Купила такие на прошлой неделе 😍', date: '2026-07-02T10:00:00.000Z' },
    { id: 'c-2', author: 'Иван', text: 'А шумоподавление реально работает в метро?', date: '2026-07-02T12:30:00.000Z' },
    { id: 'c-3', author: 'instastore_official', text: 'Да, Иван! Активное шумоподавление ANC блокирует до 90% внешних шумов!', date: '2026-07-02T13:00:00.000Z' }
  ],
  'reel-2': [
    { id: 'c-4', author: 'Кристина', text: 'Сумка нереально красивая! А есть в черном цвете?', date: '2026-07-03T09:15:00.000Z' },
    { id: 'c-5', author: 'Менеджер Анна', text: 'Кристина, здравствуйте! В черном цвете ожидаем поступление на следующей неделе.', date: '2026-07-03T10:00:00.000Z' }
  ],
  'reel-3': [
    { id: 'c-6', author: 'Артем', text: 'Плотный свитшот! Заказал себе черный оверсайз.', date: '2026-07-04T08:00:00.000Z' }
  ]
};

export default function Reels() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [currentReelIdx, setCurrentReelIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showProductCard, setShowProductCard] = useState(true);
  
  // Состояния для комментариев рилсов
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const videoRef = useRef(null);
  const commentsEndRef = useRef(null);
  const isDemo = !db;

  // Загружаем рилсы
  useEffect(() => {
    setLoading(true);
    if (isDemo) {
      const savedReels = localStorage.getItem('demo_reels');
      if (savedReels) {
        setReels(JSON.parse(savedReels));
      } else {
        setReels(DEFAULT_REELS);
        localStorage.setItem('demo_reels', JSON.stringify(DEFAULT_REELS));
      }
      setLoading(false);
    } else {
      try {
        const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReels(fetched);
          } else {
            setReels(DEFAULT_REELS);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Ошибка при чтении рилсов из Firebase:", err);
        setReels(DEFAULT_REELS);
        setLoading(false);
      }
    }
  }, [isDemo]);

  // Загрузка комментариев для текущего рилса
  useEffect(() => {
    if (reels.length === 0) return;
    const activeReelId = reels[currentReelIdx].id;
    const savedComments = localStorage.getItem(`demo_reels_comments_${activeReelId}`);
    
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    } else {
      const seed = SEED_COMMENTS[activeReelId] || [];
      setComments(seed);
      localStorage.setItem(`demo_reels_comments_${activeReelId}`, JSON.stringify(seed));
    }
  }, [currentReelIdx, reels]);

  // Воспроизведение видео при смене рилса
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Браузер заблокировал автовоспроизведение:", e));
      setShowProductCard(true); // Показываем карточку товара при переключении
      setShowComments(false); // Закрываем комментарии при переходе на новое видео
    }
  }, [currentReelIdx, reels]);

  const handleLike = (index) => {
    setReels(prev => {
      const updated = prev.map((reel, i) => {
        if (i === index) {
          const isLiked = !reel.liked;
          return {
            ...reel,
            liked: isLiked,
            likes: isLiked ? reel.likes + 1 : reel.likes - 1
          };
        }
        return reel;
      });
      if (isDemo) localStorage.setItem('demo_reels', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNextReel = () => {
    if (currentReelIdx < reels.length - 1) {
      setCurrentReelIdx(prev => prev + 1);
    }
  };

  const handlePrevReel = () => {
    if (currentReelIdx > 0) {
      setCurrentReelIdx(prev => prev - 1);
    }
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() || reels.length === 0) return;

    const activeReelId = reels[currentReelIdx].id;
    const commentObj = {
      id: 'c-' + Date.now(),
      author: 'Покупатель',
      text: newComment.trim(),
      date: new Date().toISOString()
    };

    const updatedComments = [...comments, commentObj];
    setComments(updatedComments);
    localStorage.setItem(`demo_reels_comments_${activeReelId}`, JSON.stringify(updatedComments));
    setNewComment('');

    // Автопрокрутка комментариев вниз
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Авто-ответ бота для интерактива
    simulateBotCommentReply(newComment.trim(), activeReelId);
  };

  const simulateBotCommentReply = (userComment, reelId) => {
    if (userComment.toLowerCase().includes('цена') || userComment.toLowerCase().includes('сколько')) {
      setTimeout(() => {
        const botReply = {
          id: 'c-bot-' + Date.now(),
          author: 'instastore_official',
          text: linkedProduct 
            ? `Здравствуйте! Стоимость этого товара составляет ${linkedProduct.price.toLocaleString()} ₽. Вы можете перейти к покупке по кнопке с корзиной справа!`
            : 'Здравствуйте! Перейдите к покупке по кнопке с корзиной.',
          date: new Date().toISOString()
        };
        setComments(prev => {
          const next = [...prev, botReply];
          localStorage.setItem(`demo_reels_comments_${reelId}`, JSON.stringify(next));
          return next;
        });
        setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - var(--header-height))', padding: '100px' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-pink)" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - var(--header-height))', padding: '40px', textAlign: 'center' }}>
        <Loader2 size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
        <h3>Рилсов пока нет</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Зайдите в админ-панель, чтобы опубликовать первое видео!</p>
      </div>
    );
  }

  const activeReel = reels[currentReelIdx];
  const linkedProduct = MOCK_PRODUCTS.find(p => p.id === activeReel.productId);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - var(--header-height))',
      padding: '40px 24px',
      position: 'relative',
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Декоративное пятно */}
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'var(--accent-gradient)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        opacity: 0.08,
        zIndex: 0
      }}></div>

      {/* Плеер рилсов */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        height: 'calc(100vh - 160px)',
        maxHeight: '720px',
        backgroundColor: '#000',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1
      }}>
        
        {/* Видео-элемент */}
        <video
          ref={videoRef}
          src={activeReel.videoUrl}
          loop
          muted={muted}
          playsInline
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onClick={() => {
            if (videoRef.current) {
              if (videoRef.current.paused) {
                videoRef.current.play();
              } else {
                videoRef.current.pause();
              }
            }
          }}
        />

        {/* Навигационные кнопки (Вверх/Вниз) */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 10
        }}>
          {currentReelIdx > 0 && (
            <button 
              onClick={handlePrevReel}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronUp size={20} />
            </button>
          )}

          {currentReelIdx < reels.length - 1 && (
            <button 
              onClick={handleNextReel}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>

        {/* Боковые кнопки управления (Лайк, Комментарии, Звук, Ссылка на товар) */}
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          zIndex: 10
        }}>
          {/* Лайк */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={() => handleLike(currentReelIdx)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: activeReel.liked ? 'var(--accent-pink)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={22} fill={activeReel.liked ? 'var(--accent-pink)' : 'none'} />
            </button>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {activeReel.likes}
            </span>
          </div>

          {/* Комментарии */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={() => setShowComments(!showComments)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: showComments ? 'var(--accent-pink)' : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MessageCircle size={22} />
            </button>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {comments.length}
            </span>
          </div>

          {/* Вкл/Выкл звук */}
          <button
            onClick={() => setMuted(!muted)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Кнопка показа карточки товара */}
          {linkedProduct && (
            <button
              onClick={() => setShowProductCard(!showProductCard)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: showProductCard ? 'var(--accent-pink)' : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: showProductCard ? '0 4px 10px rgba(225,48,108,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <ShoppingBag size={20} />
            </button>
          )}
        </div>

        {/* Текстовое описание рилса снизу */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '24px 20px 30px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          color: 'white',
          zIndex: 9,
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div className="gradient-bg" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1px' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#000', overflow: 'hidden' }}>
                <img src={linkedProduct?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>instastore_official</span>
            <span style={{
              fontSize: '10px',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '3px',
              padding: '1px 4px',
              fontWeight: 600
            }}>Магазин</span>
          </div>

          <p style={{
            fontSize: '13px',
            lineHeight: '1.4',
            marginBottom: '12px',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {activeReel.caption}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.8 }}>
            <Music size={12} />
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '200px' }}>
              <div style={{
                display: 'inline-block',
                paddingLeft: '100%',
                animation: 'marquee 12s linear infinite'
              }}>
                {activeReel.song || 'Original Sound - instastore'}
              </div>
            </div>
          </div>
        </div>

        {/* Слайд-карточка привязанного товара */}
        {linkedProduct && showProductCard && !showComments && (
          <div className="animate-fade-in" style={{
            position: 'absolute',
            bottom: '95px',
            left: '20px',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#262626',
            borderRadius: 'var(--border-radius-md)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 11,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <img src={linkedProduct.image} alt={linkedProduct.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {linkedProduct.name}
              </h4>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-pink)', marginTop: '2px', display: 'block' }}>
                {linkedProduct.price.toLocaleString()} ₽
              </span>
            </div>
            <button 
              onClick={() => navigate(`/product/${linkedProduct.id}`)}
              className="gradient-bg"
              style={{
                color: 'white',
                fontSize: '11px',
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: 'var(--border-radius-full)',
                boxShadow: '0 2px 8px rgba(225,48,108,0.2)'
              }}
            >
              Купить
            </button>
          </div>
        )}

        {/* Выдвижное оверлей-окно комментариев рилса */}
        {showComments && (
          <div className="animate-fade-in" style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '350px',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            color: '#262626',
            borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.4)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.1, 1, 0.1, 1) forwards'
          }}>
            {/* Хедер панели комментариев */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Комментарии ({comments.length})</span>
              <button 
                onClick={() => setShowComments(false)}
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Список комментариев */}
            <div style={{
              flexGrow: 1,
              padding: '16px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {comments.map(c => {
                const isSystem = c.author === 'instastore_official' || c.author.includes('Менеджер');
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '13px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isSystem ? 'rgba(225,48,108,0.1)' : 'var(--bg-tertiary)',
                      color: isSystem ? 'var(--accent-pink)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '11px',
                      flexShrink: 0
                    }}>
                      {c.author.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div>
                        <strong style={{ color: isSystem ? 'var(--accent-pink)' : 'inherit', marginRight: '6px' }}>{c.author}</strong>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>
                          {new Date(c.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: '1.4' }}>{c.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>

            {/* Поле добавления комментария */}
            <form 
              onSubmit={handleSendComment}
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: 'white'
              }}
            >
              <input 
                type="text" 
                placeholder="Добавьте комментарий..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  flexGrow: 1,
                  borderRadius: 'var(--border-radius-full)',
                  border: '1px solid var(--border-color)',
                  height: '36px',
                  padding: '0 16px',
                  fontSize: '13px'
                }}
              />
              <button 
                type="submit" 
                disabled={!newComment.trim()}
                className="gradient-bg"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: !newComment.trim() ? 0.6 : 1
                }}
              >
                <Send size={12} color="white" style={{ transform: 'rotate(-45deg)', margin: '0 0 1px 1px' }} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Анимационные стили для выдвижения комментариев */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
