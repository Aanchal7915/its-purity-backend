const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');
const { forgotPassword, verifyOTP, resetPassword } = require('../controllers/passwordController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
