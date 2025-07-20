const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/park-and-ride', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('Please make sure MongoDB is running on your system.');
    console.log('You can install MongoDB from: https://www.mongodb.com/try/download/community');
    console.log('Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('Continuing with in-memory storage for demo purposes...');
    return null;
  }
};

module.exports = { connectDB }; 