const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    weight: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 5
    },
    targetHours: {
      type: Number,
      default: 0
    }
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    tasks: [{
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      topic: String,
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      duration: Number,  // in minutes
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      }
    }]
  }],
  settings: {
    dailyStudyHours: {
      type: Number,
      default: 4,
      min: 1,
      max: 16
    },
    breakDuration: {
      type: Number,
      default: 15, // in minutes
      min: 5,
      max: 60
    },
    preferredStudyTimes: [{
      start: String, // HH:MM format
      end: String   // HH:MM format
    }],
    examDate: Date,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  },
  isActive: {
    type: Boolean,
    default: false
  },
  progress: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    adherenceRate: { type: Number, default: 0 } // percentage
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  aiPrompt: String
}, {
  timestamps: true
});

// Calculate progress
StudyPlanSchema.methods.calculateProgress = function() {
  // This would be implemented when we have actual task data
  // For now, it's a placeholder
  this.progress.totalTasks = this.schedule.reduce((total, day) => total + day.tasks.length, 0);
  // completedTasks would be calculated based on actual task completion
  this.progress.adherenceRate = this.progress.totalTasks > 0 
    ? (this.progress.completedTasks / this.progress.totalTasks) * 100 
    : 0;
};

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
