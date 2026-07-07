import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldAlert, User, Check, Loader2, Phone, Video } from 'lucide-react';
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

export default function Messages() {
  const { currentUser } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [activeCall, setActiveCall] = useState(null);

  const handleStartCall = (type) => {
    if (!activeChat) return;
    setActiveCall({
      contact: activeChat,
      type: type
    });
  };
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

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
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MessageSquare size={20} className="gradient-text" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Сообщения (Direct)</h2>
          </div>

          {/* Список контактов */}
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {DEMO_CHATS.map((chat) => {
              const isSelected = activeChat?.id === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
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
            })}
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
                    <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{activeChat.name}</h3>
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
    </div>
  );
}
