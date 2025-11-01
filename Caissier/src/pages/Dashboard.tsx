import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TableGrid } from "@/components/dashboard/TableGrid";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { OrdersSummary } from "@/components/dashboard/OrdersSummary";
import { TableManagementModal } from "@/components/modals/TableManagementModal";
import { TableSelectionModal } from "@/components/modals/TableSelectionModal";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import OrderNotifications from "@/components/OrderNotifications";
import { useSocket } from "@/hooks/useSocket";
import { Table, Order, Notification } from "@/types";
import { toast } from "@/hooks/use-toast";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

export const Dashboard = ({ currentUser, onLogout }: DashboardProps) => {
  const navigate = useNavigate();
  const { notifications: socketNotifications, orderUpdates, clearNotifications, clearOrderUpdates, updateOrderStatus } = useSocket();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTableSelectionModalOpen, setIsTableSelectionModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Ensure we're in cashier mode
  useEffect(() => {
    localStorage.setItem('cashierApp', 'true');
    localStorage.setItem('userRole', 'cashier');
    // Clear any admin-related items
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
  }, []);

  // Mock data - tables
  const [tables] = useState<Table[]>([
    { id: 1, number: "1", status: "free", seats: 4 },
    { id: 2, number: "2", status: "occupied", seats: 2 },
    { id: 3, number: "3", status: "free", seats: 6 },
    { id: 4, number: "4", status: "occupied", seats: 4 },
    { id: 5, number: "5", status: "reserved", seats: 8 },
    { id: 6, number: "6", status: "free", seats: 2 },
    { id: 7, number: "7", status: "free", seats: 4 },
    { id: 8, number: "8", status: "occupied", seats: 6 },
    { id: 9, number: "9", status: "occupied", seats: 4 },
  ]);

  // Mock data - orders with realistic workflow statuses
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      tableId: 2,
      items: [],
      status: "confirmed",
      total: 45.50,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      updatedAt: new Date()
    },
    {
      id: "2",
      tableId: 4,
      items: [],
      status: "ready",
      total: 78.90,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
      updatedAt: new Date()
    },
    {
      id: "3",
      tableId: 8,
      items: [],
      status: "pending",
      total: 32.75,
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      updatedAt: new Date()
    },
    {
      id: "4",
      tableId: 9,
      items: [],
      status: "served",
      total: 56.20,
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      updatedAt: new Date()
    }
  ]);

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "new_order",
      message: "Nouvelle commande pour la table 8",
      orderId: "3",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: "2",
      type: "new_order",
      message: "Commande prête pour la table 4",
      orderId: "2",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    }
  ]);

  // Handle new orders from Socket.IO
  useEffect(() => {
    if (socketNotifications.length > 0) {
      // Get the latest notification
      const latestNotification = socketNotifications[0];
      
      // Create a new order from the notification
      const newOrder: Order = {
        id: latestNotification.orderId,
        tableId: parseInt(latestNotification.tableNumber),
        items: latestNotification.items,
        status: 'pending',
        total: latestNotification.total,
        createdAt: new Date(latestNotification.timestamp),
        updatedAt: new Date(latestNotification.timestamp)
      };

      // Add the new order to the orders list
      setOrders(prev => {
        // Check if order already exists
        const exists = prev.find(order => order.id === newOrder.id);
        if (exists) return prev;
        return [newOrder, ...prev];
      });

      // Add a local notification
      const localNotification: Notification = {
        id: `socket-${latestNotification.orderId}`,
        type: 'new_order',
        message: `Nouvelle commande pour la table ${latestNotification.tableNumber}`,
        orderId: latestNotification.orderId,
        timestamp: new Date(latestNotification.timestamp),
        read: false
      };

      setNotifications(prev => {
        const exists = prev.find(n => n.id === localNotification.id);
        if (exists) return prev;
        return [localNotification, ...prev];
      });
    }
  }, [socketNotifications]);

  // Handle order status updates from Socket.IO
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[0];
      
      setOrders(prev => prev.map(order => {
        if (order.id === latestUpdate.orderId) {
          return {
            ...order,
            status: latestUpdate.status as any,
            updatedAt: new Date(latestUpdate.timestamp)
          };
        }
        return order;
      }));
    }
  }, [orderUpdates]);

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setIsTableModalOpen(true);
  };

  const handleConfirmOrder = async (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'confirmed' as const, updatedAt: new Date() }
        : order
    ));
    
    // Remove notification when order is confirmed
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
    
    // Send status update via Socket.IO
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrderStatus({
        orderId: orderId, // Use the orderId from the function parameter
        tableNumber: order.tableId.toString(), // Convert tableId to string
        status: 'confirmed'
      });
    }
  };

  const handleMarkReady = async (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'served' as const, updatedAt: new Date() }
        : order
    ));
    
    // Add new notification for ready order
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        type: "new_order",
        message: `Commande servie pour la table ${order.tableId} - En attente de paiement`,
        orderId,
        timestamp: new Date(),
        read: false
      }]);
      
      // Send status update via Socket.IO
      updateOrderStatus({
        orderId: orderId, // Use the orderId from the function parameter
        tableNumber: order.tableId.toString(), // Convert tableId to string
        status: 'served'
      });
    }
  };

  const handleProcessPayment = async (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'paid' as const, updatedAt: new Date() }
        : order
    ));
    
    // Remove all notifications for this order
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
    
    // Send status update via Socket.IO
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrderStatus({
        orderId: orderId, // Use the orderId from the function parameter
        tableNumber: order.tableId.toString(), // Convert tableId to string
        status: 'paid'
      });
    }
    
    setIsTableModalOpen(false);
  };

  const handleDeleteOrder = async (orderId: string) => {
    // Remove the order
    setOrders(prev => prev.filter(order => order.id !== orderId));
    
    // Remove all notifications for this order
    setNotifications(prev => prev.filter(n => n.orderId !== orderId));
    
    // Send cancelled status update via Socket.IO
    const order = orders.find(o => o.id === orderId);
    if (order) {
      updateOrderStatus({
        orderId: orderId, // Use the orderId from the function parameter
        tableNumber: order.tableId.toString(), // Convert tableId to string
        status: 'cancelled'
      });
    }
    
    // Close the modal
    setIsTableModalOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.orderId) {
      const order = orders.find(o => o.id === notification.orderId);
      const table = tables.find(t => t.id === order?.tableId);
      if (table) {
        setSelectedTable(table);
        setIsTableModalOpen(true);
        setIsNotificationPanelOpen(false);
      }
    }
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const getSelectedTableOrder = () => {
    if (!selectedTable) return null;
    return orders.find(order => order.tableId === selectedTable.id && order.status !== 'paid') || null;
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNewOrder = () => {
    setIsTableSelectionModalOpen(true);
  };

  const handleTableSelectForNewOrder = (table: Table) => {
    setSelectedTable(table);
    setIsTableSelectionModalOpen(true);
  };

  const handleTakeawaySelect = () => {
    setSelectedTable(null);
    setIsTableSelectionModalOpen(true);
  };

  const handleViewBills = () => {
    // Navigate to bills page or open bills modal
  };

  const handleManageMenu = () => {
    // Navigate to menu management page using React Router
    navigate('/menu-management');
  };

  const handleViewReceipts = () => {
    // TODO: Ouvrir la liste des factures
  };

  return (
    <>
      <DashboardLayout 
        currentUser={currentUser} 
        onLogout={onLogout}
        notificationCount={unreadNotifications}
        isNotificationPanelOpen={isNotificationPanelOpen}
        setIsNotificationPanelOpen={setIsNotificationPanelOpen}
      >
        <div className="space-y-6">
          {/* Résumé des commandes */}
          <OrdersSummary orders={orders} />

          {/* Actions rapides */}
          <QuickActions
            onNewOrder={handleNewOrder}
            onManageMenu={handleManageMenu}
            onViewReceipts={handleViewReceipts}
          />

          {/* Grille des tables */}
          <div className="bg-card rounded-lg border border-border/50 p-6">
            <h2 className="text-xl font-semibold mb-6">Tables du restaurant</h2>
            <TableGrid 
              tables={tables} 
              orders={orders}
              onTableSelect={handleTableSelect} 
            />
          </div>
        </div>
      </DashboardLayout>

      {/* Modal de sélection de table pour nouvelle commande */}
      <TableSelectionModal
        isOpen={isTableSelectionModalOpen}
        onClose={() => setIsTableSelectionModalOpen(false)}
        tables={tables}
        orders={orders}
        onTableSelect={handleTableSelectForNewOrder}
        onTakeawaySelect={handleTakeawaySelect}
      />

      {/* Modal de gestion des tables */}
      <TableManagementModal
        table={selectedTable}
        order={getSelectedTableOrder()}
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onConfirmOrder={handleConfirmOrder}
        onMarkReady={handleMarkReady}
        onProcessPayment={handleProcessPayment}
        onDeleteOrder={handleDeleteOrder}
      />

      {/* Panel de notifications */}
      <NotificationPanel
        notifications={notifications}
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkNotificationAsRead}
      />

      {/* Socket.IO Order Notifications */}
      <OrderNotifications />
    </>
  );
};

export default Dashboard;