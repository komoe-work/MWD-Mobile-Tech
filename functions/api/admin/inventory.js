export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const brand = formData.get('brand');
    const model = formData.get('name'); 
    const price = formData.get('price');
    const specs = formData.get('specs') || '';
    const stock_quantity = formData.get('stock_quantity') || 0;
    const imei_list = formData.get('imei_list') || '';
    const additional_info = formData.get('additional_info') || ''; // <-- NEW
    const imageFile = formData.get('image'); 

    if (!imageFile) throw new Error("No image file uploaded");
    if (!model || !brand || !price) throw new Error("Missing required fields");

    const fileName = `${Date.now()}-${imageFile.name}`;

    await context.env.BUCKET.put(fileName, imageFile.stream(), {
      httpMetadata: { contentType: imageFile.type }
    });

    const publicUrl = `https://pub-1bd14d351a7a42eeae69dcb69d806c00.r2.dev/${fileName}`;

    await context.env.DB.prepare(
      "INSERT INTO inventory (brand, model, price, specs, stock_quantity, imei_list, additional_info, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(brand, model, price, specs, stock_quantity, imei_list, additional_info, publicUrl).run();

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}