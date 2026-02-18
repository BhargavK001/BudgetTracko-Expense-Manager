const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a contact form submission email to admin and a confirmation to the user.
 * @param {Object} details - The contact details
 * @param {string} details.name - User's name
 * @param {string} details.email - User's email
 * @param {string} details.message - User's message
 */
const sendContactEmails = async ({ name, email, message }) => {
    try {
        // Use hosted logo for reliability, with a table-based text logo as fallback/support
        const logoUrl = 'https://www.budgettracko.app/logo512.png';
        const logoHtml = `
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

        // 1. Send notification to Admin
        const adminEmail = await resend.emails.send({
            from: 'BudgetTracko Support <support@budgettracko.app>',
            to: 'bhargavk056@gmail.com',
            subject: `⚡ New Contact Form: ${name}`,
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
        const userEmail = await resend.emails.send({
            from: 'BudgetTracko Support <support@budgettracko.app>',
            to: email,
            subject: 'We received your message! ⚡ - BudgetTracko',
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
                            &copy; 2026 BudgetTracko • Kothrud, Pune • Maharashtra
                        </p>
                    </div>
                </div>
            `,
        });

        return { adminEmail, userEmail };
    } catch (error) {
        console.error('Error sending emails:', error);
        throw error;
    }
};

module.exports = {
    sendContactEmails,
};
