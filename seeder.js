const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();

    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Category.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@purevit.com',
            password: hashedPassword,
            role: 'admin',
        });

        const user = await User.create({
            name: 'John Doe',
            email: 'user@example.com',
            password: hashedPassword,
        });

        // Create Audience & Product Type categories
        const audienceMen = await Category.create({ name: 'Men', slug: 'men', type: 'audience' });
        const audienceWomen = await Category.create({ name: 'Women', slug: 'women', type: 'audience' });
        const formVitamins = await Category.create({ name: 'Vitamins', slug: 'vitamins', type: 'form' });
        const formSupplements = await Category.create({ name: 'Supplements', slug: 'supplements', type: 'form' });
        const formMultivitamin = await Category.create({ name: 'Multivitamin', slug: 'multivitamin', type: 'form' });

        const products = [
            {
                name: 'Pure Vit C Boost',
                slug: 'pure-vit-c-boost',
                description: 'High potency Vitamin C for daily immunity support with added bioflavonoids for maximum absorption.',
                shortDescription: 'The ultimate daily immunity powerhouse.',
                price: 599,
                discountPrice: 899,
                stock: 50,
                targetAudience: [audienceMen._id, audienceWomen._id],
                productForm: [formVitamins._id],
                images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80'],
                benefits: ['Boosts Immunity', 'Antioxidant Rich', 'Skin Health'],
                detailedBenefits: [
                    { title: 'Immune Shield', description: 'Strengthens your natural defenses with high-potency Vitamin C.', iconType: 'emerald' },
                    { title: 'Radiant Skin', description: 'Promotes collagen production for naturally glowing skin.', iconType: 'rose' },
                    { title: 'Vitality Core', description: 'Combats oxidative stress to keep you feeling energized.', iconType: 'blue' }
                ],
                ingredients: ['Ascorbic Acid', 'Citrus Bioflavonoids', 'Rose Hips'],
                usageInstructions: 'Take one tablet daily after breakfast with plenty of water.',
                unitCount: 60,
                unitName: 'Tablets',
                rating: 4.8,
                numReviews: 1250,
                isBestSeller: true
            },
            {
                name: 'Omega 3 Fish Oil',
                slug: 'omega-3-fish-oil',
                description: 'Essential fatty acids sourced from wild-caught cold-water fish for heart and brain health.',
                shortDescription: 'Pure Omega-3s for a healthier heart.',
                price: 899,
                discountPrice: 1199,
                stock: 30,
                targetAudience: [audienceMen._id, audienceWomen._id],
                productForm: [formSupplements._id],
                images: ['https://plus.unsplash.com/premium_photo-1675716443562-b771d72a3da7?auto=format&fit=crop&q=80'],
                benefits: ['Heart Health', 'Brain Function', 'Joint Support'],
                detailedBenefits: [
                    { title: 'Heart Guardian', description: 'Supports healthy cholesterol levels and cardiovascular function.', iconType: 'rose' },
                    { title: 'Brain Focus', description: 'Enhances cognitive clarity and memory retention.', iconType: 'blue' },
                    { title: 'Joint Comfort', description: 'Reduces inflammation for smoother, pain-free movement.', iconType: 'emerald' }
                ],
                ingredients: ['Pure Fish Oil', 'EPA (360mg)', 'DHA (240mg)'],
                usageInstructions: 'Take two softgels daily, preferably with an evening meal.',
                unitCount: 90,
                unitName: 'Softgels',
                rating: 4.9,
                numReviews: 840,
                isFeatured: true
            },
            {
                name: 'Multivitamin Elite',
                slug: 'multivitamin-elite',
                description: 'A comprehensive blend of 24 essential vitamins and minerals tailored for active individuals.',
                shortDescription: 'Fuel your day with Elite nutrition.',
                price: 1299,
                discountPrice: 1799,
                stock: 20,
                targetAudience: [audienceMen._id, audienceWomen._id],
                productForm: [formMultivitamin._id, formVitamins._id],
                images: ['https://images.unsplash.com/photo-1626074961596-cab914d9392e?auto=format&fit=crop&q=80'],
                benefits: ['Energy Boost', 'Muscle Recovery', 'Daily Nutrition'],
                detailedBenefits: [
                    { title: 'All-Day Energy', description: 'Metabolic co-factors to keep you going from dawn to dusk.', iconType: 'blue' },
                    { title: 'Peak Recovery', description: 'Essential minerals to support muscle health after exercise.', iconType: 'emerald' },
                    { title: 'Foundational Health', description: 'Fills the nutritional gaps in your daily diet.', iconType: 'rose' }
                ],
                ingredients: ['Vitamin A, C, D, E', 'Zinc', 'B-Complex Vitamins', 'Magnesium'],
                usageInstructions: 'Take one capsule once a day with your main meal.',
                unitCount: 60,
                unitName: 'Capsules',
                rating: 4.7,
                numReviews: 2100,
                isNewLaunch: true
            }
        ];

        await Product.insertMany(products);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
