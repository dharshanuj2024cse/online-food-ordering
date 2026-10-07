const db = require('../config/db');

// Validate a coupon for a given subtotal
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });
    }

    const orderSubtotal = parseFloat(subtotal || 0);

    const [coupons] = await db.execute(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)',
      [code.trim()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon code not found.' });
    }

    const coupon = coupons[0];

    // Check status
    if (coupon.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active.' });
    }

    // Check expiry
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(coupon.expiry_date).toISOString().split('T')[0];
    if (expiry < today) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached.' });
    }

    // Check minimum order amount
    if (orderSubtotal < parseFloat(coupon.minimum_order)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimum_order} required to use coupon "${coupon.code}".`
      });
    }

    // Calculate discount value
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (orderSubtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.maximum_discount && discountAmount > parseFloat(coupon.maximum_discount)) {
        discountAmount = parseFloat(coupon.maximum_discount);
      }
    } else {
      discountAmount = parseFloat(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, orderSubtotal);
    discountAmount = parseFloat(discountAmount.toFixed(2));

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: parseFloat(coupon.discount_value),
        discountAmount,
        minimumOrder: parseFloat(coupon.minimum_order),
        maximumDiscount: coupon.maximum_discount ? parseFloat(coupon.maximum_discount) : null
      }
    });
  } catch (error) {
    console.error('[couponController.validateCoupon]', error);
    return res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
  }
};

// Get coupons (Active for users, All for admin)
exports.getCoupons = async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? 'SELECT * FROM coupons ORDER BY id DESC'
      : 'SELECT id, code, discount_type, discount_value, minimum_order, maximum_discount, expiry_date FROM coupons WHERE status = "active" AND expiry_date >= CURDATE() ORDER BY discount_value DESC';

    const [coupons] = await db.execute(query);
    return res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    console.error('[couponController.getCoupons]', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
};

// Create coupon (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      minimum_order,
      maximum_discount,
      expiry_date,
      usage_limit,
      status
    } = req.body;

    if (!code || !discount_type || discount_value === undefined || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Code, Discount Type, Discount Value, and Expiry Date are required.'
      });
    }

    const [existing] = await db.execute('SELECT id FROM coupons WHERE code = ?', [code.toUpperCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }

    const [result] = await db.execute(
      `INSERT INTO coupons (
        code, discount_type, discount_value, minimum_order, maximum_discount, expiry_date, usage_limit, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase().trim(),
        discount_type,
        parseFloat(discount_value),
        minimum_order ? parseFloat(minimum_order) : 0,
        maximum_discount ? parseFloat(maximum_discount) : null,
        expiry_date,
        usage_limit ? parseInt(usage_limit, 10) : 100,
        status || 'active'
      ]
    );

    const [created] = await db.execute('SELECT * FROM coupons WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully.',
      coupon: created[0]
    });
  } catch (error) {
    console.error('[couponController.createCoupon]', error);
    return res.status(500).json({ success: false, message: 'Failed to create coupon.' });
  }
};

// Update coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      minimum_order,
      maximum_discount,
      expiry_date,
      usage_limit,
      status
    } = req.body;

    if (!code || !discount_type || discount_value === undefined || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Code, Discount Type, Discount Value, and Expiry Date are required.'
      });
    }

    const [existing] = await db.execute('SELECT id FROM coupons WHERE code = ? AND id != ?', [code.toUpperCase().trim(), id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Another coupon with this code already exists.' });
    }

    const [result] = await db.execute(
      `UPDATE coupons SET
        code = ?,
        discount_type = ?,
        discount_value = ?,
        minimum_order = ?,
        maximum_discount = ?,
        expiry_date = ?,
        usage_limit = ?,
        status = ?
       WHERE id = ?`,
      [
        code.toUpperCase().trim(),
        discount_type,
        parseFloat(discount_value),
        minimum_order ? parseFloat(minimum_order) : 0,
        maximum_discount ? parseFloat(maximum_discount) : null,
        expiry_date,
        usage_limit ? parseInt(usage_limit, 10) : 100,
        status || 'active',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    const [updated] = await db.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Coupon updated successfully.',
      coupon: updated[0]
    });
  } catch (error) {
    console.error('[couponController.updateCoupon]', error);
    return res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM coupons WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }
    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('[couponController.deleteCoupon]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
};
