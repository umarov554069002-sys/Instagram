import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, ClipboardList, Plus, Trash2, Tag, ShieldCheck, Image, Film } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';

export default function Admin() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('products'); // products, orders, stories, reels
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [stories, setStories] = useState([]);
  const [reels, setReels] = useState([]);
  
  // Поля формы нового товара
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Одежда');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Поля формы новой истории
  const [storyTitle, setStoryTitle] = useState('');
  const [storyImage, setStoryImage] = useState('');
  const [storyProduct, setStoryProduct] = useState('');
  const [isSubmittingStory, setIsSubmittingStory] = useState(false);

  // Поля формы нового рилса
  const [reelVideo, setReelVideo] = useState('');
  const [reelCaption, setReelCaption] = useState('');
  const [reelProduct, setReelProduct] = useState('');
  const [isSubmittingReel, setIsSubmittingReel] = useState(false);

  // Синхронизация таба с URL-параметром (например, ?tab=reels)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['products', 'orders', 'stories', 'reels'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('products');
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    searchParams.set('tab', tabName);
    setSearchParams(searchParams);
  };

  // Загружаем данные из localStorage
  useEffect(() => {
    // Заказы
    const savedOrders = localStorage.getItem('demo_orders') || '[]';
    try {
      setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.error(e);
    }

    // Истории
    const savedStories = localStorage.getItem('demo_stories') || '[]';
    try {
      setStories(JSON.parse(savedStories));
    } catch (e) {
      console.error(e);
    }

    // Рилсы
    const savedReels = localStorage.getItem('demo_reels') || '[]';
    try {
      setReels(JSON.parse(savedReels));
    } catch (e) {
      console.error(e);
    }
  }, [activeTab]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newProduct = {
      id: 'prod-' + (products.length + 1) + '-' + Math.random().toString(36).substr(2, 5),
      name,
      price: Number(price),
      category,
      description,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      rating: 5.0,
      reviews: 0
    };

    try {
      await fetch('/api/admin-add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setProducts(prev => [newProduct, ...prev]);
    MOCK_PRODUCTS.unshift(newProduct); // Добавляем в глобальный кэш
    
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
    setIsSubmitting(false);
    alert('Товар успешно добавлен!');
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Вы действительно хотите удалить этот товар?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      const idx = MOCK_PRODUCTS.findIndex(p => p.id === productId);
      if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
    }
  };

  const handleAddStory = async (e) => {
    e.preventDefault();
    setIsSubmittingStory(true);

    const newStory = {
      id: 'story-' + Date.now(),
      title: storyTitle,
      image: storyImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
      productId: storyProduct,
      viewed: false
    };

    try {
      await fetch('/api/admin-add-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory)
      });
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const updatedStories = [newStory, ...stories];
    setStories(updatedStories);
    localStorage.setItem('demo_stories', JSON.stringify(updatedStories));

    setStoryTitle('');
    setStoryImage('');
    setStoryProduct('');
    setIsSubmittingStory(false);
    alert('История успешно добавлена!');
  };

  const handleDeleteStory = (storyId) => {
    if (window.confirm('Вы действительно хотите удалить эту историю?')) {
      const updatedStories = stories.filter(s => s.id !== storyId);
      setStories(updatedStories);
      localStorage.setItem('demo_stories', JSON.stringify(updatedStories));
    }
  };

  const handleAddReel = async (e) => {
    e.preventDefault();
    setIsSubmittingReel(true);

    const newReel = {
      id: 'reel-' + Date.now(),
      videoUrl: reelVideo || 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-camera-34280-large.mp4',
      caption: reelCaption,
      productId: reelProduct,
      likes: Math.floor(Math.random() * 500) + 50,
      liked: false
    };

    try {
      await fetch('/api/admin-add-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReel)
      });
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    const updatedReels = [newReel, ...reels];
    setReels(updatedReels);
    localStorage.setItem('demo_reels', JSON.stringify(updatedReels));

    setReelVideo('');
    setReelCaption('');
    setReelProduct('');
    setIsSubmittingReel(false);
    alert('Рилс успешно опубликован!');
  };

  const handleDeleteReel = (reelId) => {
    if (window.confirm('Вы действительно хотите удалить этот рилс?')) {
      const updatedReels = reels.filter(r => r.id !== reelId);
      setReels(updatedReels);
      localStorage.setItem('demo_reels', JSON.stringify(updatedReels));
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '120px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px' }}>Панель администратора</h1>
        <span style={{
          backgroundColor: 'rgba(225, 48, 108, 0.1)',
          color: 'var(--accent-pink)',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: 'var(--border-radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <ShieldCheck size={12} /> ДОСТУП РАЗРЕШЕН
        </span>
      </div>

      {/* Переключение табов */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
        <button
          onClick={() => handleTabChange('products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-sm)',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: activeTab === 'products' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'products' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Package size={16} /> Управление товарами
        </button>

        <button
          onClick={() => handleTabChange('stories')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-sm)',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: activeTab === 'stories' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'stories' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Image size={16} /> Истории ({stories.length})
        </button>

        <button
          onClick={() => handleTabChange('reels')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-sm)',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: activeTab === 'reels' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'reels' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <Film size={16} /> Рилсы ({reels.length})
        </button>

        <button
          onClick={() => handleTabChange('orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius-sm)',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: activeTab === 'orders' ? 'var(--accent-gradient)' : 'transparent',
            color: activeTab === 'orders' ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}
        >
          <ClipboardList size={16} /> Заказы ({orders.length})
        </button>
      </div>

      {/* Контент таба: Товары */}
      {activeTab === 'products' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.8fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Форма создания товара */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Добавить товар
            </h2>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Название товара</label>
                <input 
                  type="text" 
                  placeholder="Например: Стильный свитшот" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Цена (₽)</label>
                  <input 
                    type="number" 
                    placeholder="3500" 
                    required 
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Категория</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ height: '42px' }}
                  >
                    <option value="Одежда">Одежда</option>
                    <option value="Аксессуары">Аксессуары</option>
                    <option value="Электроника">Электроника</option>
                    <option value="Косметика">Косметика</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ссылка на изображение</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Описание товара</label>
                <textarea 
                  placeholder="Введите подробное описание..." 
                  required 
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
                style={{ width: '100%', height: '44px', borderRadius: 'var(--border-radius-sm)', marginTop: '8px' }}
              >
                {isSubmitting ? 'Добавление...' : 'Создать товар'}
              </button>
            </form>
          </div>

          {/* Список существующих товаров */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Список товаров ({products.length})</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
              {products.map(product => (
                <div key={product.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} /> {product.category} | {product.price.toLocaleString()} ₽
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProduct(product.id)}
                    style={{ color: 'var(--text-tertiary)', padding: '8px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    title="Удалить товар"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Контент таба: Истории */}
      {activeTab === 'stories' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.8fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* ... Форма создания истории ... */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Опубликовать историю
            </h2>
            
            <form onSubmit={handleAddStory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Заголовок истории</label>
                <input 
                  type="text" 
                  placeholder="Например: Скидки -50%" 
                  required 
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ссылка на изображение истории (вертикальное)</label>
                <input 
                  type="url" 
                  placeholder="https://images.unsplash.com/..." 
                  required
                  value={storyImage}
                  onChange={(e) => setStoryImage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Привязать к товару</label>
                <select 
                  value={storyProduct} 
                  onChange={(e) => setStoryProduct(e.target.value)}
                  style={{ height: '42px' }}
                  required
                >
                  <option value="">Выберите товар для перехода...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} ₽)</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmittingStory}
                style={{ width: '100%', height: '44px', borderRadius: 'var(--border-radius-sm)', marginTop: '8px' }}
              >
                {isSubmittingStory ? 'Опубликование...' : 'Опубликовать'}
              </button>
            </form>
          </div>

          {/* Список существующих историй */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Активные истории ({stories.length})</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
              {stories.map(story => {
                const linkedProduct = products.find(p => p.id === story.productId);
                return (
                  <div key={story.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <img src={story.image} alt={story.title} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {story.title}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🔗 Товар: {linkedProduct ? linkedProduct.name : 'Не привязан'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteStory(story.id)}
                      style={{ color: 'var(--text-tertiary)', padding: '8px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                      title="Удалить историю"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Контент таба: Рилсы */}
      {activeTab === 'reels' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.8fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Форма создания рилса */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Опубликовать рилс
            </h2>
            
            <form onSubmit={handleAddReel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Описание рилса (хэштеги, текст)</label>
                <input 
                  type="text" 
                  placeholder="Например: Обзор новой оверсайз худи! #fashion #style" 
                  required 
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ссылка на видеофайл (вертикальный MP4)</label>
                <input 
                  type="url" 
                  placeholder="https://assets.mixkit.co/videos/preview/..." 
                  required
                  value={reelVideo}
                  onChange={(e) => setReelVideo(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Рекламируемый товар</label>
                <select 
                  value={reelProduct} 
                  onChange={(e) => setReelProduct(e.target.value)}
                  style={{ height: '42px' }}
                  required
                >
                  <option value="">Выберите товар для покупки...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.price} ₽)</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmittingReel}
                style={{ width: '100%', height: '44px', borderRadius: 'var(--border-radius-sm)', marginTop: '8px' }}
              >
                {isSubmittingReel ? 'Публикация...' : 'Опубликовать рилс'}
              </button>
            </form>
          </div>

          {/* Список существующих рилсов */}
          <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Активные рилсы ({reels.length})</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto', paddingRight: '8px' }}>
              {reels.map(reel => {
                const linkedProduct = products.find(p => p.id === reel.productId);
                return (
                  <div key={reel.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <video src={reel.videoUrl} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px', backgroundColor: '#000' }} />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {reel.caption || 'Без описания'}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        🔗 Товар: {linkedProduct ? linkedProduct.name : 'Не привязан'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteReel(reel.id)}
                      style={{ color: 'var(--text-tertiary)', padding: '8px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-pink)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                      title="Удалить рилс"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Контент таба: Заказы */}
      {activeTab === 'orders' && (
        <div className="glass" style={{ borderRadius: 'var(--border-radius-md)', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Поступившие заказы ({orders.length})</h2>
          
          {orders.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order, idx) => (
                <div key={idx} style={{
                  padding: '20px',
                  borderRadius: 'var(--border-radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span>Заказ <strong className="gradient-text">{order.orderId}</strong></span>
                    <span style={{ fontWeight: 700 }}>{order.total.toLocaleString()} ₽</span>
                  </div>
                  <div style={{ fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Получатель:</p>
                      <p style={{ fontWeight: 500 }}>{order.customer.name}</p>
                      <p>{order.customer.phone}</p>
                      <p style={{ color: 'var(--text-tertiary)' }}>{order.customer.email}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Адрес доставки:</p>
                      <p style={{ fontWeight: 500 }}>{order.customer.address}</p>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Товары в заказе:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {item.name} x {item.quantity}</span>
                          <span>{item.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
              Заказов пока нет. Оформите покупку из корзины, чтобы увидеть ее в списке!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
