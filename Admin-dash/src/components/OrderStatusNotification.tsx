import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, CheckCircle, Clock, ChefHat, AlertCircle } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface OrderStatusUpdate {
  orderId: string;
  tableNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  timestamp: string;
}

const OrderStatusNotification = () => {
  const { orderStatusUpdates, clearOrderStatusUpdates } = useSocket();
  const [isVisible, setIsVisible] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState<OrderStatusUpdate | null>(null);

  useEffect(() => {
    console.log('🔄 OrderStatusNotification: orderStatusUpdates changed:', orderStatusUpdates);
    
    if (orderStatusUpdates.length > 0) {
      const latestUpdate = orderStatusUpdates[0];
      console.log('🔄 OrderStatusNotification: Processing latest update:', latestUpdate);
      console.log('🔄 Update details:', {
        orderId: latestUpdate.orderId,
        tableNumber: latestUpdate.tableNumber,
        status: latestUpdate.status,
        timestamp: latestUpdate.timestamp
      });
      
      setCurrentUpdate(latestUpdate);
      setIsVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [orderStatusUpdates]);

  if (!isVisible || !currentUpdate) {
    return null;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          text: 'Commande confirmée',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          message: 'Votre commande a été confirmée et est en préparation'
        };
      case 'preparing':
        return {
          text: 'Commande en préparation',
          icon: <ChefHat className="h-5 w-5 text-orange-500" />,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          message: 'Nos chefs préparent votre commande avec soin'
        };
      case 'ready':
        return {
          text: 'Commande prête',
          icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          message: 'Votre commande est prête ! Bon appétit !'
        };
      case 'served':
        return {
          text: 'Commande servie',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          message: 'Votre commande a été servie à votre table'
        };
      case 'cancelled':
        return {
          text: 'Commande annulée',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          message: 'Votre commande a été annulée'
        };
      default:
        return {
          text: 'Mise à jour',
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          message: 'Statut de votre commande mis à jour'
        };
    }
  };

  const statusInfo = getStatusInfo(currentUpdate.status);
  const timeAgo = new Date(currentUpdate.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleClose = () => {
    setIsVisible(false);
    clearOrderStatusUpdates();
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <Card className="w-96 shadow-lg border-2">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {statusInfo.icon}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={statusInfo.color}>
                    {statusInfo.text}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {statusInfo.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  Table {currentUpdate.tableNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusNotification;
