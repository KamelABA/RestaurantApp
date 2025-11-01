import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Receipt, Download } from "lucide-react";
import { CartItem } from "./RestaurantMenu";

interface BillPageProps {
  cart: CartItem[];
  onBack: () => void;
}

const BillPage = ({ cart, onBack }: BillPageProps) => {
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tva = subtotal * 0.1; // 10% TVA
  const total = subtotal + tva;
  
  // Get table number from the first item (all items should have the same table number)
  const tableNumber = cart[0]?.tableNumber || "N/A";
  
  const orderDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-restaurant-cream to-background">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Facture Détaillée</h1>
            <p className="text-primary-foreground/80">Table N° {tableNumber}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Menu 
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Table N° {tableNumber} • {orderDate}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              <h3 className="font-medium border-b pb-2">Détail de la commande</h3>
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground italic">Note: {item.notes}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)} DZD × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {(item.price * item.quantity).toFixed(2)} DZD
                  </p>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{subtotal.toFixed(2)} DZD</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>TVA (10%):</span>
                <span>{tva.toFixed(2)} DZD</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t">
                <span>Total:</span>
                <span>{total.toFixed(2)} DZD</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-muted/50 p-4 rounded-lg mt-4">
              <p className="text-sm text-center text-muted-foreground">
                Le paiement se fera directement auprès de votre serveur
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillPage;