const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin operations
router.post('/', authenticateToken, requireAdmin, categoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
