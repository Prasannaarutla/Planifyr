const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function finalFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all existing users
    await User.deleteMany({});
    console.log('Cleared all users');

    // Create user with plain password (let pre-save hook hash it)
    const newUser = new User({
      username: 'btech3year',
      email: 'btech3year@studyplanner.com',
      password: 'demo123', // Plain password - will be hashed by pre-save hook
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
    console.log('✅ User created with plain password (auto-hashed)');

    // Test the saved user
    const savedUser = await User.findOne({ email: 'btech3year@studyplanner.com' });
    console.log('Password hash length:', savedUser.password.length);
    
    const loginMatch = await savedUser.comparePassword('demo123');
    console.log('✅ Login test result:', loginMatch);

    if (loginMatch) {
      console.log('\n🎉 SUCCESS! Login credentials are working!');
      console.log('📧 Email: btech3year@studyplanner.com');
      console.log('🔑 Password: demo123');
      console.log('\n🌐 Go to: http://localhost:3000');
      
      // Now add the subjects and tasks back
      console.log('\n📚 Adding B.Tech subjects...');
      await addSubjectsAndTasks(savedUser._id);
      console.log('✅ All data restored!');
      
    } else {
      console.log('\n❌ Still not working');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

async function addSubjectsAndTasks(userId) {
  const Subject = require('./models/Subject');
  const Task = require('./models/Task');
  const StudyPlan = require('./models/StudyPlan');
  
  // B.Tech subjects data (simplified)
  const subjects = [
    {
      name: 'Automata Compiler Design',
      description: 'Study of formal languages, automata theory, and compiler design principles',
      color: '#FF6B6B',
      priority: 'high',
      user: userId,
      topics: [
        { name: 'Finite Automata', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Regular Expressions', difficulty: 'easy', estimatedTime: 90 },
        { name: 'Context-Free Grammars', difficulty: 'medium', estimatedTime: 150 }
      ]
    },
    {
      name: 'Object Oriented Analysis and Design',
      description: 'Object-oriented principles, design patterns, and UML modeling',
      color: '#4ECDC4',
      priority: 'high',
      user: userId,
      topics: [
        { name: 'OO Principles', difficulty: 'easy', estimatedTime: 90 },
        { name: 'UML Class Diagrams', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Design Patterns', difficulty: 'hard', estimatedTime: 150 }
      ]
    },
    {
      name: 'Full Stack Web Development',
      description: 'Modern web development with frontend and backend technologies',
      color: '#45B7D1',
      priority: 'high',
      user: userId,
      topics: [
        { name: 'React.js Fundamentals', difficulty: 'medium', estimatedTime: 180 },
        { name: 'Node.js & Express', difficulty: 'medium', estimatedTime: 180 },
        { name: 'RESTful APIs', difficulty: 'medium', estimatedTime: 120 }
      ]
    },
    {
      name: 'Information Security',
      description: 'Cryptography, network security, and information protection',
      color: '#96CEB4',
      priority: 'high',
      user: userId,
      topics: [
        { name: 'Symmetric Cryptography', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Network Security', difficulty: 'medium', estimatedTime: 150 },
        { name: 'Web Application Security', difficulty: 'hard', estimatedTime: 150 }
      ]
    },
    {
      name: 'Machine Learning and Data Science',
      description: 'Machine learning algorithms, data analysis, and AI concepts',
      color: '#FFEAA7',
      priority: 'high',
      user: userId,
      topics: [
        { name: 'Linear Regression', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Neural Networks', difficulty: 'hard', estimatedTime: 180 },
        { name: 'Python for Data Science', difficulty: 'medium', estimatedTime: 150 }
      ]
    },
    {
      name: 'Power BI',
      description: 'Business intelligence, data visualization, and analytics',
      color: '#DDA0DD',
      priority: 'medium',
      user: userId,
      topics: [
        { name: 'Data Connection & Transformation', difficulty: 'medium', estimatedTime: 120 },
        { name: 'DAX Functions', difficulty: 'hard', estimatedTime: 150 },
        { name: 'Creating Visualizations', difficulty: 'easy', estimatedTime: 90 }
      ]
    },
    {
      name: 'Basics of Smart Materials',
      description: 'Introduction to smart materials and their applications',
      color: '#FFB347',
      priority: 'medium',
      user: userId,
      topics: [
        { name: 'Shape Memory Alloys', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Piezoelectric Materials', difficulty: 'medium', estimatedTime: 120 },
        { name: 'Smart Composites', difficulty: 'hard', estimatedTime: 150 }
      ]
    }
  ];

  // Create subjects
  const createdSubjects = [];
  for (const subjectData of subjects) {
    const subject = new Subject(subjectData);
    await subject.save();
    createdSubjects.push(subject);
  }

  // Create some sample tasks
  const tasks = [];
  const today = new Date();
  
  createdSubjects.forEach((subject, subjectIndex) => {
    for (let i = 0; i < 5; i++) {
      const daysFromNow = Math.floor(Math.random() * 30);
      const dueDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
      const topicIndex = Math.floor(Math.random() * subject.topics.length);
      const topic = subject.topics[topicIndex];
      
      tasks.push({
        title: `${topic.name} - ${subject.name.split(' ').map(word => word[0]).join('')}`,
        description: `Complete study of ${topic.name.toLowerCase()} for ${subject.name}`,
        user: userId,
        subject: subject._id,
        topic: topic.name,
        priority: 'medium',
        dueDate: dueDate,
        estimatedTime: topic.estimatedTime,
        status: 'pending'
      });
    }
  });

  await Task.insertMany(tasks);

  // Create study plan
  const studyPlan = new StudyPlan({
    name: 'B.Tech 3rd Year - Study Plan',
    user: userId,
    subjects: createdSubjects.map(subject => ({
      subject: subject._id,
      weight: 1.0,
      targetHours: 50
    })),
    settings: {
      dailyStudyHours: 6,
      breakDuration: 15,
      difficulty: 'intermediate'
    },
    aiGenerated: true,
    isActive: true,
    progress: {
      totalTasks: tasks.length,
      completedTasks: 0,
      adherenceRate: 0
    }
  });

  await studyPlan.save();
}

finalFix();
