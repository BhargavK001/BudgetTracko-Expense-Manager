const { upload } = require('../config/cloudinary');
const multer = require('multer');

const uploadAvatarMiddleware = (req, res, next) => {
    // Specifically use multer for a single field named 'avatar'
    const uploadSingle = upload.single('avatar');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer Avatar Error:', err);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Image too large. Max limit is 2MB.'
                });
            }

            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Make sure form key is "avatar".'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            console.error('Unknown Avatar Upload Error:', err);
            return res.status(500).json({
                success: false,
                message: `Upload failed: ${err.message}`
            });
        }

        next();
    });
};

module.exports = uploadAvatarMiddleware;
