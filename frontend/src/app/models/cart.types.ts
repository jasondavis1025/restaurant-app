import { MenuItemCustomization } from './menu.types';

export type CartMenuSlug = 'morning' | 'late-night';

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  menuSlug: CartMenuSlug;
  name: string;
  quantity: number;
  basePrice: number;
  customizations: MenuItemCustomization[];
  additionalInstructions: string;
  totalPrice: number;
}

export interface CartState {
  menuSlug: CartMenuSlug | null;
  items: CartItem[];
}
