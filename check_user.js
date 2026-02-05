const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purevit');
        const user = await User.findOne({ email: 'aanchal2115@gmail.com' });
        if (user) {
            console.log('User found:', JSON.stringify({
                email: user.email,
                role: user.role,
                name: user.name
            }, null, 2));
        } else {
            console.log('User not found: aanchal2115@gmail.com');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
