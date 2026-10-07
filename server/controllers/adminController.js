const db = require('../config/db');

// Get high-level analytics and dashboard metrics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // 1. KPI Metrics
    const [userCount] = await db.execute('SELECT COUNT(*) as cnt FROM users WHERE role = "customer"');
    const [orderCount] = await db.execute('SELECT COUNT(*) as cnt FROM orders');
    const [todayOrders] = await db.execute('SELECT COUNT(*) as cnt FROM orders WHERE DATE(created_at) = CURDATE()');
    const [revenue] = await db.execute('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE order_status != "CANCELLED"');
    const [pendingOrders] = await db.execute(
      'SELECT COUNT(*) as cnt FROM orders WHERE order_status IN ("PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY")'
    );
    const [availableFoods] = await db.execute('SELECT COUNT(*) as cnt FROM food_items WHERE is_available = 1');
    const [totalFoods] = await db.execute('SELECT COUNT(*) as cnt FROM food_items');

    // 2. Orders by Status Breakdown
    const [statusBreakdown] = await db.execute(`
      SELECT order_status as status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
    `);

    // Ensure all 6 statuses are represented
    const defaultStatuses = {
      PLACED: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0
    };
    statusBreakdown.forEach(item => {
      defaultStatuses[item.status] = item.count;
    });

    // 3. Sales Trend Over Recent Days
    const [salesTrend] = await db.execute(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        DATE_FORMAT(created_at, '%d %b') as label,
        COUNT(*) as order_count,
        COALESCE(SUM(total), 0) as daily_revenue
      FROM orders
      WHERE order_status != "CANCELLED"
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
      LIMIT 14
    `);

    // 4. Popular Top Selling Food Items
    const [popularFoods] = await db.execute(`
      SELECT
        f.id,
        f.name,
        f.image,
        f.price,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue
      FROM food_items f
      JOIN categories c ON f.category_id = c.id
      LEFT JOIN order_items oi ON f.id = oi.food_id
      GROUP BY f.id
      ORDER BY total_sold DESC, f.rating DESC
      LIMIT 5
    `);

    // 5. Recent 5 Orders
    const [recentOrders] = await db.execute(`
      SELECT
        o.id,
        o.order_number,
        o.total,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.created_at,
        u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 6
    `);

    return res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].cnt,
        totalOrders: orderCount[0].cnt,
        todayOrders: todayOrders[0].cnt,
        totalRevenue: parseFloat(revenue[0].total),
        pendingOrders: pendingOrders[0].cnt,
        availableFoods: availableFoods[0].cnt,
        totalFoods: totalFoods[0].cnt
      },
      orderStatusCounts: defaultStatuses,
      salesTrend,
      popularFoods,
      recentOrders
    });
  } catch (error) {
    console.error('[adminController.getDashboardAnalytics]', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve analytics data.' });
  }
};
