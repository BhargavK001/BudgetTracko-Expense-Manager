const { sendContactEmails } = require('../services/emailService');

/**
 * Handles the contact form submission.
 * POST /api/contact
 */
exports.handleContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, message) are required.',
            });
        }

        // Email format validation (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.',
            });
        }

        // Send emails
        await sendContactEmails({ name, email, message });

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully. We will contact you soon.',
        });
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send your message. Please try again later.',
        });
    }
};
