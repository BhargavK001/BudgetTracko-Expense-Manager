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

        // Check maintenance mode and message in one go
        const configs = await AppConfig.find({
            key: { $in: ['maintenance_mode', 'maintenance_message'] }
        });

        const configMap = configs.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});

        if (configMap.maintenance_mode === 'true') {
            const message = configMap.maintenance_message || 'We are currently performing scheduled maintenance. Please try again later.';

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
