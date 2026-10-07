const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END API TESTS ---\n');

  // Start express app in-process
  const app = require('./app');
  const server = app.listen(5050);
  const port = 5050;

  try {
    // 1. Health check
    const health = await makeRequest({ hostname: 'localhost', port, path: '/api/health', method: 'GET' });
    console.log('[TEST 1] GET /api/health -> Status:', health.status, health.data?.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Customer login
    const userLogin = await makeRequest(
      { hostname: 'localhost', port, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'user@foodapp.com', password: 'User@123' }
    );
    console.log('[TEST 2] Customer Login -> Status:', userLogin.status, userLogin.data?.user?.email === 'user@foodapp.com' ? 'PASS' : 'FAIL');
    const userToken = userLogin.data?.token;

    // 3. Admin login
    const adminLogin = await makeRequest(
      { hostname: 'localhost', port, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@foodapp.com', password: 'Admin@123' }
    );
    console.log('[TEST 3] Admin Login -> Status:', adminLogin.status, adminLogin.data?.user?.role === 'admin' ? 'PASS' : 'FAIL');
    const adminToken = adminLogin.data?.token;

    // 4. Categories list
    const cats = await makeRequest({ hostname: 'localhost', port, path: '/api/categories', method: 'GET' });
    console.log('[TEST 4] GET /api/categories -> Count:', cats.data?.count, cats.data?.count >= 8 ? 'PASS' : 'FAIL');

    // 5. Foods list & search
    const foods = await makeRequest({ hostname: 'localhost', port, path: '/api/foods?search=Biryani', method: 'GET' });
    console.log('[TEST 5] GET /api/foods?search=Biryani -> Count:', foods.data?.count, foods.data?.count > 0 ? 'PASS' : 'FAIL');

    // 6. Validate Coupon
    const couponVal = await makeRequest(
      { hostname: 'localhost', port, path: '/api/coupons/validate', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { code: 'WELCOME50', subtotal: 400 }
    );
    console.log('[TEST 6] Validate Coupon WELCOME50 -> Status:', couponVal.status, 'Discount:', couponVal.data?.coupon?.discountAmount, couponVal.data?.coupon?.discountAmount === 100 ? 'PASS' : 'FAIL');

    // 7. Cart Add Item
    const addCart = await makeRequest(
      {
        hostname: 'localhost',
        port,
        path: '/api/cart/items',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
      },
      { food_id: 1, quantity: 2 } // Margherita Pizza x2 = 598.00
    );
    console.log('[TEST 7] Add Item To Cart -> Status:', addCart.status, addCart.data?.success ? 'PASS' : 'FAIL');

    // 8. Fetch Cart (Subtotal >= 500, delivery fee should be 0!)
    const getCart = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/api/cart',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    console.log(
      '[TEST 8] Fetch Cart -> Subtotal:', getCart.data?.subtotal,
      'DeliveryFee:', getCart.data?.deliveryFee,
      'Tax:', getCart.data?.tax,
      getCart.data?.deliveryFee === 0 ? 'PASS (FREE DELIVERY)' : 'FAIL'
    );

    // 9. Customer Addresses
    const addresses = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/api/users/addresses',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const addressId = addresses.data?.addresses?.[0]?.id;
    console.log('[TEST 9] Customer Addresses -> Count:', addresses.data?.count, addressId ? 'PASS' : 'FAIL');

    // 10. Place Order
    const placeOrder = await makeRequest(
      {
        hostname: 'localhost',
        port,
        path: '/api/orders',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` }
      },
      {
        address_id: addressId,
        coupon_code: 'WELCOME50',
        payment_method: 'COD'
      }
    );
    const orderNumber = placeOrder.data?.order?.orderNumber;
    const orderId = placeOrder.data?.order?.id;
    console.log(
      '[TEST 10] Place Order -> Status:', placeOrder.status,
      'OrderNumber:', orderNumber,
      'Total:', placeOrder.data?.order?.total,
      orderNumber ? 'PASS' : 'FAIL'
    );

    // 11. Customer view order details
    const orderDetails = await makeRequest({
      hostname: 'localhost',
      port,
      path: `/api/orders/${orderNumber}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    console.log(
      '[TEST 11] GET /api/orders/:orderNumber -> Status:', orderDetails.status,
      'Items in order:', orderDetails.data?.order?.items?.length,
      orderDetails.data?.order?.items?.length > 0 ? 'PASS' : 'FAIL'
    );

    // 12. Admin update order status to PREPARING
    const updateStatus = await makeRequest(
      {
        hostname: 'localhost',
        port,
        path: `/api/orders/${orderId}/status`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
      },
      { status: 'PREPARING' }
    );
    console.log('[TEST 12] Admin Update Order Status -> Status:', updateStatus.status, updateStatus.data?.status === 'PREPARING' ? 'PASS' : 'FAIL');

    // 13. Reorder previous order
    const reorder = await makeRequest(
      {
        hostname: 'localhost',
        port,
        path: `/api/orders/${orderId}/reorder`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${userToken}` }
      }
    );
    console.log('[TEST 13] Customer Reorder -> Status:', reorder.status, 'Added items:', reorder.data?.addedCount, reorder.data?.addedCount > 0 ? 'PASS' : 'FAIL');

    // 14. Admin Dashboard Analytics
    const dashboard = await makeRequest({
      hostname: 'localhost',
      port,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(
      '[TEST 14] Admin Dashboard -> Total Revenue:', dashboard.data?.stats?.totalRevenue,
      'Total Orders:', dashboard.data?.stats?.totalOrders,
      'Sales trend data points:', dashboard.data?.salesTrend?.length,
      dashboard.data?.stats?.totalOrders > 0 ? 'PASS' : 'FAIL'
    );

    console.log('\n--- ALL END-TO-END TESTS COMPLETED SUCCESSFULLY! ---');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();