const AppConfig = require('../models/AppConfig');

/**
 * Maintenance mode middleware
 * Checks if maintenance_mode is enabled in AppConfig.
 * If enabled, blocks all non-admin API requests with a 503 status.
 * Admin routes and webhooks are always allowed through.
 */
const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Always allow these paths through
        const exemptPaths = [
            '/api/admin',
            '/api/payments/webhook',
            '/api/health',
            '/api/config',
            '/auth',
            '/api/csrf-token'
        ];

        const isExempt = exemptPaths.some(path => req.originalUrl.startsWith(path));
        if (isExempt) {
            return next();
        }

        // Check maintenance mode from DB
        const config = await AppConfig.findOne({ key: 'maintenance_mode' });

        if (config && config.value === 'true') {
            // Get optional maintenance message
            const messageConfig = await AppConfig.findOne({ key: 'maintenance_message' });
            const message = messageConfig?.value || 'We are currently performing scheduled maintenance. Please try again later.';

            return res.status(503).json({
                success: false,
                maintenance: true,
                message
            });
        }

        next();
    } catch (error) {
        // If there's an error checking maintenance, let the request through
        // to avoid blocking the entire application
        console.error('Maintenance check error:', error.message);
        next();
    }
};

module.exports = maintenanceMiddleware;
