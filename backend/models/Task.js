const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 60,
    min: [5, 'Estimated time must be at least 5 minutes']
  },
  actualTime: {
    type: Number, // in minutes
    default: 0
  },
  completedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  reminder: {
    enabled: { type: Boolean, default: true },
    time: { type: Date } // when to send reminder
  }
}, {
  timestamps: true
});

// Update status based on due date
TaskSchema.pre('save', function(next) {
  if (this.dueDate < new Date() && this.status === 'pending') {
    this.status = 'overdue';
  }
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Index for better query performance
TaskSchema.index({ user: 1, dueDate: 1 });
TaskSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);
