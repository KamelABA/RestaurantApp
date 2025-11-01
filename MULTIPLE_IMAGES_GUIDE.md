# Multiple Images Feature Guide

## Overview
The restaurant management system now supports multiple images per dish with a carousel display.

## Backend Changes

### Database Structure
- Changed `image_url` column to `images` (JSON array)
- Stores multiple image URLs as an array

### API Endpoints
- `POST /api/dishes` - Create dish with multiple images
- `PUT /api/dishes/{id}` - Update dish with multiple images
- `DELETE /api/dishes/{id}` - Delete dish and all associated images

### File Upload Format
```javascript
// Frontend FormData
const formData = new FormData();
formData.append('name', 'Dish Name');
formData.append('price', '25.00');
formData.append('images[]', file1);
formData.append('images[]', file2);
formData.append('images[]', file3);
```

## Frontend Features

### Image Upload (AddMenu)
- Multiple file selection
- Image preview grid
- Drag & drop support
- File validation (max 2MB per image)

### Image Display (MenuManagement)
- Carousel with navigation arrows
- Thumbnail dots for quick navigation
- Image counter (e.g., "2/5")
- Fullscreen mode on click
- Hover effects for navigation

### Carousel Features
- **Navigation**: Left/right arrows
- **Dots**: Click to jump to specific image
- **Counter**: Shows current position
- **Fullscreen**: Click image to view large
- **Responsive**: Works on all devices

## Usage Examples

### Adding New Dish with Multiple Images
1. Go to "Ajouter un nouveau plat"
2. Fill in dish details
3. Select multiple images using file input
4. Preview images in grid
5. Submit form

### Viewing Dishes with Carousel
1. Go to menu management
2. Each dish card shows carousel
3. Hover to see navigation arrows
4. Click image for fullscreen view
5. Use arrows or dots to navigate

## Technical Details

### Image Storage
- Images stored in `storage/app/public/dishes/`
- URLs stored as `/storage/dishes/filename.jpg`
- Automatic cleanup when dish is deleted

### Validation
- Max 2MB per image
- Only image files allowed
- Multiple images supported

### Performance
- Lazy loading for better performance
- Optimized image display
- Efficient storage management
