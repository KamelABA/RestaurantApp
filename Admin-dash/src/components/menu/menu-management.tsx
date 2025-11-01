import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { ImageCarousel } from "@/components/ui/image-carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChefHat,
  Clock,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { listDishes, deleteDish, deleteImage } from './dishes';
import coqAuVinImage from "@/assets/coq-au-vin.jpg";
import onionSoupImage from "@/assets/onion-soup.jpg";
import tarteTatinImage from "@/assets/tarte-tatin.jpg";

interface Dish {
  id: number;
  name: string;
  price: string;
  category?: string | null;
  images?: string[] | null;
  is_available: boolean;
  average_rating?: number;
  total_ratings?: number;
}

// Database dishes will be loaded via useEffect

const categoryColors = {
  "Entrées": "success",
  "Plats principaux": "primary",
  "Desserts": "warning",
  "Boissons": "accent"
} as const;

export function MenuManagement() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  // Load dishes from database
  const loadDishes = async () => {
    try {
      const { data } = await listDishes();
      setDishes(data);
    } catch (error) {
      console.error('Error loading dishes:', error);
      toast({
        title: "Error",
        description: "Failed to load dishes",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadDishes();
  }, []);

  const categories = [
    t('menu.all'),
    ...Array.from(new Set(dishes.map(dish => dish.category || 'Uncategorized')))
  ];

  const filteredDishes = dishes.filter(dish => {
    const dishName = dish.name;
    const dishCategory = dish.category || 'Uncategorized';
    const matchesSearch = dishName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === t('menu.all') || dishCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = (dishId: number) => {
    setDishes(dishes.map(dish =>
      dish.id === dishId
        ? { ...dish, is_available: !dish.is_available }
        : dish
    ));

    const dish = dishes.find(d => d.id === dishId);
    const dishName = dish?.name;
    toast({
      title: dish?.is_available ? t('menu.removedFromMenu') : t('menu.addedToMenu'),
      description: `${dishName} ${dish?.is_available ? t('menu.isNowUnavailable') : t('menu.isNowAvailable')}`,
    });
  };

  const handleDeleteClick = (dish: Dish) => {
    setDishToDelete(dish);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dishToDelete) return;
    
    try {
      // Delete the dish from database
      await deleteDish(dishToDelete.id);
      
      // Delete the images from storage if they exist
      if (dishToDelete.images && dishToDelete.images.length > 0) {
        try {
          for (const imageUrl of dishToDelete.images) {
            await deleteImage(imageUrl);
          }
        } catch (imageError) {
          console.error('Error deleting images:', imageError);
          // Don't fail the entire operation if image deletion fails
        }
      }
      
      // Update UI
      setDishes(dishes.filter(dish => dish.id !== dishToDelete.id));
      toast({
        title: t('menu.dishDeleted'),
        description: `${dishToDelete.name} ${t('menu.dishDeletedText')}`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast({
        title: "Error",
        description: "Failed to delete dish",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setDishToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDishToDelete(null);
  };

  const handleEditDish = (dish: Dish) => {
    // Navigate to addmenu page with dish data to pre-fill the form
    navigate("/addmenu", { 
      state: { 
        editMode: true,
        dish: {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          category: dish.category || '',
          is_available: dish.is_available,
          images: dish.images // Pass the images array
        }
      } 
    });
  };

  const handleRemoveDish = (dish: Dish) => {
    handleDeleteClick(dish);
  };
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('menu.title')}</h2>
          <p className="text-muted-foreground">{t('menu.subtitle')}</p>
        </div>
        <Button
          onClick={() => navigate("/addmenu")}
          className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('menu.newDish')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('menu.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-gradient-primary" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDishes.map((dish) => (
          <Card
            key={dish.id}
            className={`transition-all duration-200 hover:shadow-soft hover:-translate-y-1 ${!dish.is_available ? 'opacity-60' : ''
              }`}
          >
            <CardHeader className="pb-3">
              <div className="mb-4">
                <ImageCarousel
                  images={dish.images ? dish.images.map(img => `http://127.0.0.1:8000${img}`) : []}
                  alt={dish.name}
                />
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-primary" />
                    {dish.name}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className={`mt-2 ${categoryColors[dish.category as keyof typeof categoryColors] === 'primary' ? 'bg-primary/10 text-primary' :
                        categoryColors[dish.category as keyof typeof categoryColors] === 'success' ? 'bg-success/10 text-success' :
                          categoryColors[dish.category as keyof typeof categoryColors] === 'warning' ? 'bg-warning/10 text-warning' :
                            'bg-accent/10 text-accent'
                      }`}
                  >
                    {dish.category || 'Uncategorized'}
                  </Badge>
                </div>
                <Badge
                  variant={dish.is_available ? "default" : "secondary"}
                  className={dish.is_available ? "bg-success text-success-foreground" : ""}
                >
                  {dish.is_available ? t('menu.available') : t('menu.unavailable')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">No description available</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-primary">
                  <span className="font-semibold">{Number(dish.price)} Da</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>N/A min</span>
                </div>
              </div>

              {/* Rating Display */}
              <div className="flex items-center justify-between">
                <StarRating 
                  rating={dish.average_rating || 0} 
                  totalRatings={dish.total_ratings || 0}
                  size="sm"
                  showCount={true}
                  interactive={false}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditDish(dish)}>
                  <Edit className="w-4 h-4 mr-1" />
                  {t('menu.edit')}
                </Button>
                <Button
                  variant={dish.is_available ? "outline" : "default"}
                  size="sm"
                  onClick={() => handleToggleAvailability(dish.id)}
                  className={!dish.is_available ? "bg-success hover:bg-success/90" : ""}
                >
                  {dish.is_available ? t('menu.remove') : t('menu.activate')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(dish)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('menu.noResults')}</h3>
            <p className="text-muted-foreground">
              {t('menu.noResultsText')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{dishToDelete?.name}" ? 
              Cette action supprimera également l'image associée et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}