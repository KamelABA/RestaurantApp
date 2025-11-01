import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, Order, OrderItem } from "@/types";
import { CheckCircle, Clock, Euro, Printer, Receipt, ChefHat, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TableManagementModalProps {
  table: Table | null;
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onProcessPayment: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const TableManagementModal = ({
  table,
  order,
  isOpen,
  onClose,
  onConfirmOrder,
  onMarkReady,
  onProcessPayment,
  onDeleteOrder
}: TableManagementModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!table) return null;

  const handleConfirmOrder = async () => {
    if (!order) return;
    setIsProcessing(true);
    
    try {
      await onConfirmOrder(order.id);
      toast(`La commande de la table ${table.number} a été confirmée.`);
    } catch (error) {
      toast("Impossible de confirmer la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkReady = async () => {
    if (!order) return;
    setIsProcessing(true);
    
    try {
      await onMarkReady(order.id);
      toast(`La commande de la table ${table.number} a été servie et est en attente de paiement.`);
    } catch (error) {
      toast("Impossible de marquer la commande comme servie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!order) return;
    setIsProcessing(true);
    
    try {
      await onProcessPayment(order.id);
      toast(`Le paiement de la table ${table.number} a été traité. La table est maintenant libre.`);
      onClose();
    } catch (error) {
      toast("Impossible de traiter le paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order) return;
    
    // Confirmation dialog
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la commande de la table ${table.number} ?`)) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await onDeleteOrder(order.id);
      toast(`La commande de la table ${table.number} a été supprimée.`);
      onClose();
    } catch (error) {
      toast("Impossible de supprimer la commande.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (!order) {
      return <Badge className="bg-success/20 text-success border-success/30">Table libre</Badge>;
    }
    
    switch (order.status) {
      case 'pending':
        return <Badge className="bg-warning/20 text-warning border-warning/30 animate-pulse">Nouvelle commande</Badge>;
      case 'confirmed':
        return <Badge className="bg-accent/20 text-accent border-accent/30">Confirmée - En préparation</Badge>;
      case 'ready':
        return <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">Prête à servir</Badge>;
      case 'served':
        return <Badge className="bg-muted/20 text-muted-foreground border-muted/30">Servie - En attente de paiement</Badge>;
      default:
        return <Badge variant="secondary">{order.status}</Badge>;
    }
  };

  const renderActionButtons = () => {
    if (!order) return null;

    switch (order.status) {
      case 'pending':
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleConfirmOrder} 
              disabled={isProcessing}
              className="w-full"
              variant="success"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? "Confirmation..." : "Confirmer la commande"}
            </Button>
          </div>
        );
      
      case 'confirmed':
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleMarkReady} 
              disabled={isProcessing}
              className="w-full"
              variant="gradient"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              {isProcessing ? "Marquage..." : "Marquer comme servie"}
            </Button>
          </div>
        );
      
      case 'ready':
      case 'served':
        return (
          <div className="space-y-3">
            <Button 
              onClick={handleProcessPayment} 
              disabled={isProcessing}
              className="w-full"
              variant="success"
            >
              <Euro className="h-4 w-4 mr-2" />
              {isProcessing ? "Traitement..." : "Confirmer le paiement"}
            </Button>
            <Button variant="outline" className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer la facture
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              Table {table.number}
            </div>
            {order && (
              <Button 
                onClick={handleDeleteOrder}
                disabled={isProcessing}
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                title="Supprimer la commande"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statut de la table */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut:</span>
            {getStatusBadge()}
          </div>



          {/* Détails de la commande */}
          {order && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">Détails de la commande</h4>
              <div className="space-y-2">
                {/* Mock order items */}
                <div className="flex justify-between text-sm">
                  <span>Burger Royal</span>
                  <span>15.90 DZD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frites</span>
                  <span>4.50 DZD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coca-Cola</span>
                  <span>3.50 DZD</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{order.total.toFixed(2)} DZD</span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="pt-2">
            {renderActionButtons()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};