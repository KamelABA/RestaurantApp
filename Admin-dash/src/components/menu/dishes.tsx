import api from '../../api';

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


export const listDishes = () => api.get<Dish[]>('/dishes');

export const getDish = (id: number) => api.get<Dish>(`/dishes/${id}`);

export const createDish = (data: FormData) => api.post<Dish>('/dishes', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateDish = (id: number, data: FormData) => api.put<Dish>(`/dishes/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const deleteDish = (id: number) => api.delete(`/dishes/${id}`);

export const deleteImage = (imageUrl: string) => api.delete(`/delete-image`, {
  data: { image_url: imageUrl }
});

// Rating functions
export const addRating = (data: { dish_id: number; rating: number; comment?: string }) => 
  api.post('/ratings', data);

export const getDishRatings = (dishId: number) => 
  api.get(`/dishes/${dishId}/ratings`);

export const getAllRatings = () => 
  api.get('/ratings');