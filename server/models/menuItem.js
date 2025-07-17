const { pool } = require('../config/database');

class MenuItem {
  // Get all menu items
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, description, price FROM menu_items ORDER BY name'
      );
      // Convert price to number for each item
      return rows.map(item => ({
        ...item,
        price: parseFloat(item.price)
      }));
    } catch (error) {
      throw new Error(`Error fetching menu items: ${error.message}`);
    }
  }

  // Get menu item by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, description, price FROM menu_items WHERE id = ?',
        [id]
      );
      if (rows.length === 0) return null;
      
      const item = rows[0];
      return {
        ...item,
        price: parseFloat(item.price)
      };
    } catch (error) {
      throw new Error(`Error fetching menu item: ${error.message}`);
    }
  }

  // Create new menu item
  static async create(itemData) {
    try {
      const { id, name, description, price } = itemData;
      await pool.execute(
        'INSERT INTO menu_items (id, name, description, price) VALUES (?, ?, ?, ?)',
        [id, name, description, price]
      );
      return { id, name, description, price: parseFloat(price) };
    } catch (error) {
      throw new Error(`Error creating menu item: ${error.message}`);
    }
  }

  // Update menu item
  static async update(id, itemData) {
    try {
      const { name, description, price } = itemData;
      await pool.execute(
        'UPDATE menu_items SET name = ?, description = ?, price = ? WHERE id = ?',
        [name, description, price, id]
      );
      return { id, name, description, price: parseFloat(price) };
    } catch (error) {
      throw new Error(`Error updating menu item: ${error.message}`);
    }
  }

  // Delete menu item
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM menu_items WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting menu item: ${error.message}`);
    }
  }
}

module.exports = MenuItem; 