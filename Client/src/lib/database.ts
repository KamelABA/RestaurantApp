// Database connection configuration
export const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'RestaurantMangement',
  user: 'postgres',
  password: 'admin'
};

// API endpoints for database operations
export const API_ENDPOINTS = {
  menuItems: '/api/dishes',
  addMenuItem: '/api/dishes',
  updateMenuItem: '/api/dishes',
  deleteMenuItem: '/api/dishes',
  getAllMenuItems: '/api/dishes'
};

// Database table structure for menu items
export interface MenuItemDB {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

// Form interface for adding/editing menu items
export interface MenuItemForm {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  available: boolean;
}

// Database operations
export class DatabaseService {
  private static baseURL = 'http://localhost:8000'; // Backend server URL

  // Add new menu item
  static async addMenuItem(item: MenuItemForm): Promise<MenuItemDB> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.addMenuItem}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  }

  // Update existing menu item
  static async updateMenuItem(id: number, item: MenuItemForm): Promise<MenuItemDB> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.updateMenuItem}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  }

  // Delete menu item
  static async deleteMenuItem(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.deleteMenuItem}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  }

  // Get all menu items
  static async getAllMenuItems(): Promise<MenuItemDB[]> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.getAllMenuItems}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Laravel returns the data directly, not wrapped in a data property
      return result || [];
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  }

  // Test database connection
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/test`);
      return response.ok;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}
