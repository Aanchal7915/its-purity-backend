const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find(req.query.parent ? { parent: req.query.parent } : {});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        const { name, description, image, parent, type } = req.body;

        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            res.status(400);
            throw new Error('Category already exists');
        }

        const slug = name.toLowerCase().replace(/ /g, '-');

        const category = await Category.create({
            name,
            slug,
            description,
            image,
            parent: parent || null,
            type: type || 'general'
        });

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        const { name, description, image, type, parent } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (name && name !== category.name) {
            const existing = await Category.findOne({ name });
            if (existing && existing._id.toString() !== category._id.toString()) {
                return res.status(400).json({ message: 'Category already exists' });
            }
            category.name = name;
            category.slug = name.toLowerCase().replace(/ /g, '-');
        }

        if (typeof description !== 'undefined') category.description = description;
        if (typeof image !== 'undefined') category.image = image;
        if (typeof type !== 'undefined') category.type = type;
        if (typeof parent !== 'undefined') category.parent = parent;

        const updated = await category.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            await Category.deleteOne({ _id: category._id });
            res.json({ message: 'Category removed' });
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
