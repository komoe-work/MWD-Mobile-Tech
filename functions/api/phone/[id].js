export async function onRequestDelete(context) {
  try {
    const id = context.params.id; 
    
    await context.env.DB.prepare(
      "DELETE FROM inventory WHERE id = ?"
    ).bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}