import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cart, CartStatuses } from '../models/index';
import { randomUUID } from 'crypto';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class CartService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<Cart> {
    try {
      const query = 'SELECT * FROM carts WHERE user_id = $1';
      const result: QueryResult = await this.pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new InternalServerErrorException('Failed to find cart by user ID');
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    try {
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      const status = CartStatuses.OPEN;

      const query =
        'INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      const values = [id, userId, createdAt, createdAt, status];
      const result: QueryResult = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create cart by user ID',
      );
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    let cart = await this.findByUserId(userId);
    if (!cart) {
      cart = await this.createByUserId(userId);
    }
    return cart;
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(userId);

    try {
      const updatedAt = new Date().toISOString();
      if (items && items.length > 0) {
        const queryDelete = 'DELETE FROM cart_items WHERE cart_id = $1';
        await this.pool.query(queryDelete, [cart.id]);

        const queryItems =
          'INSERT INTO cart_items (product_id, count, cart_id) VALUES ($1, $2, $3)';
        const valuesItems = items.map((item) => [
          item.product_id,
          item.count,
          cart.id,
        ]);
        await Promise.all(
          valuesItems.map((values) => this.pool.query(queryItems, values)),
        );
      }

      const query =
        'UPDATE carts SET updated_at = $1 WHERE id = $2 RETURNING *';
      const values = [updatedAt, cart.id];
      const result: QueryResult = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update cart by user ID',
      );
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    try {
      const deleteCartItemsQuery =
        'DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)';
      await this.pool.query(deleteCartItemsQuery, [userId]);
      
      const deleteCartQuery = 'DELETE FROM carts WHERE user_id = $1';
      await this.pool.query(deleteCartQuery, [userId]);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to remove cart by user ID',
      );
    }
  }
}
