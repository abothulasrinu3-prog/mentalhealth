import { User } from './src/models/user.model.js';
import { connectDB } from './src/config/db.js';
import bcrypt from 'bcryptjs';

const createDemoUser = async () => {
  try {
    await connectDB();
    
    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'demo@mindcare.ai' });
    if (existingUser) {
      console.log('Demo user already exists');
      process.exit(0);
    }
    
    // Create demo user
    const demoUser = new User({
      name: 'Demo User',
      email: 'demo@mindcare.ai',
      password: 'demo123',
      age: 25,
      gender: 'prefer-not-to-say'
    });
    
    await demoUser.save();
    console.log('Demo user created successfully!');
    console.log('Email: demo@mindcare.ai');
    console.log('Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating demo user:', error);
    process.exit(1);
  }
};

createDemoUser();
