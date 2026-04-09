const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Task = require('./models/Task');
const StudyPlan = require('./models/StudyPlan');
require('dotenv').config();

// B.Tech 3rd Year Subjects Data
const btechSubjects = [
  {
    name: 'Automata Compiler Design',
    shortName: 'ACD',
    description: 'Study of formal languages, automata theory, and compiler design principles',
    color: '#FF6B6B',
    priority: 'high',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    topics: [
      { name: 'Finite Automata', description: 'DFA and NFA concepts', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Regular Expressions', description: 'Pattern matching and regex', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Context-Free Grammars', description: 'CFG and derivations', difficulty: 'medium', estimatedTime: 150 },
      { name: 'Pushdown Automata', description: 'PDA and acceptance', difficulty: 'hard', estimatedTime: 120 },
      { name: 'Turing Machines', description: 'Basic TM concepts', difficulty: 'hard', estimatedTime: 180 },
      { name: 'Lexical Analysis', description: 'Token recognition and patterns', difficulty: 'medium', estimatedTime: 100 },
      { name: 'Syntax Analysis', description: 'Parsing techniques', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Semantic Analysis', description: 'Type checking and symbol tables', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Code Generation', description: 'Intermediate code and optimization', difficulty: 'hard', estimatedTime: 180 },
      { name: 'Runtime Environments', description: 'Memory management and activation records', difficulty: 'medium', estimatedTime: 90 }
    ]
  },
  {
    name: 'Object Oriented Analysis and Design',
    shortName: 'OOAD',
    description: 'Object-oriented principles, design patterns, and UML modeling',
    color: '#4ECDC4',
    priority: 'high',
    targetDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'OO Principles', description: 'Encapsulation, inheritance, polymorphism', difficulty: 'easy', estimatedTime: 90 },
      { name: 'UML Class Diagrams', description: 'Class relationships and associations', difficulty: 'medium', estimatedTime: 120 },
      { name: 'UML Sequence Diagrams', description: 'Interaction modeling', difficulty: 'medium', estimatedTime: 90 },
      { name: 'Design Patterns - Creational', description: 'Singleton, Factory, Builder patterns', difficulty: 'medium', estimatedTime: 150 },
      { name: 'Design Patterns - Structural', description: 'Adapter, Decorator, Proxy patterns', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Design Patterns - Behavioral', description: 'Observer, Strategy, Command patterns', difficulty: 'hard', estimatedTime: 180 },
      { name: 'GRASP Patterns', description: 'General Responsibility Assignment Software Patterns', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Agile Methodologies', description: 'Scrum and XP principles', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Requirements Analysis', description: 'Use cases and user stories', difficulty: 'medium', estimatedTime: 120 },
      { name: 'System Architecture', description: 'Layered and microservices architecture', difficulty: 'hard', estimatedTime: 150 }
    ]
  },
  {
    name: 'Full Stack Web Development',
    shortName: 'FSW',
    description: 'Modern web development with frontend and backend technologies',
    color: '#45B7D1',
    priority: 'high',
    targetDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'HTML5 & CSS3 Advanced', description: 'Semantic HTML and modern CSS', difficulty: 'easy', estimatedTime: 120 },
      { name: 'JavaScript ES6+', description: 'Modern JavaScript features', difficulty: 'medium', estimatedTime: 150 },
      { name: 'React.js Fundamentals', description: 'Components, state, and props', difficulty: 'medium', estimatedTime: 180 },
      { name: 'React Hooks & State Management', description: 'useState, useEffect, Context API', difficulty: 'medium', estimatedTime: 150 },
      { name: 'Node.js & Express', description: 'Backend development with JavaScript', difficulty: 'medium', estimatedTime: 180 },
      { name: 'RESTful APIs', description: 'API design and implementation', difficulty: 'medium', estimatedTime: 120 },
      { name: 'MongoDB & Databases', description: 'NoSQL database concepts', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Authentication & Security', description: 'JWT, OAuth, and security best practices', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Deployment & DevOps', description: 'Cloud deployment and CI/CD', difficulty: 'hard', estimatedTime: 180 },
      { name: 'Progressive Web Apps', description: 'PWA concepts and service workers', difficulty: 'medium', estimatedTime: 120 }
    ]
  },
  {
    name: 'Information Security',
    shortName: 'IS',
    description: 'Cryptography, network security, and information protection',
    color: '#96CEB4',
    priority: 'high',
    targetDate: new Date(Date.now() + 88 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'Introduction to Security', description: 'Security concepts and terminology', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Symmetric Cryptography', description: 'AES, DES, and block ciphers', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Asymmetric Cryptography', description: 'RSA and public key infrastructure', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Hash Functions & Digital Signatures', description: 'SHA, MD5, and digital signatures', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Network Security', description: 'Firewalls, IDS, and network protocols', difficulty: 'medium', estimatedTime: 150 },
      { name: 'Web Application Security', description: 'XSS, CSRF, and injection attacks', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Security Policies & Risk Management', description: 'Security frameworks and compliance', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Ethical Hacking', description: 'Penetration testing methodologies', difficulty: 'hard', estimatedTime: 180 },
      { name: 'Security Auditing', description: 'Vulnerability assessment and tools', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Incident Response', description: 'Security incident handling and forensics', difficulty: 'medium', estimatedTime: 90 }
    ]
  },
  {
    name: 'Machine Learning and Data Science',
    shortName: 'MLDS',
    description: 'Machine learning algorithms, data analysis, and AI concepts',
    color: '#FFEAA7',
    priority: 'high',
    targetDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'Introduction to ML', description: 'Types of learning and basic concepts', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Linear Regression', description: 'Simple and multiple linear regression', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Logistic Regression', description: 'Classification using logistic regression', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Decision Trees & Random Forests', description: 'Tree-based algorithms', difficulty: 'medium', estimatedTime: 150 },
      { name: 'Support Vector Machines', description: 'SVM theory and applications', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Neural Networks', description: 'Deep learning fundamentals', difficulty: 'hard', estimatedTime: 180 },
      { name: 'Clustering Algorithms', description: 'K-means, hierarchical clustering', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Data Preprocessing', description: 'Cleaning, transformation, and feature engineering', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Model Evaluation', description: 'Metrics and cross-validation', difficulty: 'medium', estimatedTime: 90 },
      { name: 'Python for Data Science', description: 'NumPy, Pandas, and Scikit-learn', difficulty: 'medium', estimatedTime: 150 }
    ]
  },
  {
    name: 'Power BI',
    shortName: 'PowerBI',
    description: 'Business intelligence, data visualization, and analytics',
    color: '#DDA0DD',
    priority: 'medium',
    targetDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'Introduction to Power BI', description: 'Interface and basic concepts', difficulty: 'easy', estimatedTime: 60 },
      { name: 'Data Connection & Transformation', description: 'Power Query and data cleaning', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Data Modeling', description: 'Relationships and data modeling concepts', difficulty: 'medium', estimatedTime: 120 },
      { name: 'DAX Functions', description: 'Data Analysis Expressions', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Creating Visualizations', description: 'Charts, graphs, and custom visuals', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Dashboard Design', description: 'Creating interactive dashboards', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Power BI Service', description: 'Cloud sharing and collaboration', difficulty: 'easy', estimatedTime: 60 },
      { name: 'Advanced Analytics', description: 'Statistical functions and forecasting', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Report Publishing', description: 'Sharing and embedding reports', difficulty: 'easy', estimatedTime: 60 },
      { name: 'Real-time Dashboards', description: 'Streaming data and real-time updates', difficulty: 'medium', estimatedTime: 90 }
    ]
  },
  {
    name: 'Basics of Smart Materials',
    shortName: 'SM',
    description: 'Introduction to smart materials and their applications',
    color: '#FFB347',
    priority: 'medium',
    targetDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
    topics: [
      { name: 'Introduction to Smart Materials', description: 'Definition and classification', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Shape Memory Alloys', description: 'SMA properties and applications', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Piezoelectric Materials', description: 'Piezoelectric effect and applications', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Electroactive Polymers', description: 'EAP types and characteristics', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Magnetostrictive Materials', description: 'Magnetic field responsive materials', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Thermoresponsive Materials', description: 'Temperature-sensitive materials', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Chromogenic Materials', description: 'Color-changing materials', difficulty: 'easy', estimatedTime: 90 },
      { name: 'Smart Composites', description: 'Composite smart materials', difficulty: 'hard', estimatedTime: 150 },
      { name: 'Applications in Engineering', description: 'Real-world applications', difficulty: 'medium', estimatedTime: 120 },
      { name: 'Future Trends', description: 'Emerging smart materials', difficulty: 'easy', estimatedTime: 90 }
    ]
  }
];

// Sample tasks for each subject
const generateTasks = (subjects, userId) => {
  const tasks = [];
  const today = new Date();
  
  subjects.forEach((subject, subjectIndex) => {
    // Generate tasks for next 30 days
    for (let i = 0; i < 15; i++) {
      const daysFromNow = Math.floor(Math.random() * 30);
      const dueDate = new Date(today.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
      const topicIndex = Math.floor(Math.random() * subject.topics.length);
      const topic = subject.topics[topicIndex];
      
      const priorities = ['low', 'medium', 'high'];
      const statuses = ['pending', 'in_progress', 'completed'];
      
      tasks.push({
        title: `${topic.name} - ${subject.name.split(' ').map(word => word[0]).join('')}`,
        description: `Complete study of ${topic.name.toLowerCase()} for ${subject.name}`,
        user: userId,
        subject: subject._id,
        topic: topic.name,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        dueDate: dueDate,
        estimatedTime: topic.estimatedTime,
        actualTime: Math.floor(Math.random() * topic.estimatedTime),
        status: i < 5 ? 'completed' : statuses[Math.floor(Math.random() * (statuses.length - 1))],
        tags: [subject.name.split(' ').map(word => word[0]).join('').toLowerCase(), topic.name.toLowerCase().split(' ')[0] || ''],
        reminder: {
          enabled: true,
          time: new Date(dueDate.getTime() - 24 * 60 * 60 * 1000) // 1 day before
        }
      });
    }
  });
  
  return tasks;
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Task.deleteMany({});
    await StudyPlan.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = new User({
      username: 'btech3year',
      email: 'btech3year@studyplanner.com',
      password: hashedPassword,
      profile: {
        firstName: 'B.Tech',
        lastName: 'Student',
        studyLevel: 'college'
      },
      stats: {
        totalStudyTime: 4500, // 75 hours
        streakDays: 15,
        lastStudyDate: new Date(),
        completedTasks: 25
      }
    });

    await demoUser.save();
    console.log('Created demo user');

    // Create subjects
    const createdSubjects = [];
    for (const subjectData of btechSubjects) {
      const subject = new Subject({
        ...subjectData,
        user: demoUser._id
      });
      await subject.save();
      createdSubjects.push(subject);
    }
    console.log('Created B.Tech subjects');

    // Generate and create tasks
    const tasks = generateTasks(createdSubjects, demoUser._id);
    await Task.insertMany(tasks);
    console.log('Created sample tasks');

    // Create a study plan
    const studyPlan = new StudyPlan({
      name: 'B.Tech 3rd Year - Semester Study Plan',
      user: demoUser._id,
      subjects: createdSubjects.map(subject => ({
        subject: subject._id,
        weight: subject.priority === 'high' ? 1.5 : 1.0,
        targetHours: subject.priority === 'high' ? 60 : 40
      })),
      settings: {
        dailyStudyHours: 6,
        breakDuration: 15,
        examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        difficulty: 'intermediate'
      },
      aiGenerated: true,
      aiPrompt: 'Generate comprehensive study plan for B.Tech 3rd year student with 7 subjects',
      isActive: true,
      progress: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        adherenceRate: 75
      }
    });

    await studyPlan.save();
    console.log('Created study plan');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Email: btech3year@studyplanner.com');
    console.log('   Password: demo123');
    console.log('\n📚 Subjects added:');
    btechSubjects.forEach(subject => {
      console.log(`   • ${subject.name} (${subject.shortName}) - ${subject.topics.length} topics`);
    });
    console.log(`\n📊 Generated ${tasks.length} sample tasks`);
    console.log('\n🚀 You can now login and explore the demo!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedDatabase();
