const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    try {
        const { email, subject, message, html } = options;

        const data = await resend.emails.send({
            from: 'BudgetTracko <noreply@budgettracko.app>', // Verified domain
            to: email,
            subject: subject,
            text: message,
            html: html || message.replace(/\n/g, '<br>'),
        });

        if (data.error) {
            console.error('Resend API Error:', data.error);
            throw data.error;
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

module.exports = sendEmail;
