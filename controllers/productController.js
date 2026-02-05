const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { keyword, audience, form, minPrice, maxPrice, sort, isFeatured, isBestSeller, isNewLaunch, isSuperSaver } = req.query;
        let query = {};

        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' };
        }

        if (isFeatured) {
            query.isFeatured = isFeatured === 'true';
        }

        if (isBestSeller) {
            query.isBestSeller = isBestSeller === 'true';
        }

        if (isNewLaunch) {
            query.isNewLaunch = isNewLaunch === 'true';
        }

        if (isSuperSaver) {
            query.isSuperSaver = isSuperSaver === 'true';
        }

        // First filter: audience type (men, women, kids, 50+, etc.)
        if (audience) {
            const audienceIds = audience.split(',').map(id => id.trim()).filter(Boolean);
            if (audienceIds.length) query.targetAudience = { $in: audienceIds };
        }

        // Second filter: product type (multivitamin, powder, etc.)
        if (form) {
            const formIds = form.split(',').map(id => id.trim()).filter(Boolean);
            if (formIds.length) query.productForm = { $in: formIds };
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let sortOption = {};
        if (sort === 'priceLow') {
            sortOption = { price: 1 };
        } else if (sort === 'priceHigh') {
            sortOption = { price: -1 };
        } else if (sort === 'newest') {
            sortOption = { createdAt: -1 };
        }

        const products = await Product.find(query)
            .populate('targetAudience', 'name')
            .populate('productForm', 'name')
            .sort(sortOption);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('targetAudience', 'name')
            .populate('productForm', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const {
            name, slug, description, shortDescription, price, discountPrice,
            brand, targetAudience, productForm, stock, sizes, colors, images, benefits,
            detailedBenefits, ingredients, usageInstructions,
            isFeatured, isBestSeller, isNewLaunch, isSuperSaver,
            unitCount, unitName, packageSize, variants, rating, numReviews
        } = req.body;
        const product = new Product({
            name,
            slug,
            description,
            price,
            discountPrice,
            brand,
            targetAudience,
            productForm,
            stock,
            sizes,
            colors,
            images,
            benefits,
            detailedBenefits,
            ingredients,
            usageInstructions,
            isFeatured,
            isBestSeller,
            isNewLaunch,
            isSuperSaver,
            shortDescription,
            unitCount,
            unitName,
            packageSize,
            variants,
            rating,
            numReviews
        });
        const createdProduct = await Product.create(product);
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const {
            name, description, shortDescription, price, discountPrice,
            brand, targetAudience, productForm, stock, sizes, colors, images, benefits,
            detailedBenefits, ingredients, usageInstructions,
            isFeatured, isBestSeller, isNewLaunch, isSuperSaver,
            unitCount, unitName, rating, numReviews, packageSize, variants
        } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
            product.brand = brand || product.brand;
            product.targetAudience = targetAudience || product.targetAudience;
            product.productForm = productForm || product.productForm;
            product.stock = stock || product.stock;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.images = images || product.images;
            product.benefits = benefits || product.benefits;
            product.detailedBenefits = detailedBenefits || product.detailedBenefits;
            product.ingredients = ingredients || product.ingredients;
            product.usageInstructions = usageInstructions || product.usageInstructions;
            product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
            product.isBestSeller = isBestSeller !== undefined ? isBestSeller : product.isBestSeller;
            product.isNewLaunch = isNewLaunch !== undefined ? isNewLaunch : product.isNewLaunch;
            product.isSuperSaver = isSuperSaver !== undefined ? isSuperSaver : product.isSuperSaver;
            product.shortDescription = shortDescription || product.shortDescription;
            product.unitCount = unitCount !== undefined ? unitCount : product.unitCount;
            product.unitName = unitName || product.unitName;
            product.packageSize = packageSize || product.packageSize;
            product.variants = variants || product.variants;
            product.rating = rating !== undefined ? rating : product.rating;
            product.numReviews = numReviews !== undefined ? numReviews : product.numReviews;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct
};
