const db = require('../config/db');

// Helper to get or create user's cart ID
const getOrCreateCartId = async (userId) => {
  let [carts] = await db.execute('SELECT id FROM cart WHERE user_id = ?', [userId]);
  if (carts.length === 0) {
    const [created] = await db.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);
    return created.insertId;
  }
  return carts[0].id;
};

// Calculate order financials safely on backend
const calculateCartTotals = (items, couponDiscount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0.00 : 40.00;
  const tax = subtotal > 0 ? parseFloat((subtotal * 0.05).toFixed(2)) : 0.00;
  const discount = Math.min(parseFloat(couponDiscount || 0), subtotal);
  const total = parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    tax,
    discount: parseFloat(discount.toFixed(2)),
    total: Math.max(0, total),
    freeDeliveryThreshold: 500.00,
    amountNeededForFreeDelivery: subtotal < 500 && subtotal > 0 ? parseFloat((500 - subtotal).toFixed(2)) : 0
  };
};

// Get cart items and computed summary
exports.getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);

    const [items] = await db.execute(
      `SELECT
        ci.id as cart_item_id,
        ci.quantity,
        f.id as food_id,
        f.name as food_name,
        f.price,
        f.image,
        f.is_vegetarian,
        f.is_available,
        (f.price * ci.quantity) as item_subtotal,
        c.name as category_name
       FROM cart_items ci
       JOIN food_items f ON ci.food_id = f.id
       JOIN categories c ON f.category_id = c.id
       WHERE ci.cart_id = ?
       ORDER BY ci.id DESC`,
      [cartId]
    );

    const calculations = calculateCartTotals(items, 0);

    return res.json({
      success: true,
      cartId,
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      ...calculations
    });
  } catch (error) {
    console.error('[cartController.getCart]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve cart.' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { food_id, quantity = 1 } = req.body;

    if (!food_id) {
      return res.status(400).json({ success: false, message: 'food_id is required.' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than 0.' });
    }

    // Check food availability
    const [foods] = await db.execute('SELECT id, name, is_available, price FROM food_items WHERE id = ?', [food_id]);
    if (foods.length === 0) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    if (!foods[0].is_available) {
      return res.status(400).json({
        success: false,
        message: `Sorry, "${foods[0].name}" is currently sold out or unavailable.`
      });
    }

    const cartId = await getOrCreateCartId(req.user.id);

    // Check if already in cart
    const [existing] = await db.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND food_id = ?',
      [cartId, food_id]
    );

    if (existing.length > 0) {
      const updatedQty = existing[0].quantity + qty;
      await db.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [updatedQty, existing[0].id]);
    } else {
      await db.execute('INSERT INTO cart_items (cart_id, food_id, quantity) VALUES (?, ?, ?)', [cartId, food_id, qty]);
    }

    return res.json({
      success: true,
      message: `Added "${foods[0].name}" to your cart.`
    });
  } catch (error) {
    console.error('[cartController.addToCart]', error);
    return res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;

    const cartId = await getOrCreateCartId(req.user.id);
    const qty = parseInt(quantity, 10);

    if (isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Invalid quantity provided.' });
    }

    if (qty <= 0) {
      // Remove item if quantity is zero or less
      await db.execute('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cartId]);
      return res.json({ success: true, message: 'Item removed from cart.' });
    }

    const [result] = await db.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?',
      [qty, id, cartId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    return res.json({ success: true, message: 'Cart quantity updated.' });
  } catch (error) {
    console.error('[cartController.updateCartItem]', error);
    return res.status(500).json({ success: false, message: 'Failed to update item quantity.' });
  }
};

// Remove single cart item
exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartId = await getOrCreateCartId(req.user.id);

    const [result] = await db.execute('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cartId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    return res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    console.error('[cartController.removeCartItem]', error);
    return res.status(500).json({ success: false, message: 'Failed to remove cart item.' });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCartId(req.user.id);
    await db.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return res.json({ success: true, message: 'Shopping cart cleared.' });
  } catch (error) {
    console.error('[cartController.clearCart]', error);
    return res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};
