const express = require('express');

const requestSizeLimiter = express.json({
    limit: '10kb' // Batasi ukuran request JSON
});

module.exports = requestSizeLimiter;