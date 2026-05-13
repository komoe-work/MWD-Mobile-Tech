export async function onRequestGet(context) {
  // context.env.DB is the binding you created in Step 1
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM inventory"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response("Database error", { status: 500 });
  }
}