const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create SQLite database connection
const dbPath = path.join(__dirname, 'restaurant.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create a simple pool-like interface for compatibility
const pool = {
  query: (text, params = []) => {
    return new Promise((resolve, reject) => {
      if (typeof text === 'string' && text.trim().toUpperCase().startsWith('SELECT')) {
        db.all(text, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows });
          }
        });
      } else {
        db.run(text, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      }
    });
  }
};

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create menu_items table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL CHECK (price > 0),
        category TEXT NOT NULL,
        image_url TEXT,
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create index for better performance
      CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
      CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
    `;

    await pool.query(createTableQuery);
    console.log('✅ Database tables initialized successfully');



    // Insert sample data if table is empty
    const checkDataQuery = 'SELECT COUNT(*) as count FROM menu_items';
    const result = await pool.query(checkDataQuery);
    
    if (parseInt(result.rows[0].count) === 0) {
      await insertSampleData();
      console.log('✅ Sample data inserted successfully');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}



// Insert sample menu items
async function insertSampleData() {
  const sampleItems = [
    {
      name: 'Steak Grillé',
      description: 'Filet de bœuf grillé aux légumes de saison, servi avec sauce au poivre',
      price: 28.50,
      category: 'Plats Principaux',
      image_url: null, // Will use fallback image from frontend
      available: true
    },
    {
      name: 'Salade César',
      description: 'Laitue romaine, parmesan, croûtons et sauce césar maison',
      price: 14.90,
      category: 'Salades',
      image_url: null, // Will use fallback image from frontend
      available: true
    },
    {
      name: 'Soupe à l\'Oignon',
      description: 'Soupe traditionnelle française au fromage fondu et croûtons dorés',
      price: 9.80,
      category: 'Entrées',
      image_url: null, // Will use fallback image from frontend
      available: true
    },
    {
      name: 'Dessert Chocolat',
      description: 'Fondant au chocolat avec fruits rouges et crème anglaise',
      price: 8.50,
      category: 'Desserts',
      image_url: null, // Will use fallback image from frontend
      available: true
    }
  ];

  for (const item of sampleItems) {
    const insertQuery = `
      INSERT INTO menu_items (name, description, price, category, image_url, available)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await pool.query(insertQuery, [
      item.name,
      item.description,
      item.price,
      item.category,
      item.image_url,
      item.available
    ]);
  }
}

module.exports = {
  pool,
  initializeDatabase
};

