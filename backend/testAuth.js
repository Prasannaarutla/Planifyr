const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user exists
    const user = await User.findOne({ email: 'btech3year@studyplanner.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Username:', user.username);
      console.log('   Password Hash exists:', !!user.password);
      
      // Test password comparison
      const isMatch = await user.comparePassword('demo123');
      console.log('   Password matches:', isMatch);
    } else {
      console.log('❌ User not found in database');
      console.log('Available users:');
      const allUsers = await User.find({}, { email: 1, username: 1 });
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.username})`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAuth();
