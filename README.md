# 📚 AI Study Planner Web Application

A comprehensive full-stack study planner application designed to help students organize their subjects, manage tasks, and generate AI-powered study schedules. Built with React.js frontend, Node.js backend, and MongoDB database.

## 🎯 Features

- **🔐 User Authentication** - Secure signup, login, and profile management
- **📚 Subject Management** - Create subjects with topics and track progress
- **✅ Task Management** - Full CRUD operations with priorities and deadlines
- **📅 Calendar View** - Visual calendar with task scheduling
- **🤖 AI Study Plans** - Generate intelligent study schedules
- **🌙 Dark Mode** - Toggle between light and dark themes
- **📊 Progress Tracking** - Visual progress indicators and statistics
- **📱 Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

1. **Node.js** (v14 or higher)
2. **npm** (v6 or higher)
3. **MongoDB** (local installation or MongoDB Atlas account)

## 🚀 Quick Setup Guide

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd StudyPlanner
```

### Step 2: Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyplanner
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here (optional)
```

**Note:** Replace `your_jwt_secret_key_here` with a secure random string.

### Step 4: Start MongoDB

#### Option A: Local MongoDB
```bash
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Step 5: Run the Application

#### Start Backend Server
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

#### Start Frontend Server
Open a new terminal:
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 🎮 Demo Account Setup

### Option 1: Use Existing Demo (Recommended)
The application comes with a pre-configured demo account:

**📧 Email:** `btech3year@studyplanner.com`  
**🔑 Password:** `demo123`

### Option 2: Create Your Own Demo Data
If you want to populate the database with sample B.Tech subjects:

1. **Run the seed script:**
```bash
cd backend
node seedDatabase.js
```

2. **Or run the final fix script:**
```bash
cd backend
node finalFix.js
```

This will create:
- ✅ Demo user account
- 📚 7 B.Tech subjects with topics
- 📊 Sample tasks and deadlines
- 🎯 AI-generated study plan

## 📁 Project Structure

```
StudyPlanner/
├── backend/                 # Node.js + Express API
│   ├── models/             # MongoDB Data Models
│   │   ├── User.js         # User authentication & profile
│   │   ├── Subject.js      # Subject & topic management
│   │   ├── Task.js         # Task scheduling & tracking
│   │   └── StudyPlan.js    # AI-generated study plans
│   ├── routes/             # API Endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── subjects.js     # Subject CRUD operations
│   │   ├── tasks.js        # Task management
│   │   └── plans.js        # Study plan generation
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React.js SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.js   # Navigation with dark mode
│   │   │   └── Footer.js   # Footer component
│   │   ├── contexts/       # React Context providers
│   │   │   ├── AuthContext.js    # Authentication state
│   │   │   └── ThemeContext.js   # Theme management
│   │   ├── pages/          # Page components
│   │   │   ├── Login.js    # User authentication
│   │   │   ├── Register.js # User registration
│   │   │   ├── Dashboard.js # Main dashboard
│   │   │   ├── Subjects.js # Subject management
│   │   │   ├── Tasks.js    # Task management
│   │   │   ├── Calendar.js # Calendar view
│   │   │   ├── StudyPlans.js # AI study plans
│   │   │   └── Profile.js  # User profile
│   │   └── App.js          # Main app router
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind configuration
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject
- `POST /api/subjects/:id/topics` - Add topic to subject
- `PUT /api/subjects/:id/topics/:index` - Update topic

### Tasks
- `GET /api/tasks` - Get all tasks (with filtering)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `GET /api/tasks/calendar/:year/:month` - Get calendar tasks

### Study Plans
- `GET /api/plans` - Get all study plans
- `POST /api/plans` - Create study plan
- `POST /api/plans/generate` - Generate AI study plan
- `PUT /api/plans/:id` - Update study plan
- `DELETE /api/plans/:id` - Delete study plan

## 🎯 Usage Guide

### 1. **Getting Started**
- Login with demo credentials or create a new account
- Navigate to the Dashboard to see your overview

### 2. **Managing Subjects**
- Go to Subjects page
- Click "Add Subject" to create new subjects
- Add topics to each subject with difficulty levels
- Track progress by marking topics as complete

### 3. **Task Management**
- Visit Tasks page to create and manage tasks
- Set priorities, due dates, and estimated time
- Filter tasks by subject, priority, or status
- Mark tasks as complete to track progress

### 4. **Calendar View**
- Use the Calendar page for visual scheduling
- See color-coded tasks by priority
- Click on dates to view detailed task lists

### 5. **AI Study Plans**
- Generate intelligent study schedules
- Configure daily study hours and preferences
- Track adherence and progress

### 6. **Personalization**
- Update your profile information
- Toggle dark mode for comfortable studying
- View your study statistics and streaks

## 🐛 Troubleshooting

### Common Issues

#### 1. **"Invalid Credentials" Error**
- Ensure MongoDB is running
- Check that the demo user was created properly
- Run `node finalFix.js` to recreate the demo account

#### 2. **MongoDB Connection Error**
- Verify MongoDB is installed and running
- Check your `MONGODB_URI` in `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

#### 3. **Frontend Not Loading**
- Ensure both frontend and backend servers are running
- Check that the backend is running on port 5000
- Verify the frontend proxy configuration

#### 4. **Port Already in Use**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Debug Commands

#### Test Backend Connection
```bash
# Test if backend is responding
curl http://localhost:5000/api/auth/register
```

#### Check Database Connection
```bash
# Test MongoDB connection
node -e "require('./models/User')"
```

#### Recreate Demo Data
```bash
cd backend
node finalFix.js
```

## 🎨 Customization

### Adding New Subjects
1. Update the `seedDatabase.js` file with your subjects
2. Add topics with difficulty levels and time estimates
3. Run the seed script to populate the database

### Modifying AI Study Plans
1. Edit the `/api/plans/generate` endpoint in `routes/plans.js`
2. Customize the generation algorithm
3. Add new parameters and preferences

### Changing Theme Colors
1. Update `tailwind.config.js` for new color schemes
2. Modify CSS variables in `src/index.css`
3. Update component color classes

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update environment variables for API URL

### Backend Deployment (Heroku/Railway)
1. Set environment variables in hosting platform
2. Deploy the backend code
3. Ensure MongoDB is accessible (use MongoDB Atlas)

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=your_frontend_url
```

## 📝 License

This project is for educational purposes. Feel free to use, modify, and distribute according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running properly
4. Recreate demo data if needed

---

**🎓 Happy Studying!** 

This AI Study Planner is designed to help you organize your studies effectively and achieve your academic goals.
