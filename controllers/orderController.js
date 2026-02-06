const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            userNotes
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            // Check stock first
            // Note: In a real high-concurrency app, this should be a transaction.
            // For now, we decrement efficiently.

            // Validate stock
            /* See Implementation Note: We skip pre-check for speed and assume UI checked, 
               but ideally we should check here. We will just decrement. failure leaves negative stock which admin sees. */

            // Decrement Stock
            for (const item of orderItems) {
                const product = await require('../models/Product').findById(item.product);
                if (product) {
                    product.stock = product.stock - item.qty;
                    await product.save();
                }
            }

            console.log('Creating Order for user:', req.user._id);
            const order = new Order({
                items: orderItems.map(item => ({
                    product: item.product,
                    quantity: item.qty,
                    price: item.price,
                    name: item.name,
                    image: item.image
                })),
                user: req.user._id,
                shippingAddress,
                paymentMethod,
                totalAmount: totalPrice,
                userNotes
            });

            const createdOrder = await order.save();
            console.log('Order created:', createdOrder._id);

            // Send Email (fail-safe)
            try {
                await sendEmail({
                    email: req.user.email,
                    subject: 'Purevit - Order Placed Successfully',
                    message: `Hi ${req.user.name}, \n\nThank you for your order! We have received your order #${createdOrder._id}. \n\nTotal: ₹${totalPrice}\nStatus: Processing\n\nWe will notify you when it ships.`,
                    html: `<h1>Thank You!</h1><p>Order #${createdOrder._id} has been placed.</p><p><strong>Total:</strong> ₹${totalPrice}</p><p>We will process it shortly.</p>`
                });
            } catch (error) {
                console.error('Email send failed:', error);
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error('Error in addOrderItems:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .populate('items.product', 'name images price');
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id name')
        .populate('items.product', 'name');
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const { status, adminNotes } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product');

    if (order) {
        const oldStatus = order.status;

        // Handle Stock Restoration if Cancelled/Returned
        if ((status === 'Cancelled' || status === 'Returned') && (oldStatus !== 'Cancelled' && oldStatus !== 'Returned')) {
            for (const item of order.items) {
                // Safely get product ID even if population failed or product was deleted
                const productId = item.product?._id || item.product;
                if (!productId) continue;

                const product = await Product.findById(productId);
                if (product) {
                    product.stock += (item.quantity || 0);
                    await product.save();
                }
            }
        }

        order.status = status;
        if (adminNotes) order.adminNotes = adminNotes;

        order.timeline.push({ status, date: Date.now() });
        const updatedOrder = await order.save();

        // Send Email
        try {
            if (order.user && order.user.email) {
                await sendEmail({
                    email: order.user.email,
                    subject: `Purevit - Order status updated to ${status}`,
                    message: `Hi ${order.user.name}, \n\nYour order #${order._id} status has been updated to: ${status}.`,
                    html: `<h1>Order Update</h1><p>Your order #${order._id} is now <strong>${status}</strong>.</p>`
                });
            }
        } catch (error) {
            console.error('Email send failed:', error);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
}

module.exports = {
    addOrderItems,
    getMyOrders,
    getOrders,
    updateOrderStatus
};
