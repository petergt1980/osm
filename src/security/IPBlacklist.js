const express = require('express');

const blacklistedIPs = new Set();
const suspiciousActivities = new Map();

const ipBlacklist = (req, res, next) => {
    const clientIP = req.ip;

    if (blacklistedIPs.has(clientIP)) {
        return res.status(403).send('Access Denied');
    }

    // Track suspicious activities
    if (!suspiciousActivities.has(clientIP)) {
        suspiciousActivities.set(clientIP, {
            count: 1,
            timestamp: Date.now()
        });
    } else {
        const activity = suspiciousActivities.get(clientIP);
        const timeDiff = Date.now() - activity.timestamp;

        // If more than 500 requests within 10 seconds
        if (timeDiff < 10000) {
            activity.count++;
            if (activity.count > 500) {
                blacklistedIPs.add(clientIP);
                return res.status(403).send('IP has been blacklisted');
            }
        } else {
            // Reset counter after 10 seconds
            activity.count = 1;
            activity.timestamp = Date.now();
        }
    }
    next();
};

module.exports = ipBlacklist;