const db = require('../config/db');

// Helper to generate human-readable order number (e.g. ORD-10023)
const generateOrderNumber = async () => {
  const [rows] = await db.execute('SELECT MAX(id) as max_id FROM orders');
  const nextId = (rows[0].max_id || 0) + 1;
  return `ORD-${(10000 + nextId).toString()}`;
};

// Place Order
exports.placeOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { address_id, new_address, coupon_code, payment_method = 'COD' } = req.body;

    // 1. Resolve Delivery Address
    let addressSnapshot = null;
    let finalAddressId = null;

    if (address_id) {
      const [addrRows] = await connection.execute(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [address_id, userId]
      );
      if (addrRows.length > 0) {
        finalAddressId = addrRows[0].id;
        addressSnapshot = {
          full_name: addrRows[0].full_name,
          phone: addrRows[0].phone,
          address: addrRows[0].address,
          city: addrRows[0].city,
          state: addrRows[0].state,
          pincode: addrRows[0].pincode
        };
      }
    }

    if (!addressSnapshot && new_address) {
      const { full_name, phone, address, city, state, pincode, save_address } = new_address;
      if (!full_name || !phone || !address || !city || !pincode) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Please provide all delivery address details.' });
      }

      addressSnapshot = { full_name, phone, address, city, state: state || '', pincode };

      if (save_address) {
        const [savedAddr] = await connection.execute(
          'INSERT INTO addresses (user_id, full_name, phone, address, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
          [userId, full_name, phone, address, city, state || '', pincode]
        );
        finalAddressId = savedAddr.insertId;
      }
    }

    if (!addressSnapshot) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'A valid delivery address is required.' });
    }

    // 2. Fetch User's Cart
    const [cartRows] = await connection.execute('SELECT id FROM cart WHERE user_id = ?', [userId]);
    if (cartRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Shopping cart is empty.' });
    }

    const cartId = cartRows[0].id;

    const [cartItems] = await connection.execute(
      `SELECT ci.quantity, f.id as food_id, f.name as food_name, f.price, f.is_available
       FROM cart_items ci
       JOIN food_items f ON ci.food_id = f.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ success: false, message: 'Your cart is empty. Please add items before checkout.' });
    }

    // 3. Verify Food Availability
    for (const item of cartItems) {
      if (!item.is_available) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          success: false,
          message: `Item "${item.food_name}" is currently unavailable. Please remove it from your cart.`
        });
      }
    }

    // 4. Calculate Subtotal from Database Prices
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
      const price = parseFloat(item.price);
      const qty = parseInt(item.quantity, 10);
      const itemSubtotal = parseFloat((price * qty).toFixed(2));
      subtotal += itemSubtotal;
      orderItemsData.push({
        food_id: item.food_id,
        food_name: item.food_name,
        price,
        quantity: qty,
        subtotal: itemSubtotal
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    // 5. Calculate Delivery Fee & Tax
    const deliveryFee = subtotal >= 500 ? 0.00 : 40.00;
    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST

    // 6. Validate and Calculate Coupon Discount
    let discount = 0.00;
    let couponId = null;

    if (coupon_code) {
      const [coupons] = await connection.execute(
        'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND status = "active" AND expiry_date >= CURDATE()',
        [coupon_code.trim()]
      );

      if (coupons.length > 0) {
        const coupon = coupons[0];
        const minOrder = parseFloat(coupon.minimum_order || 0);

        if (subtotal >= minOrder && (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)) {
          couponId = coupon.id;
          if (coupon.discount_type === 'percentage') {
            discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
            if (coupon.maximum_discount && discount > parseFloat(coupon.maximum_discount)) {
              discount = parseFloat(coupon.maximum_discount);
            }
          } else {
            discount = parseFloat(coupon.discount_value);
          }
          discount = Math.min(discount, subtotal);
          discount = parseFloat(discount.toFixed(2));

          // Increment coupon used count
          await connection.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
        }
      }
    }

    // 7. Calculate Grand Total
    const grandTotal = parseFloat((subtotal + deliveryFee + tax - discount).toFixed(2));

    // 8. Generate Human-Readable Order Number
    const orderNumber = await generateOrderNumber();

    // 9. Payment Status
    const paymentStatus = payment_method === 'ONLINE' ? 'PAID' : 'PENDING';

    // 10. Insert Order
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        order_number, user_id, address_id, coupon_id, subtotal, delivery_fee, tax, discount, total,
        payment_method, payment_status, order_status, delivery_address_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PLACED', ?)`,
      [
        orderNumber,
        userId,
        finalAddressId,
        couponId,
        subtotal,
        deliveryFee,
        tax,
        discount,
        grandTotal,
        payment_method,
        paymentStatus,
        JSON.stringify(addressSnapshot)
      ]
    );

    const orderId = orderResult.insertId;

    // 11. Insert Order Items
    for (const item of orderItemsData) {
      await connection.execute(
        'INSERT INTO order_items (order_id, food_id, food_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.food_id, item.food_name, item.price, item.quantity, item.subtotal]
      );
    }

    // 12. Clear User Cart
    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: orderId,
        orderNumber,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total: grandTotal,
        paymentMethod: payment_method,
        paymentStatus,
        orderStatus: 'PLACED',
        deliveryAddress: addressSnapshot,
        itemsCount: orderItemsData.length
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('[orderController.placeOrder]', error);
    return res.status(500).json({ success: false, message: 'Failed to place order. Please try again.' });
  }
};

// Get Orders (User's orders or Admin all orders)
exports.getOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const { status, search, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        COUNT(oi.id) as total_items,
        GROUP_CONCAT(CONCAT(oi.food_name, ' (x', oi.quantity, ')') SEPARATOR ', ') as items_summary
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE 1=1
    `;
    const params = [];

    if (!isAdmin) {
      query += ' AND o.user_id = ?';
      params.push(req.user.id);
    }

    if (status) {
      query += ' AND o.order_status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      query += ' AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' GROUP BY o.id ORDER BY o.id DESC LIMIT ? OFFSET ?';
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    params.push(parseInt(limit, 10), offset);

    const [orders] = await db.execute(query, params);

    return res.json({
      success: true,
      count: orders.length,
      orders: orders.map(ord => ({
        ...ord,
        delivery_address: ord.delivery_address_json ? JSON.parse(ord.delivery_address_json) : null
      }))
    });
  } catch (error) {
    console.error('[orderController.getOrders]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

// Get single order details with item list and tracking timeline
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    let orderQuery = `
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? OR o.order_number = ?
    `;
    const [orders] = await db.execute(orderQuery, [id, id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // Authorization check
    if (!isAdmin && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    // Fetch order items
    const [items] = await db.execute(
      `SELECT oi.*, f.image, f.is_vegetarian, f.is_available
       FROM order_items oi
       LEFT JOIN food_items f ON oi.food_id = f.id
       WHERE oi.order_id = ?`,
      [order.id]
    );

    // Build timeline stages
    const statuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = statuses.indexOf(order.order_status);

    const timeline = statuses.map((statusName, idx) => ({
      status: statusName,
      completed: currentIndex >= idx && order.order_status !== 'CANCELLED',
      current: order.order_status === statusName,
      title: statusName.replace(/_/g, ' ')
    }));

    return res.json({
      success: true,
      order: {
        ...order,
        delivery_address: order.delivery_address_json ? JSON.parse(order.delivery_address_json) : null,
        items,
        timeline,
        isCancelled: order.order_status === 'CANCELLED'
      }
    });
  } catch (error) {
    console.error('[orderController.getOrderById]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve order details.' });
  }
};

// Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if order exists
    const [orders] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orders[0];

    // If marked DELIVERED and COD, auto-update payment status to PAID
    let paymentUpdate = '';
    const params = [status];

    if (status === 'DELIVERED' && order.payment_method === 'COD') {
      paymentUpdate = ', payment_status = "PAID"';
    }

    params.push(id);
    await db.execute(`UPDATE orders SET order_status = ? ${paymentUpdate} WHERE id = ?`, params);

    return res.json({
      success: true,
      message: `Order #${order.order_number} status updated to ${status}.`,
      status
    });
  } catch (error) {
    console.error('[orderController.updateOrderStatus]', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

// Reorder feature (Section 14)
exports.reorder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Fetch previous order
    const [orders] = await db.execute('SELECT id FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Previous order not found.' });
    }

    // Fetch items from that order
    const [items] = await db.execute(
      `SELECT oi.food_id, oi.food_name, oi.quantity, f.is_available
       FROM order_items oi
       LEFT JOIN food_items f ON oi.food_id = f.id
       WHERE oi.order_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items found in this order.' });
    }

    // Get user cart
    let [carts] = await db.execute('SELECT id FROM cart WHERE user_id = ?', [userId]);
    let cartId;
    if (carts.length === 0) {
      const [created] = await db.execute('INSERT INTO cart (user_id) VALUES (?)', [userId]);
      cartId = created.insertId;
    } else {
      cartId = carts[0].id;
    }

    let addedCount = 0;
    const unavailableItems = [];

    for (const item of items) {
      if (!item.food_id || !item.is_available) {
        unavailableItems.push(item.food_name);
        continue;
      }

      // Check if already in cart
      const [existing] = await db.execute(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND food_id = ?',
        [cartId, item.food_id]
      );

      if (existing.length > 0) {
        await db.execute(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, existing[0].id]
        );
      } else {
        await db.execute(
          'INSERT INTO cart_items (cart_id, food_id, quantity) VALUES (?, ?, ?)',
          [cartId, item.food_id, item.quantity]
        );
      }
      addedCount++;
    }

    let message = `Added ${addedCount} item(s) from previous order to your cart.`;
    if (unavailableItems.length > 0) {
      message += ` Note: ${unavailableItems.join(', ')} is currently unavailable and was skipped.`;
    }

    return res.json({
      success: true,
      message,
      addedCount,
      unavailableItems
    });
  } catch (error) {
    console.error('[orderController.reorder]', error);
    return res.status(500).json({ success: false, message: 'Failed to reorder items.' });
  }
};
