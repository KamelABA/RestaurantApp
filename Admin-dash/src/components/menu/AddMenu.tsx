import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { createDish, updateDish } from './dishes';
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AddMenu() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  interface Dish {
    id: number;
    name: string;
    price: string;
    category?: string | null;
    images?: string[] | null;
    is_available: boolean;
  }

  interface DishForm {
    id?: number | null;
    name: string;
    price: string;
    category: string;
    is_available: boolean;
    images?: File[] | null;
  }

  const [form, setForm] = useState<DishForm>({
    id: null,
    name: '',
    price: '',
    category: '',
    is_available: true,
    images: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => { 
    // Check if we're in edit mode and pre-fill the form
    if (location.state?.editMode && location.state?.dish) {
      const dishData = location.state.dish;
      setForm({
        id: dishData.id,
        name: dishData.name,
        price: dishData.price,
        category: dishData.category || '',
        is_available: dishData.is_available,
        images: null
      });
      // Set the existing images if available
      if (dishData.images && dishData.images.length > 0) {
        setSelectedImages(dishData.images.map(img => `http://127.0.0.1:8000${img}`));
      }
    }
  }, [location.state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Add new files to existing ones
      const existingFiles = form.images || [];
      const newFiles = [...existingFiles, ...files];
      setForm({ ...form, images: newFiles });
      
      // Create preview URLs for new files
      const newPreviews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setSelectedImages([...selectedImages, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    // Clear the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      // Add new files to existing ones
      const existingFiles = form.images || [];
      const newFiles = [...existingFiles, ...files];
      setForm({ ...form, images: newFiles });
      
      // Create preview URLs for new files
      const newPreviews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setSelectedImages([...selectedImages, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newFiles = form.images?.filter((_, i) => i !== index) || [];
    const newPreviews = selectedImages.filter((_, i) => i !== index);
    setForm({ ...form, images: newFiles });
    setSelectedImages(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category', form.category || '');
    formData.append('is_available', form.is_available ? '1' : '0');

    if (form.images) {
      form.images.forEach(image => {
        formData.append('images[]', image);
      });
    }

    // Debug: Log what we're sending
    console.log('Form data being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      if (form.id) {
        await updateDish(form.id, formData);
        toast({
          title: "Success",
          description: "Dish updated successfully!",
        });
      } else {
        await createDish(formData);
        toast({
          title: "Success",
          description: "Dish created successfully!",
        });
      }
      
      // Reset form
      setForm({ id: null, name: '', price: '', category: '', is_available: true, images: null });
      setSelectedImages([]);
      
      // Clear the location state after successful submission
      navigate("/addmenu", { replace: true });
    } catch (err: any) {
      console.error('Error submitting form:', err);
      
      // Log detailed error information
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to save dish. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!form.id;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background to-muted p-4 ${language === 'ar' ? 'font-arabic' : ''}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? "العودة" : "Retour"}
          </Button>
          <ThemeToggle />
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-bold">
                {isEditMode 
                  ? (language === 'ar' ? "تعديل الطبق" : "Modifier le plat")
                  : (language === 'ar' ? "إضافة طبق جديد" : "Ajouter un nouveau plat")
                }
              </CardTitle>
            </div>
            <p className="text-muted-foreground">
              {isEditMode 
                ? "Modifiez les informations du plat"
                : "Remplissez les informations pour créer un nouveau plat"
              }
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dish Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {language === 'ar' ? "اسم الطبق" : "Nom du plat"}
                </Label>
                <Input
                  id="name"
                  placeholder={language === 'ar' ? "أدخل اسم الطبق" : "Entrez le nom du plat"}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  {language === 'ar' ? "السعر" : "Prix"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder={language === 'ar' ? "أدخل السعر" : "Entrez le prix"}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  className="h-12"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  {language === 'ar' ? "الفئة" : "Catégorie"}
                </Label>
                <Input
                  id="category"
                  placeholder={language === 'ar' ? "أدخل الفئة" : "Entrez la catégorie"}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                                                  <Label htmlFor="images" className="text-sm font-medium">
                   {language === 'ar' ? "صور الطبق" : "Images du plat"}
                 </Label>
                 <div className="space-y-4">
                                       {/* Image Preview */}
                    {selectedImages.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' 
                              ? `${selectedImages.length} صورة محددة` 
                              : `${selectedImages.length} image(s) sélectionnée(s)`
                            }
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                   
                   {/* File Input */}
                   <div className="relative">
                     <div 
                       className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors"
                       onDragOver={handleDragOver}
                       onDrop={handleDrop}
                     >
                       <input
                         id="images"
                         type="file"
                         accept="image/*"
                         multiple
                         onChange={handleImageChange}
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       />
                                               <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {language === 'ar' ? "أضف صورة جديدة" : "Ajouter une nouvelle image"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {language === 'ar' ? "اختر صورة أو اسحبها هنا" : "Choisissez une image ou glissez-la ici"}
                            </p>
                          </div>
                        </div>
                     </div>
                   </div>
                 </div>
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_available"
                  checked={form.is_available}
                  onCheckedChange={(checked) => setForm({ ...form, is_available: checked as boolean })}
                />
                <Label htmlFor="is_available" className="text-sm font-medium">
                  {language === 'ar' ? "متاح" : "Disponible"}
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {language === 'ar' ? "جاري الحفظ..." : "Enregistrement..."}
                  </div>
                ) : (
                  isEditMode 
                    ? (language === 'ar' ? "تحديث الطبق" : "Mettre à jour")
                    : (language === 'ar' ? "إضافة الطبق" : "Ajouter le plat")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
