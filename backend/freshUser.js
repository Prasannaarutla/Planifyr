const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createFreshUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing users
    await User.deleteMany({});
    console.log('Cleared all users');

    // Hash password manually first
    const plainPassword = 'demo123';
    console.log('Plain password:', plainPassword);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    console.log('Hashed password length:', hashedPassword.length);
    console.log('Hashed password starts with:', hashedPassword.substring(0, 20));

    // Test the hash immediately
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Hash test result:', testMatch);

    // Create user with pre-hashed password (bypass pre-save hook)
    const newUser = new User({
      username: 'btech3year',
      email: 'btech3year@studyplanner.com',
      password: hashedPassword, // Use pre-hashed password
      profile: {
        firstName: 'B.Tech',
        lastName: 'Student',
        studyLevel: 'college'
      },
      stats: {
        totalStudyTime: 4500,
        streakDays: 15,
        lastStudyDate: new Date(),
        completedTasks: 25
      }
    });

    await newUser.save();
    console.log('✅ User created with pre-hashed password');

    // Test login with the saved user
    const savedUser = await User.findOne({ email: 'btech3year@studyplanner.com' });
    const loginMatch = await savedUser.comparePassword('demo123');
    console.log('✅ Login test result:', loginMatch);

    if (loginMatch) {
      console.log('\n🎉 SUCCESS! Login credentials are working!');
      console.log('📧 Email: btech3year@studyplanner.com');
      console.log('🔑 Password: demo123');
      console.log('\n🌐 Go to: http://localhost:3000');
    } else {
      console.log('\n❌ Still not working. Investigating further...');
      
      // Debug the comparePassword method
      const directCompare = await bcrypt.compare('demo123', savedUser.password);
      console.log('Direct bcrypt compare:', directCompare);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createFreshUser();
