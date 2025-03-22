# GameHub Production Deployment

This directory contains the production-ready build of the GameHub web application.

## Deployment Instructions

1. Install dependencies:
   ```
   npm install --production
   ```

2. Start the server:
   ```
   npm start
   ```
   
   Alternatively, you can specify a custom port:
   ```
   PORT=8080 npm start
   ```

## Structure

- `dist/index.js` - The compiled server code
- `dist/public/` - Static assets for the frontend
  - `dist/public/assets/` - CSS and JavaScript files
  - `dist/public/games/` - Game files and assets
  - `dist/public/index.html` - Main HTML file

## Version

This deployment contains:
- Frontend version: v1.0.0-p (production)
- Server version: v1.0.0

## Notes

- The server uses an in-memory database by default
- Remember to check the browser console for any potential issues
- The application is configured to work correctly with absolute URLs in production