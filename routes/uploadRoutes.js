const path = require('path');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

function checkVideoType(file, cb) {
    const filetypes = /mp4|webm|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /video\/(mp4|webm|quicktime)/.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Videos only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

const uploadVideo = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkVideoType(file, cb);
    },
});

function uploadBufferToCloudinary(file, options) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(file.buffer);
    });
}

router.post('/', upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const result = await uploadBufferToCloudinary(req.file, { resource_type: 'image' });
        res.send(result.secure_url);
    } catch (err) {
        next(err);
    }
});

router.post('/multiple', upload.array('images', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const uploads = req.files.map(file =>
            uploadBufferToCloudinary(file, { resource_type: 'image' })
        );
        const results = await Promise.all(uploads);
        res.send(results.map(r => r.secure_url));
    } catch (err) {
        next(err);
    }
});

router.post('/video', uploadVideo.single('video'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const result = await uploadBufferToCloudinary(req.file, { resource_type: 'video' });
        res.send(result.secure_url);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
