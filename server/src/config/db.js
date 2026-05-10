import mongoose from 'mongoose';

let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/mindcare_ai';

    connectionPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000
    });

    const conn = await connectionPromise;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    connectionPromise = null;
    console.error(`Error: ${error.message}`);

    if (process.env.VERCEL) {
      throw error;
    }

    process.exit(1);
  }
};
