import { computed, Service, signal } from '@angular/core';
import { CartItem, CartState } from '../../models/cart.types';

@Service()
export class CartService {
  readonly maxItemQuantity = 25;
  readonly items = signal<CartItem[]>([]);
  readonly cart = signal<CartState>({
    menuSlug: null,
    items: [],
  });
  readonly itemCount = computed(() =>
    this.cart().items.reduce((count, item) => count + item.quantity, 0),
  );
  readonly subTotal = computed(() =>
    this.cart().items.reduce((total, item) => total + item.totalPrice * item.quantity, 0),
  );

  private areSameCartItem(existingItem: CartItem, newItem: CartItem): boolean {
    const existingCustomizationIds = existingItem.customizations
      .map((customization) => customization.id)
      .sort();

    const newCustomizationIds = newItem.customizations
      .map((customizations) => customizations.id)
      .sort();

    return (
      existingItem.menuItemId === newItem.menuItemId &&
      existingItem.additionalInstructions.trim() === newItem.additionalInstructions.trim() &&
      JSON.stringify(existingCustomizationIds) === JSON.stringify(newCustomizationIds)
    );
  }

  addItem(item: CartItem): boolean {
    const currentCart = this.cart();

    if (currentCart.menuSlug && currentCart.menuSlug !== item.menuSlug) {
      return false;
    }
    const matchingItem = currentCart.items.find((existingItem) =>
      this.areSameCartItem(existingItem, item),
    );

    if (matchingItem) {
      this.cart.update((cart) => ({
        ...cart,
        items: cart.items.map((existingItem) =>
          existingItem.cartItemId === matchingItem.cartItemId
            ? {
                ...existingItem,
                quantity: Math.min(existingItem.quantity + item.quantity, this.maxItemQuantity),
              }
            : existingItem,
        ),
      }));

      return true;
    }

    this.cart.update((cart) => ({
      menuSlug: cart.menuSlug ?? item.menuSlug,
      items: [...cart.items, item],
    }));

    return true;
  }

  updateItem(cartItemId: string, updatedItem: CartItem): void {
    this.cart.update((cart) => ({
      ...cart,
      items: cart.items.map((item) => (item.cartItemId === cartItemId ? updatedItem : item)),
    }));
  }

  updateQuantity(cartItemId: string, quantity: number): void {
    const safeQuantity = Math.min(Math.max(quantity, 1), this.maxItemQuantity);

    this.cart.update((cart) => ({
      ...cart,
      items: cart.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: safeQuantity } : item,
      ),
    }));
  }

  modifyItem(cartItemId: string): void {
    console.log('modify', cartItemId);
  }

  removeItem(cartItemId: string): void {
    this.cart.update((cart) => {
      const items = cart.items.filter((item) => item.cartItemId !== cartItemId);

      return {
        menuSlug: items.length === 0 ? null : cart.menuSlug,
        items,
      };
    });
  }

  clearCart(): void {
    this.cart.set({
      menuSlug: null,
      items: [],
    });
  }
}
