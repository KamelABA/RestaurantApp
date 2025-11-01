import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Clock, 
  CreditCard, 
  AlertTriangle,
  Phone,
  Users,
  FileText,
  Printer,
  Globe,
  CheckCircle,
  XCircle,
  Timer,
  Euro,
  RefreshCw
} from "lucide-react";
import { printInvoice, createMockInvoiceData, type Language } from '../utils/invoicePrinter';
import { useAuth } from '../contexts/AuthContext';


interface QuickOrder {
  id: string;
  tableNumber: number;
  customerName?: string;
  items: string[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  orderTime: string;
  waitTime: number; // in minutes
}

interface PendingPayment {
  id: string;
  tableNumber: number;
  customerName?: string;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'mixed';
  items: number;
  discount?: number;
}

interface ActiveTable {
  id: string;
  number: number;
  customerName?: string;
  guestCount: number;
  orderTime: string;
  total: number;
  status: 'occupied' | 'waiting_payment';
}

const mockActiveOrders: QuickOrder[] = [
  {
    id: "1",
    tableNumber: 3,
    customerName: "Ahmed Benali",
    items: ["Couscous Royal", "Thé à la menthe", "Baklawa"],
    total: 2450,
    status: "preparing",
    orderTime: "14:30",
    waitTime: 25
  },
  {
    id: "2",
    tableNumber: 7,
    customerName: "Fatima Kadi",
    items: ["Tajine Agneau", "Salade Mechouia"],
    total: 1800,
    status: "ready",
    orderTime: "14:45",
    waitTime: 10
  },
  {
    id: "3",
    tableNumber: 1,
    items: ["Pizza Margherita", "Coca Cola"],
    total: 1200,
    status: "pending",
    orderTime: "15:00",
    waitTime: 5
  }
];

const mockPendingPayments: PendingPayment[] = [
  {
    id: "1",
    tableNumber: 4,
    customerName: "Omar Mansouri",
    total: 3200,
    items: 8,
    discount: 10
  },
  {
    id: "2",
    tableNumber: 8,
    customerName: "Sarah Johnson",
    total: 2750,
    items: 5
  }
];

const mockActiveTables: ActiveTable[] = [
  {
    id: "1",
    number: 1,
    customerName: "Ahmed Benali",
    guestCount: 3,
    orderTime: "14:30",
    total: 2450,
    status: "occupied"
  },
  {
    id: "2", 
    number: 4,
    customerName: "Omar Mansouri",
    guestCount: 4,
    orderTime: "13:45",
    total: 3200,
    status: "waiting_payment"
  },
  {
    id: "3",
    number: 7,
    customerName: "Fatima Kadi",
    guestCount: 2,
    orderTime: "15:15",
    total: 1800,
    status: "occupied"
  }
];

export function QuickDashboard() {
  const { cashier } = useAuth();
  const [activeOrders, setActiveOrders] = useState<QuickOrder[]>(mockActiveOrders);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(mockPendingPayments);
  const [activeTables, setActiveTables] = useState<ActiveTable[]>(mockActiveTables);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('fr');
  const [showEmergency, setShowEmergency] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'preparing': return 'bg-blue-500 text-white';
      case 'ready': return 'bg-green-500 text-white';
      case 'served': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prêt';
      case 'served': return 'Servi';
      default: return status;
    }
  };

  const handlePrintInvoice = async (payment: PendingPayment) => {
    try {
      // Create simple invoice data
      const invoiceData = createMockInvoiceData(payment.tableNumber, payment.customerName);
      
      // Override with actual payment data
      invoiceData.total = payment.total;
      invoiceData.discount = payment.discount;
      invoiceData.subtotal = payment.total + (payment.discount || 0);
      invoiceData.cashierName = cashier?.name;
      
      // Simple QR data with basic info only
      const qrContent = JSON.stringify({
        table: payment.tableNumber,
        total: payment.total,
        items: invoiceData.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.unitPrice
        })),
        date: new Date().toISOString()
      });

      invoiceData.qrData = {
        invoiceData: qrContent
      };
      
      // Print the invoice with simple QR code
      await printInvoice(invoiceData, selectedLanguage);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  const handleEmergencyCall = () => {
    setShowEmergency(true);
    // In real app, could send notification to manager
    alert('Appel d\'urgence envoyé au manager!');
    setTimeout(() => setShowEmergency(false), 3000);
  };

  const confirmPayment = (paymentId: string) => {
    setPendingPayments(prev => prev.filter(p => p.id !== paymentId));
    // In real app, would update backend
    alert('Paiement confirmé!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Emergency Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tableau de Bord Rapide</h2>
        
        <div className="flex items-center gap-4">
          {/* Language Selector for Receipts */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>


          
          {/* Emergency Button */}
          <Button
            variant={showEmergency ? "default" : "destructive"}
            size="sm"
            onClick={handleEmergencyCall}
            className={`flex items-center gap-2 ${showEmergency ? 'animate-pulse' : ''}`}
          >
            <Phone className="h-4 w-4" />
            {showEmergency ? 'Manager Contacté!' : 'Appeler Manager'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tables Actives</p>
                <p className="text-2xl font-bold text-blue-600">{activeTables.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commandes en Cours</p>
                <p className="text-2xl font-bold text-orange-600">{activeOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paiements en Attente</p>
                <p className="text-2xl font-bold text-green-600">{pendingPayments.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Tables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tables Actives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTables.map((table) => (
              <div key={table.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Table {table.number}</span>
                  <Badge variant={table.status === 'waiting_payment' ? 'default' : 'secondary'}>
                    {table.status === 'waiting_payment' ? 'Attente Paiement' : 'Occupée'}
                  </Badge>
                </div>
                
                {table.customerName && (
                  <p className="text-sm text-muted-foreground">{table.customerName}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span>{table.guestCount} personnes</span>
                  <span className="font-semibold">{table.total} DA</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  Depuis {table.orderTime}
                </div>
              </div>
            ))}
            
            {activeTables.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucune table active</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Commandes en Cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOrders.map((order) => (
              <div key={order.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Table {order.tableNumber}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                
                {order.customerName && (
                  <p className="text-sm text-muted-foreground mb-1">{order.customerName}</p>
                )}
                
                <div className="text-xs text-muted-foreground mb-2">
                  {order.items.slice(0, 2).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} autres`}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    <span className={order.waitTime > 30 ? 'text-red-500' : 'text-muted-foreground'}>
                      {order.waitTime}min
                    </span>
                  </div>
                  <span className="font-semibold">{order.total} DA</span>
                </div>
              </div>
            ))}
            
            {activeOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucune commande en cours</p>
            )}
          </CardContent>
        </Card>

        {/* Payments to Confirm */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paiements à Confirmer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Table {payment.tableNumber}</span>
                  <span className="font-bold text-green-600">{payment.total} DA</span>
                </div>
                
                {payment.customerName && (
                  <p className="text-sm text-muted-foreground mb-1">{payment.customerName}</p>
                )}
                
                <div className="text-xs text-muted-foreground mb-3">
                  {payment.items} articles
                  {payment.discount && <span className="text-green-600"> • Remise: -{payment.discount} DA</span>}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePrintInvoice(payment)}
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Imprimer
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => confirmPayment(payment.id)}
                    className="flex-1 text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmer
                  </Button>
                </div>
              </div>
            ))}
            
            {pendingPayments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun paiement en attente</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Alert */}
      {showEmergency && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Manager contacté avec succès!</span>
          </div>
        </div>
      )}


    </div>
  );
}
