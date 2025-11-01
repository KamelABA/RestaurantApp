import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, Order } from "@/types";
import { Users, Clock, CheckCircle, AlertCircle, ChefHat, Plus } from "lucide-react";
import { useState, useMemo } from "react";

interface TableGridProps {
  tables: Table[];
  orders: Order[];
  onTableSelect: (table: Table) => void;
}

export const TableGrid = ({ tables, orders, onTableSelect }: TableGridProps) => {
  const [activeSection, setActiveSection] = useState<string>('all');

  const getTableOrder = (tableId: number) => {
    return orders.find(order => order.tableId === tableId && order.status !== 'paid');
  };

  // Group tables by status
  const groupedTables = {
    all: tables,
    free: tables.filter(table => !getTableOrder(table.id)),
    pending: tables.filter(table => {
      const order = getTableOrder(table.id);
      return order && order.status === 'pending';
    }),
    preparing: tables.filter(table => {
      const order = getTableOrder(table.id);
      return order && (order.status === 'confirmed' || order.status === 'preparing');
    }),
    payment: tables.filter(table => {
      const order = getTableOrder(table.id);
      return order && order.status === 'served';
    })
  };

  const getTableStatusFromOrder = (order: Order | undefined) => {
    if (!order) return 'free';
    if (order.status === 'pending') return 'pending';
    if (order.status === 'confirmed' || order.status === 'preparing') return 'occupied';
    if (order.status === 'served') return 'payment';
    return 'occupied';
  };

  const getTableStatusColor = (order: Order | undefined) => {
    const status = getTableStatusFromOrder(order);
    switch (status) {
      case 'free':
        return 'bg-success/20 text-success border-success/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30 animate-pulse';
      case 'occupied':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'payment':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getTableStatusText = (order: Order | undefined) => {
    const status = getTableStatusFromOrder(order);
    switch (status) {
      case 'free':
        return 'Libre';
      case 'pending':
        return 'Nouvelle commande';
      case 'occupied':
        return 'En préparation';
      case 'payment':
        return 'À encaisser';
      default:
        return 'Occupée';
    }
  };

  const getTableIcon = (order: Order | undefined) => {
    const status = getTableStatusFromOrder(order);
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'payment':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderTableCard = (table: Table) => {
    const tableOrder = getTableOrder(table.id);
    
    return (
      <Card 
        key={table.id} 
        className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg relative ${
          getTableStatusFromOrder(tableOrder) === 'free' ? 'hover:border-success' : 
          'hover:border-primary'
        }`}
        onClick={() => onTableSelect(table)}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Table {table.number}</h3>
            <div className="flex items-center gap-1">
              {getTableIcon(tableOrder)}
              <Badge className={getTableStatusColor(tableOrder)}>
                {getTableStatusText(tableOrder)}
              </Badge>
            </div>
          </div>



          {tableOrder?.createdAt && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {tableOrder.createdAt.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}

          {tableOrder && (
            <div className="text-sm font-medium text-primary">
              Total: {tableOrder.total.toFixed(2)} DZD
            </div>
          )}
        </div>
      </Card>
    );
  };

  const sections = [
    {
      id: 'all',
      title: 'Toutes les Tables',
      icon: <Plus className="h-4 w-4" />,
      color: 'bg-muted/20 text-muted-foreground',
      count: groupedTables.all.length,
      hasNotification: false
    },
    {
      id: 'pending',
      title: 'Commandes Nouvelles',
      icon: <AlertCircle className="h-4 w-4 text-warning" />,
      color: 'bg-warning/20 text-warning',
      count: groupedTables.pending.length,
      hasNotification: groupedTables.pending.length > 0
    },
    {
      id: 'preparing',
      title: 'En Préparation',
      icon: <ChefHat className="h-4 w-4 text-accent" />,
      color: 'bg-accent/20 text-accent',
      count: groupedTables.preparing.length,
      hasNotification: false
    },
    {
      id: 'payment',
      title: 'En Attente de Paiement',
      icon: <CheckCircle className="h-4 w-4 text-destructive" />,
      color: 'bg-destructive/20 text-destructive',
      count: groupedTables.payment.length,
      hasNotification: groupedTables.payment.length > 0
    },
    {
      id: 'free',
      title: 'Tables Libres',
      icon: <Plus className="h-4 w-4 text-success" />,
      color: 'bg-success/20 text-success',
      count: groupedTables.free.length,
      hasNotification: false
    }
  ];

  // Add fallback for empty state
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune table disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="flex items-center gap-2 relative"
          >
            <div className={`p-1 rounded ${section.color}`}>
              {section.icon}
            </div>
            <span>{section.title}</span>
            <Badge variant="secondary" className="ml-1">
              {section.count}
            </Badge>
            {section.hasNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
            )}
          </Button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
        {groupedTables[activeSection as keyof typeof groupedTables]?.map(renderTableCard)}
      </div>
    </div>
  );
};