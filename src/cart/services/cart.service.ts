import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cart, CartStatuses } from '../models/index';
import { randomUUID } from 'crypto';
import { Pool, QueryResult } from 'pg';
import { CART_QUERIES } from './cart.query';

@Injectable()
export class CartService {
  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  async findByUserId(userId: string): Promise<Cart> {
    try {
      const result: QueryResult = await this.pool.query(CART_QUERIES.findByUserId, [userId]);
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

      const values = [id, userId, createdAt, createdAt, status];
      const result: QueryResult = await this.pool.query(CART_QUERIES.createCart, values);
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
    const updatedAt = new Date().toISOString();

    if (items && items.length > 0) {
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');
        await client.query(CART_QUERIES.deleteCartItems, [cart.id]);
        const valuesItems = items.map((item) => [
          item.product_id,
          item.count,
          cart.id,
        ]);
        await Promise.all(
          valuesItems.map((values) => client.query(CART_QUERIES.insertCartItem, values)),
        );
        const values = [updatedAt, cart.id];
        const result: QueryResult = await client.query(CART_QUERIES.updateCart, values);
        await client.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw new InternalServerErrorException(
          'Failed to update cart by user ID',
        );
      } finally {
        client.release();
      }
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.pool.query(CART_QUERIES.deleteCartItemsByUserId, [userId]);
      await this.pool.query(CART_QUERIES.deleteCartByUserId, [userId]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new InternalServerErrorException(
        'Failed to remove cart by user ID',
      );
    } finally {
      client.release();
    }
  }
}
