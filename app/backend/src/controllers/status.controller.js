const mongoose = require('mongoose');
const os = require('os');
const https = require('https');

// Helper to check external connectivity
const checkService = (url, options = {}) => {
    return new Promise((resolve) => {
        const req = https.get(url, { ...options, headers: { 'User-Agent': 'BudgetTracko-Monitor', ...options.headers } }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400 ? 'online' : `error: ${res.statusCode}`);
        });
        req.on('error', (err) => resolve('unreachable'));
        req.setTimeout(5000, () => {
            req.destroy();
            resolve('timeout');
        });
    });
};

exports.getStatus = async (req, res) => {
    const status = {
        server: {
            status: 'online',
            uptime: process.uptime(),
            timestamp: new Date(),
        },
        database: {
            status: 'disconnected',
            latency: null,
        },
        environment: {
            status: 'ok',
            missing: [],
        },
        system: {
            memory: process.memoryUsage(),
            os: {
                platform: os.platform(),
                release: os.release(),
                type: os.type(),
                loadAvg: os.loadavg(),
                totalMem: os.totalmem(),
                freeMem: os.freemem(),
            }
        },
        external: {
            google: 'checking',
            cloudinary: 'checking',
            razorpay: 'checking',
            github: 'checking'
        }
    };

    // Check Database
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusMap = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };
        status.database.status = statusMap[dbStatus] || 'unknown';

        if (dbStatus === 1) {
            const start = Date.now();
            await mongoose.connection.db.admin().ping();
            status.database.latency = Date.now() - start;
        }
    } catch (error) {
        status.database.status = 'error';
        status.database.error = error.message;
    }

    // Check External Services (Parallel)
    const [google, cloudinary, razorpay, github] = await Promise.all([
        checkService('https://www.google.com'), // General internet check
        checkService('https://api.cloudinary.com/v1_1/demo/ping'), // Cloudinary ping (public demo) or just base
        checkService('https://api.razorpay.com/'),
        checkService('https://api.github.com')
    ]);

    status.external = { google, cloudinary, razorpay, github };

    // Check Environment Variables
    const requiredEnv = [
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'NODE_ENV',
        'FRONTEND_URL',
        'BACKEND_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'RAZORPAY_KEY_ID',
        'RAZORPAY_KEY_SECRET',
        'RAZORPAY_WEBHOOK_SECRET'
    ];

    const missingEnvs = requiredEnv.filter(key => !process.env[key]);
    if (missingEnvs.length > 0) {
        status.environment.status = 'issues_found';
        status.environment.missing = missingEnvs;
    }

    // Helper to format uptime
    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor(seconds % (3600 * 24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${d}d ${h}h ${m}m ${s}s`;
    };

    status.server.uptimeFormatted = formatUptime(status.server.uptime);

    res.json(status);
};
