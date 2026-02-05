const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get Admin Analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateQuery = {};

        if (startDate && endDate) {
            dateQuery = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Sales & Orders Overview within range
        const totalOrders = await Order.countDocuments(dateQuery);
        const pendingOrders = await Order.countDocuments({ ...dateQuery, status: 'Processing' });
        const shippedOrders = await Order.countDocuments({ ...dateQuery, status: 'Out for delivery' });
        const deliveredOrders = await Order.countDocuments({ ...dateQuery, status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ ...dateQuery, status: 'Cancelled' });
        const returnedOrders = await Order.countDocuments({ ...dateQuery, status: 'Returned' });

        // Revenue Aggregations within range
        const revenueAgg = await Order.aggregate([
            {
                $match: {
                    ...dateQuery,
                    status: { $nin: ['Cancelled', 'Returned', 'Replaced'] }
                }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // Customer Insights (Always shows total, but new customers within range or last 30d)
        const totalCustomers = await User.countDocuments({ role: 'user' });

        let customerDateRange = dateQuery.createdAt || {};
        if (!startDate) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            customerDateRange = { $gte: thirtyDaysAgo };
        }

        const newCustomers = await User.countDocuments({
            role: 'user',
            createdAt: customerDateRange
        });

        // Product Status (Doesn't depend on date)
        const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);
        const totalProducts = await Product.countDocuments();

        // Best Sellers within range
        const bestSellersAgg = await Order.aggregate([
            { $match: dateQuery },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productInfo' } },
            { $unwind: '$productInfo' }
        ]);

        // Sales Trend within range
        // Group by YYYY-MM-DD
        const salesData = await Order.aggregate([
            {
                $match: {
                    ...dateQuery,
                    status: { $nin: ['Cancelled', 'Returned', 'Replaced'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Status Breakdown within range
        const statusBreakdown = await Order.aggregate([
            { $match: dateQuery },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Notifications / Recent Activity within range
        const recentOrders = await Order.find(dateQuery).sort({ createdAt: -1 }).limit(10).populate('user', 'name email');

        res.json({
            stats: {
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalProducts,
                newCustomers,
                growth: 15
            },
            orders: {
                pending: pendingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders,
                returned: returnedOrders
            },
            lowStock: lowStockProducts,
            bestSellers: bestSellersAgg,
            statusBreakdown,
            salesData,
            recentOrders
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalytics
};
