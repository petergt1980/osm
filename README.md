# Growtopia HTTPS Server

A simple and secure HTTPS server for hosting your Growtopia Private Server (GTPS).

## Features

- Fixes failed download issues
- HTTPS/SSL support
- Request compression
- Rate limiting
- Request logging
- Cross-Origin Resource Sharing (CORS)
- Express.js backend
- EJS template engine
- Type2 support
- Integrated with GTPSHost

> **Note:**
> When using GTPSHost to create a host, use the `--growplus` flag to add the domain `osm.growplus.asia` to your host.
>
> **Example:**
> ```
> /add MyServer 127.0.0.1 --growplus
> ```

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- NPM (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GTPSHAX/growtopia-https.git
   ```
2. Navigate to the project directory:
   ```bash
   cd growtopia-https/src
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

The server uses SSL certificates for HTTPS connections. Make sure to:

1. Place your SSL certificates in the `certs` directory.
2. Update the certificate paths in your configuration if needed.

## Usage

1. Start the server:
   ```bash
   node MainApp.js
   ```
   Or use the provided batch file.
2. The server will run on the configured port (default: 443 for HTTPS).

## Project Structure

```plaintext
growtopia-https/
├── certs/              # SSL certificates
├── public/             # Static files
├── src/                # Source code
│   ├── MainApp.js      # Main application file
│   ├── package.json    # Project dependencies
│   ├── middleware/     # Express middleware
│   ├── routes/         # Route handlers
│   └── security/       # Security configurations
└── Config.js           # Configuration file
```

## Feature Details

### Compression
- Uses compression middleware to reduce response size
- Configurable compression level
- Supports compression filtering

### Request Logging
- Logs all incoming requests
- Includes timestamp, IP address, and request details
- CORS support included

### Rate Limiting
- Prevents abuse through configurable rate limits and windows

## Contributing

Contributions are welcome! Please submit a Pull Request for improvements or new features.

## License

This project is licensed under the GNU License. See the LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.