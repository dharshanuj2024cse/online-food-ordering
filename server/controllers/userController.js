const db = require('../config/db');

// --- Customer Address Methods ---

exports.getAddresses = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.user.id]
    );
    return res.json({ success: true, count: rows.length, addresses: rows });
  } catch (error) {
    console.error('[userController.getAddresses]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve addresses.' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { full_name, phone, address, city, state, pincode, is_default } = req.body;

    if (!full_name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, address, city, and pincode are required.'
      });
    }

    if (is_default) {
      await db.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [existing] = await db.execute('SELECT id FROM addresses WHERE user_id = ?', [req.user.id]);
    const makeDefault = is_default || existing.length === 0 ? 1 : 0;

    const [result] = await db.execute(
      'INSERT INTO addresses (user_id, full_name, phone, address, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, full_name.trim(), phone.trim(), address.trim(), city.trim(), state ? state.trim() : '', pincode.trim(), makeDefault]
    );

    const [created] = await db.execute('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Delivery address saved successfully.',
      address: created[0]
    });
  } catch (error) {
    console.error('[userController.addAddress]', error);
    return res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, address, city, state, pincode, is_default } = req.body;

    if (!full_name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, address, city, and pincode are required.'
      });
    }

    if (is_default) {
      await db.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const [result] = await db.execute(
      `UPDATE addresses SET
        full_name = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [full_name.trim(), phone.trim(), address.trim(), city.trim(), state ? state.trim() : '', pincode.trim(), is_default ? 1 : 0, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }

    const [updated] = await db.execute('SELECT * FROM addresses WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Address updated successfully.',
      address: updated[0]
    });
  } catch (error) {
    console.error('[userController.updateAddress]', error);
    return res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Address not found.' });
    }
    return res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    console.error('[userController.deleteAddress]', error);
    return res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
};

// --- Admin User Management Methods ---

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    let query = `
      SELECT
        u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
        COUNT(o.id) as orders_count,
        COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim()) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    query += ' GROUP BY u.id ORDER BY u.id DESC';

    const [users] = await db.execute(query, params);
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('[userController.getAllUsers]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const [orders] = await db.execute(
      'SELECT id, order_number, total, order_status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 10',
      [id]
    );

    return res.json({
      success: true,
      user: users[0],
      recentOrders: orders
    });
  } catch (error) {
    console.error('[userController.getUserById]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user details.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const [user] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deactivating own admin account
    if (parseInt(id, 10) === req.user.id && status === 'inactive') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own administrator account.' });
    }

    const updates = [];
    const params = [];

    if (role && (role === 'customer' || role === 'admin')) {
      updates.push('role = ?');
      params.push(role);
    }

    if (status && (status === 'active' || status === 'inactive')) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided to update.' });
    }

    params.push(id);
    await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await db.execute('SELECT id, name, email, phone, role, status FROM users WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    console.error('[userController.updateUser]', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};
