import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Plus, Edit3, Image, Sparkles, Eye } from 'lucide-react';
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

// Фоновые пресеты для редактора историй
const BACKGROUND_PRESETS = [
  { name: 'Закат', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Кибер Неон', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80' },
  { name: 'Нежная роза', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80' },
  { name: 'Темный тех', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80' }
];

// Пресеты фотоэффектов (CSS filters)
const EFFECTS_PRESETS = [
  { name: 'Обычный', style: 'none' },
  { name: 'Сепия (Ретро)', style: 'sepia(0.8) contrast(1.1) brightness(0.95)' },
  { name: 'Нуар (Ч/Б)', style: 'grayscale(1) contrast(1.25)' },
  { name: 'Размытие', style: 'blur(2px) brightness(1.05)' },
  { name: 'Неон', style: 'hue-rotate(90deg) saturate(1.8) contrast(1.15)' }
];

// Цветовая палитра текста
const COLOR_PRESETS = [
  { name: 'Белый', value: '#ffffff' },
  { name: 'Розовый', value: '#ff007f' },
  { name: 'Голубой', value: '#00f0ff' },
  { name: 'Желтый', value: '#ffee00' },
  { name: 'Черный', value: '#000000' }
];

export default function Stories() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null); // null means modal is closed
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Состояния Stories Creator (Редактора)
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [creatorBg, setCreatorBg] = useState(BACKGROUND_PRESETS[0].url);
  const [creatorText, setCreatorText] = useState('');
  const [creatorFont, setCreatorFont] = useState('Modern'); // Modern, Neon, Retro
  const [creatorColor, setCreatorColor] = useState('#ffffff');
  const [creatorEffect, setCreatorEffect] = useState('none');

  // Состояние просмотра списка зрителей
  const [showViewersList, setShowViewersList] = useState(false);

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
    setShowViewersList(false);

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
    setShowViewersList(false);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const handleNextStory = () => {
    setProgress(0);
    setShowViewersList(false);
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
    setShowViewersList(false);
    setActiveStoryIndex((prev) => {
      if (prev === null) return null;
      if (prev > 0) {
        return prev - 1;
      } else {
        return prev;
      }
    });
  };

  const handleShopNow = (productId) => {
    handleCloseStory();
    navigate(`/product/${productId}`);
  };

  // Публикация кастомной истории
  const handlePublishStory = (e) => {
    e.preventDefault();
    const newStory = {
      id: 'story-user-' + Date.now(),
      title: 'Ваша история',
      image: creatorBg,
      text: creatorText.trim(),
      fontStyle: creatorFont,
      textColor: creatorColor,
      effect: creatorEffect,
      viewed: false
    };

    const nextStories = [newStory, ...stories];
    setStories(nextStories);
    localStorage.setItem('demo_stories', JSON.stringify(nextStories));

    // Сброс полей
    setIsCreatorOpen(false);
    setCreatorText('');
    setCreatorEffect('none');
  };

  return (
    <div style={{ padding: '24px 0 12px' }}>
      {/* Список историй (Лента) */}
      <div style={{
        display: 'flex',
        gap: '18px',
        overflowX: 'auto',
        padding: '4px 0',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* Кнопка "Добавить историю" (для любого пользователя через Редактор) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => setIsCreatorOpen(true)}
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
            title="Создать историю в редакторе"
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
                  border: '2.5px solid var(--bg-primary)',
                  filter: story.effect || 'none'
                }}
              />
            </div>
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
            onMouseUp={() => { if (!showViewersList) setIsPaused(false); }}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => { if (!showViewersList) setIsPaused(false); }}
          >
            {/* Картинка истории с наложенным CSS-фильтром */}
            <img 
              src={stories[activeStoryIndex].image} 
              alt={stories[activeStoryIndex].title} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                filter: stories[activeStoryIndex].effect || 'none'
              }}
            />

            {/* Стилизованный текст поверх истории */}
            {stories[activeStoryIndex].text && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: stories[activeStoryIndex].textColor || '#ffffff',
                fontFamily: stories[activeStoryIndex].fontStyle === 'Neon' ? 'cursive' : stories[activeStoryIndex].fontStyle === 'Retro' ? 'serif' : 'sans-serif',
                fontSize: '28px',
                fontWeight: 900,
                textAlign: 'center',
                padding: '0 20px',
                width: '100%',
                wordWrap: 'break-word',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
                zIndex: 12,
                pointerEvents: 'none',
                lineHeight: '1.3',
                letterSpacing: stories[activeStoryIndex].fontStyle === 'Retro' ? '0.05em' : 'normal'
              }}>
                {stories[activeStoryIndex].text}
              </div>
            )}

            {/* Зоны клика (Навигация) */}
            <div 
              onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
              style={{ position: 'absolute', left: 0, top: '80px', width: '25%', height: 'calc(100% - 160px)', cursor: 'w-resize', zIndex: 11 }}
            />
            <div 
              onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
              style={{ position: 'absolute', right: 0, top: '80px', width: '25%', height: 'calc(100% - 160px)', cursor: 'e-resize', zIndex: 11 }}
            />

            {/* Боковые кнопки */}
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
                  <div className="gradient-bg" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5px' }}>
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

            {/* Блок просмотра счетчика зрителей (Только для "Ваша история") */}
            {stories[activeStoryIndex].title === 'Ваша история' && !showViewersList && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(true);
                  setShowViewersList(true);
                }}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '20px',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 'var(--border-radius-full)',
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 15,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
              >
                <Eye size={14} /> Просмотры: 3
              </button>
            )}

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

            {/* Выдвижная шторка со списком зрителей (Stories Viewers Drawer) */}
            {showViewersList && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-lg) var(--border-radius-lg) 0 0',
                padding: '24px',
                color: 'var(--text-primary)',
                zIndex: 30,
                boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
                maxHeight: '380px',
                overflowY: 'auto',
                borderTop: '1px solid var(--border-color)',
                animation: 'slideUp 0.3s cubic-bezier(0.1, 1, 0.1, 1) forwards'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <Eye size={16} /> Просмотрели историю (3)
                  </h4>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowViewersList(false);
                      setIsPaused(false);
                    }}
                    style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Зритель 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60" alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>@maria_style</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Мария • Блогер</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleCloseStory();
                        navigate('/messages', { state: { selectChatId: 'chat-maria' } });
                      }}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Написать
                    </button>
                  </div>

                  {/* Зритель 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>@anna_sales</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Анна • Продавец</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleCloseStory();
                        navigate('/messages', { state: { selectChatId: 'chat-seller-1' } });
                      }}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Написать
                    </button>
                  </div>

                  {/* Зритель 3 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60" alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block' }}>@sergey_logistic</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Сергей • Доставка</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        handleCloseStory();
                        navigate('/messages', { state: { selectChatId: 'chat-logistic' } });
                      }}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                    >
                      Написать
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Полноэкранный Stories Creator (Редактор) */}
      {isCreatorOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          animation: 'fadeIn 0.2s',
          userSelect: 'none'
        }}>
          <div className="glass" style={{
            width: '90%',
            maxWidth: '780px',
            borderRadius: 'var(--border-radius-lg)',
            padding: '30px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '95vh',
            overflowY: 'auto'
          }}>
            
            {/* Хедер редактора */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="gradient-text" /> Редактор историй (Stories Studio)
              </h3>
              <button 
                onClick={() => setIsCreatorOpen(false)}
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Рабочая зона: Превью (Слева) и Инструменты (Справа) */}
            <form onSubmit={handlePublishStory} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              gap: '30px',
              alignItems: 'start'
            }}>
              
              {/* Превью (Колонка 1) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Предпросмотр</span>
                <div style={{
                  position: 'relative',
                  width: '240px',
                  height: '420px',
                  backgroundColor: '#000',
                  borderRadius: 'var(--border-radius-md)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                  border: '1px solid var(--border-color)'
                }}>
                  <img 
                    src={creatorBg} 
                    alt="" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: creatorEffect
                    }}
                  />
                  {creatorText.trim() && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: creatorColor,
                      fontFamily: creatorFont === 'Neon' ? 'cursive' : creatorFont === 'Retro' ? 'serif' : 'sans-serif',
                      fontSize: '20px',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '0 10px',
                      width: '100%',
                      wordWrap: 'break-word',
                      textShadow: '0 2px 8px rgba(0,0,0,0.85)',
                      pointerEvents: 'none'
                    }}>
                      {creatorText}
                    </div>
                  )}
                </div>
              </div>

              {/* Настройки (Колонка 2) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Выбор фона (Presets) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Image size={14} /> Выберите фон
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {BACKGROUND_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCreatorBg(preset.url)}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '8px',
                          border: creatorBg === preset.url ? '2.5px solid var(--accent-pink)' : '1px solid var(--border-color)',
                          backgroundImage: `url(${preset.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Или вставьте ссылку на картинку..." 
                    value={creatorBg}
                    onChange={(e) => setCreatorBg(e.target.value)}
                    style={{
                      width: '100%',
                      height: '36px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border-color)',
                      padding: '0 10px',
                      fontSize: '12px'
                    }}
                  />
                </div>

                {/* Наложение Текста */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Edit3 size={14} /> Добавить текст
                  </label>
                  <input 
                    type="text" 
                    placeholder="Напишите что-нибудь... (до 80 знаков)" 
                    maxLength={80}
                    value={creatorText}
                    onChange={(e) => setCreatorText(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border-color)',
                      padding: '0 10px',
                      fontSize: '13px'
                    }}
                  />
                  <span style={{ fontSize: '10px', textAlign: 'right', color: 'var(--text-tertiary)' }}>
                    {creatorText.length}/80
                  </span>
                </div>

                {/* Стиль шрифта */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Шрифт текста</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Modern', 'Neon', 'Retro'].map(font => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => setCreatorFont(font)}
                        className={`btn ${creatorFont === font ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 14px', fontSize: '11px', borderRadius: 'var(--border-radius-full)' }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Цвет текста */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Цвет текста</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {COLOR_PRESETS.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCreatorColor(color.value)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: color.value,
                          border: creatorColor === color.value ? '2.5px solid var(--accent-pink)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Эффекты (Фильтры) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={14} /> Фотоэффекты
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {EFFECTS_PRESETS.map((effect, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCreatorEffect(effect.style)}
                        className={`btn ${creatorEffect === effect.style ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '11px', borderRadius: 'var(--border-radius-sm)' }}
                      >
                        {effect.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Кнопка отправки */}
                <button
                  type="submit"
                  className="btn btn-primary gradient-bg"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: 'var(--border-radius-sm)',
                    fontSize: '13px',
                    fontWeight: 700,
                    marginTop: '10px',
                    boxShadow: '0 4px 12px rgba(225, 48, 108, 0.3)'
                  }}
                >
                  Опубликовать историю
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
