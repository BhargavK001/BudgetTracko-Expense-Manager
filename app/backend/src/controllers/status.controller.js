const mongoose = require('mongoose');
const os = require('os');
const https = require('https');

// Helper to check external connectivity
const checkService = (url, options = {}) => {
    return new Promise((resolve) => {
        const req = https.get(url, { ...options, headers: { 'User-Agent': 'BudgetTracko-Monitor', ...options.headers } }, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 500 ? 'online' : `error: ${res.statusCode}`);
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
            github: 'checking',
            resend: 'checking'
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
    const [google, cloudinary, razorpay, github, resend, geminiApi, groqApi, routerApi] = await Promise.all([
        checkService('https://www.google.com'), // General internet check
        checkService('https://status.cloudinary.com'), // Cloudinary Service Status
        checkService('https://api.razorpay.com/'),
        checkService('https://github.com'), // Connectivity check (avoids API rate limiting)
        checkService('https://resend.com'),   // Connectivity check (avoids API auth issues)
        checkService('https://generativelanguage.googleapis.com'), // Gemini
        checkService('https://api.groq.com'), // Groq Cloud
        checkService('https://openrouter.ai') // OpenRouter
    ]);

    status.external = {
        google,
        cloudinary,
        razorpay,
        github,
        resend,
        tracko_ai_gemini: process.env.GEMINI_API_KEY ? geminiApi : 'offline',
        tracko_ai_groq: process.env.GROQ_API_KEY ? groqApi : 'offline',
        tracko_ai_router: process.env.OPENROUTER_API_KEY ? routerApi : 'offline'
    };

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
        'RAZORPAY_WEBHOOK_SECRET',
        'RESEND_API_KEY',
        'GEMINI_API_KEY',
        'GROQ_API_KEY',
        'OPENROUTER_API_KEY'
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
