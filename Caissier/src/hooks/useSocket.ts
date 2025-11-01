import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface OrderData {
  id: string;
  orderId: string; // Add this field to match server data
  tableNumber: string;
  items: any[];
  total: number;
  timestamp: string;
}

interface OrderStatusUpdate {
  orderId: string;
  tableNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  timestamp: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: OrderData[];
  orderUpdates: OrderStatusUpdate[];
  clearNotifications: () => void;
  clearOrderUpdates: () => void;
  updateOrderStatus: (updateData: Omit<OrderStatusUpdate, 'timestamp'>) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<OrderData[]>([]);
  const [orderUpdates, setOrderUpdates] = useState<OrderStatusUpdate[]>([]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Cashier connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Cashier disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setIsConnected(false);
    });

    // Listen for new orders
    newSocket.on('order-notification', (orderData: OrderData) => {
      console.log('🆕 New order notification received:', orderData);
      setNotifications(prev => [orderData, ...prev]);
      
      // Play notification sound
      playNotificationSound();
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('Nouvelle commande!', {
          body: `Table ${orderData.tableNumber} - ${orderData.items.length} article(s)`,
          icon: '/favicon.ico',
          tag: orderData.orderId,
        });
      }
    });

    // Listen for order status updates
    newSocket.on('order-status-changed', (updateData: OrderStatusUpdate) => {
      console.log('📊 Order status update received:', updateData);
      setOrderUpdates(prev => [updateData, ...prev]);
    });

    // Set socket
    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Could not play notification sound:', err));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Clear order updates
  const clearOrderUpdates = useCallback(() => {
    setOrderUpdates([]);
  }, []);

  // Update order status
  const updateOrderStatus = useCallback((updateData: Omit<OrderStatusUpdate, 'timestamp'>) => {
    console.log('🔘 updateOrderStatus called with:', updateData);
    console.log('🔘 Socket status:', { socket: !!socket, isConnected });
    
    if (socket && isConnected) {
      const fullUpdateData = {
        ...updateData,
        timestamp: new Date().toISOString()
      };
      console.log('📤 Sending order status update via Socket.IO:', fullUpdateData);
      socket.emit('order-status-update', fullUpdateData);
      console.log('✅ Order status update sent successfully');
    } else {
      console.warn('⚠️ Socket not connected, cannot update order status');
      console.log('❌ Socket details:', { socket: !!socket, isConnected });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    notifications,
    orderUpdates,
    clearNotifications,
    clearOrderUpdates,
    updateOrderStatus,
  };
};
