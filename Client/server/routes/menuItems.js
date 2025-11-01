const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Get all menu items
router.get('/all', async (req, res) => {
  try {
    const query = `
      SELECT id, name, description, price, category, image_url, available, 
             created_at, updated_at
      FROM menu_items 
      ORDER BY category, name
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get all unique categories from menu items
router.get('/categories/all', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category, COUNT(*) as item_count
      FROM menu_items 
      WHERE available = true
      GROUP BY category 
      ORDER BY category ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get menu items by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const query = `
      SELECT id, name, description, price, category, image_url, available, 
             created_at, updated_at
      FROM menu_items 
      WHERE category = $1 AND available = true
      ORDER BY name
    `;
    
    const result = await pool.query(query, [category]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching menu items by category:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT id, name, description, price, category, image_url, available, 
             created_at, updated_at
      FROM menu_items 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Add new menu item
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, category, image_url, available } = req.body;
    
    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'description', 'price', 'category']
      });
    }
    
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }
    
    const insertQuery = `
      INSERT INTO menu_items (name, description, price, category, image_url, available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, price, category, image_url, available, 
                created_at, updated_at
    `;
    
    const values = [name, description, price, category.trim(), image_url || null, available !== undefined ? available : true];
    const result = await pool.query(insertQuery, values);
    
    res.status(201).json({
      success: true,
      message: 'Menu item added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update menu item
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, available } = req.body;
    
    // Check if item exists
    const checkQuery = 'SELECT id FROM menu_items WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    
    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['name', 'description', 'price', 'category']
      });
    }
    
    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be greater than 0'
      });
    }
    
    const updateQuery = `
      UPDATE menu_items 
      SET name = $1, description = $2, price = $3, category = $4, 
          image_url = $5, available = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id, name, description, price, category, image_url, available, 
                created_at, updated_at
    `;
    
    const values = [name, description, price, category.trim(), image_url || null, available !== undefined ? available : true, id];
    const result = await pool.query(updateQuery, values);
    
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete menu item
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const checkQuery = 'SELECT id FROM menu_items WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    
    const deleteQuery = 'DELETE FROM menu_items WHERE id = $1';
    await pool.query(deleteQuery, [id]);
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Toggle menu item availability
router.patch('/toggle/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists
    const checkQuery = 'SELECT id, available FROM menu_items WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Menu item not found'
      });
    }
    
    const currentStatus = checkResult.rows[0].available;
    const newStatus = !currentStatus;
    
    const toggleQuery = `
      UPDATE menu_items 
      SET available = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, available
    `;
    
    const result = await pool.query(toggleQuery, [newStatus, id]);
    
    res.json({
      success: true,
      message: `Menu item ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling menu item availability:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get menu statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN available = true THEN 1 END) as available_items,
        COUNT(CASE WHEN available = false THEN 1 END) as unavailable_items,
        COUNT(DISTINCT category) as total_categories,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM menu_items
    `;
    
    const result = await pool.query(statsQuery);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching menu statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;

