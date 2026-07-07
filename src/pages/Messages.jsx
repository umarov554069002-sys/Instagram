import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, MessageSquare, ShieldAlert, User, Check, Loader2, Phone, Video, Search, UserPlus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import CallOverlay from '../components/CallOverlay';
import { useFollowing } from '../context/FollowingContext';

// Начальные демо-диалоги
const DEMO_CHATS = [
  {
    id: 'chat-support',
    name: 'Поддержка InstaStore 🤖',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    subtitle: 'Онлайн. Готовы помочь',
    botAnswers: [
      'Привет! Я бот поддержки InstaStore. Чем могу помочь?',
      'Наши операторы обычно отвечают в течение 10 минут. Опишите вашу проблему, пожалуйста.',
      'Все заказы доставляются в среднем за 2-3 дня. Номер накладной придет в SMS.',
      'Спасибо за сообщение! Хорошего дня и приятных покупок в InstaStore!'
    ]
  },
  {
    id: 'chat-seller-1',
    name: 'Анна (Менеджер по продажам)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    subtitle: 'Была в сети 5 мин. назад',
    botAnswers: [
      'Здравствуйте! Да, этот свитшот оверсайз кроя идет размер в размер.',
      'Молочная сумка сейчас осталась в количестве 2 штук. Оформляем?',
      'Если вам не подойдет размер, вы можете вернуть товар через службу СДЭК.',
    ]
  },
  {
    id: 'chat-buyer-1',
    name: 'Алексей (Клиент)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    subtitle: 'В сети',
    botAnswers: [
      'Добрый день! А есть скидка при покупке двух пар наушников?',
      'Отлично, тогда оформляю заказ прямо сейчас!',
      'Спасибо за быструю обратную связь!'
    ]
  }
];

// Общий список зарегистрированных аккаунтов для поиска
const ALL_ACCOUNTS = [
  ...DEMO_CHATS,
  {
    id: 'chat-logistic',
    name: 'Сергей (Служба доставки/Логистика) 🚚',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    subtitle: 'В сети',
    botAnswers: [
      'Здравствуйте! Ваш заказ передан курьеру.',
      'Ожидайте доставку сегодня с 14:00 до 18:00.',
      'Спасибо за выбор нашей службы логистики!'
    ]
  },
  {
    id: 'chat-sales',
    name: 'instastore_sales (Оптовый отдел) 📈',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
    subtitle: 'Был(а) в сети 2 часа назад',
    botAnswers: [
      'Приветствуем! Оптовые прайсы высланы вам на почту.',
      'Минимальная партия для оптового заказа — от 50 000 ₽.',
      'Напишите ваш email, и мы вышлем договор.'
    ]
  },
  {
    id: 'chat-maria',
    name: 'Мария (Блогер / Инфлюенсер) ✨',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    subtitle: 'Онлайн',
    botAnswers: [
      'Привет! Очень крутые товары у вас в магазине!',
      'Хочу сделать обзор на ваш свитшот в сторис.',
      'Жду ответа от вашего PR-отдела!'
    ]
  }
];

// Короткие заметки собеседников по умолчанию
const NOTES_LOOKUP = {
  'chat-seller-1': 'На связи 👜',
  'chat-maria': 'SoundFlow — огонь! 🎧',
  'chat-buyer-1': 'Ищу подарок 🎁',
  'chat-logistic': 'Посылки в пути 🚚',
  'chat-sales': 'Оптовый прайс готов 📈'
};

export default function Messages() {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  
  // Поиск и список диалогов
  const [searchQuery, setSearchQuery] = useState('');
  const [chatsList, setChatsList] = useState(() => {
    const saved = localStorage.getItem('demo_chats_list');
    return saved ? JSON.parse(saved) : DEMO_CHATS;
  });

  // Добавление кастомного аккаунта
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customNickname, setCustomNickname] = useState('');

  // Заметки (Instagram Notes)
  const [userNote, setUserNote] = useState(() => localStorage.getItem('demo_user_note') || '');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  const handleStartCall = (type) => {
    if (!activeChat) return;
    setActiveCall({
      contact: activeChat,
      type: type
    });
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (noteInput.trim().length > 60) return;
    const cleanNote = noteInput.trim();
    setUserNote(cleanNote);
    localStorage.setItem('demo_user_note', cleanNote);
    setIsNoteModalOpen(false);
    setNoteInput('');
  };

  const handleDeleteNote = () => {
    setUserNote('');
    localStorage.removeItem('demo_user_note');
    setIsNoteModalOpen(false);
    setNoteInput('');
  };

  const handleAddCustomAccount = (e) => {
    e.preventDefault();
    if (!customNickname.trim()) return;

    let nickname = customNickname.trim().replace(/^@/, '').replace(/\s+/g, '');
    if (!nickname) return;

    const existingInAll = ALL_ACCOUNTS.find(
      acc => acc.name.toLowerCase().includes(nickname.toLowerCase()) || 
             acc.id.toLowerCase().includes(nickname.toLowerCase())
    );
    
    if (existingInAll) {
      handleSelectAccount(existingInAll);
      setIsAddModalOpen(false);
      setCustomNickname('');
      return;
    }

    const newContact = {
      id: 'chat-custom-' + Date.now(),
      name: `@${nickname} 👤`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
      subtitle: 'Онлайн',
      botAnswers: [
        `Привет! Я новый пользователь @${nickname}. Рад общению!`,
        'Я сейчас немного занят покупками в InstaStore, отвечу позже!',
        'Качество товаров здесь действительно отличное 👍'
      ]
    };

    ALL_ACCOUNTS.push(newContact);

    const updatedChatsList = [...chatsList, newContact];
    setChatsList(updatedChatsList);
    localStorage.setItem('demo_chats_list', JSON.stringify(updatedChatsList));

    setActiveChat(newContact);
    setIsAddModalOpen(false);
    setCustomNickname('');
  };

  const handleSelectAccount = (account) => {
    const exists = chatsList.some(c => c.id === account.id);
    if (!exists) {
      const updated = [...chatsList, account];
      setChatsList(updated);
      localStorage.setItem('demo_chats_list', JSON.stringify(updated));
    }
    setActiveChat(account);
    setSearchQuery('');
  };

  // Фильтрация результатов поиска
  const filteredAccounts = searchQuery.trim() !== ''
    ? ALL_ACCOUNTS.filter(acc => 
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.subtitle && acc.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : chatsList;

  const [loading, setLoading] = useState(false);
  
  // Подписки
  const { isFollowing, toggleFollow } = useFollowing();
  const isFollowingContact = activeChat ? isFollowing(activeChat.id) : false;

  const messagesEndRef = useRef(null);

  const location = useLocation();

  // Автовыбор диалога при переходе по ссылке (например, со страницы поиска)
  useEffect(() => {
    if (location.state?.selectChatId) {
      const targetId = location.state.selectChatId;
      const target = ALL_ACCOUNTS.find(acc => acc.id === targetId);
      if (target) {
        handleSelectAccount(target);
      }
    }
  }, [location, chatsList]);

  // Проверка демо-режима
  const isDemo = !db;

  // Автопрокрутка вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Загрузка сообщений для выбранного чата
  useEffect(() => {
    if (!activeChat) return;

    setLoading(true);
    setMessages([]);

    if (isDemo) {
      // Инициализация сообщений в демо-режиме из localStorage
      const savedMessages = localStorage.getItem(`demo_msg_${activeChat.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Начальное приветственное сообщение от контакта
        const initialMsg = {
          id: 'msg-init-' + Date.now(),
          text: activeChat.id === 'chat-support' 
            ? 'Здравствуйте! Как я могу вам помочь сегодня?' 
            : `Привет! Я на связи. Задавай любой вопрос про наши товары!`,
          senderId: activeChat.id,
          timestamp: new Date().toISOString()
        };
        setMessages([initialMsg]);
        localStorage.setItem(`demo_msg_${activeChat.id}`, JSON.stringify([initialMsg]));
      }
      setLoading(false);
    } else {
      // Реальный Firebase Firestore слушатель сообщений
      try {
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Конвертируем Firestore timestamp в строку ISO
            timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
          }));
          setMessages(fetchedMessages);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Ошибка Firebase при загрузке сообщений:", err);
        setLoading(false);
      }
    }
  }, [activeChat, isDemo]);

  // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const messageText = inputText.trim();
    setInputText('');

    const newMessage = {
      text: messageText,
      senderId: currentUser?.uid || 'guest-user',
      senderName: currentUser?.displayName || currentUser?.email || 'Гость',
      timestamp: new Date().toISOString()
    };

    if (isDemo) {
      // ДЕМО-РЕЖИМ: Сохранение в LocalStorage
      const updatedMessages = [...messages, { id: 'msg-' + Date.now(), ...newMessage }];
      setMessages(updatedMessages);
      localStorage.setItem(`demo_msg_${activeChat.id}`, JSON.stringify(updatedMessages));

      // Запуск имитации ответа бота
      simulateBotReply(updatedMessages);
    } else {
      // РЕАЛЬНЫЙ РЕЖИМ: Отправка в Firestore
      try {
        const messagesRef = collection(db, 'chats', activeChat.id, 'messages');
        await addDoc(messagesRef, {
          ...newMessage,
          timestamp: serverTimestamp() // Используем серверное время
        });
      } catch (err) {
        console.error("Ошибка при отправке в Firebase:", err);
        alert("Не удалось отправить сообщение. Проверьте права доступа в Firebase консоли.");
      }
    }
  };

  // Имитация автоответчика в Демо-режиме
  const simulateBotReply = (currentMessages) => {
    setTyping(true);

    // Случайная задержка ответа 1.5 - 2.5 сек
    const delay = 1500 + Math.random() * 1000;

    setTimeout(() => {
      // Выбираем случайную фразу бота
      const botPhrases = activeChat.botAnswers || ['Спасибо за сообщение!'];
      // Выбираем ответ на основе количества отправленных сообщений пользователя
      const replyIndex = Math.min(
        currentMessages.filter(m => m.senderId !== activeChat.id).length - 1, 
        botPhrases.length - 1
      );
      const replyText = botPhrases[replyIndex >= 0 ? replyIndex : 0];

      const botMessage = {
        id: 'msg-bot-' + Date.now(),
        text: replyText,
        senderId: activeChat.id,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => {
        const nextMessages = [...prev, botMessage];
        localStorage.setItem(`demo_msg_${activeChat.id}`, JSON.stringify(nextMessages));
        return nextMessages;
      });

      setTyping(false);
    }, delay);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '100px 24px 40px' }}>
      {/* Контейнер чата */}
      <div className="glass" style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        borderRadius: 'var(--border-radius-md)',
        height: 'calc(100vh - 160px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        
        {/* Левая панель - Диалоги */}
        <div style={{
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Хедер списка диалогов */}
          <div style={{
            padding: '24px 24px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MessageSquare size={20} className="gradient-text" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Сообщения (Direct)</h2>
          </div>

          {/* Лента заметок (Instagram Notes) */}
          <div 
            className="hide-scrollbar"
            style={{
              display: 'flex',
              gap: '16px',
              padding: '0 24px 16px',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}
          >
            {/* Ваша заметка */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
              <button 
                onClick={() => {
                  setNoteInput(userNote);
                  setIsNoteModalOpen(true);
                }}
                style={{
                  position: 'relative',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60" 
                  alt="" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
                
                {/* Облачко с заметкой */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  fontSize: '9px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  maxWidth: '70px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--text-primary)'
                }}>
                  {userNote ? userNote : '+'}
                </div>
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'center', width: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Вы
              </span>
            </div>

            {/* Заметки контактов */}
            {chatsList.map(chat => {
              const noteText = NOTES_LOOKUP[chat.id];
              if (!noteText) return null;
              return (
                <div 
                  key={`note-${chat.id}`}
                  onClick={() => handleSelectAccount(chat)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                >
                  <div style={{
                    position: 'relative',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    border: '2px solid var(--border-color)',
                    overflow: 'hidden'
                  }}>
                    <img src={chat.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  {/* Облачко с заметкой */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '9px',
                    fontWeight: 500,
                    maxWidth: '70px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-sm)',
                    color: 'var(--text-secondary)'
                  }}
                  title={noteText}
                  >
                    {noteText}
                  </div>
                  
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'center', width: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.name.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Строка поиска и кнопка добавления аккаунта */}
          <div style={{ padding: '0 24px 16px', display: 'flex', gap: '10px', position: 'relative' }}>
            <div style={{ position: 'relative', flexGrow: 1 }}>
              <input
                type="text"
                placeholder="Поиск аккаунтов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: 'var(--border-radius-full)',
                  border: '1px solid var(--border-color)',
                  height: '36px',
                  padding: '0 16px 0 38px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <Search size={14} style={{ position: 'absolute', left: '14px', top: '11px', color: 'var(--text-tertiary)' }} />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              title="Начать чат по никнейму"
            >
              <UserPlus size={16} />
            </button>
          </div>

          {/* Список контактов */}
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((chat) => {
                const isSelected = activeChat?.id === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectAccount(chat)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left',
                      backgroundColor: isSelected ? 'rgba(225, 48, 108, 0.08)' : 'transparent',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                  {/* Аватар */}
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={chat.avatar} 
                      alt={chat.name} 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--border-color)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#4caf50',
                      border: '2px solid var(--bg-secondary)'
                    }}></div>
                  </div>

                      {/* Описание контакта */}
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {chat.name}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {chat.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                  Контакты не найдены
                </div>
              )}
            </div>
        </div>

        {/* Правая панель - Диалог */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {activeChat ? (
            <>
              {/* Хедер активного чата */}
              <div className="glass" style={{
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-color)',
                zIndex: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={activeChat.avatar} 
                    alt={activeChat.name} 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{activeChat.name}</h3>
                      <button
                        onClick={() => toggleFollow(activeChat.id)}
                        style={{
                          background: isFollowingContact ? 'var(--bg-tertiary)' : 'var(--accent-pink)',
                          border: isFollowingContact ? '1px solid var(--border-color)' : 'none',
                          color: isFollowingContact ? 'var(--text-primary)' : 'white',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isFollowingContact ? 'Подписки' : 'Подписаться'}
                      </button>
                    </div>
                    <span style={{ fontSize: '11px', color: '#4caf50', fontWeight: 600 }}>Онлайн</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {isDemo && (
                    <span style={{
                      backgroundColor: 'rgba(255, 204, 0, 0.1)',
                      color: '#c49a00',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--border-radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShieldAlert size={12} /> ДЕМО-ЧАТ
                    </span>
                  )}

                  {/* Кнопка аудиозвонка */}
                  <button 
                    onClick={() => handleStartCall('audio')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    title="Аудиозвонок"
                  >
                    <Phone size={18} />
                  </button>

                  {/* Кнопка видеозвонка */}
                  <button 
                    onClick={() => handleStartCall('video')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    title="Видеозвонок"
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>

              {/* История сообщений */}
              <div style={{
                flexGrow: 1,
                padding: '24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(225, 48, 108, 0.02) 0%, transparent 40%)'
              }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Loader2 className="animate-spin" size={24} color="var(--accent-pink)" />
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === (currentUser?.uid || 'guest-user');
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%',
                            alignSelf: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          {/* Облачко сообщения */}
                          <div style={{
                            padding: '12px 18px',
                            borderRadius: isMe 
                              ? '18px 18px 4px 18px' 
                              : '18px 18px 18px 4px',
                            background: isMe ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                            color: isMe ? 'white' : 'var(--text-primary)',
                            fontSize: '14px',
                            lineHeight: '1.4',
                            boxShadow: 'var(--shadow-sm)',
                            border: isMe ? 'none' : '1px solid var(--border-color)',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                          }}>
                            {msg.text}
                          </div>
                          
                          {/* Время */}
                          <span style={{
                            fontSize: '10px',
                            color: 'var(--text-tertiary)',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <Check size={10} color="#4caf50" />}
                          </span>
                        </div>
                      );
                    })}

                    {/* Анимация набора текста */}
                    {typing && (
                      <div style={{
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--bg-secondary)',
                        padding: '10px 16px',
                        borderRadius: '18px 18px 18px 4px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Печатает</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite' }}></span>
                          <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.2s' }}></span>
                          <span className="dot" style={{ width: '4px', height: '4px', background: 'var(--text-secondary)', borderRadius: '50%', animation: 'pulse-glow 1s infinite 0.4s' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Поле ввода сообщения */}
              <form 
                onSubmit={handleSendMessage}
                style={{
                  padding: '20px 24px',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: 'var(--bg-secondary)',
                  alignItems: 'center'
                }}
              >
                <input 
                  type="text" 
                  placeholder="Напишите сообщение..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flexGrow: 1,
                    borderRadius: 'var(--border-radius-full)',
                    border: '1px solid var(--border-color)',
                    height: '44px',
                    padding: '0 20px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={!inputText.trim() || loading}
                  className="gradient-bg"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(225, 48, 108, 0.2)',
                    opacity: !inputText.trim() ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={16} color="white" style={{ transform: 'rotate(-45deg)', margin: '0 0 1px 1px' }} />
                </button>
              </form>
            </>
          ) : (
            /* Экран при невыбранном чате (Empty State) */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: '40px',
              textAlign: 'center'
            }}>
              <div className="gradient-bg" style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: '0 10px 25px rgba(225, 48, 108, 0.2)'
              }}>
                <Send size={36} color="white" style={{ transform: 'rotate(-45deg)', margin: '0 0 4px 4px' }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Ваши сообщения</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '280px', fontSize: '14px', lineHeight: '1.5' }}>
                Отправляйте личные сообщения, делитесь мнениями о товарах или консультируйтесь с продавцами напрямую.
              </p>
              <span style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                marginTop: '32px',
                display: 'block'
              }}>
                Выберите диалог из списка слева, чтобы начать переписку.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Экран аудио/видео вызовов */}
      {activeCall && (
        <CallOverlay 
          contact={activeCall.contact}
          type={activeCall.type}
          onClose={() => setActiveCall(null)}
        />
      )}

      {/* Модальное окно добавления аккаунта */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 12000,
          animation: 'fadeIn 0.2s'
        }}
        onClick={() => setIsAddModalOpen(false)}
        >
          <div className="glass" style={{
            width: '100%',
            maxWidth: '340px',
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleUp 0.3s cubic-bezier(0.1, 1, 0.1, 1) forwards'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Новый диалог</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddCustomAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Никнейм пользователя</label>
                <input
                  type="text"
                  placeholder="@username"
                  required
                  value={customNickname}
                  onChange={(e) => setCustomNickname(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    height: '38px',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: '0 12px',
                    fontSize: '13px'
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '38px', borderRadius: 'var(--border-radius-sm)', marginTop: '6px' }}
              >
                Начать чат
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования заметки (Instagram Notes) */}
      {isNoteModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 12000,
          animation: 'fadeIn 0.2s'
        }}
        onClick={() => setIsNoteModalOpen(false)}
        >
          <div className="glass" style={{
            width: '100%',
            maxWidth: '340px',
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'scaleUp 0.3s cubic-bezier(0.1, 1, 0.1, 1) forwards'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{userNote ? 'Ваша заметка' : 'Поделиться мыслью'}</h3>
              <button onClick={() => setIsNoteModalOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Мысль (до 60 символов)
                </label>
                <textarea
                  placeholder="Что у вас нового?..."
                  required
                  maxLength={60}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  autoFocus
                  rows={3}
                  style={{
                    width: '100%',
                    borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    fontSize: '13px',
                    resize: 'none'
                  }}
                />
                <span style={{ fontSize: '10px', textAlign: 'right', color: noteInput.length > 50 ? 'var(--accent-pink)' : 'var(--text-tertiary)' }}>
                  {noteInput.length}/60
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                {userNote && (
                  <button
                    type="button"
                    onClick={handleDeleteNote}
                    className="btn btn-secondary"
                    style={{ flex: 1, height: '38px', borderRadius: 'var(--border-radius-sm)', border: '1px solid #ff3b30', color: '#ff3b30' }}
                  >
                    Удалить
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, height: '38px', borderRadius: 'var(--border-radius-sm)' }}
                >
                  Поделиться
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
