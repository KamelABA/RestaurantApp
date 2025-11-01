import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  Users, 
  Table, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  CreditCard,
  Bell,
  Clock,
  Phone
} from "lucide-react";
import { Table as TableType, Order, OrderItem, Notification } from '@/types';
import api from '@/services/api';

export function CashierInterface() {
  // State management
  const [tables, setTables] = useState<TableType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize tables
  useEffect(() => {
    fetchTables();
    fetchOrders();
    fetchNotifications();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Fallback to mock data
      const mockTables: TableType[] = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        number: i + 1,
        status: 'free' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setTables(mockTables);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const assignTable = async (tableId: number, phone?: string, name?: string) => {
    setLoading(true);
    try {
      const response = await api.put(`/tables/${tableId}/assign`, {
        customerPhone: phone,
        customerName: name,
      });
      
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { 
              ...table, 
              status: 'occupied', 
              customerPhone: phone,
              customerName: name,
              arrivalTime: new Date().toISOString()
            }
          : table
      ));
      
      alert(`Table ${tableId} assigned successfully`);
    } catch (error) {
      console.error('Error assigning table:', error);
      alert('Error assigning table');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (tableId: number, items: OrderItem[], customerPhone?: string, customerName?: string) => {
    setLoading(true);
    try {
      const response = await api.post('/orders', {
        tableId,
        items,
        customerPhone,
        customerName,
      });
      
      const newOrder = response.data.data;
      setOrders(prev => [...prev, newOrder]);
      
      // Update table with order
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, orderId: newOrder.id }
          : table
      ));

      alert(`Order created for table ${tableId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (orderId: number) => {
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}/confirm`);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'confirmed' }
          : order
      ));

      alert('Order confirmed');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Error confirming order');
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/orders/${orderId}`);
      
      setOrders(prev => prev.filter(order => order.id !== orderId));
      
      // Free up the table
      setTables(prev => prev.map(table => 
        table.orderId === orderId 
          ? { 
              ...table, 
              status: 'free', 
              orderId: undefined,
              customerPhone: undefined,
              customerName: undefined,
              arrivalTime: undefined
            }
          : table
      ));

      alert('Order cancelled');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (orderId: number, paymentMethod: string, amount: number) => {
    setLoading(true);
    try {
      const response = await api.post('/payments', {
        orderId,
        method: paymentMethod,
        amount,
      });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'paid' }
          : order
      ));

      // Free up the table
      setTables(prev => prev.map(table => 
        table.orderId === orderId 
          ? { 
              ...table, 
              status: 'free', 
              orderId: undefined,
              customerPhone: undefined,
              customerName: undefined,
              arrivalTime: undefined
            }
          : table
      ));

      alert(`Payment processed: ${amount} DA`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment');
    } finally {
      setLoading(false);
    }
  };

  const getTableStatusColor = (status: TableType['status']) => {
    switch (status) {
      case 'free': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
    }
  };

  const getTableStatusText = (status: TableType['status']) => {
    switch (status) {
      case 'free': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats and Notifications */}
      <div className="flex items-center justify-between">
        {/* Notification Bell */}
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.status === 'free').length}
            </div>
            <div className="text-xs text-muted-foreground">Tables libres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <div className="text-xs text-muted-foreground">Tables occupées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Commandes en attente</div>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Gestion des Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {tables.map((table) => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  table.status === 'occupied' ? 'ring-2 ring-red-200' : ''
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-3">
                    {/* Table Number */}
                    <div className="text-2xl font-bold text-primary">
                      {table.number}
                    </div>
                    
                    {/* Status Badge */}
                    <Badge 
                      variant="secondary" 
                      className={`${getTableStatusColor(table.status)} text-white text-xs`}
                    >
                      {getTableStatusText(table.status)}
                    </Badge>
                    
                    {/* Customer Info */}
                    {table.status === 'occupied' && (
                      <div className="space-y-2 text-xs">
                        {table.customerName && (
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {table.customerName}
                          </div>
                        )}
                        
                        {table.customerPhone && (
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {table.customerPhone}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    {table.status === 'free' && (
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          assignTable(table.id);
                        }}
                        disabled={loading}
                      >
                        Assigner
                      </Button>
                    )}
                    
                    {table.status === 'occupied' && table.orderId && (
                      <div className="text-xs text-muted-foreground">
                        Commande #{table.orderId}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Table Actions */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Table {selectedTable.number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="secondary" 
                className={`${getTableStatusColor(selectedTable.status)} text-white`}
              >
                {getTableStatusText(selectedTable.status)}
              </Badge>
              
              {selectedTable.customerName && (
                <span className="text-sm">
                  Client: {selectedTable.customerName}
                </span>
              )}
              
              {selectedTable.customerPhone && (
                <span className="text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedTable.customerPhone}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {selectedTable.status === 'free' && (
                <div className="space-y-4 w-full">
                  <div>
                    <label className="text-sm font-medium">Nom du client (optionnel)</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nom du client"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Téléphone (optionnel)</label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Numéro de téléphone"
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      assignTable(selectedTable.id, customerPhone || undefined, customerName || undefined);
                      setCustomerName('');
                      setCustomerPhone('');
                    }}
                    disabled={loading}
                  >
                    Assigner
                  </Button>
                </div>
              )}

              {selectedTable.status === 'occupied' && (
                <div className="flex gap-2">
                  <Button onClick={() => alert('Order dialog would open here')} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Commande
                  </Button>
                  
                  {selectedTable.orderId && (
                    <Button variant="outline" onClick={() => alert('Payment dialog would open here')} disabled={loading}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Paiement
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes Actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.filter(order => order.status !== 'paid').map(order => {
              const table = tables.find(t => t.id === order.tableId);
              return (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">
                      Commande #{order.id} - Table {order.tableId}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items?.length || 0} articles - {order.total} DA
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {order.status}
                    </Badge>
                    
                    {order.status === 'pending' && (
                      <Button size="sm" onClick={() => confirmOrder(order.id)} disabled={loading}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmer
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedTable(table || null);
                        alert('Order dialog would open here');
                      }}
                      disabled={loading}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => cancelOrder(order.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {orders.filter(order => order.status !== 'paid').length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Aucune commande active
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
