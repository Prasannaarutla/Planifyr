const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Find user
    const user = await User.findOne({ email: 'btech3year@studyplanner.com' });
    console.log('User exists:', !!user);
    
    if (user) {
      // Test 2: Password comparison
      const isMatch = await user.comparePassword('demo123');
      console.log('Password matches:', isMatch);
      
      // Test 3: Create test login data (what the API would receive)
      const loginData = {
        email: 'btech3year@studyplanner.com',
        password: 'demo123'
      };
      
      console.log('Login data:', loginData);
      console.log('User email:', user.email);
      console.log('Password hash length:', user.password.length);
      
      // Test 4: Manual bcrypt comparison
      const bcrypt = require('bcryptjs');
      const manualMatch = await bcrypt.compare('demo123', user.password);
      console.log('Manual bcrypt match:', manualMatch);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testApi();
