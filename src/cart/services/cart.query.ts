export const CART_QUERIES = {
  findByUserId: 'SELECT * FROM carts WHERE user_id = $1',
  createCart:
    'INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
  deleteCartItems: 'DELETE FROM cart_items WHERE cart_id = $1',
  insertCartItem:
    'INSERT INTO cart_items (product_id, count, cart_id) VALUES ($1, $2, $3)',
  updateCart: 'UPDATE carts SET updated_at = $1 WHERE id = $2 RETURNING *',
  deleteCartItemsByUserId:
    'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)',
  deleteCartByUserId: 'DELETE FROM carts WHERE user_id = $1',
};
