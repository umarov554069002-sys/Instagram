import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Volume2, VolumeX, ShoppingBag, Music, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useCart } from '../context/CartContext';
import { MOCK_PRODUCTS } from '../mockData';

// Стартовые демо-рилсы с вертикальными видео (Pexels / Mixkit)
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

export default function Reels() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [reels, setReels] = useState([]);
  const [currentReelIdx, setCurrentReelIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showProductCard, setShowProductCard] = useState(true);

  const videoRef = useRef(null);
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

  // Воспроизведение видео при смене рилса
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Браузер заблокировал автовоспроизведение:", e));
      setShowProductCard(true); // Показываем карточку товара при переключении
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
        <Film size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
        <h3>Рилсов пока нет</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Зайдите в админ-панель, чтобы опубликовать первое видео!</p>
      </div>
    );
  }

  const activeReel = reels[currentReelIdx];
  // Находим привязанный товар из каталога (локального или MOCK)
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
            // Клик по видео ставит на паузу или возобновляет
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
              title="Предыдущее видео"
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
              title="Следующее видео"
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>

        {/* Боковые кнопки управления (Лайк, Звук, Ссылка на товар) */}
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
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
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {activeReel.likes}
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
            title={muted ? "Включить звук" : "Выключить звук"}
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
              title="Показать товар"
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
          {/* Аккаунт */}
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

          {/* Описание */}
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

          {/* Бегущий звук трека */}
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
        {linkedProduct && showProductCard && (
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
      </div>

      {/* Стили для бегущей строки (marquee) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
