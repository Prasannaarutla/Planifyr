const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the user and update password
    const user = await User.findOne({ email: 'btech3year@studyplanner.com' });
    
    if (user) {
      console.log('Found user, updating password...');
      
      // Hash the correct password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('demo123', salt);
      
      // Update user password
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Password updated successfully');
      
      // Test the password
      const isMatch = await user.comparePassword('demo123');
      console.log('✅ Password test result:', isMatch);
      
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixPassword();
