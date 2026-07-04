import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Plus } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Стартовые демо-истории
const DEFAULT_STORIES = [
  {
    id: 'story-1',
    title: 'Летний Стиль',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    productId: 'prod-1',
    viewed: false
  },
  {
    id: 'story-2',
    title: 'Кожа Creamy',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    productId: 'prod-2',
    viewed: false
  },
  {
    id: 'story-3',
    title: 'SoundFlow',
    image: 'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&auto=format&fit=crop&q=80',
    productId: 'prod-3',
    viewed: false
  }
];

export default function Stories() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null); // null means modal is closed
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const progressInterval = useRef(null);
  const STORY_DURATION = 5000; // 5 секунд на историю
  const isDemo = !db;

  // Загрузка историй
  useEffect(() => {
    if (isDemo) {
      const savedStories = localStorage.getItem('demo_stories');
      if (savedStories) {
        setStories(JSON.parse(savedStories));
      } else {
        setStories(DEFAULT_STORIES);
        localStorage.setItem('demo_stories', JSON.stringify(DEFAULT_STORIES));
      }
    } else {
      // Подключение к Firestore
      try {
        const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStories(fetched);
          } else {
            setStories(DEFAULT_STORIES);
          }
        });
        return () => unsubscribe();
      } catch (err) {
        console.error("Ошибка при чтении историй из Firebase:", err);
        setStories(DEFAULT_STORIES);
      }
    }
  }, [isDemo]);

  // Управление автопрогрессом истории
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const intervalTime = 50; // обновляем каждые 50мс
    const step = (intervalTime / STORY_DURATION) * 100;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Время вышло, переходим к следующей истории
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeStoryIndex, isPaused]);

  const handleOpenStory = (index) => {
    setActiveStoryIndex(index);
    setProgress(0);
    setIsPaused(false);

    // Отмечаем историю как просмотренную
    setStories(prev => {
      const updated = prev.map((s, i) => i === index ? { ...s, viewed: true } : s);
      if (isDemo) localStorage.setItem('demo_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCloseStory = () => {
    setActiveStoryIndex(null);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const handleNextStory = () => {
    setProgress(0);
    setActiveStoryIndex((prev) => {
      if (prev === null) return null;
      if (prev < stories.length - 1) {
        return prev + 1;
      } else {
        handleCloseStory();
        return null;
      }
    });
  };

  const handlePrevStory = () => {
    setProgress(0);
    setActiveStoryIndex((prev) => {
      if (prev === null) return null;
      if (prev > 0) {
        return prev - 1;
      } else {
        return prev; // Остаемся на первой
      }
    });
  };

  const handleShopNow = (productId) => {
    handleCloseStory();
    navigate(`/product/${productId}`);
  };

  return (
    <div style={{ padding: '24px 0 12px' }}>
      {/* Список историй (Лента) */}
      <div style={{
        display: 'flex',
        gap: '18px',
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE/Edge
      }}>
        {/* Кнопка "Добавить историю" (показывается всегда, но доступна админам) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => {
              if (currentUser?.isAdmin) {
                navigate('/admin?tab=stories');
              } else {
                alert('Публиковать истории могут только администраторы магазина (Войдите под admin@store.com)');
              }
            }}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px dashed var(--border-color)',
              color: 'var(--text-secondary)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-pink)';
              e.currentTarget.style.color = 'var(--accent-pink)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Plus size={24} />
            <div className="gradient-bg" style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--bg-primary)'
            }}>
              <Plus size={12} color="white" />
            </div>
          </button>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', maxWidth: '80px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Добавить
          </span>
        </div>

        {/* Элементы историй */}
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => handleOpenStory(index)}
          >
            {/* Круглые рамки с градиентом */}
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              padding: '3px',
              background: story.viewed 
                ? 'var(--border-color)' 
                : 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={story.image} 
                alt={story.title} 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid var(--bg-primary)'
                }}
              />
            </div>
            {/* Название истории */}
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-primary)',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {story.title}
            </span>
          </div>
        ))}
      </div>

      {/* Полноэкранный плеер историй (Модалка) */}
      {activeStoryIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(10px)',
          userSelect: 'none'
        }}>
          {/* Контент плеера */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '430px',
              height: '100%',
              maxHeight: '850px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#000',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Картинка истории */}
            <img 
              src={stories[activeStoryIndex].image} 
              alt={stories[activeStoryIndex].title} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
            />

            {/* Зоны клика (Навигация) */}
            <div 
              onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
              style={{ position: 'absolute', left: 0, top: '80px', width: '25%', height: 'calc(100% - 160px)', cursor: 'w-resize', zIndex: 11 }}
            />
            <div 
              onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
              style={{ position: 'absolute', right: 0, top: '80px', width: '25%', height: 'calc(100% - 160px)', cursor: 'e-resize', zIndex: 11 }}
            />

            {/* Боковые кнопки (десктопные стрелочки) */}
            {activeStoryIndex > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
                style={{
                  position: 'absolute',
                  left: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {activeStoryIndex < stories.length - 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
                style={{
                  position: 'absolute',
                  right: '-60px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Элементы управления сверху */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              padding: '16px 20px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
              zIndex: 12
            }}>
              {/* Полоски прогресса (Story Bars) */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
                {stories.map((s, idx) => {
                  let widthPercent = 0;
                  if (idx < activeStoryIndex) widthPercent = 100;
                  if (idx === activeStoryIndex) widthPercent = progress;
                  return (
                    <div key={idx} style={{ flexGrow: 1, height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.35)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${widthPercent}%`, height: '100%', backgroundColor: 'white', transition: idx === activeStoryIndex ? 'none' : 'width 0.1s linear' }}></div>
                    </div>
                  );
                })}
              </div>

              {/* Заголовок истории и Закрыть */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="gradient-bg" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContainer: 'center', padding: '1.5px' }}>
                    <img src={stories[activeStoryIndex].image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                    {stories[activeStoryIndex].title}
                  </span>
                </div>
                <button 
                  onClick={handleCloseStory}
                  style={{ color: 'white', opacity: 0.8 }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Кнопка "Купить" внизу */}
            {stories[activeStoryIndex].productId && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '30px 20px 40px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 12
              }}>
                <button 
                  onClick={() => handleShopNow(stories[activeStoryIndex].productId)}
                  className="btn btn-primary"
                  style={{
                    borderRadius: 'var(--border-radius-full)',
                    padding: '12px 32px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(225, 48, 108, 0.4)'
                  }}
                >
                  <ShoppingCart size={16} /> В магазин
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
