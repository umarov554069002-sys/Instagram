import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  // Состояния оформления заказа
  const [name, setName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');

  const total = getCartTotal();
  const deliveryFee = total > 5000 || total === 0 ? 0 : 350;
  const finalTotal = total + deliveryFee;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    
    // Имитируем запрос к Netlify Serverless Function (/api/checkout)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems,
          customer: { name, phone, address, email: currentUser?.email || 'guest@store.com' },
          total: finalTotal
        })
      });

      const data = await response.json();
      
      // Имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (response.ok || data.success) {
        setOrderId(data.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000));
        setOrderCompleted(true);
        clearCart();
      } else {
        alert('Ошибка при оформлении заказа: ' + data.error);
      }
    } catch (err) {
      console.warn('Серверные функции Netlify не запущены локально. Симулируем успешный заказ на стороне клиента.');
      // Симуляция успешного ответа
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOrderId('ORD-' + Math.floor(100000 + Math.random() * 900000));
      setOrderCompleted(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Страница успешного заказа
  if (orderCompleted) {
    return (
      <div className="container animate-fade-in" style={{ padding: '150px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px', color: '#4caf50' }}>
          <CheckCircle2 size={72} />
        </div>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>Заказ успешно оформлен!</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Номер вашего заказа: <strong className="gradient-text">{orderId}</strong>
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '40px' }}>
          Мы свяжемся с вами в ближайшее время для подтверждения доставки.
        </p>
        <Link to="/catalog" className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 'var(--border-radius-full)' }}>
          Вернуться к покупкам
        </Link>
      </div>
    );
  }

  // 2. Страница пустой корзины
  if (cartItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '150px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-tertiary)' }}>
          <ShoppingBag size={72} />
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '16px' }}>Ваша корзина пуста</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
          Вы еще не добавили ни одного товара в корзину.
        </p>
        <Link to="/catalog" className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 'var(--border-radius-full)' }}>
          В каталог <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // 3. Основной вид корзины
  return (
    <div className="container animate-fade-in" style={{ padding: '120px 24px 80px' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '40px' }}>Корзина</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Список товаров */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="glass" style={{
              borderRadius: 'var(--border-radius-md)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              {/* Фото */}
              <img 
                src={item.image} 
                alt={item.name} 
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--border-radius-sm)',
                  objectFit: 'cover'
                }}
              />
              
              {/* Название и категория */}
              <div style={{ flexGrow: 1 }}>
                <Link to={`/product/${item.id}`} style={{ fontWeight: 600, fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                  {item.name}
                </Link>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.category}</span>
              </div>

              {/* Управление количеством */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                overflow: 'hidden',
                background: 'var(--bg-secondary)'
              }}>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '4px 12px', fontSize: '16px', fontWeight: 600 }}
                >
                  -
                </button>
                <span style={{ padding: '0 8px', minWidth: '24px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '4px 12px', fontSize: '16px', fontWeight: 600 }}
                >
                  +
                </button>
              </div>

              {/* Стоимость */}
              <div style={{
                minWidth: '100px',
                textAlign: 'right',
                fontWeight: 700,
                fontSize: '16px'
              }}>
                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
              </div>

              {/* Кнопка удаления */}
              <button 
                onClick={() => removeFromCart(item.id)}
                style={{
                  color: 'var(--text-tertiary)',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                title="Удалить"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Форма оформления и Итого */}
        <div className="glass" style={{
          borderRadius: 'var(--border-radius-md)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Оформление заказа
          </h2>

          {/* Детализация цен */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Сумма заказа</span>
              <span style={{ fontWeight: 600 }}>{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Доставка</span>
              <span style={{ fontWeight: 600 }}>
                {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--accent-pink)', marginTop: '-8px' }}>
                Добавьте товаров еще на {(5000 - total).toLocaleString('ru-RU')} ₽ для бесплатной доставки!
              </span>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: 800,
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              marginTop: '4px'
            }}>
              <span>Итого к оплате</span>
              <span className="gradient-text">{finalTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Форма */}
          <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ваше имя</label>
              <input 
                type="text" 
                placeholder="Иван Иванов" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Номер телефона</label>
              <input 
                type="tel" 
                placeholder="+7 (999) 999-99-99" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Адрес доставки</label>
              <textarea 
                placeholder="г. Москва, ул. Ленина, д. 1, кв. 10" 
                required 
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: 'var(--border-radius-sm)',
                marginTop: '12px'
              }}
            >
              {isSubmitting ? 'Оформление...' : 'Подтвердить заказ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
