const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

router.post('/validate', couponController.validateCoupon);
router.get('/', optionalAuth, couponController.getCoupons);

// Admin operations
router.post('/', authenticateToken, requireAdmin, couponController.createCoupon);
router.put('/:id', authenticateToken, requireAdmin, couponController.updateCoupon);
router.delete('/:id', authenticateToken, requireAdmin, couponController.deleteCoupon);

module.exports = router;
