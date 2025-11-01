# Menu Items Images

This folder contains all menu item images uploaded through the system.

## Structure:
- Images are automatically organized by date
- Original filenames are preserved
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB per image

## Naming Convention:
- Format: `YYYY-MM-DD_HH-MM-SS_original-name.ext`
- Example: `2024-08-29_14-30-25_couscous-royal.jpg`

## Usage:
1. Upload image through the form
2. Image is automatically copied to this folder
3. URL is stored in database as: `/images/menu-items/filename.ext`
4. Image can be accessed via: `http://localhost:8080/images/menu-items/filename.ext`


