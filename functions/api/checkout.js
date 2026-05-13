export async function onRequestPost(context) {
  try {
    const orderData = await context.request.json();
    
    await context.env.DB.prepare(
      "INSERT INTO orders (customer_name, phone, items, total) VALUES (?, ?, ?, ?)"
    ).bind(orderData.name, orderData.phone, orderData.items, orderData.total).run();

    const botToken = context.env.TELEGRAM_BOT_TOKEN;
    const chatId = context.env.TELEGRAM_CHAT_ID;
    
    const message = `
🚀 *New Order Received!*
👤 *Name:* ${orderData.name}
📞 *Phone:* ${orderData.phone}
🛍️ *Items:* ${orderData.items}
💰 *Total:* $${orderData.total}
    `;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
    });

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}