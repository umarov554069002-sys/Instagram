import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Volume2, VolumeX, Music, ChevronUp, ChevronDown, Loader2, MessageCircle, X, Send, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';
import { useFollowing } from '../context/FollowingContext';

const DEFAULT_REELS = [
  {
    id: 'reel-1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-camera-34280-large.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    caption: 'Новый взгляд на качественный звук 🎧 Обзор наушников SoundFlow! #sound #neon #style',
    authorId: 'chat-maria',
    likes: 342,
    views: 1240,
    liked: false,
    song: 'SoundFlow - Original Audio'
  },
  {
    id: 'reel-2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-showing-leather-handbag-40292-large.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
    caption: 'Минималистичный дизайн и натуральная кожа. Идеально под любой образ 👜 #accessories #cream',
    authorId: 'chat-seller-1',
    likes: 189,
    views: 890,
    liked: false,
    song: 'Creamy - Accessories Collection'
  },
  {
    id: 'reel-3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-in-neon-lighting-34302-large.mp4',
    coverUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
    caption: 'Качество в каждой детали. Узнайте характеристики в каталоге! ✨ #electronics #unbox',
    authorId: 'chat-support',
    likes: 512,
    views: 2450,
    liked: false,
    song: 'Neon Beats - Gadgets'
  }
];

// Стартовые комментарии для рилсов
const SEED_COMMENTS = {
  'reel-1': [
    { id: 'c-1', author: 'Мария', text: 'Наушники просто космос! Купила такие на прошлой неделе 😍', date: '2026-07-02T10:00:00.000Z' },
    { id: 'c-2', author: 'Иван', text: 'А шумоподавление реально работает в метро?', date: '2026-07-02T12:30:00.000Z' },
    { id: 'c-3', author: 'instagram_official', text: 'Да, Иван! Активное шумоподавление ANC блокирует до 90% внешних шумов!', date: '2026-07-02T13:00:00.000Z' }
  ],
  'reel-2': [
    { id: 'c-4', author: 'Кристина', text: 'Сумка нереально красивая! А есть в черном цвете?', date: '2026-07-03T09:15:00.000Z' },
    { id: 'c-5', author: 'Менеджер Анна', text: 'Кристина, здравствуйте! В черном цвете ожидаем поступление на следующей неделе.', date: '2026-07-03T10:00:00.000Z' }
  ],
  'reel-3': [
    { id: 'c-6', author: 'Артем', text: 'Плотный свитшот! Заказал себе черный оверсайз.', date: '2026-07-04T08:00:00.000Z' }
  ]
};

const PUBLIC_AUTHORS = {
  'chat-maria': { name: 'maria_style', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
  'chat-seller-1': { name: 'anna_sales', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' },
  'chat-logistic': { name: 'sergey_logistic', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' },
  'chat-support': { name: 'instagram_official', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60' }
};

export default function Reels() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useFollowing();

  const currentUserId = currentUser ? currentUser.uid : 'guest_user';
  const currentUserName = currentUser ? (currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'user')) : 'guest_user';

  const [reels, setReels] = useState([]);
  const [currentReelIdx, setCurrentReelIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Состояния для комментариев рилсов
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Состояние модалки репоста
  const [isShareOpen, setIsShareOpen] = useState(false);

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
        const reelsRef = collection(db, 'reels');
        const q = query(reelsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, 
          async (snapshot) => {
            try {
              if (snapshot.empty) {
                console.log("[Firestore] База рилсов пуста. Производится автозаполнение...");
                for (const reel of DEFAULT_REELS) {
                  await setDoc(doc(db, 'reels', reel.id), {
                    ...reel,
                    likedBy: [],
                    comments: SEED_COMMENTS[reel.id] || [],
                    createdAt: new Date().toISOString()
                  });
                }
              } else {
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReels(fetched);
              }
              setLoading(false);
            } catch (err) {
              console.error("[Firestore] Ошибка во время автозаполнения/обработки рилсов:", err);
              const savedReels = localStorage.getItem('demo_reels');
              setReels(savedReels ? JSON.parse(savedReels) : DEFAULT_REELS);
              setLoading(false);
            }
          },
          (error) => {
            console.error("Ошибка Firestore при чтении рилсов:", error);
            const savedReels = localStorage.getItem('demo_reels');
            setReels(savedReels ? JSON.parse(savedReels) : DEFAULT_REELS);
            setLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error("Ошибка при чтении рилсов из Firebase:", err);
        setReels(DEFAULT_REELS);
        setLoading(false);
      }
    }
  }, [isDemo]);

  // Считываем GET-параметр ?index=N для перехода к выбранному рилсу
  useEffect(() => {
    if (reels.length > 0) {
      const indexParam = searchParams.get('index');
      if (indexParam !== null) {
        const parsed = parseInt(indexParam, 10);
        if (parsed >= 0 && parsed < reels.length) {
          setCurrentReelIdx(parsed);
        }
      }
    }
  }, [searchParams, reels]);

  // Загрузка комментариев для текущего рилса
  useEffect(() => {
    if (reels.length === 0) return;
    const activeReel = reels[currentReelIdx];
    if (isDemo) {
      const savedComments = localStorage.getItem(`demo_reels_comments_${activeReel.id}`);
      setComments(savedComments ? JSON.parse(savedComments) : SEED_COMMENTS[activeReel.id] || []);
    } else {
      setComments(activeReel.comments || []);
    }
  }, [currentReelIdx, reels, isDemo]);

  // Воспроизведение видео при смене рилса
  useEffect(() => {
    if (videoRef.current && reels.length > 0) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Браузер заблокировал автовоспроизведение:", e));
      setShowComments(false); // Закрываем комментарии при переходе на новое видео

      // Инкрементируем просмотры
      const activeReel = reels[currentReelIdx];
      const incrementViews = async () => {
        if (isDemo) {
          const updated = reels.map((r, i) => i === currentReelIdx ? { ...r, views: (r.views || 0) + 1 } : r);
          setReels(updated);
          localStorage.setItem('demo_reels', JSON.stringify(updated));
        } else {
          try {
            await updateDoc(doc(db, 'reels', activeReel.id), {
              views: (activeReel.views || 0) + 1
            });
          } catch (e) {
            console.error("Ошибка при обновлении просмотров в Firestore:", e);
          }
        }
      };
      // Инкрементируем через секунду просмотра
      const timer = setTimeout(incrementViews, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentReelIdx, reels.length, isDemo]);

  const handleLike = async (index) => {
    const reel = reels[index];
    const isLiked = reel.likedBy ? reel.likedBy.includes(currentUserId) : reel.liked;
    const nextLikedBy = isLiked
      ? reel.likedBy.filter(uid => uid !== currentUserId)
      : [...(reel.likedBy || []), currentUserId];
    
    const nextLikesCount = isLiked
      ? Math.max(0, reel.likes - 1)
      : (reel.likes || 0) + 1;

    if (isDemo) {
      setReels(prev => {
        const updated = prev.map((r, i) => {
          if (i === index) {
            return {
              ...r,
              liked: !isLiked,
              likes: nextLikesCount,
              likedBy: nextLikedBy
            };
          }
          return r;
        });
        localStorage.setItem('demo_reels', JSON.stringify(updated));
        return updated;
      });
    } else {
      try {
        await updateDoc(doc(db, 'reels', reel.id), {
          likedBy: nextLikedBy,
          likes: nextLikesCount
        });
      } catch (err) {
        console.error("Ошибка при лайке рилса в Firestore:", err);
      }
    }
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

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || reels.length === 0) return;

    const activeReel = reels[currentReelIdx];
    const commentObj = {
      id: 'c-' + Date.now(),
      author: currentUserName,
      text: newComment.trim(),
      date: new Date().toISOString()
    };

    const updatedComments = [...(activeReel.comments || []), commentObj];

    if (isDemo) {
      setComments(updatedComments);
      localStorage.setItem(`demo_reels_comments_${activeReel.id}`, JSON.stringify(updatedComments));
      setNewComment('');
      simulateBotCommentReply(newComment.trim(), activeReel.id);
    } else {
      try {
        await updateDoc(doc(db, 'reels', activeReel.id), {
          comments: updatedComments
        });
        setNewComment('');
        simulateBotCommentReply(newComment.trim(), activeReel.id);
      } catch (err) {
        console.error("Ошибка при добавлении комментария в Firestore:", err);
      }
    }

    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const simulateBotCommentReply = (userComment, reelId) => {
    if (userComment.toLowerCase().includes('цена') || userComment.toLowerCase().includes('сколько') || userComment.toLowerCase().includes('привет')) {
      setTimeout(async () => {
        const botReply = {
          id: 'c-' + Date.now(),
          author: 'instagram_official',
          text: 'Спасибо за проявленный интерес! Задавайте любые вопросы в Direct или пишите в комментарии, мы на связи! ✨',
          date: new Date().toISOString()
        };

        if (isDemo) {
          setComments(prev => {
            const next = [...prev, botReply];
            localStorage.setItem(`demo_reels_comments_${reelId}`, JSON.stringify(next));
            return next;
          });
        } else {
          try {
            const freshReels = await getDocs(collection(db, 'reels'));
            const targetDoc = freshReels.docs.find(d => d.id === reelId);
            if (targetDoc) {
              const freshComments = [...(targetDoc.data().comments || []), botReply];
              await updateDoc(doc(db, 'reels', reelId), {
                comments: freshComments
              });
            }
          } catch (e) {
            console.error("Ошибка при автоответе в Firestore:", e);
          }
        }
      }, 2000);
    }
  };

  const isReelLiked = (reel) => {
    if (reel.likedBy) return reel.likedBy.includes(currentUserId);
    return reel.liked;
  };

  if (loading || reels.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        gap: '16px'
      }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-pink)' }} />
        <span>Загрузка Reels...</span>
      </div>
    );
  }

  const activeReel = reels[currentReelIdx];
  const authorId = activeReel.authorId;
  const author = PUBLIC_AUTHORS[authorId] || PUBLIC_AUTHORS['chat-support'];
  const liked = isReelLiked(activeReel);

  return (
    <div style={{
      backgroundColor: '#000',
      minHeight: 'calc(100vh - var(--header-height))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 0 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Контейнер плеера */}
      <div style={{
        position: 'relative',
        width: '350px',
        height: '600px',
        borderRadius: 'var(--border-radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backgroundColor: '#1c1c1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Видео-элемент */}
        <video
          ref={videoRef}
          src={activeReel.videoUrl}
          poster={activeReel.coverUrl}
          loop
          muted={muted}
          playsInline
          onClick={() => setMuted(!muted)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer'
          }}
        />

        {/* Кнопка переключения вверх */}
        {currentReelIdx > 0 && (
          <button
            onClick={handlePrevReel}
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}
          >
            <ChevronUp size={20} />
          </button>
        )}

        {/* Кнопка переключения вниз */}
        {currentReelIdx < reels.length - 1 && (
          <button
            onClick={handleNextReel}
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10,
              backdropFilter: 'blur(4px)'
            }}
          >
            <ChevronDown size={20} />
          </button>
        )}

        {/* Боковые кнопки управления (Лайк, Комментарии, Репост, Звук) */}
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
                color: liked ? 'var(--accent-pink)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.85)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={22} fill={liked ? 'var(--accent-pink)' : 'none'} />
            </button>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {activeReel.likes}
            </span>
          </div>

          {/* Просмотры Reels */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
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
            }}>
              <Eye size={20} />
            </div>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {activeReel.views || 0}
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

          {/* Репост / Поделиться */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={() => setIsShareOpen(true)}
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
              title="Поделиться"
            >
              <Send size={18} style={{ transform: 'rotate(-45deg)', margin: '0 0 2px 2px' }} />
            </button>
            <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, marginTop: '5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              Поделиться
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
                <img src={author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <span 
              onClick={() => navigate(`/profile/${authorId}`)} 
              style={{ fontSize: '13px', fontWeight: 700, pointerEvents: 'auto', cursor: 'pointer' }}
            >{author.name}</span>

            {/* Кнопка подписки */}
            <button
              onClick={() => toggleFollow(authorId)}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                backgroundColor: isFollowing(authorId) ? 'rgba(255,255,255,0.2)' : 'var(--accent-pink)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                marginLeft: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isFollowing(authorId) ? 'Подписки' : 'Подписаться'}
            </button>
          </div>

          <p style={{
            fontSize: '12px',
            margin: '0 0 12px 0',
            lineHeight: '1.4',
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {activeReel.caption}
          </p>

          {/* Информация о треке */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', opacity: 0.8 }}>
            <Music size={12} />
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '200px' }}>
              <div style={{
                display: 'inline-block',
                paddingLeft: '100%',
                animation: 'marquee 12s linear infinite'
              }}>
                {activeReel.song || 'Original Sound'}
              </div>
            </div>
          </div>
        </div>

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
                style={{ color: '#262626', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Список комментариев */}
            <div style={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '14px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px', fontSize: '13px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: 'var(--accent-pink)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, flexShrink: 0, fontSize: '11px'
                    }}>
                      {c.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, marginRight: '6px' }}>{c.author}</span>
                      <span style={{ color: '#555' }}>{c.text}</span>
                      <span style={{
                        display: 'block', fontSize: '10px', color: '#999', marginTop: '4px'
                      }}>
                        {new Date(c.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8e8e8e' }}>
                  Комментариев пока нет. Будьте первыми!
                </div>
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Форма добавления комментария */}
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
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-full)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  outline: 'none',
                  color: '#262626',
                  backgroundColor: '#fafafa'
                }}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                style={{
                  color: '#0095f6',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  opacity: newComment.trim() ? 1 : 0.5
                }}
              >
                Опубликовать
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Модалка репоста */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        postUrl={window.location.origin + `/reels?index=${currentReelIdx}`}
        title="Поделиться рилсом"
      />

    </div>
  );
}
