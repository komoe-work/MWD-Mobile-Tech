export async function onRequestPost(context) {
  try {
    const saleData = await context.request.json();
    
    // 1. Save the Order to the Database
    await context.env.DB.prepare(
      "INSERT INTO orders (customer_name, phone, items, total, discount, payment_method) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      saleData.customerName || 'Walk-in',
      saleData.phone || 'N/A',
      JSON.stringify(saleData.items), // Save items as a JSON string
      saleData.finalTotal,
      saleData.discount,
      saleData.paymentMethod
    ).run();

    // 2. Automatically reduce stock for each item sold
    // We loop through the cart and subtract the quantity sold from the current stock
    for (const item of saleData.items) {
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