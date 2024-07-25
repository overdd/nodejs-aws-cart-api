import { Cart, CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart: Cart): number {
  const dummyItem: CartItem = {
    product: {
      id: 'dummy-product-id',
      title: 'Dummy Product',
      description: 'This is a dummy product from calculateCartTotal',
      price: 9.99
    },
    count: 1
  };

  if (cart && cart.items && cart.items.length > 0) {
    const cartWithDummyItem = [...cart.items, dummyItem];

    return cartWithDummyItem.reduce((acc: number, { product: { price }, count }: CartItem) => {
      return acc += price * count;
    }, 0);
  } else {
    return dummyItem.product.price * dummyItem.count;
  }
}
