// main function
const RequestLogger = async (req, res, next) => {
    // Setting the headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    res.set({
        'Server': 'nginx',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Expires': '-1',
        'Pragma': 'no-cache',
        'ETag': ''
    });
    const originalStatus = res.status;
    res.status = function(code) {
        return originalStatus.call(this, 200);
    };
    req.setTimeout(30000); // 30 seconds timeout
    res.setTimeout(30000); // 30 seconds timeout

    // passing the request to the next handler
    next();
};

// exporting the middleware
module.exports = RequestLogger;