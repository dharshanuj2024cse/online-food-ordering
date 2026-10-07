const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public / Optional auth (for admin viewing unavailable foods)
router.get('/', optionalAuth, foodController.getFoods);
router.get('/:id', foodController.getFoodById);

// Admin operations
router.post('/', authenticateToken, requireAdmin, foodController.createFood);
router.put('/:id', authenticateToken, requireAdmin, foodController.updateFood);
router.patch('/:id/availability', authenticateToken, requireAdmin, foodController.toggleAvailability);
router.delete('/:id', authenticateToken, requireAdmin, foodController.deleteFood);

module.exports = router;
