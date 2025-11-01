import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { 
  Users, 
  Clock, 
  MapPin,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Edit,
  Phone,
  User,
  Timer,
  CreditCard,
  Eye
} from "lucide-react";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "libre" | "reservee" | "occupee";
  currentGuests?: number;
  orderStartTime?: string;
  reservationTime?: string;
  customerName?: string;
  customerPhone?: string;
  waiter?: string;
  totalAmount?: number;
  orderItems?: number;
}

const mockTables: Table[] = [
  {
    id: "1",
    number: 1,
    capacity: 4,
    status: "occupee",
    currentGuests: 3,
    orderStartTime: "14:30",
    customerName: "Ahmed Benali",
    customerPhone: "+213 555 123 456",
    waiter: "Marie",
    totalAmount: 2450,
    orderItems: 5
  },
  {
    id: "2",
    number: 2,
    capacity: 2,
    status: "libre",
    currentGuests: 0
  },
  {
    id: "3",
    number: 3,
    capacity: 6,
    status: "reservee",
    reservationTime: "19:00",
    customerName: "Fatima Kadi",
    customerPhone: "+213 555 789 123",
    waiter: "Jean"
  },
  {
    id: "4",
    number: 4,
    capacity: 4,
    status: "occupee",
    currentGuests: 4,
    orderStartTime: "13:45",
    customerName: "Omar Mansouri",
    waiter: "Sophie",
    totalAmount: 3200,
    orderItems: 8
  },
  {
    id: "5",
    number: 5,
    capacity: 2,
    status: "libre"
  },
  {
    id: "6",
    number: 6,
    capacity: 8,
    status: "libre"
  },
  {
    id: "7",
    number: 7,
    capacity: 4,
    status: "occupee",
    currentGuests: 2,
    orderStartTime: "15:15",
    customerName: "Yacine Bouzid",
    customerPhone: "+213 555 456 789",
    waiter: "Marie",
    totalAmount: 1800,
    orderItems: 3
  },
  {
    id: "8",
    number: 8,
    capacity: 6,
    status: "libre"
  }
];

export function TableTracker() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });

  // Update time display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getStatusConfig = () => ({
    libre: {
      label: "Libre",
      color: "bg-green-500 text-white",
      icon: CheckCircle,
      bgColor: "bg-green-50 border-green-200 hover:bg-green-100"
    },
    reservee: {
      label: "Réservée",
      color: "bg-yellow-500 text-white",
      icon: AlertCircle,
      bgColor: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
    },
    occupee: {
      label: "Occupée",
      color: "bg-red-500 text-white",
      icon: XCircle,
      bgColor: "bg-red-50 border-red-200 hover:bg-red-100"
    }
  });

  const refreshTables = () => {
    setLastUpdate(new Date());
    // Simulate data refresh - in real app would fetch from API
    console.log('Refreshing table data...');
  };

  const getStatusStats = () => {
    const libre = tables.filter(t => t.status === "libre").length;
    const reservee = tables.filter(t => t.status === "reservee").length;
    const occupee = tables.filter(t => t.status === "occupee").length;
    
    return { libre, reservee, occupee, total: tables.length };
  };

  const assignTable = (table: Table) => {
    if (!customerInfo.name.trim()) {
      alert('Veuillez entrer le nom du client');
      return;
    }

    setTables(prev => prev.map(t => 
      t.id === table.id 
        ? {
            ...t,
            status: "occupee" as const,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone || undefined,
            orderStartTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            currentGuests: 1
          }
        : t
    ));

    setCustomerInfo({ name: '', phone: '' });
    setSelectedTable(null);
    alert(`Table ${table.number} assignée à ${customerInfo.name}`);
  };

  const freeTable = (table: Table) => {
    if (confirm(`Libérer la table ${table.number} ?`)) {
      setTables(prev => prev.map(t => 
        t.id === table.id 
          ? {
              ...t,
              status: "libre" as const,
              customerName: undefined,
              customerPhone: undefined,
              orderStartTime: undefined,
              currentGuests: 0,
              totalAmount: undefined,
              orderItems: undefined
            }
          : t
      ));
    }
  };

  const getElapsedTime = (startTime: string) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    
    if (elapsed < 0) return 'À venir';
    if (elapsed < 60) return `${elapsed}min`;
    return `${Math.floor(elapsed / 60)}h ${elapsed % 60}min`;
  };

  const stats = getStatusStats();
  const statusConfig = getStatusConfig();

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Suivi des Tables</h2>
          <p className="text-muted-foreground">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </p>
        </div>
        
        <Button 
          onClick={refreshTables}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.libre}</p>
                <p className="text-sm text-muted-foreground">Tables libres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.reservee}</p>
                <p className="text-sm text-muted-foreground">Tables réservées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.occupee}</p>
                <p className="text-sm text-muted-foreground">Tables occupées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const config = statusConfig[table.status];
          const StatusIcon = config.icon;

          return (
            <Card 
              key={table.id}
              className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 ${config.bgColor} cursor-pointer`}
              onClick={() => setSelectedTable(table)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Table {table.number}
                  </CardTitle>
                  <Badge className={config.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Capacity */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{table.currentGuests || 0}/{table.capacity} places</span>
                </div>

                {/* Customer Info for Occupied Tables */}
                {table.status === "occupee" && (
                  <div className="space-y-2">
                    {table.customerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{table.customerName}</span>
                      </div>
                    )}
                    
                    {table.customerPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{table.customerPhone}</span>
                      </div>
                    )}
                    
                    {table.orderStartTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span>Depuis {getElapsedTime(table.orderStartTime)}</span>
                      </div>
                    )}
                    
                    {table.totalAmount && (
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{table.totalAmount} DA</span>
                        {table.orderItems && (
                          <span className="text-muted-foreground">({table.orderItems} articles)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Reservation Info */}
                {table.status === "reservee" && (
                  <div className="space-y-2">
                    {table.customerName && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{table.customerName}</span>
                      </div>
                    )}
                    
                    {table.reservationTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Réservé pour {table.reservationTime}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Waiter Info */}
                {table.waiter && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Serveur: {table.waiter}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {table.status === "libre" && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTable(table);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Assigner
                    </Button>
                  )}
                  
                  {table.status === "occupee" && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Interface de commande');
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Commande
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          freeTable(table);
                        }}
                      >
                        Libérer
                      </Button>
                    </>
                  )}
                  
                  {table.status === "reservee" && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTable(table);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Détails
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table Assignment Modal */}
      {selectedTable && selectedTable.status === "libre" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assigner Table {selectedTable.number}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du client *</label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du client"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Téléphone (optionnel)</label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Numéro de téléphone"
                  className="mt-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => assignTable(selectedTable)}
                  className="flex-1"
                >
                  Assigner
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedTable(null);
                    setCustomerInfo({ name: '', phone: '' });
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
