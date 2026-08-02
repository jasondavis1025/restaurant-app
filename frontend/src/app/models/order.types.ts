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
  subtotal: number;
  tax: number;
  total: number;
}
