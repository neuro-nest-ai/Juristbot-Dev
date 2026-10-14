
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const { authenticateAppRoleAndVerifySecret } = require('./src/database/db');
const { connectToMongo } = require('./src/database/mongodb');
const cors    = require('cors');
const dotenv  = require('dotenv');
const http    = require('http');
const trialCron = require('./src/cron/trailend');

const app    = express();
const server = http.createServer(app);

// ── Env ──────────────────────────────────────────────────────────────────────
const env = process.env.NODE_ENV || 'Dev';
dotenv.config({ path: `.env.${env}` });
console.log(`🌍 Running in ${env} mode`);

const port = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    ...(process.env.CORS_ORIGIN_CLIENT ? process.env.CORS_ORIGIN_CLIENT.split(',') : []),
    ...(process.env.CORS_ORIGIN_ADMIN  ? process.env.CORS_ORIGIN_ADMIN.split(',')  : [])
].map(o => o.trim()).filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (Google OAuth redirect, Postman, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

const { errorHandler, logRequestResponse } = require('./src/middleware/index');
const { initSocket } = require('./test');

(async () => {
    try {
        await authenticateAppRoleAndVerifySecret();
        await connectToMongo();

        // ── Middleware ────────────────────────────────────────────────────────
        app.use(cors(corsOptions));
        app.options('*', cors(corsOptions));        // handle preflight for ALL routes

        app.use(express.json({ limit: '50mb' }));
        app.use(logRequestResponse);

        // ── Routes ────────────────────────────────────────────────────────────
        const appRoutesAssigner = require('./src/routes/index');
        appRoutesAssigner(app);

        app.get('/', (req, res) => {
            res.status(200).json({ message: '🟢 JuristBot API server is running.' });
        });

        // ── Socket + Error handler ────────────────────────────────────────────
        initSocket(server);
        app.use(errorHandler);
        require('./src/cron/expireTrialPack'); 
        trialCron.startTrialCron();
        server.listen(port, () => {
            console.log(`✅ Server running on port ${port}`);
        });

    } catch (err) {
        console.error('❌ Server failed to start:', err);
    }
})();