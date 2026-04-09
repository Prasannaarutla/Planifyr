const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function recreateUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing user
    await User.deleteOne({ email: 'btech3year@studyplanner.com' });
    console.log('Deleted existing user');

    // Create new user with fresh password
    const newUser = new User({
      username: 'btech3year',
      email: 'btech3year@studyplanner.com',
      password: 'demo123', // Will be hashed by pre-save hook
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
    console.log('✅ New user created successfully');

    // Test login
    const testUser = await User.findOne({ email: 'btech3year@studyplanner.com' });
    const isMatch = await testUser.comparePassword('demo123');
    console.log('✅ Password test result:', isMatch);

    if (isMatch) {
      console.log('\n🎉 Login credentials are now working!');
      console.log('📧 Email: btech3year@studyplanner.com');
      console.log('🔑 Password: demo123');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

recreateUser();
