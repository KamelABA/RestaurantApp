# Images Directory

This folder contains all uploaded images.

## Structure:
- Images are automatically organized by date
- Original filenames are preserved
- Supported formats: JPG, PNG, GIF, WebP

## Naming Convention:
- Format: `YYYY-MM-DD_HH-MM-SS_original-name.ext`
- Example: `2024-08-29_14-30-25_couscous-royal.jpg`

## Usage:
1. Upload image through the API
2. Image is automatically saved to this folder
3. URL is stored in database as: `/images/filename.ext`
4. Image can be accessed via: `http://localhost:8080/images/filename.ext`


