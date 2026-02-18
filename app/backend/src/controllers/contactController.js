const { Resend } = require('resend');
const ContactRequest = require('../models/ContactRequest');

const resend = new Resend(process.env.RESEND_API_KEY);

// Shared logo HTML for email templates
const getLogoHtml = () => {
    const logoUrl = 'https://www.budgettracko.app/logo512.png';
    return `
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px; font-family: sans-serif;">
            <tr>
                <td valign="middle">
                    <img src="${logoUrl}" alt="BudgetTracko Logo" width="40" height="40" style="display: block; width: 40px; height: 40px; border: 2px solid #1a1a1a;">
                </td>
                <td valign="middle" style="padding-left: 10px;">
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: -1px; color: #1a1a1a; text-transform: uppercase;">BUDGET</span>
                    <span style="font-size: 20px; font-weight: 900; letter-spacing: -1px; background-color: #1a1a1a; color: #ffffff; padding: 2px 8px; margin-left: 4px; border: 2px solid #1a1a1a; text-transform: uppercase;">TRACKO</span>
                </td>
            </tr>
        </table>
    `;
};

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

        // Save to database
        await ContactRequest.create({ name, email, message });

        const logoHtml = getLogoHtml();

        // 1. Send notification to Admin
        await resend.emails.send({
            from: 'BudgetTracko Support <support@budgettracko.app>',
            to: 'bhargavk056@gmail.com',
            subject: `New Contact Form: ${name}`,
            html: `
                <div style="background-color: #FFD700; padding: 40px 20px; font-family: sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #1a1a1a; box-shadow: 8px 8px 0px 0px #1a1a1a; padding: 40px;">
                        ${logoHtml}
                        <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; color: #1a1a1a; border-bottom: 4px solid #1a1a1a; padding-bottom: 10px;">New Submission</h1>
                        <p style="font-size: 16px; font-weight: 700; margin-bottom: 10px; color: #1a1a1a;"><strong>From:</strong> ${name} (${email})</p>
                        <p style="font-size: 16px; font-weight: 700; margin-bottom: 10px; color: #1a1a1a;"><strong>Message:</strong></p>
                        <div style="background-color: #f5f5f5; border: 2px solid #1a1a1a; padding: 20px; font-size: 16px; color: #1a1a1a; line-height: 1.5;">
                            ${message}
                        </div>
                    </div>
                </div>
            `,
        });

        // 2. Send confirmation to User
        await resend.emails.send({
            from: 'BudgetTracko Support <support@budgettracko.app>',
            to: email,
            subject: 'We received your message! - BudgetTracko',
            html: `
                <div style="background-color: #FFD700; padding: 40px 20px; font-family: sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #1a1a1a; box-shadow: 8px 8px 0px 0px #1a1a1a; padding: 40px;">
                        ${logoHtml}
                        <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; line-height: 1.1; color: #1a1a1a;">Got it! We'll talk soon.</h1>
                        <p style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a;">Hey ${name},</p>
                        <p style="font-size: 16px; font-weight: 500; line-height: 1.6; color: #1a1a1a; margin-bottom: 24px;">
                            Thanks for reaching out to BudgetTracko. We've received your message and our team is already on it. We usually reply faster than a coffee break.
                        </p>
                        <div style="background-color: #f5f5f5; border: 2px solid #1a1a1a; padding: 15px; margin-bottom: 30px;">
                            <p style="font-size: 13px; font-weight: 900; text-transform: uppercase; margin: 0 0 10px 0; color: #666;">Your Message:</p>
                            <p style="font-size: 15px; font-style: italic; color: #1a1a1a; margin: 0;">"${message.length > 300 ? message.substring(0, 300) + '...' : message}"</p>
                        </div>
                        <p style="font-size: 16px; font-weight: 900; color: #1a1a1a; margin-bottom: 40px;">
                            Stay Bold,<br>
                            The BudgetTracko Team
                        </p>
                        <hr style="border: none; border-top: 3px solid #1a1a1a; margin-bottom: 20px;">
                        <p style="font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; text-align: center; margin: 0;">
                            &copy; 2026 BudgetTracko &bull; Kothrud, Pune &bull; Maharashtra
                        </p>
                    </div>
                </div>
            `,
        });

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

/**
 * Get all contact requests (Admin)
 * GET /api/admin/contacts
 */
exports.getContactRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // optional filter

        const query = {};
        if (status && ['unread', 'read', 'replied'].includes(status)) {
            query.status = status;
        }

        const [requests, total] = await Promise.all([
            ContactRequest.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            ContactRequest.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: requests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin Contact Requests Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch contact requests' });
    }
};

/**
 * Reply to a contact request (Admin)
 * POST /api/admin/contacts/:id/reply
 */
exports.replyToContactRequest = async (req, res) => {
    try {
        const { replyContent } = req.body;
        if (!replyContent) {
            return res.status(400).json({ success: false, message: 'Reply content is required' });
        }

        const contactRequest = await ContactRequest.findById(req.params.id);
        if (!contactRequest) {
            return res.status(404).json({ success: false, message: 'Contact request not found' });
        }

        const logoHtml = getLogoHtml();

        // Send reply email to user
        await resend.emails.send({
            from: 'BudgetTracko Support <support@budgettracko.app>',
            to: contactRequest.email,
            subject: `Re: Your message to BudgetTracko`,
            html: `
                <div style="background-color: #FFD700; padding: 40px 20px; font-family: sans-serif;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 4px solid #1a1a1a; box-shadow: 8px 8px 0px 0px #1a1a1a; padding: 40px;">
                        ${logoHtml}
                        <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; color: #1a1a1a; border-bottom: 4px solid #1a1a1a; padding-bottom: 10px;">We've Responded</h1>
                        <p style="font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #1a1a1a;">Hey ${contactRequest.name},</p>
                        <p style="font-size: 14px; font-weight: 500; color: #666; margin-bottom: 10px;">Your original message:</p>
                        <div style="background-color: #f5f5f5; border: 2px solid #e0e0e0; padding: 15px; margin-bottom: 20px;">
                            <p style="font-size: 14px; font-style: italic; color: #666; margin: 0;">"${contactRequest.message.length > 200 ? contactRequest.message.substring(0, 200) + '...' : contactRequest.message}"</p>
                        </div>
                        <p style="font-size: 14px; font-weight: 500; color: #666; margin-bottom: 10px;">Our response:</p>
                        <div style="background-color: #fff9e6; border: 2px solid #1a1a1a; padding: 20px; margin-bottom: 30px;">
                            <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6; margin: 0;">${replyContent}</p>
                        </div>
                        <p style="font-size: 16px; font-weight: 900; color: #1a1a1a; margin-bottom: 40px;">
                            Best regards,<br>
                            The BudgetTracko Team
                        </p>
                        <hr style="border: none; border-top: 3px solid #1a1a1a; margin-bottom: 20px;">
                        <p style="font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; text-align: center; margin: 0;">
                            &copy; 2026 BudgetTracko &bull; Kothrud, Pune &bull; Maharashtra
                        </p>
                    </div>
                </div>
            `,
        });

        // Update contact request status
        contactRequest.status = 'replied';
        contactRequest.replyContent = replyContent;
        contactRequest.repliedAt = new Date();
        await contactRequest.save();

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: contactRequest
        });
    } catch (error) {
        console.error('Admin Reply Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send reply' });
    }
};

/**
 * Mark a contact request as read (Admin)
 * PATCH /api/admin/contacts/:id/read
 */
exports.markAsRead = async (req, res) => {
    try {
        const contactRequest = await ContactRequest.findById(req.params.id);
        if (!contactRequest) {
            return res.status(404).json({ success: false, message: 'Contact request not found' });
        }

        if (contactRequest.status === 'unread') {
            contactRequest.status = 'read';
            await contactRequest.save();
        }

        res.json({ success: true, data: contactRequest });
    } catch (error) {
        console.error('Admin Mark Read Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update contact request' });
    }
};
