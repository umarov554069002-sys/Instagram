import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Image, Check, Heart } from 'lucide-react';

const CONTACTS = [
  { id: 'chat-support', name: 'Поддержка InstaStore 🤖', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60' },
  { id: 'chat-seller-1', name: 'Анна (Менеджер)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60' },
  { id: 'chat-buyer-1', name: 'Алексей (Клиент)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' }
];

export default function ShareModal({ isOpen, onClose, item, type }) {
  const [copied, setCopied] = useState(false);
  const [sentStatus, setSentStatus] = useState({}); // { contactId: boolean }

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setSentStatus({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Прямая ссылка для копирования
  const shareUrl = `${window.location.origin}${type === 'reel' ? '/reels' : `/product/${item.id}`}`;

  // Копирование ссылки
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Репост в ленту историй
  const handleRepostToStories = () => {
    const saved = localStorage.getItem('demo_stories') || '[]';
    try {
      const currentStories = JSON.parse(saved);
      const newStory = {
        id: 'story-repost-' + Date.now(),
        title: type === 'reel' ? 'Репост Видео' : item.name,
        // Для рилсов берем плейсхолдер или кадр, для продуктов — изображение
        image: type === 'reel' 
          ? 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80' 
          : item.image,
        productId: type === 'reel' ? item.productId : item.id,
        viewed: false
      };

      const updated = [newStory, ...currentStories];
      localStorage.setItem('demo_stories', JSON.stringify(updated));
      alert('Репост успешно опубликован в ваших Историях на главной странице!');
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  // Отправка в Direct-чат
  const handleSendToDirect = (contactId) => {
    const chatKey = `demo_msg_${contactId}`;
    const saved = localStorage.getItem(chatKey) || '[]';
    try {
      const currentMessages = JSON.parse(saved);
      const messageText = `Репост ${type === 'reel' ? 'видео-рилса' : 'товара'} 🔗\nПосмотри: ${type === 'reel' ? (item.caption || 'Видеоролик') : item.name}\n${shareUrl}`;
      
      const newMsg = {
        id: 'msg-share-' + Date.now(),
        text: messageText,
        senderId: 'guest-user', // Текущий гость
        senderName: 'Вы',
        timestamp: new Date().toISOString()
      };

      const updated = [...currentMessages, newMsg];
      localStorage.setItem(chatKey, JSON.stringify(updated));
      
      setSentStatus(prev => ({ ...prev, [contactId]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease-out'
    }}
    onClick={onClose}
    >
      <div className="glass" style={{
        width: '100%',
        maxWidth: '380px',
        borderRadius: 'var(--border-radius-md)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-primary)',
        animation: 'scaleUp 0.3s cubic-bezier(0.1, 1, 0.1, 1) forwards'
      }}
      onClick={(e) => e.stopPropagation()} // предотвращаем закрытие при клике на модалку
      >
        {/* Хедер модалки */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Поделиться</h3>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Опции быстрой отправки */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          
          {/* Репост в историю */}
          <button 
            onClick={handleRepostToStories}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color 0.2s',
              fontWeight: 600,
              fontSize: '13.5px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(225, 48, 108, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          >
            <div className="gradient-bg" style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={14} color="white" />
            </div>
            Добавить в вашу Историю
          </button>

          {/* Копировать ссылку */}
          <button 
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--border-radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              width: '100%',
              textAlign: 'left',
              transition: 'background-color 0.2s',
              fontWeight: 600,
              fontSize: '13.5px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 149, 246, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              {copied ? <Check size={14} color="#4caf50" /> : <Copy size={14} />}
            </div>
            {copied ? 'Ссылка скопирована!' : 'Скопировать ссылку'}
          </button>

        </div>

        {/* Отправить в Direct (Список контактов) */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Отправить в Direct
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {CONTACTS.map(contact => {
              const isSent = sentStatus[contact.id];
              return (
                <div key={contact.id} style={{ display: 'flex', alignItems: 'center', justifyContainer: 'space-between', gap: '10px' }}>
                  <img src={contact.avatar} alt={contact.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contact.name}
                  </span>
                  <button
                    onClick={() => handleSendToDirect(contact.id)}
                    disabled={isSent}
                    className="gradient-bg"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--border-radius-full)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'white',
                      opacity: isSent ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(225,48,108,0.2)',
                      width: '80px',
                      justifyContent: 'center'
                    }}
                  >
                    {isSent ? <><Check size={10} /> Отпр.</> : 'Отправить'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
