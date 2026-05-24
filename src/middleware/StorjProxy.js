const path = require('path');
const fs   = require('fs');
const cnf  = require(path.join(__dirname, '..', '..', 'Config.js'));

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

const CACHE_DIR = path.join(__dirname, '..', '..', 'public', 'cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const s3 = new S3Client({
    endpoint:        'https://gateway.storjshare.io',
    region:          'us-east-1',
    credentials: {
        accessKeyId:     'ju45enihf6n6uhgcarq5ngx7lyxa',
        secretAccessKey: 'jzrthpufsvdxf74bz7og6gzgsc7adg37bgsef3aqa7lqjz2m4k6ok',
    },
    forcePathStyle: true,
});

const BUCKET = 'gtps-cdn';

const StorjProxy = async (req, res, next) => {
    if (!req.path.startsWith('/cache/')) return next();
    if (!cnf.storj_enabled) return next();

    const fileSuffix = req.path.replace(/^\/cache\//, '');
    if (fileSuffix.includes('..') || fileSuffix.trim() === '') return next();

    const localPath = path.join(CACHE_DIR, fileSuffix);

    // Cek local cache dulu
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
        return next();
    }

    const s3Key = `cache/${fileSuffix}`;
    console.log(`[Storj] Fetching from S3: ${s3Key}`);

    try {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: s3Key });
        const s3Res   = await s3.send(command);

        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        res.set({
            'Content-Type':           'application/octet-stream',
            'Accept-Ranges':          'bytes',
            'Cache-Control':          'max-age=31526583',
            'Expires':                expirationDate.toUTCString(),
            'Last-Modified':          new Date().toUTCString(),
            'Server':                 'nginx',
            'ServerId':               '02',
            'ServerLocation':         'apac',
            'X-Cache-Status':         'MISS',
            'Alt-Svc':                'quic=":443"; ma=93600; v="43"',
            'X-OpenStack-Request-Id': 'tx' + Math.random().toString(36).substring(2),
            'X-Timestamp':            (Date.now() / 1000).toString(),
            'X-Trans-Id':             'tx' + Math.random().toString(36).substring(2),
        });

        if (cnf.storj_cache_local) {
            const dir = path.dirname(localPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            const fileStream = fs.createWriteStream(localPath);
            s3Res.Body.pipe(fileStream);
            s3Res.Body.pipe(res);
            fileStream.on('finish', () => console.log(`[Storj] Cached locally: ${localPath}`));
        } else {
            s3Res.Body.pipe(res);
        }

    } catch (err) {
        if (err.name === 'NoSuchKey') {
            console.warn(`[Storj] Not found: ${s3Key}`);
            return res.sendStatus(200);
        }
        console.error(`[Storj] S3 error: ${err.message}`);
        return next();
    }
};

module.exports = StorjProxy;
