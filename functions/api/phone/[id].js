export async function onRequestDelete(context) {
  try {
    const id = context.params.id; 
    await context.env.DB.prepare("DELETE FROM inventory WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }});
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPut(context) {
  try {
    const id = context.params.id;
    const formData = await context.request.formData();
    
    const brand = formData.get('brand');
    const model = formData.get('name');
    const price = formData.get('price');
    const specs = formData.get('specs') || '';
    const stock_quantity = formData.get('stock_quantity') || 0;
    const imei_list = formData.get('imei_list') || '';
    const additional_info = formData.get('additional_info') || ''; // <-- NEW
    const imageFile = formData.get('image');

    if (imageFile && imageFile.name) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      
      await context.env.BUCKET.put(fileName, imageFile.stream(), {
        httpMetadata: { contentType: imageFile.type }
      });
      
      const publicUrl = `https://pub-1bd14d351a7a42eeae69dcb69d806c00.r2.dev/${fileName}`;

      await context.env.DB.prepare(
        "UPDATE inventory SET brand = ?, model = ?, price = ?, specs = ?, stock_quantity = ?, imei_list = ?, additional_info = ?, image_url = ? WHERE id = ?"
      ).bind(brand, model, price, specs, stock_quantity, imei_list, additional_info, publicUrl, id).run();

    } else {
      await context.env.DB.prepare(
        "UPDATE inventory SET brand = ?, model = ?, price = ?, specs = ?, stock_quantity = ?, imei_list = ?, additional_info = ? WHERE id = ?"
      ).bind(brand, model, price, specs, stock_quantity, imei_list, additional_info, id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" }});
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}