const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Simple image upload endpoint (no size limit)
router.post('/upload', (req, res) => {
  try {
    // Get image data from request body (base64 or URL)
    const { imageData, imageType, fileName } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided'
      });
    }

    // Log file size for debugging (no limit check)
    const dataSizeMB = (Buffer.byteLength(imageData, 'utf8') / (1024 * 1024)).toFixed(2);
    console.log(`📸 Uploading image: ${fileName || 'unnamed'} - Size: ${dataSizeMB}MB`);

    // Create images directory if it doesn't exist
    const imagesDir = path.join(__dirname, '../public/images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const extension = imageType || '.jpg';
    const filename = `${timestamp}_${fileName || 'image'}${extension}`;
    const filePath = path.join(imagesDir, filename);

    // Save image data
    if (imageData.startsWith('data:')) {
      // Base64 image data
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else {
      // URL or other data
      fs.writeFileSync(filePath, imageData);
    }

    // Return success response
    const imageUrl = `/images/${filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: filename,
        url: imageUrl,
        fullUrl: `http://localhost:8080${imageUrl}`,
        size: fs.statSync(filePath).size
      }
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error.message
    });
  }
});

// Get all images
router.get('/list', (req, res) => {
  try {
    const imagesDir = path.join(__dirname, '../public/images');
    
    if (!fs.existsSync(imagesDir)) {
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    const files = fs.readdirSync(imagesDir);
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      })
      .map(file => {
        const stats = fs.statSync(path.join(imagesDir, file));
        return {
          filename: file,
          url: `/images/${file}`,
          fullUrl: `http://localhost:8080/images/${file}`,
          size: stats.size,
          uploadedAt: stats.birthtime
        };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({
      success: true,
      data: images,
      count: images.length
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get images',
      message: error.message
    });
  }
});

module.exports = router;
