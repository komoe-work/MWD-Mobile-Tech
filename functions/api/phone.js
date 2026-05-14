export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM inventory").all();
    
    const formattedResults = results.map(row => ({
      id: row.id.toString(),
      name: row.model,
      brand: row.brand,
      price: row.price,
      image: row.image_url,
      specs: row.specs || '',
      stock_quantity: row.stock_quantity || 0,
      imei_list: row.imei_list || '',
      additional_info: row.additional_info || '' // <-- NEW
    }));

    return new Response(JSON.stringify(formattedResults), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, s-maxage=3600"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}