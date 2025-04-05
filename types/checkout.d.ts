export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface CheckoutInput {
  email: string;
  name: string;
  phone?: string;
  shipping_address: ShippingAddress;
}

export interface CheckoutResponse {
  url: string;
  session_id: string;
  order_id: string;
}