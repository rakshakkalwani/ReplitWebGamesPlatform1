# GameHub Production Deployment

This directory contains the production-ready build of the GameHub web application.

## Quick Start

Use the deployment script to quickly get started:

```bash
./deploy.sh
```

## Detailed Deployment Instructions

1. Set up environment variables (optional):
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

2. Install dependencies:
   ```bash
   npm install --production
   ```

3. Start the server:
   ```bash
   # Default port (5001)
   NODE_ENV=production npm start
   
   # Custom port
   PORT=8080 NODE_ENV=production npm start
   ```

## Structure

- `dist/index.js` - The compiled server code
- `dist/public/` - Static assets for the frontend
  - `dist/public/assets/` - CSS and JavaScript files (minified)
  - `dist/public/games/` - Game files and assets
  - `dist/public/index.html` - Main HTML file

## Monitoring

- Check that the server is running by accessing the root URL or `/health` endpoint
- The server logs startup information and API requests

## Version

This deployment contains:
- Frontend version: v1.0.0-p (production)
- Server version: v1.0.0

## Notes

- The server uses an in-memory database by default
- The application is optimized for production with minified assets
- The system is configured to work correctly with absolute URLs in production
- Frontend assets total size: ~670KB (72KB CSS + 598KB JS)

## Troubleshooting

- If games don't appear, check network connections and browser console
- If server won't start, verify that the port isn't in use
- For persistence issues, consider configuring a database connection