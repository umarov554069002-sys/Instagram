import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { MOCK_PRODUCTS } from '../mockData';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('popular'); // popular, price-asc, price-desc
  
  // Доступные категории из списка товаров
  const categories = ['Все', ...new Set(MOCK_PRODUCTS.map(p => p.category))];

  // Считываем категорию из URL при монтировании/изменении URL
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('Все');
    }
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'Все') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  // Фильтрация и сортировка
  const filteredProducts = MOCK_PRODUCTS.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    return 0; // По умолчанию (как в исходном массиве)
  });

  return (
    <div className="container animate-fade-in" style={{ padding: '120px 24px 80px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Каталог товаров</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Найдено товаров: {filteredProducts.length}
        </p>
      </div>

      {/* Панель фильтров */}
      <div className="glass" style={{
        borderRadius: 'var(--border-radius-md)',
        padding: '24px',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Поиск и Сортировка */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Поле поиска */}
          <div style={{
            position: 'relative',
            flexGrow: 1,
            maxWidth: '500px',
            width: '100%'
          }}>
            <input 
              type="text" 
              placeholder="Поиск товаров..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                borderRadius: 'var(--border-radius-full)',
                border: '1px solid var(--border-color)',
                height: '44px'
              }}
            />
            <Search size={18} color="var(--text-secondary)" style={{
              position: 'absolute',
              left: '14px',
              top: '13px'
            }} />
          </div>

          {/* Сортировка */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <SlidersHorizontal size={14} /> Сортировка:
            </span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                borderRadius: 'var(--border-radius-full)',
                height: '44px',
                border: '1px solid var(--border-color)',
                paddingRight: '32px'
              }}
            >
              <option value="popular">По популярности</option>
              <option value="price-asc">Сначала дешевые</option>
              <option value="price-desc">Сначала дорогие</option>
            </select>
          </div>
        </div>

        {/* Категории (пилюли) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          whiteSpace: 'nowrap'
        }}>
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--border-radius-full)',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                  background: isActive ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                  color: isActive ? 'white' : 'var(--text-primary)',
                  boxShadow: isActive ? '0 4px 10px rgba(225, 48, 108, 0.2)' : 'none',
                  border: isActive ? 'none' : '1px solid transparent'
                }}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Сетка товаров */}
      {filteredProducts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px dashed var(--border-color)'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Товары не найдены</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Попробуйте изменить поисковый запрос или выбрать другую категорию.
          </p>
        </div>
      )}
    </div>
  );
}
