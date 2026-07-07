import React, { createContext, useContext, useState, useEffect } from 'react';

const FollowingContext = createContext(null);

export const useFollowing = () => useContext(FollowingContext);

export const FollowingProvider = ({ children }) => {
  const [followedIds, setFollowedIds] = useState([]);

  // Загрузка подписок при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('shopping_following');
    if (saved) {
      try {
        setFollowedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Ошибка при загрузке подписок:', e);
      }
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('shopping_following', JSON.stringify(followedIds));
  }, [followedIds]);

  const toggleFollow = (accountId) => {
    setFollowedIds((prevIds) => {
      const exists = prevIds.includes(accountId);
      if (exists) {
        return prevIds.filter((id) => id !== accountId);
      }
      return [...prevIds, accountId];
    });
  };

  const isFollowing = (accountId) => {
    return followedIds.includes(accountId);
  };

  const value = {
    followedIds,
    toggleFollow,
    isFollowing
  };

  return (
    <FollowingContext.Provider value={value}>
      {children}
    </FollowingContext.Provider>
  );
};
