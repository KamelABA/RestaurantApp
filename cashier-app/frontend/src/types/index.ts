export interface Table {
  id: number;
  number: number;
  status: 'free' | 'occupied' | 'reserved';
  customerPhone?: string;
  customerName?: string;
  orderId?: number;
  arrivalTime?: string;
  estimatedDeparture?: string;
  created_at: string;
  updated_at: string;
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  is_available: boolean;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  dishId: number;
  dishName: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid';
  createdAt: string;
  customerPhone?: string;
  customerName?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  type: 'new_order' | 'order_modified' | 'order_cancelled' | 'payment_received';
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: number;
  tableId?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  change: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
