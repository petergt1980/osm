// importing the compression module
const compression = require('compression');

// setting the middleware
const Compression = compression(
    {
        level: 5,
        threshold: 0,
        filter: (req, res) => {
            if (req.headers['x-no-compression'] || req.path.startsWith('/cache/')) {
                return false;
            }
            return compression.filter(req, res);
        }
    }
);

// exporting the middleware
module.exports = Compression;