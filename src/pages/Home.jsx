import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Film, MessageCircle, Send, Bookmark, MoreHorizontal, Plus } from 'lucide-react';
import Stories from '../components/Stories';
import { useFollowing } from '../context/FollowingContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, getDocs, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';

// Демо-посты в стиле Instagram (только фото + социальные действия)
const SUGGESTED_PROFILES = [
  {
    id: 'chat-maria',
    name: 'maria_style',
    desc: 'Мария • Блогер',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'chat-seller-1',
    name: 'anna_sales',
    desc: 'Анна • Контент',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'chat-logistic',
    name: 'sergey_logistic',
    desc: 'Сергей • Путешествия',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'chat-sales',
    name: 'instagram_sales',
    desc: 'Контент для бизнеса',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60'
  }
];

// Дефолтные посты ленты
const DEFAULT_FEED = [
  {
    id: 'post-1',
    authorId: 'chat-support',
    authorName: 'instagram_official',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
    location: 'Москва, Россия',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    likesCount: 4281,
    liked: false,
    caption: 'Этот moment был просто волшебным 🌅 Делитесь своими лучшими кадрами с нами! #instagram #photography',
    comments: [
      { id: 'c1', author: 'maria_style', text: 'Невероятно красиво! 😍' },
      { id: 'c2', author: 'sergey_logistic', text: 'Где это снято? Хочу туда!' }
    ],
    saved: false
  },
  {
    id: 'post-2',
    authorId: 'chat-maria',
    authorName: 'maria_style',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    location: 'Санкт-Петербург',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
    likesCount: 2140,
    liked: false,
    caption: 'Новый look на каждый день ✨ Что думаете, подписчики? #fashion #style #ootd',
    comments: [
      { id: 'c3', author: 'anna_sales', text: 'Ты потрясающая! 💫' }
    ],
    saved: false
  },
  {
    id: 'post-3',
    authorId: 'chat-seller-1',
    authorName: 'anna_sales',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    location: 'Сочи, Россия',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    likesCount: 3876,
    liked: false,
    caption: 'Море, солнце и счастье 🌊☀️ Лучший отдых — тот, который с душой! #travel #beach #summer',
    comments: [
      { id: 'c4', author: 'instagram_official', text: 'Добавь геотег, чтобы больше людей увидело этот кадр! 📍' }
    ],
    saved: false
  },
  {
    id: 'post-4',
    authorId: 'chat-logistic',
    authorName: 'sergey_logistic',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    location: 'Горный Алтай',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop&q=80',
    likesCount: 5930,
    liked: false,
    caption: 'Покорил очередную вершину 🏔️ Природа — лучший учитель. Каждый подъём напоминает, что трудности делают нас сильнее 💪 #mountains #hiking #nature',
    comments: [
      { id: 'c5', author: 'maria_style', text: 'Серёга, ты герой! 🏆' },
      { id: 'c6', author: 'anna_sales', text: 'Это невероятно красиво 😮' }
    ],
    saved: false
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { isFollowing, toggleFollow } = useFollowing();
  const { currentUser } = useAuth();

  const currentUserId = currentUser ? currentUser.uid : 'guest_user';
  const currentUserName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'guest_user';

  const [posts, setPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const isDemo = !db;

  useEffect(() => {
    if (isDemo) {
      const saved = localStorage.getItem('ig_feed_posts');
      if (saved) {
        setPosts(JSON.parse(saved));
      } else {
        setPosts(DEFAULT_FEED);
        localStorage.setItem('ig_feed_posts', JSON.stringify(DEFAULT_FEED));
      }
      setLoading(false);
    } else {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, 
          async (snapshot) => {
            if (snapshot.empty) {
              console.log("[Firestore] База постов пуста. Производится автозаполнение...");
              // Создаем посты последовательно, чтобы избежать дублирования
              for (const post of DEFAULT_FEED) {
                await setDoc(doc(db, 'posts', post.id), {
                  ...post,
                  likedBy: [],
                  savedBy: [],
                  createdAt: new Date().toISOString()
                });
              }
            } else {
              const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setPosts(fetched);
            }
            setLoading(false);
          },
          (error) => {
            console.error("[Firestore] Ошибка при чтении постов:", error);
            const saved = localStorage.getItem('ig_feed_posts');
            setPosts(saved ? JSON.parse(saved) : DEFAULT_FEED);
            setLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (err) {
        console.error("Ошибка при подписке на посты:", err);
        setLoading(false);
      }
    }
  }, [isDemo]);

  const handleLike = async (post) => {
    const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
    const nextLikedBy = isLiked
      ? post.likedBy.filter(uid => uid !== currentUserId)
      : [...(post.likedBy || []), currentUserId];
    
    const nextLikesCount = isLiked
      ? Math.max(0, post.likesCount - 1)
      : post.likesCount + 1;

    if (isDemo) {
      const nextPosts = posts.map(p =>
        p.id === post.id
          ? { ...p, liked: !isLiked, likesCount: nextLikesCount, likedBy: nextLikedBy }
          : p
      );
      setPosts(nextPosts);
      localStorage.setItem('ig_feed_posts', JSON.stringify(nextPosts));
    } else {
      try {
        await updateDoc(doc(db, 'posts', post.id), {
          likedBy: nextLikedBy,
          likesCount: nextLikesCount
        });
      } catch (e) {
        console.error("Ошибка при сохранении лайка:", e);
      }
    }
  };

  const handleSave = async (post) => {
    const isSaved = post.savedBy && post.savedBy.includes(currentUserId);
    const nextSavedBy = isSaved
      ? post.savedBy.filter(uid => uid !== currentUserId)
      : [...(post.savedBy || []), currentUserId];

    if (isDemo) {
      const nextPosts = posts.map(p =>
        p.id === post.id
          ? { ...p, saved: !isSaved, savedBy: nextSavedBy }
          : p
      );
      setPosts(nextPosts);
      localStorage.setItem('ig_feed_posts', JSON.stringify(nextPosts));
    } else {
      try {
        await updateDoc(doc(db, 'posts', post.id), {
          savedBy: nextSavedBy
        });
      } catch (e) {
        console.error("Ошибка при сохранении закладки:", e);
      }
    }
  };

  const handleComment = async (postId, e) => {
    e.preventDefault();
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
      id: 'c_' + Date.now(),
      author: currentUserName,
      text: text,
      createdAt: new Date().toISOString()
    };
    const nextComments = [...(post.comments || []), newComment];

    if (isDemo) {
      const nextPosts = posts.map(p =>
        p.id === postId
          ? { ...p, comments: nextComments }
          : p
      );
      setPosts(nextPosts);
      localStorage.setItem('ig_feed_posts', JSON.stringify(nextPosts));
    } else {
      try {
        await updateDoc(doc(db, 'posts', postId), {
          comments: nextComments
        });
      } catch (err) {
        console.error("Ошибка при добавлении комментария:", err);
      }
    }
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const isPostLiked = (post) => {
    if (post.likedBy) return post.likedBy.includes(currentUserId);
    return post.liked;
  };

  const isPostSaved = (post) => {
    if (post.savedBy) return post.savedBy.includes(currentUserId);
    return post.saved;
  };

  return (
    <div style={{ paddingBottom: '40px' }}>

      {/* Истории */}
      <div className="container" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Stories />
      </div>

      {/* Основной контент — Лента + Боковая панель */}
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '40px',
        alignItems: 'start',
        paddingTop: '30px'
      }}>

        {/* Лента постов */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
              Загрузка ленты...
            </div>
          ) : (
            posts.map(post => {
              const liked = isPostLiked(post);
              const saved = isPostSaved(post);
              return (
                <div key={post.id} style={{
                  borderRadius: 'var(--border-radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)'
                }}>
                  {/* Шапка поста */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        onClick={() => navigate(`/profile/${post.authorId}`)}
                        style={{
                          width: '38px', height: '38px', borderRadius: '50%',
                          overflow: 'hidden', cursor: 'pointer',
                          border: '2px solid transparent',
                          background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7) border-box'
                        }}
                      >
                        <img src={post.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <strong
                          onClick={() => navigate(`/profile/${post.authorId}`)}
                          style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'block' }}
                        >
                          {post.authorName}
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{post.location}</span>
                      </div>
                    </div>
                    <button style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Фото поста */}
                  <div style={{ width: '100%', aspectRatio: '1', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={post.image} alt=""
                      onDoubleClick={() => handleLike(post)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Панель действий */}
                  <div style={{ padding: '12px 16px 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <button
                          onClick={() => handleLike(post)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: liked ? 'var(--accent-pink)' : 'var(--text-primary)',
                            padding: 0, transition: 'transform 0.1s'
                          }}
                          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.82)'}
                          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <Heart size={24} fill={liked ? 'var(--accent-pink)' : 'none'} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}>
                          <MessageCircle size={24} />
                        </button>
                        <button
                          onClick={() => navigate('/messages')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 0 }}
                        >
                          <Send size={22} style={{ transform: 'rotate(-45deg)', marginBottom: '-2px' }} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleSave(post)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-primary)', padding: 0
                        }}
                      >
                        <Bookmark size={24} fill={saved ? 'var(--text-primary)' : 'none'} />
                      </button>
                    </div>

                    {/* Лайки */}
                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                      {post.likesCount.toLocaleString()} отметок «Нравится»
                    </div>

                    {/* Caption */}
                    <div style={{ fontSize: '14px', marginBottom: '6px', lineHeight: '1.5' }}>
                      <strong
                        onClick={() => navigate(`/profile/${post.authorId}`)}
                        style={{ marginRight: '6px', cursor: 'pointer' }}
                      >{post.authorName}</strong>
                      <span style={{ color: 'var(--text-secondary)' }}>{post.caption}</span>
                    </div>

                    {/* Комментарии */}
                    {post.comments && post.comments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '8px' }}>
                        {post.comments.map(c => (
                          <div key={c.id} style={{ fontSize: '13px' }}>
                            <strong style={{ marginRight: '5px' }}>{c.author}</strong>
                            <span style={{ color: 'var(--text-secondary)' }}>{c.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Форма комментария */}
                    <form
                      onSubmit={(e) => handleComment(post.id, e)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Добавьте комментарий..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        style={{
                          flexGrow: 1, border: 'none', outline: 'none',
                          fontSize: '13px', backgroundColor: 'transparent',
                          color: 'var(--text-primary)'
                        }}
                      />
                      {(commentInputs[post.id] || '').trim() && (
                        <button type="submit" style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#0095f6', fontWeight: 700, fontSize: '13px'
                        }}>
                          Опубликовать
                        </button>
                      )}
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Боковая панель — Профиль + Рекомендации */}
        <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Мой профиль */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              onClick={() => navigate('/profile')}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                overflow: 'hidden', cursor: 'pointer',
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7) border-box',
                flexShrink: 0
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flexGrow: 1 }}>
              <strong
                onClick={() => navigate('/profile')}
                style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'block' }}
              >
                {currentUserName}
              </strong>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Мой профиль</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              style={{ color: '#0095f6', fontWeight: 700, fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Войти
            </button>
          </div>

          {/* Рекомендации */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Рекомендуем
              </span>
              <button
                onClick={() => navigate('/explore')}
                style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Смотреть все
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {SUGGESTED_PROFILES.map(profile => {
                const following = isFollowing(profile.id);
                return (
                  <div key={profile.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      onClick={() => navigate(`/profile/${profile.id}`)}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <strong
                        onClick={() => navigate(`/profile/${profile.id}`)}
                        style={{ fontSize: '13px', fontWeight: 700, display: 'block', cursor: 'pointer' }}
                      >
                        {profile.name}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{profile.desc}</span>
                    </div>
                    <button
                      onClick={() => toggleFollow(profile.id)}
                      style={{
                        fontSize: '12px', fontWeight: 700, background: 'none', border: 'none',
                        cursor: 'pointer',
                        color: following ? 'var(--text-secondary)' : '#0095f6'
                      }}
                    >
                      {following ? 'Подписки' : 'Подписаться'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ссылки-подвал */}
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: '8px' }}>
              {['О нас', 'Помощь', 'Конфиденциальность', 'Условия', 'Реклама'].map(link => (
                <span key={link} style={{ cursor: 'pointer' }}>{link}</span>
              ))}
            </div>
            <div>© {new Date().getFullYear()} Instagram</div>
          </div>
        </div>

      </div>
    </div>
  );
}
