const express    = require('express');
const path       = require('path');
const ejs        = require('ejs');
const bodyParser = require('body-parser');

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(require(path.join(__dirname, 'middleware', 'DefaultHeader.js')));
app.use(require(path.join(__dirname, 'middleware', 'Compression.js')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(require(path.join(__dirname, 'middleware', 'CacheHandler.js')));

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(require(path.join(__dirname, 'security', 'IPBlacklist.js')));
app.use(require(path.join(__dirname, 'security', 'RequestSizeLimiter.js')));
app.use(require(path.join(__dirname, 'security', 'RateLimiter.js')));
app.use(require(path.join(__dirname, 'security', 'XssProtection.js')));

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/', require(path.join(__dirname, 'routes', 'IndexRoute.js')));
app.use('/player', require(path.join(__dirname, 'routes', 'PlayerSupport.js')));
app.use('/growtopia', require(path.join(__dirname, 'routes', 'GrowtopiaGame.js')));

// ─── STORJ CDN PROXY ─────────────────────────────────────────────────────────
// Harus di taruh SEBELUM express.static supaya bisa intercept /cache/* dulu
// Flow: request /cache/file.rttex
//   → cek local public/cache/ dulu
//   → kalau ga ada, auto-fetch dari Storj CDN
//   → stream ke client + simpan lokal (kalau storj_cache_local: true)
app.use(require(path.join(__dirname, 'middleware', 'StorjProxy.js')));

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.includes('/cache/')) {
            res.removeHeader('Content-Length');
            if (filePath.endsWith('.rttex')) {
                res.set('Content-Type', 'application/octet-stream');
            }
        }
    }
}));

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    const currentTime = new Date().toISOString();
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]
                     || req.socket.remoteAddress
                     || req.ip;
    console.warn(
        `[${req.get('host')}] ${clientIP} Missing File -> ${req.method} ${req.originalUrl} - ${currentTime}`,
    );
    res.sendStatus(200);
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(200).send('Internal Server Error');
});

module.exports = app;
