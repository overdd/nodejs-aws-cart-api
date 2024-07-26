import { Injectable } from '@nestjs/common';
import { Cart, CartStatuses } from '../models/index';
import { randomUUID } from 'crypto';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class CartService {
  private pool: Pool;

  constructor() {
    const host = process.env.RDS_HOSTNAME;
    const port = parseInt(process.env.RDS_PORT, 10);
    const database = process.env.RDS_DB_NAME;
    const user = process.env.RDS_USERNAME;
    const password = process.env.RDS_PASSWORD;

    this.pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async findByUserId(userId: string): Promise<Cart> {
    const query = 'SELECT * FROM carts WHERE user_id = $1';
    const result: QueryResult = await this.pool.query(query, [userId]);
    return result.rows[0];
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = randomUUID();
    userId ? userId : (userId = randomUUID());
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const status = CartStatuses.OPEN;

    const query =
      'INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [id, userId, createdAt, updatedAt, status];
    const result: QueryResult = await this.pool.query(query, values);
    return result.rows[0];
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      return cart;
    }
    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);

    const updatedAt = new Date().toISOString();
    if (items) {
      const queryDelete = 'DELETE FROM cart_items WHERE cart_id = $1';
      await this.pool.query(queryDelete, [cart.id]);

      items.map(async (item) => {
        const queryItems =
          'INSERT INTO cart_items (product_id, count, cart_id) VALUES ($1, $2, $3) RETURNING *';
        const valuesItems = [item.product_id, item.count, cart.id];
        const resultItems: QueryResult = await this.pool.query(queryItems, valuesItems);
      });

      const query =
        'UPDATE carts SET updated_at = $1 WHERE id = $2 RETURNING *';
      const values = [updatedAt, cart.id];
      const result: QueryResult = await this.pool.query(query, values);

      return result.rows[0];
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    const deleteCartItemsQuery = 'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)';
    await this.pool.query(deleteCartItemsQuery, [userId]);
  
    const deleteCartQuery = 'DELETE FROM carts WHERE user_id = $1';
    await this.pool.query(deleteCartQuery, [userId]);
  }
}
