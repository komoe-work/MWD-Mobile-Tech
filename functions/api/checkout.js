export async function onRequestPost(context) {
  try {
    // 1. Receive FormData instead of JSON (because we are sending a file)
    const formData = await context.request.formData();
    const name = formData.get('name') || 'Walk-in';
    const phone = formData.get('phone') || 'N/A';
    const address = formData.get('address') || 'N/A';
    const items = formData.get('items') || '';
    const total = formData.get('total') || 0;
    const imageFile = formData.get('payment_screenshot');

    let publicUrl = 'No screenshot';

    // 2. Upload the screenshot to Cloudflare R2
    if (imageFile && imageFile.name) {
      const fileName = `receipt-${Date.now()}-${imageFile.name}`;
      await context.env.BUCKET.put(fileName, imageFile.stream(), {
        httpMetadata: { contentType: imageFile.type }
      });
      publicUrl = `https://pub-1bd14d351a7a42eeae69dcb69d806c00.r2.dev/${fileName}`;
    }

    // 3. Save Order to D1 Database
    await context.env.DB.prepare(
      "INSERT INTO orders (customer_name, phone, items, total, payment_proof) VALUES (?, ?, ?, ?, ?)"
    ).bind(name, phone, items, total, publicUrl).run();

    // 4. Send the Photo and Details to Telegram
    const botToken = context.env.TELEGRAM_BOT_TOKEN;
    const chatId = context.env.TELEGRAM_CHAT_ID;
    
    const caption = `🚨 *NEW ONLINE ORDER* 🚨\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Address:* ${address}\n\n🛍️ *Items Ordered:*\n${items}\n\n💰 *Total Paid:* ${total} Ks`;

    if (publicUrl !== 'No screenshot') {
      // If there is an image, use the sendPhoto API
      await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: publicUrl,
          caption: caption,
          parse_mode: 'Markdown'
        })
      });
    } else {
      // Fallback if no image was uploaded
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: caption + "\n\n⚠️ *NO PAYMENT SCREENSHOT PROVIDED*",
          parse_mode: 'Markdown'
        })
      });
    }

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}