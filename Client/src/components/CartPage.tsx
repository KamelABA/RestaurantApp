import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ShoppingCart, Plus, Minus, Receipt, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CartItem } from "./RestaurantMenu";

interface CartPageProps {
  cart: CartItem[];
  onBack: () => void;
  onUpdateCart: (newCart: CartItem[]) => void;
  onSubmitOrder: (tableNumber: string) => void;
  orderStatuses: {[orderId: string]: "pending" | "preparing" | "ready"};
}

const CartPage = ({ cart, onBack, onUpdateCart, onSubmitOrder, orderStatuses }: CartPageProps) => {
  const [cartNotes, setCartNotes] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      return;
    }
    // Reset table number and open modal
    setTableNumber("");
    setIsTableModalOpen(true);
  };

  const handleConfirmOrder = () => {
    console.log('🔘 handleConfirmOrder called');
    console.log('🔘 Table number:', tableNumber);
    console.log('🔘 Cart length:', cart.length);
    
    if (!tableNumber.trim()) {
      console.log('❌ Table number is empty');
      toast({
        title: "Numéro de table requis",
        description: "Veuillez saisir le numéro de votre table",
        variant: "destructive"
      });
      return;
    }
    
    console.log('✅ Calling onSubmitOrder with table number:', tableNumber.trim());
    onSubmitOrder(tableNumber.trim());
    setIsTableModalOpen(false);
  };

  const removeFromCart = (itemIndex: number) => {
    const item = cart[itemIndex];
    
    if (item.quantity > 1) {
      const newCart = cart.map((cartItem, index) => 
        index === itemIndex 
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      );
      onUpdateCart(newCart);
    } else {
      const newCart = cart.filter((_, index) => index !== itemIndex);
      onUpdateCart(newCart);
    }
  };

  const addToCart = (itemIndex: number) => {
    const newCart = cart.map((cartItem, index) => 
      index === itemIndex 
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
    onUpdateCart(newCart);
  };

  const removeItemCompletely = (itemIndex: number) => {
    const newCart = cart.filter((_, index) => index !== itemIndex);
    onUpdateCart(newCart);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (cart.length === 0) {
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
              <h1 className="text-xl font-bold">Votre Panier</h1>
              <p className="text-primary-foreground/80">Gérez votre commande</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <Card className="bg-card/95 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">Votre panier est vide</h2>
              <p className="text-muted-foreground mb-6">Ajoutez des plats délicieux pour commencer votre commande</p>
              <Button 
                onClick={onBack}
                className="bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90 text-white font-medium px-6 py-3 rounded-xl"
              >
                Parcourir le menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Votre Panier</h1>
            <p className="text-primary-foreground/80">{getItemCount()} article(s) • {getTotal().toFixed(2)} DZD</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item, index) => (
            <Card key={`${item.id}-${index}`} className="bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || '/placeholder.svg'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemCompletely(index)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {item.notes && (
                      <p className="text-sm text-muted-foreground italic mb-2">
                        Note: {item.notes}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => removeFromCart(index)}
                          className="h-8 w-8 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-all duration-200 hover:scale-110 rounded-lg"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-700">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => addToCart(index)}
                          className="h-8 w-8 bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 hover:text-green-700 transition-all duration-200 hover:scale-110 rounded-lg"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)} DZD × {item.quantity}
                        </p>
                        <p className="font-semibold text-lg">
                          {(item.price * item.quantity).toFixed(2)} DZD
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>



        {/* Order Summary */}
        <Card className="bg-card/95 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Résumé de la commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes pour la commande (optionnel)</label>
              <Textarea 
                placeholder="Demandes spéciales pour toute la commande..."
                value={cartNotes}
                onChange={(e) => setCartNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t font-bold text-xl">
              <span>Total:</span>
                              <span className="text-primary">{getTotal().toFixed(2)} DZD</span>
            </div>
            
            {/* Submit Button */}
            <Button 
              onClick={handleSubmitOrder}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none btn-glow"
            >
              <Receipt className="h-5 w-5 mr-2" />
              Valider la commande ({getItemCount()} article(s))
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal pour le numéro de table */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Confirmer votre commande
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Veuillez saisir le numéro de votre table pour confirmer votre commande
              </p>
            </div>

            {/* Table Number Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de table *</label>
              <Input 
                placeholder="Ex: 5, 12, A3..."
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="text-center font-semibold text-lg"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                * Champs obligatoire pour confirmer votre commande
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsTableModalOpen(false);
                  setTableNumber(""); // Reset table number when canceling
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleConfirmOrder}
                disabled={!tableNumber.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Confirmer pour la table {tableNumber || "?"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartPage;
