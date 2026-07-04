// Netlify Serverless Function: Получение списка товаров
// Путь: /api/products

const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Черный оверсайз свитшот',
    price: 4900,
    category: 'Одежда',
    description: 'Минималистичный черный свитшот оверсайз кроя. Изготовлен из 100% органического хлопка повышенной плотности.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 'prod-2',
    name: 'Кожаная мини-сумка Creamy',
    price: 8500,
    category: 'Аксессуары',
    description: 'Элегантная женская сумка из натуральной текстурной кожи молочного оттенка.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 86
  },
  {
    id: 'prod-3',
    name: 'Беспроводные наушники SoundFlow',
    price: 12900,
    category: 'Электроника',
    description: 'Наушники с активным шумоподавлением и невероятно чистым звуком. До 30 часов работы.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 312
  }
];

exports.handler = async function(event, context) {
  // Обработка CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    /* 
    Здесь вы можете подключить Firebase Admin SDK для реального получения из Firestore:
    
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    }
    const db = admin.firestore();
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    */

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(MOCK_PRODUCTS)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
