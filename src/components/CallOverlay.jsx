import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Maximize2 } from 'lucide-react';

export default function CallOverlay({ contact, type, onClose }) {
  const [status, setStatus] = useState('outgoing'); // 'outgoing' | 'connected'
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const timerRef = useRef(null);

  // Симуляция ответа (3 секунды гудков)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setStatus('connected');
    }, 3000);

    return () => {
      clearTimeout(timeout);
      stopTracks();
    };
  }, []);

  // Таймер звонка после соединения
  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Запуск веб-камеры для видеозвонка при соединении
  useEffect(() => {
    if (type === 'video' && status === 'connected' && !cameraOff) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Доступ к веб-камере отклонен:", err);
        });
    } else if (cameraOff) {
      stopTracks();
    }
  }, [type, status, cameraOff]);

  const stopTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const handleToggleCamera = () => {
    setCameraOff(prev => !prev);
  };

  const handleEndCall = () => {
    stopTracks();
    onClose();
  };

  // Форматирование времени
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      zIndex: 11000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '60px 24px 80px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      
      {/* Шапка звонка */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          opacity: 0.6,
          display: 'block',
          marginBottom: '8px'
        }}>
          {type === 'video' ? 'Видеовызов' : 'Аудиовызов'}
        </span>
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 8px' }}>
          {contact?.name || 'Пользователь'}
        </h2>
        <span style={{ fontSize: '15px', opacity: 0.8, color: status === 'outgoing' ? '#0095f6' : 'white' }}>
          {status === 'outgoing' ? 'Исходящий вызов...' : formatTime(duration)}
        </span>
      </div>

      {/* Центральная часть */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '360px',
        height: '360px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5
      }}>
        {/* Видео-звонок: Полноэкранный фид собеседника (симуляция) или камера */}
        {type === 'video' && status === 'connected' ? (
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '24px',
            backgroundColor: '#161616',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)'
          }}>
            {/* Картинка собеседника на весь экран */}
            <img 
              src={contact?.avatar} 
              alt="" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.7)'
              }} 
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Собеседник на связи
            </div>

            {/* Ваша камера: Маленькое плавающее окно (Selfie) */}
            {!cameraOff && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '90px',
                  height: '130px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '2px solid white',
                  backgroundColor: '#000',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  zIndex: 20
                }}
              />
            )}
          </div>
        ) : (
          /* Аудио-звонок: Анимация аватара */
          <div style={{ position: 'relative' }}>
            {status === 'outgoing' && (
              <>
                <div className="calling-ring" style={{ animationDelay: '0s' }}></div>
                <div className="calling-ring" style={{ animationDelay: '1s' }}></div>
                <div className="calling-ring" style={{ animationDelay: '2s' }}></div>
              </>
            )}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 10
            }}>
              <img 
                src={contact?.avatar} 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Панель управления звонком */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        zIndex: 10
      }}>
        {/* Микрофон */}
        <button
          onClick={() => setMuted(prev => !prev)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: muted ? 'white' : 'rgba(255,255,255,0.1)',
            color: muted ? '#0a0a0a' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            transition: 'background-color 0.2s'
          }}
          title={muted ? "Включить микрофон" : "Выключить микрофон"}
        >
          {muted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

        {/* Сброс звонка */}
        <button
          onClick={handleEndCall}
          className="call-end-btn"
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#ff3b30',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            boxShadow: '0 8px 24px rgba(255, 59, 48, 0.4)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Завершить звонок"
        >
          <PhoneOff size={26} />
        </button>

        {/* Камера (только для видеозвонков) */}
        {type === 'video' ? (
          <button
            onClick={handleToggleCamera}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: cameraOff ? 'white' : 'rgba(255,255,255,0.1)',
              color: cameraOff ? '#0a0a0a' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              transition: 'background-color 0.2s'
            }}
            title={cameraOff ? "Включить камеру" : "Выключить камеру"}
          >
            {cameraOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
        ) : (
          /* Пустая кнопка-заглушка для симметрии в аудио-звонке */
          <div style={{ width: '56px' }}></div>
        )}
      </div>

      {/* Анимации */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .calling-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid rgba(0, 149, 246, 0.6);
          animation: ringPulse 3s infinite linear;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes ringPulse {
          0% {
            width: 140px;
            height: 140px;
            opacity: 1;
          }
          100% {
            width: 280px;
            height: 280px;
            opacity: 0;
            border-color: rgba(225, 48, 108, 0);
          }
        }
      `}</style>
    </div>
  );
}
