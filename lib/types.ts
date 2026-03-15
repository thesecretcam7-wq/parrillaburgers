export type Category = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
  category?: Category;
};

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: "pending" | "paid" | "failed";
  wompi_transaction_id: string | null;
  notes: string | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Customer = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  points: number;
  total_orders: number;
  total_spent: number;
  created_at: string;
};

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
};
