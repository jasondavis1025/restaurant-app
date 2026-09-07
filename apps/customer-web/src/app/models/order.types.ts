export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: 'pickup';
  scheduledFor: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  additionalInstructions: string;
  modifiers: CreateOrderModifierRequest[];
}

export interface CreateOrderModifierRequest {
  customizationId: string;
}
export interface CreatedOrder {
  id: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scheduledFor: string;
  estimatedReadyAt: string;
  items: CreatedOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  guestAccessToken: string | null;
}

export interface CreatedOrderItem {
  orderItemId: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  additionalInstructions: string | null;
  modifiers: CreatedOrderModifier[];
}

export interface CreatedOrderModifier {
  id: string;
  ingredientName: string;
  modifierType: string;
  priceAdjustment: number;
}
