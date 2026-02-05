const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purevit')
    .then(() => console.log('Test MongoDB Connected'))
    .catch(err => console.log(err));

try {
    app.use('/api/reels', require('./routes/reelRoutes'));
    app.use('/api/products', require('./routes/productRoutes'));
    console.log("Mounted /api/reels and /api/products");
} catch (error) {
    console.error("Failed to mount routes:", error);
}

app.get('/', (req, res) => res.send('Test Server Running'));

app.listen(PORT, () => {
    console.log(`Test Server running on port ${PORT}`);
});
