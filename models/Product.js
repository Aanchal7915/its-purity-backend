const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String }, // For a quick tagline
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    brand: { type: String },
    unitCount: { type: Number, default: 1 }, // e.g., 50
    unitName: { type: String, default: 'Piece' }, // e.g., 'Tabs', 'Caps'
    packageSize: { type: String }, // e.g., '1 Pack', 'Pack of 3'
    variants: [{
        unitCount: Number,
        unitName: String
    }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    stock: { type: Number, required: true, default: 0 },
    targetAudience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    productForm: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    images: [{ type: String }], // Array of image URLs
    videoUrl: { type: String }, // Optional product video URL
    primaryMedia: { type: String, enum: ['image', 'video'] }, // Which media should be primary
    benefits: [{ type: String }], // Simple array for bullet points
    detailedBenefits: [{
        title: String,
        description: String,
        iconType: String // e.g., 'shield', 'heart', 'star'
    }],
    ingredients: [{ type: String }],
    usageInstructions: { type: String },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewLaunch: { type: Boolean, default: false },
    isSuperSaver: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
