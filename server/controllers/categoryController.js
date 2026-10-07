const db = require('../config/db');

// Get all categories with food count
exports.getCategories = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let query = `
      SELECT c.*, COUNT(f.id) as food_count
      FROM categories c
      LEFT JOIN food_items f ON c.id = f.category_id AND (f.is_available = 1 OR ? = 1)
      ${isAdmin ? '' : 'WHERE c.status = "active"'}
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    const [categories] = await db.execute(query, [isAdmin ? 1 : 0]);
    return res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    console.error('[categoryController.getCategories]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({ success: true, category: rows[0] });
  } catch (error) {
    console.error('[categoryController.getCategoryById]', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving category.' });
  }
};

// Create category (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [existing] = await db.execute('SELECT id FROM categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name, description, image, status) VALUES (?, ?, ?, ?)',
      [name.trim(), description || '', image || '', status || 'active']
    );

    const [created] = await db.execute('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: created[0]
    });
  } catch (error) {
    console.error('[categoryController.createCategory]', error);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

// Update category (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const [existing] = await db.execute('SELECT id FROM categories WHERE name = ? AND id != ?', [name.trim(), id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Category name is already in use.' });
    }

    await db.execute(
      'UPDATE categories SET name = ?, description = ?, image = ?, status = ? WHERE id = ?',
      [name.trim(), description || '', image || '', status || 'active', id]
    );

    const [updated] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (updated.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      category: updated[0]
    });
  } catch (error) {
    console.error('[categoryController.updateCategory]', error);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// Delete category (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if food items exist under this category
    const [foodCount] = await db.execute('SELECT COUNT(*) as cnt FROM food_items WHERE category_id = ?', [id]);
    if (foodCount[0].cnt > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category: Contains ${foodCount[0].cnt} associated food items. Reassign or delete them first.`
      });
    }

    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('[categoryController.deleteCategory]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
