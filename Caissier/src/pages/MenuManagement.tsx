import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, ArrowLeft, Upload, Image as ImageIcon, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * ✅ Server Connection Status
 * 
 * Connected to EXISTING SERVER in server folder
 * Table: menu_items
 * 
 * API Endpoints (using existing server):
 * - GET /api/menu_items - Load all menu items
 * - POST /api/menu_items - Add new menu item
 * - PUT /api/menu_items/:id - Update menu item
 * - DELETE /api/menu_items/:id - Delete menu item
 * 
 * Status: 🟢 CONNECTED TO EXISTING SERVER
 * Server: http://192.168.1.16:3001 (from server folder)
 * Table: menu_items
 */

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  available: boolean;
  image?: string;
  image_url?: string; // Add support for image_url from server
}

// Helper function to safely format price
const formatPrice = (price: number | string): string => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  const numPrice = parseFloat(price || '0');
  return numPrice.toFixed(2);
};

interface MenuManagementProps {
  currentUser: string;
  onLogout: () => void;
}

export const MenuManagement = ({ currentUser, onLogout }: MenuManagementProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
    image: ""
  });

  const [categories, setCategories] = useState<string[]>([]);

  // Load menu items and categories from server
  useEffect(() => {
    loadMenuItems();
  }, [currentUser]);

  // Load categories after menu items are loaded
  useEffect(() => {
    if (menuItems.length > 0) {
      loadCategories();
    }
  }, [menuItems]);



  // Ensure edit modal closes when editingItem is reset
  useEffect(() => {
    if (!editingItem) {
      setIsEditModalOpen(false);
    }
  }, [editingItem]);

  // API Base URL - Using same pattern as first project
  const API_BASE = 'http://192.168.1.16:3001/api';

  // Load menu items from database
  const loadMenuItems = async () => {
    setIsLoading(true);
    
    try {
      
      // Connect to existing server using same pattern as first project
      const response = await fetch(`${API_BASE}/menu-items/all`);
      
      
      if (response.ok) {
        const data = await response.json();
        // Handle the same response structure as first project
        const menuData = data.data || data;
        
        // Convert price to number for all menu items
        const processedMenuData = menuData.map((item: any) => ({
          ...item,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
          id: item.id?.toString() || item.id,
          // Handle both image and image_url properties consistently
          image: item.image || item.image_url || '',
          image_url: item.image || item.image_url || ''
        }));
        
        setMenuItems(processedMenuData);
        
        // Extract categories from loaded menu items as fallback
        if (processedMenuData.length > 0) {
          const extractedCategories = Array.from(new Set(processedMenuData.map((item: any) => item.category)));
          if (extractedCategories.length > 0) {
            setCategories(extractedCategories);
          }
        }
        
        toast("Menu chargé avec succès depuis le serveur");
      } else {
        throw new Error(`Server responded with status: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      
      // Check specific error types
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        toast("Erreur de connexion: Impossible de joindre le serveur. Vérifiez que le serveur est démarré sur 192.168.1.16:3001");
      } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        toast("Erreur réseau: Problème de connexion au serveur");
      } else if (error.message.includes('CORS')) {
        toast("Erreur CORS: Le serveur n'autorise pas la connexion depuis cette origine");
      } else {
        toast(`Erreur de connexion: ${error.message}`);
      }
      
      // Show empty state instead of mock data
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleImageUpload called', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log('File read result length:', result.length);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: "" }));
  };

  // Function to load categories from server
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/menu-items/categories/all`);
      
      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.data.map((cat: any) => cat.category);
        setCategories(categoryNames);
      } else {
        console.warn('Failed to load categories from server');
      }
    } catch (error) {
      console.warn('Error loading categories:', error);
    }
  };

  // Function to add new category if it doesn't exist
  const addNewCategory = (newCategory: string) => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
      // Show success message
      toast(`Nouvelle catégorie "${newCategory}" ajoutée avec succès!`);
    }
  };



  // Add new menu item
  const handleAddItem = async () => {
    if (!formData.name || !formData.description || !formData.category || parseFloat(formData.price) <= 0) {
      toast("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setIsLoading(true);
      
      // Using same API pattern as first project
      const response = await fetch(`${API_BASE}/menu-items/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image || '',
          available: formData.available
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the same response structure as first project
        const newItem = data.data || data;
        setMenuItems(prev => [...prev, newItem]);
        toast("Menu item ajouté avec succès");
        setIsAddModalOpen(false);
        resetForm();
      } else {
        throw new Error(`Failed to add menu item: ${response.status}`);
      }
    } catch (error) {
      toast("Erreur lors de l'ajout du menu item");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit menu item
  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.description || !formData.category || parseFloat(formData.price) <= 0) {
      toast("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Editing item with form data:', formData);
      console.log('Current editing item:', editingItem);
      
      // Using same API pattern as first project
      const response = await fetch(`${API_BASE}/menu-items/update/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: formData.image || '',
          available: formData.available
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle the same response structure as first project
        const updatedItem = data.data || data;
        
        console.log('Server response:', updatedItem);
        
        // Ensure the updated item has the correct image data
        const finalUpdatedItem = {
          ...updatedItem,
          // Preserve the image data from formData
          image: formData.image || updatedItem.image || updatedItem.image_url || '',
          image_url: formData.image || updatedItem.image_url || ''
        };
        
        console.log('Final updated item:', finalUpdatedItem);
        
        // Update menu items list
        setMenuItems(prev => prev.map(item => 
          item.id === editingItem.id ? finalUpdatedItem : item
        ));
        
        // Close modal and reset state
        setIsEditModalOpen(false);
        setEditingItem(null);
        resetForm();
        
        // Show success message
        toast("Menu item mis à jour avec succès");
        
        console.log('Edit successful, modal closed, state reset');
      } else {
        const errorText = await response.text();
        console.error('Edit failed:', response.status, errorText);
        throw new Error(`Failed to update menu item: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast("Erreur lors de la mise à jour du menu item");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete menu item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article?")) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Using same API pattern as first project
      const response = await fetch(`${API_BASE}/menu-items/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        toast("Article supprimé avec succès");
      } else {
        throw new Error(`Failed to delete menu item: ${response.status}`);
      }
    } catch (error) {
      toast("Erreur lors de la suppression du menu item");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (item: MenuItem) => {
    console.log('Opening edit modal for item:', item);
    console.log('Item image data:', { image: item.image, image_url: item.image_url });
    
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      available: item.available,
      // Handle both image and image_url properties
      image: item.image || item.image_url || ""
    });
    setIsEditModalOpen(true);
    console.log('Edit modal opened, editingItem set to:', item.id);
    console.log('Form data set with image:', item.image || item.image_url || "");
  };

  const resetForm = () => {
    console.log('Resetting form data');
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
      image: ""
    });
    console.log('Form data reset complete');
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Gestion du Menu</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Connecté en tant que: <span className="font-medium text-foreground">{currentUser}</span>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            Déconnexion
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>Chargement du menu depuis le serveur...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="space-y-4">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900">Aucun article trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all" 
                ? "Aucun article ne correspond à votre recherche ou filtre."
                : "La base de données est vide. Commencez par ajouter votre premier article !"
              }
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Ajouter le premier article
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              {/* Image Section */}
              <div className="relative h-48 bg-gray-100">
                {(item.image || item.image_url) ? (
                  <img 
                    src={item.image || item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${(item.image || item.image_url) ? 'hidden' : ''}`}>
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                </div>
                <Badge 
                  variant={item.available ? "default" : "secondary"}
                  className="absolute top-2 right-2"
                >
                  {item.available ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(item.price)} DZD
                  </span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(item)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] w-[95vw] sm:w-auto overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Ajouter un article au menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-4">
            <Input
              placeholder="Nom de l'article"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Prix"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Nouvelle catégorie"
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, category: value }));
                    // Add to categories if it's a new one
                    if (value && !categories.includes(value)) {
                      addNewCategory(value);
                    }
                  }}
                  className={`flex-1 ${formData.category && !categories.includes(formData.category) ? 'border-green-500 bg-green-50' : ''}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sélectionnez une catégorie existante ou tapez une nouvelle
              </p>
              {formData.category && !categories.includes(formData.category) && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Nouvelle catégorie : "{formData.category}"
                </div>
              )}
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image du plat</label>
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Cliquez pour télécharger une image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-add"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('image-upload-add')?.click()}
                  >
                    Choisir une image
                  </Button>
                </div>
              )}
              {/* Debug info */}
              {formData.image && (
                <p className="text-xs text-gray-500">
                  Image sélectionnée: {formData.image.substring(0, 50)}...
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="available" className="text-sm font-medium">
                Disponible à la commande
              </label>
            </div>
            
            <div className="flex gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleAddItem} className="flex-1">
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] w-[95vw] sm:w-auto overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Modifier l'article</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-track-gray-50 pb-4">
            <Input
              placeholder="Nom de l'article"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Prix"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Nouvelle catégorie"
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ ...prev, category: value }));
                    // Add to categories if it's a new one
                    if (value && !categories.includes(value)) {
                      addNewCategory(value);
                    }
                  }}
                  className={`flex-1 ${formData.category && !categories.includes(formData.category) ? 'border-green-500 bg-green-50' : ''}`}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Sélectionnez une catégorie existante ou tapez une nouvelle
              </p>
              {formData.category && !categories.includes(formData.category) && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Nouvelle catégorie : "{formData.category}"
                </div>
              )}
            </div>
            
            {/* Image Upload Section for Edit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image du plat</label>
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Cliquez pour télécharger une image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('edit-image-upload')?.click()}
                  >
                    Choisir une image
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-available"
                checked={formData.available}
                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="edit-available" className="text-sm font-medium">
                Disponible à la commande
              </label>
            </div>
            
            <div className="flex gap-2 pt-4 border-t bg-white sticky bottom-0">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleEditItem} className="flex-1">
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
