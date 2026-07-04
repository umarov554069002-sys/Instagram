import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext(null);

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favoriteItems, setFavoriteItems] = useState([]);

  // Загрузка избранного при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('shopping_favorites');
    if (saved) {
      try {
        setFavoriteItems(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка при загрузке избранного:', e);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('shopping_favorites', JSON.stringify(favoriteItems));
  }, [favoriteItems]);

  const toggleFavorite = (product) => {
    setFavoriteItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) {
        return prevItems.filter((item) => item.id !== product.id);
      }
      return [...prevItems, product];
    });
  };

  const isFavorite = (productId) => {
    return favoriteItems.some((item) => item.id === productId);
  };

  const getFavoritesCount = () => {
    return favoriteItems.length;
  };

  const value = {
    favoriteItems,
    toggleFavorite,
    isFavorite,
    getFavoritesCount
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
