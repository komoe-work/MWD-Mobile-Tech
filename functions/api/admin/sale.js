export async function onRequestPost(context) {
  try {
    const saleData = await context.request.json();
    
    // Map the payload directly from POSSystem.tsx
    const customerName = saleData.customer?.name || 'Walk-in';
    const customerPhone = saleData.customer?.phone || 'N/A';
    const items = saleData.cart || []; // POSSystem sends 'cart'
    const total = saleData.total || 0; // POSSystem sends 'total'
    const discount = saleData.discount || 0;
    const paymentMethod = saleData.paymentMethod || 'Cash';

    // 1. Save the Order to the Database
    await context.env.DB.prepare(
      "INSERT INTO orders (customer_name, phone, items, total, discount, payment_method) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      customerName,
      customerPhone,
      JSON.stringify(items), 
      total,
      discount,
      paymentMethod
    ).run();

    // 2. Automatically reduce stock for each item sold
    for (const item of items) {
        await context.env.DB.prepare(
            "UPDATE inventory SET stock_quantity = stock_quantity - ? WHERE id = ?"
        ).bind(item.quantity, item.id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}