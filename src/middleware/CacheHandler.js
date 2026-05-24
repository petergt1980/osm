const express = require('express');

const CacheHandler = (req, res, next) => {
    if (req.path.startsWith('/cache/')) {
        // Remove any compression-related headers
        if (req.get('host') == 'www.growtopia1.com') {
            res.removeHeader('Content-Encoding');
            res.removeHeader('Transfer-Encoding');
        }
        
        // Setting response headers
        res.set({
            'Accept-Ranges': 'bytes',
            'Alt-Svc': 'quic=":443"; ma=93600; v="43"',
            'Cache-Control': 'max-age=31526583',
            'Content-Type': 'application/octet-stream',
            'Server': 'nginx',
            'ServerId': '02',
            'ServerLocation': 'apac',
            'X-Cache-Status': 'MISS',
            'Last-Modified': new Date().toUTCString(),
            'X-OpenStack-Request-Id': 'tx' + Math.random().toString(36).substring(2),
            'X-Timestamp': (Date.now() / 1000).toString(),
            'X-Trans-Id': 'tx' + Math.random().toString(36).substring(2)
        });

        // Set dynamic expiration date (1 year from now)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        res.set('Expires', expirationDate.toUTCString());
    }
    next();
};

module.exports = CacheHandler;