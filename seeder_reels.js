const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reel = require('./models/Reel');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purevit');

const importData = async () => {
    try {
        await Reel.deleteMany();

        const products = await Product.find();

        if (products.length === 0) {
            console.log('No products found to link reels to!');
            process.exit();
        }

        const sampleReels = [
            {
                title: 'Morning Routine with PureVit',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80',
                product: products[0]._id,
                views: 1200,
                likes: 340
            },
            {
                title: 'Boost Your Energy',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1594489428504-5c0c480a3202?auto=format&fit=crop&q=80',
                product: products[1] ? products[1]._id : products[0]._id,
                views: 5600,
                likes: 890
            },
            {
                title: 'Immunity Hacks',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                thumbnailUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80',
                product: products[2] ? products[2]._id : products[0]._id,
                views: 8900,
                likes: 1200
            }
        ];

        await Reel.insertMany(sampleReels);

        console.log('Reels Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Reel.deleteMany();
        console.log('Reels Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
