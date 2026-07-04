// Netlify Serverless Function: Оформление заказа
// Путь: /api/checkout

exports.handler = async function(event, context) {
  // Обработка CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Метод не разрешен' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { items, customer, total } = body;

    // Валидация входных данных
    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Корзина пуста' })
      };
    }

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Не все данные покупателя заполнены' })
      };
    }

    // Генерация случайного номера заказа
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    console.log(`[БЕКЕНД] Заказ успешно создан: ${orderId}`);
    console.log(`Покупатель: ${customer.name} (${customer.phone})`);
    console.log(`Сумма: ${total} ₽`);
    console.log(`Товаров: ${items.length} шт.`);

    /* 
    Здесь вы можете сохранить заказ в Firebase Firestore:
    
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
      });
    }
    const db = admin.firestore();
    await db.collection('orders').add({
      orderId,
      customer,
      items,
      total,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });
    */

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        message: 'Заказ успешно создан'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Ошибка сервера: ' + error.message })
    };
  }
};
