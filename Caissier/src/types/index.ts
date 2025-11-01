export interface Table {
  id: number;
  number: string;
  status: 'free' | 'occupied' | 'reserved';
  orderTime?: Date;
  seats: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image?: string;
  image_url?: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid';
  total: number;
  createdAt: Date;
  updatedAt: Date;
  phoneNumber?: string;
}

export interface Notification {
  id: string;
  type: 'new_order' | 'order_modified' | 'order_cancelled' | 'payment_received';
  message: string;
  orderId?: string;
  timestamp: Date;
  read: boolean;
}