const db = require('../config/db');

// Get all foods with multi-factor search, filter, and sorting
exports.getFoods = async (req, res) => {
  try {
    const {
      search,
      category,
      is_vegetarian,
      min_price,
      max_price,
      rating,
      available_only,
      sort,
      limit
    } = req.query;

    const isAdmin = req.user && req.user.role === 'admin';

    let query = `
      SELECT f.*, c.name as category_name
      FROM food_items f
      JOIN categories c ON f.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by availability (non-admins by default only see available items unless specified)
    if (available_only === 'true' || available_only === '1' || !isAdmin) {
      if (available_only !== 'false' && available_only !== '0') {
        query += ' AND f.is_available = 1 AND c.status = "active"';
      }
    }

    // Search by food name, description, or category name
    if (search && search.trim()) {
      query += ' AND (f.name LIKE ? OR f.description LIKE ? OR c.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    // Filter by category (by ID or category name)
    if (category) {
      if (!isNaN(category)) {
        query += ' AND f.category_id = ?';
        params.push(parseInt(category, 10));
      } else {
        query += ' AND LOWER(c.name) = LOWER(?)';
        params.push(category.trim());
      }
    }

    // Filter by vegetarian
    if (is_vegetarian !== undefined && is_vegetarian !== '') {
      query += ' AND f.is_vegetarian = ?';
      params.push(is_vegetarian === 'true' || is_vegetarian === '1' ? 1 : 0);
    }

    // Filter by price range
    if (min_price && !isNaN(min_price)) {
      query += ' AND f.price >= ?';
      params.push(parseFloat(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      query += ' AND f.price <= ?';
      params.push(parseFloat(max_price));
    }

    // Filter by minimum rating
    if (rating && !isNaN(rating)) {
      query += ' AND f.rating >= ?';
      params.push(parseFloat(rating));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY f.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY f.price DESC';
        break;
      case 'rating':
        query += ' ORDER BY f.rating DESC, f.price ASC';
        break;
      case 'newest':
        query += ' ORDER BY f.created_at DESC';
        break;
      case 'popular':
      default:
        query += ' ORDER BY f.rating DESC, f.id ASC';
        break;
    }

    if (limit && !isNaN(limit)) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const [foods] = await db.execute(query, params);

    return res.json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    console.error('[foodController.getFoods]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve food items.' });
  }
};

// Get single food item by ID
exports.getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT f.*, c.name as category_name
       FROM food_items f
       JOIN categories c ON f.category_id = c.id
       WHERE f.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const food = rows[0];

    // Fetch related foods in same category
    const [related] = await db.execute(
      `SELECT f.*, c.name as category_name
       FROM food_items f
       JOIN categories c ON f.category_id = c.id
       WHERE f.category_id = ? AND f.id != ? AND f.is_available = 1
       LIMIT 4`,
      [food.category_id, food.id]
    );

    return res.json({
      success: true,
      food,
      related
    });
  } catch (error) {
    console.error('[foodController.getFoodById]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving food details.' });
  }
};

// Create food item (Admin)
exports.createFood = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      image,
      ingredients,
      rating,
      is_vegetarian,
      is_available
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, and Price are required fields.'
      });
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number.'
      });
    }

    // Verify category exists
    const [cat] = await db.execute('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (cat.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected category does not exist.' });
    }

    const [result] = await db.execute(
      `INSERT INTO food_items (
        category_id, name, description, price, image, ingredients, rating, is_vegetarian, is_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name.trim(),
        description || '',
        parseFloat(price),
        image || '',
        ingredients || '',
        rating ? parseFloat(rating) : 4.5,
        is_vegetarian ? 1 : 0,
        is_available !== undefined ? (is_available ? 1 : 0) : 1
      ]
    );

    const [created] = await db.execute(
      `SELECT f.*, c.name as category_name
       FROM food_items f
       JOIN categories c ON f.category_id = c.id
       WHERE f.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Food item added successfully.',
      food: created[0]
    });
  } catch (error) {
    console.error('[foodController.createFood]', error);
    return res.status(500).json({ success: false, message: 'Failed to create food item.' });
  }
};

// Update food item (Admin)
exports.updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      image,
      ingredients,
      rating,
      is_vegetarian,
      is_available
    } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, and Price are required.'
      });
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    const [result] = await db.execute(
      `UPDATE food_items SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image = ?,
        ingredients = ?,
        rating = ?,
        is_vegetarian = ?,
        is_available = ?
       WHERE id = ?`,
      [
        category_id,
        name.trim(),
        description || '',
        parseFloat(price),
        image || '',
        ingredients || '',
        rating ? parseFloat(rating) : 4.5,
        is_vegetarian ? 1 : 0,
        is_available ? 1 : 0,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const [updated] = await db.execute(
      `SELECT f.*, c.name as category_name
       FROM food_items f
       JOIN categories c ON f.category_id = c.id
       WHERE f.id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Food item updated successfully.',
      food: updated[0]
    });
  } catch (error) {
    console.error('[foodController.updateFood]', error);
    return res.status(500).json({ success: false, message: 'Failed to update food item.' });
  }
};

// Toggle food availability (Admin)
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT is_available FROM food_items WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const nextState = rows[0].is_available === 1 ? 0 : 1;
    await db.execute('UPDATE food_items SET is_available = ? WHERE id = ?', [nextState, id]);

    return res.json({
      success: true,
      message: `Food item is now ${nextState === 1 ? 'Available' : 'Unavailable'}.`,
      is_available: nextState
    });
  } catch (error) {
    console.error('[foodController.toggleAvailability]', error);
    return res.status(500).json({ success: false, message: 'Failed to update availability.' });
  }
};

// Delete food item (Admin)
exports.deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM food_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }
    return res.json({ success: true, message: 'Food item removed successfully.' });
  } catch (error) {
    console.error('[foodController.deleteFood]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete food item.' });
  }
};
