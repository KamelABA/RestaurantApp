import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface OrderStatusUpdate {
  orderId: string;
  tableNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  timestamp: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  orderStatusUpdates: OrderStatusUpdate[];
  clearOrderStatusUpdates: () => void;
  sendOrder: (orderData: any) => void;
  joinTable: (tableNumber: string) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState<OrderStatusUpdate[]>([]);
  const [socketDisabled, setSocketDisabled] = useState(false);

  useEffect(() => {
    // Create socket connection with error handling
    let newSocket: Socket | null = null;
    
    try {
      newSocket = io('http://localhost:8000', {
        transports: ['websocket', 'polling'],
        timeout: 5000, // Reduced timeout
        autoConnect: false, // Don't auto-connect
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔌 Client connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Client disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('🔌 Socket.IO connection failed (this is normal if no Socket.IO server is running):', error.message);
        setIsConnected(false);
        setSocketDisabled(true); // Disable socket after connection error
        // Don't set socket to null, keep it for manual connection attempts
      });

      // Listen for order status updates
      newSocket.on('order-status-changed', (updateData: OrderStatusUpdate) => {
        console.log('📊 Order status update received:', updateData);
        setOrderStatusUpdates(prev => [updateData, ...prev]);
      });

      // Set socket
      setSocket(newSocket);

      // Try to connect, but don't fail if it doesn't work
      newSocket.connect();

    } catch (error) {
      console.warn('🔌 Socket.IO initialization failed:', error);
      setIsConnected(false);
      setSocketDisabled(true);
    }

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  // Clear order status updates
  const clearOrderStatusUpdates = useCallback(() => {
    setOrderStatusUpdates([]);
  }, []);

  // Send order (placeholder implementation)
  const sendOrder = useCallback((orderData: any) => {
    console.log('📤 Sending order:', orderData);
    if (socket && isConnected && !socketDisabled) {
      socket.emit('send-order', orderData);
    } else {
      console.log('📤 Order data (Socket.IO not available):', orderData);
      // In a real app, you might want to send this via HTTP API instead
    }
  }, [socket, isConnected, socketDisabled]);

  // Join table (placeholder implementation)
  const joinTable = useCallback((tableNumber: string) => {
    console.log('🪑 Joining table:', tableNumber);
    if (socket && isConnected && !socketDisabled) {
      socket.emit('join-table', { tableNumber });
    } else {
      console.log('🪑 Table join (Socket.IO not available):', tableNumber);
      // In a real app, you might want to send this via HTTP API instead
    }
  }, [socket, isConnected, socketDisabled]);

  return {
    socket,
    isConnected,
    orderStatusUpdates,
    clearOrderStatusUpdates,
    sendOrder,
    joinTable,
  };
};
