const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purevit')
    .then(async () => {
        console.log('Connected to DB');
        const count = await Product.countDocuments();
        console.log(`Product Count: ${count}`);

        if (count > 0) {
            const products = await Product.find().select('name _id').limit(3);
            console.log('Sample Products:', products);
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
