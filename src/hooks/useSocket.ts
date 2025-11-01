import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface OrderData {
  id: string;
  tableNumber: string;
  items: any[];
  total: number;
  timestamp: string;
  orderId: string;
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
  sendOrder: (orderData: Omit<OrderData, 'timestamp' | 'orderId'>) => void;
  joinTable: (tableNumber: string) => void;
  leaveTable: (tableNumber: string) => void;
  orderStatusUpdates: OrderStatusUpdate[];
  clearOrderStatusUpdates: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const orderStatusUpdatesRef = useRef<OrderStatusUpdate[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    orderStatusUpdatesRef.current = orderStatusUpdates;
  }, [orderStatusUpdates]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      setIsConnected(false);
    });

    // Listen for new orders
    newSocket.on('order-notification', (orderData: OrderData) => {
      console.log('🆕 Client: New order notification received:', orderData);
      console.log('🆕 Client: Order details:', {
        id: orderData.id,
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
        itemsCount: orderData.items.length,
        total: orderData.total,
        timestamp: orderData.timestamp
      });
    });

    // Listen for order status updates
    newSocket.on('order-status-changed', (updateData: OrderStatusUpdate) => {
      console.log('📊 Client: Order status update received (order-status-changed):', updateData);
      console.log('📊 Client: Update details:', {
        orderId: updateData.orderId,
        tableNumber: updateData.tableNumber,
        status: updateData.status,
        timestamp: updateData.timestamp
      });
      console.log('📊 Client: Previous orderStatusUpdates length:', orderStatusUpdatesRef.current.length);
      setOrderStatusUpdates(prev => {
        const updated = [updateData, ...prev];
        console.log('📊 Client: Updated orderStatusUpdates length:', updated.length);
        console.log('📊 Client: Latest update in array:', updated[0]);
        return updated;
      });
    });

    // Listen for table-specific updates
    newSocket.on('table-status-update', (updateData: OrderStatusUpdate) => {
      console.log('📋 Client: Table status update received (table-status-update):', updateData);
      console.log('📋 Client: Update details:', {
        orderId: updateData.orderId,
        tableNumber: updateData.tableNumber,
        status: updateData.status,
        timestamp: updateData.timestamp
      });
      console.log('📋 Client: Previous orderStatusUpdates length:', orderStatusUpdatesRef.current.length);
      setOrderStatusUpdates(prev => {
        const updated = [updateData, ...prev];
        console.log('📋 Client: Updated orderStatusUpdates length:', updated.length);
        console.log('📋 Client: Latest update in array:', updated[0]);
        return updated;
      });
    });

    // Listen for table order updates
    newSocket.on('table-order-update', (updateData: any) => {
      console.log('📋 Table order update received (table-order-update):', updateData);
    });

    // Set socket
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []); // Remove orderStatusUpdates from dependency array

  // Send new order
  const sendOrder = useCallback((orderData: Omit<OrderData, 'timestamp' | 'orderId'>) => {
    if (socket && isConnected) {
      console.log('📤 Sending order:', orderData);
      socket.emit('new-order', orderData);
    } else {
      console.warn('⚠️ Socket not connected, cannot send order');
    }
  }, [socket, isConnected]);

  // Join table room
  const joinTable = useCallback((tableNumber: string) => {
    if (socket && isConnected) {
      console.log(`📋 Joining table ${tableNumber}`);
      socket.emit('join-table', tableNumber);
    }
  }, [socket, isConnected]);

  // Leave table room
  const leaveTable = useCallback((tableNumber: string) => {
    if (socket && isConnected) {
      console.log(`📋 Leaving table ${tableNumber}`);
      // Note: Socket.IO client doesn't have leave method, we'll handle this differently
    }
  }, [socket, isConnected]);

  // Clear order status updates
  const clearOrderStatusUpdates = useCallback(() => {
    setOrderStatusUpdates([]);
  }, []);

  return {
    socket,
    isConnected,
    sendOrder,
    joinTable,
    leaveTable,
    orderStatusUpdates,
    clearOrderStatusUpdates,
  };
};
