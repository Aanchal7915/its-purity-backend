const express = require('express');
const router = express.Router();
const { getReels, createReel, likeReel, deleteReel, updateReel } = require('../controllers/reelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getReels).post(protect, admin, createReel);
router.route('/:id')
    .put(protect, admin, updateReel)
    .delete(protect, admin, deleteReel);
router.route('/:id/like').post(protect, likeReel);

module.exports = router;
