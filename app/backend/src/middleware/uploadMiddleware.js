const { upload } = require('../config/cloudinary');
const multer = require('multer');

const uploadMiddleware = (req, res, next) => {
    // Use the existing multer instance to create a middleware for 'attachments' with max 3 files
    const uploadSingle = upload.array('attachments', 3);

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.error('Multer Error:', err);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Max limit is 2MB per file.'
                });
            }

            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Too many files. Max 3 files allowed.'
                });
            }

            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field. Ensure you are uploading to "attachments".'
                });
            }

            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // An unknown error occurred when uploading (e.g. Cloudinary auth failed)
            console.error('Unknown Upload Error (Cloudinary/Network):', err);

            // Check for common Cloudinary errors
            if (err.message && err.message.includes('CLOUDINARY_URL')) {
                return res.status(500).json({
                    success: false,
                    message: 'Server Error: Cloudinary configuration missing.'
                });
            }

            return res.status(500).json({
                success: false,
                message: `Upload failed: ${err.message}`
            });
        }

        // Everything went fine.
        next();
    });
};

module.exports = uploadMiddleware;
