require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: [process.env.FRONTEND_URL, 'https://budgettracko.app', 'https://www.budgettracko.app', 'http://localhost:5173'],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Authorization"],
        credentials: true
    },
    transports: ['websocket', 'polling'] // Allow both
});

// Import and initialize socket handlers
require('./src/tracko-pulse/api/sockets/ask-tracko-socket')(io);

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
