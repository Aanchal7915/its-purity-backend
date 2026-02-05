const Reel = require('../models/Reel');
const Product = require('../models/Product');

// @desc    Get all reels
// @route   GET /api/reels
// @access  Public
const getReels = async (req, res) => {
    try {
        const reels = await Reel.find().populate('product').sort('-createdAt');
        res.json(reels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a reel
// @route   POST /api/reels
// @access  Private/Admin
const createReel = async (req, res) => {
    try {
        const { title, videoUrl, thumbnailUrl, productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const reel = new Reel({
            title,
            videoUrl,
            thumbnailUrl: thumbnailUrl || product.images[0], // Fallback to product image
            product: productId
        });

        const createdReel = await reel.save();
        res.status(201).json(createdReel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Like a reel
// @route   POST /api/reels/:id/like
// @access  Private
const likeReel = async (req, res) => {
    // Placeholder for simple like increment, in real app might track user likes
    try {
        const reel = await Reel.findById(req.params.id);
        if (reel) {
            reel.likes += 1;
            await reel.save();
            res.json(reel);
        } else {
            res.status(404).json({ message: 'Reel not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Delete a reel
// @route   DELETE /api/reels/:id
// @access  Private/Admin
const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (reel) {
            await Reel.deleteOne({ _id: reel._id });
            res.json({ message: 'Reel removed' });
        } else {
            res.status(404).json({ message: 'Reel not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a reel
// @route   PUT /api/reels/:id
// @access  Private/Admin
const updateReel = async (req, res) => {
    try {
        const { title, videoUrl, thumbnailUrl, productId } = req.body;
        const reel = await Reel.findById(req.params.id);

        if (reel) {
            reel.title = title || reel.title;
            reel.videoUrl = videoUrl || reel.videoUrl;
            reel.product = productId || reel.product;

            if (thumbnailUrl) {
                reel.thumbnailUrl = thumbnailUrl;
            } else if (productId && productId !== reel.product.toString()) {
                const product = await Product.findById(productId);
                if (product) reel.thumbnailUrl = product.images[0];
            }

            const updatedReel = await reel.save();
            const populatedReel = await updatedReel.populate('product');
            res.json(populatedReel);
        } else {
            res.status(404).json({ message: 'Reel not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getReels, createReel, likeReel, deleteReel, updateReel };
