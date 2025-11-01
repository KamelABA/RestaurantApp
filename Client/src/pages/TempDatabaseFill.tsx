import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Database, Menu, AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MenuItemForm {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

const TempDatabaseFill = () => {
  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([]);
  const [currentItem, setCurrentItem] = useState<MenuItemForm>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    available: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  const { toast } = useToast();

  const categories = [
    "Entrées",
    "Plats Principaux", 
    "Desserts",
    "Boissons",
    "Apéritifs",
    "Salades",
    "Soupes",
    "Pâtes",
    "Viandes",
    "Poissons",
    "Végétarien",
    "Fast Food",
    "Cuisine du Monde",
    "Spécialités Maison"
  ];

  // API Base URL
  const API_BASE = 'http://localhost:8000/api';

  // Handle image file selection
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Type de fichier invalide",
        description: "Veuillez sélectionner un fichier image (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Show file size info (no size limit)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    toast({
      title: "📸 Image sélectionnée",
      description: `${file.name} - ${fileSizeMB}MB`,
    });

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCurrentItem({...currentItem, image_url: result});
      }
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };



  // Check database connection
  const checkDatabaseConnection = async () => {
    try {
      setDbStatus('checking');
      const response = await fetch(`${API_BASE}/test`);
      if (response.ok) {
        setDbStatus('connected');
        toast({
          title: "✅ Connexion réussie",
          description: "Base de données connectée avec succès!",
        });
      } else {
        setDbStatus('disconnected');
        toast({
          title: "❌ Connexion échouée",
          description: "Impossible de se connecter à la base de données.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setDbStatus('disconnected');
      toast({
        title: "❌ Erreur de connexion",
        description: "Serveur Laravel non accessible. Vérifiez que le serveur Laravel est démarré.",
        variant: "destructive"
      });
    }
  };

  // Load menu items from database
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dishes`);
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data || []);
        toast({
          title: "📋 Menu chargé",
          description: `${data.length} plats chargés depuis la base de données`,
        });
      } else {
        throw new Error('Failed to load menu items');
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: "❌ Erreur de chargement",
        description: "Impossible de charger les plats depuis la base de données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add or update menu item
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem.name || !currentItem.description || !currentItem.category || currentItem.price <= 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires et vérifier le prix.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing && editingId) {
        // Update existing item
        const response = await fetch(`${API_BASE}/dishes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentItem),
        });

        if (response.ok) {
          const data = await response.json();
          setMenuItems(prev => prev.map(item => 
            item.id === editingId ? data.data : item
          ));
          toast({
            title: "✅ Succès",
            description: "Plat mis à jour avec succès dans la base de données!",
          });
        } else {
          throw new Error('Failed to update menu item');
        }
      } else {
        // Add new item
        const response = await fetch(`${API_BASE}/dishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentItem),
        });

        if (response.ok) {
          const data = await response.json();
          setMenuItems(prev => [...prev, data.data]);
          toast({
            title: "✅ Succès",
            description: "Nouveau plat ajouté avec succès dans la base de données!",
          });
        } else {
          throw new Error('Failed to add menu item');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder le plat dans la base de données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit menu item
  const handleEdit = (item: MenuItemForm) => {
    setCurrentItem({
      name: item.name,
      description: item.description,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price || 0),
      category: item.category,
      image_url: item.image_url || "",
      available: item.available
    });
    setIsEditing(true);
    setEditingId(item.id || null);
  };

  // Delete menu item
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plat de la base de données?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dishes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "🗑️ Supprimé",
          description: "Plat supprimé avec succès de la base de données!",
        });
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le plat de la base de données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/dishes/${id}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, available: !currentStatus } : item
        ));
        toast({
          title: "🔄 Statut modifié",
          description: `Plat ${!currentStatus ? 'activé' : 'désactivé'} avec succès!`,
        });
      } else {
        throw new Error('Failed to toggle availability');
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de modifier le statut du plat",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setCurrentItem({
      name: "",
      description: "",
      price: 0,
      category: "",
      image_url: "",
      available: true
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `menu-items-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "📥 Export réussi",
      description: "Menu exporté en JSON depuis la base de données!",
    });
  };

  // Clear all items (from database)
  const clearAll = async () => {
    if (!confirm("⚠️ ATTENTION: Cette action supprimera TOUS les plats de la base de données. Êtes-vous absolument sûr?")) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete all items one by one
      for (const item of menuItems) {
        if (item.id) {
          await fetch(`${API_BASE}/dishes/${item.id}`, {
            method: 'DELETE',
          });
        }
      }
      
      setMenuItems([]);
      toast({
        title: "🗑️ Base vidée",
        description: "Tous les plats ont été supprimés de la base de données!",
      });
    } catch (error) {
      console.error('Error clearing all items:', error);
      toast({
        title: "❌ Erreur",
        description: "Erreur lors de la suppression de tous les plats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    checkDatabaseConnection();
    // Removed automatic loading of menu items
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="h-8 w-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-800">Page Temporaire - Base de Données PostgreSQL</h1>
          </div>
          
          {/* Database Status */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              dbStatus === 'connected' ? 'bg-green-100 text-green-800 border border-green-300' :
              dbStatus === 'disconnected' ? 'bg-red-100 text-red-800 border border-red-300' :
              'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`}>
              {dbStatus === 'connected' ? <CheckCircle className="h-5 w-5" /> :
               dbStatus === 'disconnected' ? <XCircle className="h-5 w-5" /> :
               <RefreshCw className="h-5 w-5 animate-spin" />}
              <span className="font-semibold">
                {dbStatus === 'connected' ? 'Base de données connectée' :
                 dbStatus === 'disconnected' ? 'Base de données déconnectée' :
                 'Vérification de la connexion...'}
              </span>
            </div>
            
            <Button 
              onClick={checkDatabaseConnection} 
              variant="outline" 
              size="sm"
              disabled={dbStatus === 'checking'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tester la connexion
            </Button>
          </div>

          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Page Temporaire - Base de Données Réelle</span>
            </div>
            <p className="text-orange-700 text-sm">
              Cette page se connecte directement à votre base de données PostgreSQL. 
              Accès manuel via: <code className="bg-orange-200 px-2 py-1 rounded">/temp-db-fill</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {isEditing ? "Modifier le Plat" : "Ajouter un Nouveau Plat"}
              </CardTitle>
              <CardDescription className="text-orange-100">
                Remplissez les informations du plat
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du Plat *</Label>
                    <Input
                      id="name"
                      value={currentItem.name}
                      onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                      placeholder="Ex: Couscous Royal"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={currentItem.category} onValueChange={(value) => setCurrentItem({...currentItem, category: value})}>
                      <SelectTrigger disabled={loading}>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    placeholder="Décrivez le plat, ses ingrédients, sa préparation..."
                    rows={3}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                           <Label htmlFor="price">Prix (DZD) *</Label>
                     <Input
                       id="price"
                       type="number"
                       step="0.01"
                       min="0"
                       value={currentItem.price}
                       onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                                               placeholder="1500.00 DZD"
                       required
                       disabled={loading}
                     />
                   </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image du Plat</Label>
                    <div className="space-y-3">
                      {/* URL Input */}
                      <Input
                        id="image_url"
                        type="url"
                        value={currentItem.image_url}
                        onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg ou choisissez un fichier"
                        disabled={loading}
                      />
                      
                                             {/* File Upload Section - No size limit */}
                       <div className="space-y-2">
                         <div className="text-xs text-gray-500 mb-2">
                           💡 Aucune limite de taille - Images de haute qualité acceptées
                         </div>
                         <div className="flex gap-2">
                           <Button
                             type="button"
                             variant="outline"
                             size="sm"
                             onClick={() => document.getElementById('image-file-input')?.click()}
                             disabled={loading}
                             className="flex-1"
                           >
                             📁 Choisir Image
                           </Button>
                          {currentItem.image_url && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentItem({...currentItem, image_url: ""})}
                              disabled={loading}
                            >
                              🗑️ Effacer
                            </Button>
                          )}
                        </div>
                        
                        {/* Hidden file input */}
                        <input
                          id="image-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileSelect}
                        />
                        
                        {/* Image Preview */}
                        {currentItem.image_url && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">Aperçu:</span>
                              <span className="text-xs text-gray-500">
                                {currentItem.image_url.startsWith('data:') ? 'Fichier local' : 'URL externe'}
                              </span>
                            </div>
                            <img
                              src={currentItem.image_url}
                              alt="Aperçu du plat"
                              className="w-24 h-24 object-cover rounded border mx-auto"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={currentItem.available}
                    onCheckedChange={(checked) => setCurrentItem({...currentItem, available: checked})}
                    disabled={loading}
                  />
                  <Label htmlFor="available">Disponible</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                    disabled={loading || dbStatus !== 'connected'}
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? "Mettre à Jour" : "Ajouter"}
                  </Button>
                  
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="flex-1"
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Actions Base de Données
              </CardTitle>
              <CardDescription className="text-blue-100">
                Gérer et exporter les données
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{menuItems.length}</div>
                  <div className="text-blue-600">Plats dans la base de données</div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={loadMenuItems} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading || dbStatus !== 'connected'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recharger depuis la DB
                  </Button>
                  
                  <Button 
                    onClick={exportToJSON} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={menuItems.length === 0 || loading}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Exporter en JSON
                  </Button>
                  
                  <Button 
                    onClick={clearAll} 
                    variant="destructive" 
                    className="w-full"
                    disabled={menuItems.length === 0 || loading || dbStatus !== 'connected'}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider Toute la Base
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items List */}
        {menuItems.length > 0 && (
          <Card className="mt-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Liste des Plats ({menuItems.length})
              </CardTitle>
              <CardDescription className="text-green-100">
                Tous les plats de la base de données
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="border-2 hover:border-orange-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => item.id && handleDelete(item.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                          {item.category}
                        </span>
                                                 <span className="font-bold text-lg text-green-600">
                                                       {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)} DZD
                         </span>
                      </div>
                      
                                               <div className="flex justify-between items-center mt-2">
                           <Button
                             size="sm"
                             variant={item.available ? "default" : "secondary"}
                             onClick={() => item.id && handleToggleAvailability(item.id, item.available)}
                             disabled={loading}
                             className="text-xs"
                           >
                             {item.available ? '✅ Disponible' : '❌ Non disponible'}
                           </Button>
                           
                           {/* Image indicator */}
                           {(item.image_url || (item as any).images) && (
                             <div className="flex items-center gap-1">
                               <span className="text-xs text-blue-600">📷</span>
                               <span className="text-xs text-gray-500">
                                 {item.image_url?.startsWith('data:') ? 'Fichier local' : 
                                  (item as any).images ? 'Laravel Storage' : 'URL'}
                               </span>
                             </div>
                           )}
                         </div>
                         
                         {/* Image preview in card */}
                         {(item.image_url || (item as any).images) && (
                           <div className="mt-3 pt-3 border-t border-gray-200">
                             <img
                               src={
                                 item.image_url || 
                                 ((item as any).images && Array.isArray((item as any).images) && (item as any).images.length > 0 
                                   ? `http://localhost:8000${(item as any).images[0]}` 
                                   : '')
                               }
                               alt={item.name}
                               className="w-full h-32 object-cover rounded border"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                               }}
                             />
                           </div>
                         )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Items Message */}
        {menuItems.length === 0 && !loading && dbStatus === 'connected' && (
          <Card className="mt-8 shadow-lg">
            <CardContent className="p-8 text-center">
              <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun plat trouvé</h3>
              <p className="text-gray-500">Commencez par ajouter votre premier plat au menu!</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="mt-8 shadow-lg">
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Chargement en cours...</h3>
              <p className="text-gray-500">Veuillez patienter pendant le traitement de votre demande.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TempDatabaseFill;
