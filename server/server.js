// Load environment variables FIRST before any other requires
require('dotenv').config();
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  // Don't log secret
});

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const socket = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socket.init(server);

// Connect to database (async)
let dbError = null;
connectDB().catch(err => {
  console.error('Failed to connect to database', err);
  dbError = err;
});

// Debug route to see DB error
app.get('/api/db-debug', (req, res) => {
  if (dbError) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: dbError.message,
      stack: process.env.NODE_ENV === 'production' ? null : dbError.stack
    });
  }
  res.json({ success: true, message: 'Database connected successfully' });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
