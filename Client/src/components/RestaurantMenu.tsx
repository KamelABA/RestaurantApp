import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, ShoppingCart, Receipt, MessageSquare, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/useSocket";
import DishModal from "./DishModal";
import BillPage from "./BillPage";
import ComplaintPage from "./ComplaintPage";
import CartPage from "./CartPage";
import OrderStatusNotification from "./OrderStatusNotification";
import steakImg from "@/assets/steak.jpg";
import saladImg from "@/assets/salad.jpg";
import dessertImg from "@/assets/dessert.jpg";
import soupImg from "@/assets/soup.jpg";
import restaurantHero from "@/assets/restaurant-hero.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[]; // Support multiple images
  available?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
  tableNumber?: string;
  orderId?: string; // Add orderId field for confirmed orders
}


type ViewType = "menu" | "bill" | "complaint" | "cart";

// Fallback static data in case database is not available
const fallbackMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Steak Grillé",
    description: "Filet de bœuf grillé aux légumes de saison",
    price: 28.50,
    category: "Plats Principaux",
    image: steakImg,
    available: true
  },
  {
    id: "2",
    name: "Salade César",
    description: "Salade fraîche avec croûtons et parmesan",
    price: 14.90,
    category: "Entrées",
    image: saladImg,
    available: true
  },
  {
    id: "3",
    name: "Soupe à l'Oignon",
    description: "Soupe traditionnelle française au fromage fondu",
    price: 9.80,
    category: "Entrées",
    image: soupImg,
    available: true
  },
  {
    id: "4",
    name: "Dessert Chocolat",
    description: "Fondant au chocolat avec fruits rouges",
    price: 8.50,
    category: "Desserts",
    image: dessertImg,
    available: true
  }
];

const RestaurantMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [categories, setCategories] = useState<string[]>(["Tous"]);

  const [orderStatuses, setOrderStatuses] = useState<{[orderId: string]: "pending" | "preparing" | "ready"}>({});
  const [currentView, setCurrentView] = useState<ViewType>("menu");
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successItem, setSuccessItem] = useState<{name: string, quantity: number} | null>(null);

  const { toast } = useToast();
  const { socket, isConnected, sendOrder, joinTable, orderStatusUpdates } = useSocket();
  
  // Log socket connection status for debugging
  useEffect(() => {
    console.log('🔌 Socket connection status:', { isConnected, socket: !!socket });
  }, [isConnected, socket]);

  const tableNumber = 12;

  // Listen for order status updates from Socket.IO
  useEffect(() => {
    console.log('🔄 RestaurantMenu: orderStatusUpdates changed, length:', orderStatusUpdates.length);
    console.log('🔄 RestaurantMenu: Current orderStatusUpdates:', orderStatusUpdates);
    console.log('🔄 RestaurantMenu: Current orderStatuses:', orderStatuses);
    
    if (orderStatusUpdates.length > 0) {
      const latestUpdate = orderStatusUpdates[0];
      console.log('🔄 RestaurantMenu: Processing latest update:', latestUpdate);
      console.log('🔄 RestaurantMenu: Update details:', {
        orderId: latestUpdate.orderId,
        tableNumber: latestUpdate.tableNumber,
        status: latestUpdate.status,
        timestamp: latestUpdate.timestamp
      });
      
      // Update the order status in our local state
      const newStatus: "pending" | "preparing" | "ready" = 
        latestUpdate.status === 'confirmed' ? 'preparing' : 
        latestUpdate.status === 'preparing' ? 'preparing' :
        latestUpdate.status === 'ready' ? 'ready' :
        latestUpdate.status === 'served' ? 'ready' :
        latestUpdate.status === 'paid' ? 'ready' :
        latestUpdate.status === 'cancelled' ? 'pending' : 'pending';
      
      console.log('🔄 RestaurantMenu: Converting status from', latestUpdate.status, 'to', newStatus);
      console.log('🔄 RestaurantMenu: Looking for orderId:', latestUpdate.orderId, 'in orderStatuses');
      
      // If order is paid, clear all data for new customer
      if (latestUpdate.status === 'paid') {
        console.log('💰 Order paid - clearing all data for new customer');
        
        // Clear all data to prepare for new customer
        setOrderStatuses({});
        setConfirmedOrders([]);
        setCart([]);
        
        // Reset to menu view
        setCurrentView("menu");
        
        // Show success message
        toast({
          title: "Paiement effectué !",
          description: "Merci pour votre visite. L'interface est maintenant prête pour un nouveau client.",
          variant: "default"
        });
        
        return; // Exit early since we've cleared everything
      }
      
      // If order is cancelled, clear data for that specific order
      if (latestUpdate.status === 'cancelled') {
        console.log('❌ Order cancelled - clearing data for cancelled order');
        
        // Remove the cancelled order from orderStatuses
        setOrderStatuses(prev => {
          const { [latestUpdate.orderId]: removed, ...rest } = prev;
          console.log('🔄 RestaurantMenu: Removed cancelled order:', latestUpdate.orderId);
          return rest;
        });
        
        // Remove the cancelled order from confirmedOrders
        setConfirmedOrders(prev => 
          prev.filter(item => item.orderId !== latestUpdate.orderId)
        );
        
        // Show cancellation message
        toast({
          title: "Commande annulée",
          description: "La commande a été annulée par le personnel.",
          variant: "destructive"
        });
        
        return; // Exit early since we've handled the cancellation
      }
      
      // If order is served, show message but DON'T clear data
      if (latestUpdate.status === 'served') {
        console.log('🍽️ Order served - showing message but keeping data');
        
        // Show served message
        toast({
          title: "Commande servie !",
          description: "Votre commande a été servie. Vous pouvez maintenant la déguster.",
          variant: "default"
        });
        
        // Update status but keep all data
        setOrderStatuses(prev => ({
          ...prev,
          [latestUpdate.orderId]: 'ready'
        }));
        
        return; // Exit early since we've handled the served status
      }
      
      setOrderStatuses(prev => {
        const updated = {
          ...prev,
          [latestUpdate.orderId]: newStatus
        };
        console.log('🔄 RestaurantMenu: Previous orderStatuses:', prev);
        console.log('🔄 RestaurantMenu: Updated orderStatuses:', updated);
        return updated;
      });
    } else {
      console.log('🔄 RestaurantMenu: No order status updates to process');
    }
  }, [orderStatusUpdates]);

  // Load menu items from database
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try multiple server URLs
        const serverUrls = [
          'http://localhost:8000',
          'http://127.0.0.1:8000',
          'http://192.168.1.16:8000'
        ];
        
        let workingUrl = null;
        let lastError = null;
        
        // Test each server URL
        for (const baseUrl of serverUrls) {
          try {
            console.log(`Testing server at: ${baseUrl}/api/test`);
            
            const healthResponse = await fetch(`${baseUrl}/api/test`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (healthResponse.ok) {
              const healthData = await healthResponse.json();
              console.log('Server health check successful at:', baseUrl, healthData);
              workingUrl = baseUrl;
              break;
            } else {
              console.warn(`Server health check failed at ${baseUrl}:`, healthResponse.status);
            }
          } catch (healthError) {
            console.warn(`Server health check failed at ${baseUrl}:`, healthError);
            lastError = healthError;
          }
        }
        
        if (!workingUrl) {
          throw new Error(`Aucun serveur accessible. URLs testées: ${serverUrls.join(', ')}. Dernière erreur: ${lastError?.message || 'Inconnue'}`);
        }
        
        console.log(`Using working server at: ${workingUrl}/api/dishes`);
        
        const response = await fetch(`${workingUrl}/api/dishes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Menu items loaded from database:', data);
          
          // Process the data to match our interface (Laravel returns data directly)
          const items = Array.isArray(data) ? data : [];
          
          console.log('Processed items count:', items.length);
          
          // Transform database data to match our interface
          const transformedItems = items
            .filter(item => item.available !== false) // Filter out unavailable items
            .map((item: any) => {
              console.log('Processing item:', item);
              console.log('Item images array:', item.images);
              console.log('Item image_url:', item.image_url);
              console.log('Item image:', item.image);
              
              // Select appropriate fallback image based on category
              let fallbackImage = steakImg; // Default fallback
              if (item.category === 'Salades') {
                fallbackImage = saladImg;
              } else if (item.category === 'Entrées') {
                fallbackImage = soupImg;
              } else if (item.category === 'Desserts') {
                fallbackImage = dessertImg;
              }
              
              // Get all images from the images array, or use fallback
              let imageUrls = [fallbackImage];
              if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                // Convert all images to full URLs
                imageUrls = item.images.map(imagePath => `http://localhost:8000${imagePath}`);
              } else if (item.image_url) {
                imageUrls = [item.image_url];
              } else if (item.image) {
                imageUrls = [item.image];
              }
              
              return {
                id: item.id?.toString() || item.id,
                name: item.name || 'Sans nom',
                description: item.description || 'Aucune description',
                price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
                category: item.category || 'Autre',
                image: imageUrls[0], // Use first image as primary
                images: imageUrls, // Store all images for slider
                available: item.available !== false // Default to true if not specified
              };
            });

          console.log('Transformed items:', transformedItems);
          setMenuItems(transformedItems);

          // Extract unique categories from loaded menu items
          const uniqueCategories = Array.from(new Set(transformedItems.map(item => item.category)));
          console.log('Extracted categories from database:', uniqueCategories);
          setCategories(["Tous", ...uniqueCategories]);

        } else {
          const errorText = await response.text();
          console.error('Response not OK:', response.status, errorText);
          throw new Error(`Failed to load menu items: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(`Erreur lors du chargement du menu: ${errorMessage}. Utilisation des données de secours.`);
        // Use fallback data if database fails
        setMenuItems(fallbackMenuItems);
        // Extract categories from fallback data
        const fallbackCategories = Array.from(new Set(fallbackMenuItems.map(item => item.category)));
        setCategories(["Tous", ...fallbackCategories]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const openDishModal = (item: MenuItem) => {
    setSelectedDish(item);
    setIsDishModalOpen(true);
  };

  const addToCartFromModal = (item: MenuItem, quantity: number) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      setCart(cart.map((cartItem, index) => 
        index === existingItemIndex 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    
    // Afficher le message de succès animé
    setSuccessItem({ name: item.name, quantity });
    setShowSuccessMessage(true);
    
    // Masquer le message après 2 secondes
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessItem(null);
    }, 2000);
  };

  const addToCart = (item: MenuItem) => {
    openDishModal(item);
  };





  const submitOrder = (tableNumber: string) => {
    console.log('🚀 submitOrder called with tableNumber:', tableNumber);
    console.log('🚀 Current cart:', cart);
    console.log('🚀 Current view:', currentView);
    
    if (cart.length === 0) {
      console.log('❌ Cart is empty');
      toast({
        title: "Panier vide",
        description: "Veuillez ajouter au moins un plat à votre commande",
        variant: "destructive"
      });
      return;
    }

    if (!tableNumber.trim()) {
      console.log('❌ Table number is empty');
      toast({
        title: "Numéro de table requis",
        description: "Veuillez saisir le numéro de votre table",
        variant: "destructive"
      });
      return;
    }

    // Créer un ID unique pour cette commande - utiliser un format plus simple
    const orderId = `order_${tableNumber.trim()}_${Date.now()}`;
    
    // Préparer les données de la commande pour Socket.IO
    const orderData = {
      id: orderId,
      tableNumber: tableNumber.trim(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      })),
      total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    // Envoyer la commande via Socket.IO si connecté
    if (isConnected && socket) {
      console.log('✅ Socket is connected, sending order...');
      sendOrder(orderData);
      console.log('📤 Order sent via Socket.IO:', orderData);
      
      // Rejoindre la salle de la table pour recevoir les mises à jour
      console.log('📋 Joining table room:', tableNumber.trim());
      joinTable(tableNumber.trim());
    } else {
      console.warn('⚠️ Socket not connected, order sent locally only');
      console.log('❌ Socket status:', { isConnected, socket: !!socket });
    }
    
    // Ajouter les éléments du panier إلى الطلبات المؤكدة avec ID et numéro de table
    const orderWithId = cart.map(item => ({ ...item, orderId, tableNumber: tableNumber.trim() }));
    setConfirmedOrders(prevOrders => [...prevOrders, ...orderWithId]);
    
    // Définir le statut initial pour cette commande
    setOrderStatuses(prev => ({ ...prev, [orderId]: "pending" }));
    
    setCurrentView("menu");
    
    // Vider le panier après تأكيد الطلب
    setCart([]);
    
    // Afficher un message de succès
    toast({
      title: "Commande confirmée !",
      description: `Votre commande a été envoyée pour la table ${tableNumber.trim()}`,
      variant: "default"
    });
    
    // Note: Les changements de statut se feront uniquement via Socket.IO
    // quand le cashier change le statut manuellement
    
    console.log('✅ Order submitted successfully!');
    console.log('✅ Order ID:', orderId);
    console.log('✅ Table Number:', tableNumber.trim());
    console.log('✅ Cart cleared, length:', cart.length);
    console.log('✅ Confirmed orders count:', confirmedOrders.length + orderWithId.length);
  };

  // Handle different views
  if (currentView === "bill") {
    return <BillPage cart={confirmedOrders} onBack={() => setCurrentView("menu")} />;
  }

  if (currentView === "complaint") {
    return <ComplaintPage onBack={() => setCurrentView("menu")} tableNumber={tableNumber} />;
  }

  if (currentView === "cart") {
    return (
      <CartPage 
        cart={cart} 
        onBack={() => setCurrentView("menu")} 
        onUpdateCart={setCart}
        onSubmitOrder={submitOrder}
        orderStatuses={orderStatuses}
      />
    );
  }

  const filteredItems = selectedCategory === "Tous" 
    ? menuItems.filter(item => item.available !== false) // Hide unavailable dishes
    : menuItems.filter(item => item.category === selectedCategory && item.available !== false); // Hide unavailable dishes in category view

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-restaurant-cream to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-primary">Chargement du menu...</h2>
          <p className="text-muted-foreground">Connexion à la base de données</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-restaurant-cream to-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur de connexion</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-background via-restaurant-cream to-background min-h-screen overflow-y-auto">
        {/* Hero Header */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={restaurantHero} 
            alt="Restaurant ambiance" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-restaurant-dark/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-between px-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Menu</h1>
              <p className="text-restaurant-cream text-lg">Sélectionnez votre table lors de la commande</p>
              <p className="text-restaurant-cream text-sm opacity-80">
                {filteredItems.length} plats disponibles sur {menuItems.length} au total
              </p>
              {/* Socket.IO Connection Status */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-restaurant-cream opacity-80">
                  {isConnected ? 'Connecté au serveur' : 'Déconnecté du serveur'}
                </span>
              </div>
            </div>
                        <div className="flex gap-3">
                             <Button 
                 variant="outline" 
                 size="icon"
                 className="relative bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-white/20 group"
                 onClick={() => setCurrentView("cart")}
                 title={cart.length > 0 ? "⚠️ Confirmez vos commandes dans le panier !" : "Voir le panier"}
               >
                 <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                                     {cart.length > 0 && (
                     <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap animate-bounce shadow-lg">
                       ⚠️ Confirmez !
                     </div>
                   )}
                   {cart.length > 0 && (
                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                       Commandes en attente
                     </div>
                   )}
                   {cart.length > 0 && (
                     <Badge 
                       className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold animate-pulse shadow-lg"
                     >
                       {cart.reduce((sum, item) => sum + item.quantity, 0)}
                     </Badge>
                   )}

                </Button>
                                                               {/* Icone Facture - toujours visible si il y a des commandes confirmées */}
                                {(cart.length > 0 || confirmedOrders.length > 0) && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="relative bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-white/20 group"
                      onClick={() => setCurrentView("bill")}
                      title={confirmedOrders.length > 0 ? "Voir la facture détaillée" : "Voir la facture détaillée"}
                    >
                      <Receipt className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    </Button>
                  )}
              <Button 
                variant="outline" 
                size="icon"
                className="relative bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-white/20 group"
                onClick={() => setCurrentView("complaint")}
              >
                <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              </Button>
              
            </div>
          </div>
        </div>

                                                                                                                               {/* Order Statuses - Display all confirmed orders with their statuses */}
           {Object.keys(orderStatuses).length > 0 && (
             <div className="space-y-4 m-4">
                               {Object.entries(orderStatuses).map(([orderId, status]) => (
                  <div 
                    key={orderId} 
                    className={`p-4 border-l-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${
                      status === "pending" ? "bg-orange-50 border-orange-400" :
                      status === "preparing" ? "bg-blue-50 border-blue-400" :
                      "bg-green-50 border-green-400"
                    }`}
                    onClick={() => {
                      if (status === "preparing" || status === "ready") {
                        setCurrentView("bill");
                      }
                    }}
                    title={status === "preparing" || status === "ready" ? "Cliquez pour voir la facture" : ""}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        status === "pending" ? "bg-orange-100 text-orange-600" :
                        status === "preparing" ? "bg-blue-100 text-blue-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {status === "pending" && <AlertCircle className="h-4 w-4" />}
                        {status === "preparing" && <Clock className="h-4 w-4" />}
                        {status === "ready" && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          status === "pending" ? "text-orange-700" :
                          status === "preparing" ? "text-blue-700" :
                          "text-green-700"
                        }`}>
                          {status === "pending" && "Commande en attente"}
                          {status === "preparing" && "Commande en préparation"}
                          {status === "ready" && "Commande prête"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {status === "pending" && "Votre commande a été reçue"}
                          {status === "preparing" && "Nos chefs préparent votre commande"}
                          {status === "ready" && "Votre commande est prête à être servie"}
                        </p>
                        {(status === "preparing" || status === "ready") && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            💡 Cliquez pour voir la facture
                          </p>
                        )}
                      </div>
                      {(status === "preparing" || status === "ready") && (
                        <div className="text-muted-foreground">
                          <Receipt className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
               
               {/* New Order Status (if there are new items in cart after confirming previous order) */}
               {cart.length > 0 && (
                 <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                       <AlertCircle className="h-4 w-4" />
                     </div>
                     <div>
                       <p className="font-semibold text-red-700">
                         Nouvelle commande en attente
                       </p>
                       <p className="text-sm text-muted-foreground">
                         Vous avez {cart.reduce((sum, item) => sum + item.quantity, 0)} nouvel(le)(s) article(s) dans votre panier. Confirmez cette nouvelle commande !
                       </p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           )}

          {/* Cart Reminder */}
          {cart.length > 0 && Object.keys(orderStatuses).length === 0 && (
            <div className="bg-restaurant-warm/10 border-l-4 border-restaurant-warm p-4 m-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-restaurant-warm" />
                <div>
                  <p className="font-semibold text-restaurant-warm">
                    Commandes en attente
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vous avez {cart.reduce((sum, item) => sum + item.quantity, 0)} article(s) dans votre panier. N'oubliez pas de confirmer votre commande !
                  </p>
                </div>
              </div>
            </div>
          )}

        <div className="container mx-auto px-4 py-6 pb-32">
          {/* Category Filter */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category 
                    ? "bg-gradient-to-r from-primary to-restaurant-warm text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40" 
                    : "bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 hover:bg-white hover:border-primary/30 hover:text-primary hover:shadow-md"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-border/50 cursor-pointer"
                onClick={() => openDishModal(item)}
              >
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log('Image failed to load for item:', item.name, 'Image URL:', item.image);
                      const target = e.target as HTMLImageElement;
                      // Use category-appropriate fallback image
                      if (item.category === 'Salades') {
                        target.src = saladImg;
                      } else if (item.category === 'Entrées') {
                        target.src = soupImg;
                      } else if (item.category === 'Desserts') {
                        target.src = dessertImg;
                      } else {
                        target.src = steakImg;
                      }
                    }}
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="secondary" className="bg-restaurant-gold/20 text-restaurant-dark">
                      {item.price.toFixed(2)} DZD
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openDishModal(item);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-restaurant-warm hover:from-primary/90 hover:to-restaurant-warm/90 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/30 transform hover:scale-105 transition-all duration-300 group"
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Voir les détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </div>

             {/* Dish Modal */}
       <DishModal 
         dish={selectedDish}
         isOpen={isDishModalOpen}
         onClose={() => setIsDishModalOpen(false)}
         onAddToCart={addToCartFromModal}
       />

       {/* Success Message Animation */}
       {showSuccessMessage && successItem && (
         <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
           <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl transform animate-in slide-in-from-bottom-4 zoom-in-95 duration-500 pointer-events-auto">
             <div className="flex items-center gap-4">
               <div className="bg-white/20 p-3 rounded-full">
                 <ShoppingCart className="h-8 w-8 text-white" />
               </div>
               <div>
                 <h3 className="text-xl font-bold mb-1">🎉 Ajouté avec succès !</h3>
                 <p className="text-green-100">
                   {successItem.name} (x{successItem.quantity}) a été ajouté à votre panier
                 </p>
               </div>
             </div>
             <div className="mt-4 flex justify-center">
               <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce mx-1"></div>
               <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce mx-1" style={{animationDelay: '0.1s'}}></div>
               <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce mx-1" style={{animationDelay: '0.2s'}}></div>
             </div>
           </div>
         </div>
       )}

       {/* Order Status Notifications */}
       <OrderStatusNotification />
     </>
   );
 };

export default RestaurantMenu;