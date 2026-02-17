const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s for Vercel/Atlas latency
      bufferTimeoutMS: 30000, // Wait longer for connection to be ready before timing out operations
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
