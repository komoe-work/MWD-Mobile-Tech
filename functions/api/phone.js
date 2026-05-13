export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM inventory").all();
    
    // Format the database rows to match exactly what the React frontend expects
    const formattedResults = results.map(row => ({
      id: row.id.toString(),
      name: row.model,       // Translates DB 'model' to UI 'name'
      brand: row.brand,
      price: row.price,
      image: row.image_url,  // Translates DB 'image_url' to UI 'image'
      specs: row.specs || '' // Sends specs
    }));

    return new Response(JSON.stringify(formattedResults), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}