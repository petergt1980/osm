const xss = require('xss-clean');
const helmet = require('helmet');

const xssProtection = [
    xss(),
    helmet.xssFilter(),
    helmet.noSniff(),
    helmet.frameguard({ action: 'deny' })
];

module.exports = xssProtection;