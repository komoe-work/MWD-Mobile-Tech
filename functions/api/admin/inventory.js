export async function onRequestPost(context) {
  try {
    // 1. Receive the form data from your Admin Dashboard
    const formData = await context.request.formData();
    const brand = formData.get('brand');
    const model = formData.get('model');
    const price = formData.get('price');
    const imageFile = formData.get('image'); // This is the actual file

    if (!imageFile) throw new Error("No image file uploaded");

    // 2. Generate a unique filename (e.g., 168439203-redmi.jpg)
    const fileName = `${Date.now()}-${imageFile.name}`;

    // 3. Upload the file to Cloudflare R2
    // context.env.BUCKET is the connection to your R2 storage
    await context.env.BUCKET.put(fileName, imageFile.stream(), {
      httpMetadata: { contentType: imageFile.type }
    });

    // 4. Construct the Public URL using your specific R2 domain
    const publicUrl = `https://pub-1bd14d351a7a42eeae69dcb69d806c00.r2.dev/${fileName}`;

    // 5. Save the phone details and the new image URL to D1 Database
    await context.env.DB.prepare(
      "INSERT INTO inventory (brand, model, price, image_url) VALUES (?, ?, ?, ?)"
    ).bind(brand, model, price, publicUrl).run();

    return new Response(JSON.stringify({ success: true, url: publicUrl }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}