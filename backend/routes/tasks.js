const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for a user
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, subject, date } = req.query;
    
    // Build filter
    const filter = { user: req.userId };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = subject;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.dueDate = { $gte: startDate, $lte: endDate };
    }

    const tasks = await Task.find(filter)
      .populate('subject', 'name color')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('subject', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/', auth, [
  body('title').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('subject').isMongoId(),
  body('topic').optional().trim().escape(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').isISO8601().toDate(),
  body('estimatedTime').optional().isInt({ min: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, topic, priority, dueDate, estimatedTime, tags, reminder } = req.body;

    // Verify subject belongs to user
    const subjectDoc = await Subject.findOne({ _id: subject, user: req.userId });
    if (!subjectDoc) {
      return res.status(400).json({ message: 'Invalid subject' });
    }

    const task = new Task({
      title,
      description,
      subject,
      topic,
      priority: priority || 'medium',
      dueDate,
      estimatedTime: estimatedTime || 60,
      tags: tags || [],
      reminder: reminder || { enabled: true },
      user: req.userId
    });

    await task.save();
    await task.populate('subject', 'name color');
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', auth, [
  body('title').optional().notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('subject').optional().isMongoId(),
  body('topic').optional().trim().escape(),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'overdue']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().toDate(),
  body('estimatedTime').optional().isInt({ min: 5 }),
  body('actualTime').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, subject, topic, status, priority, dueDate, estimatedTime, actualTime, tags, reminder } = req.body;

    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If changing subject, verify it belongs to user
    if (subject && subject !== task.subject.toString()) {
      const subjectDoc = await Subject.findOne({ _id: subject, user: req.userId });
      if (!subjectDoc) {
        return res.status(400).json({ message: 'Invalid subject' });
      }
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (subject !== undefined) task.subject = subject;
    if (topic !== undefined) task.topic = topic;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (estimatedTime !== undefined) task.estimatedTime = estimatedTime;
    if (actualTime !== undefined) task.actualTime = actualTime;
    if (tags !== undefined) task.tags = tags;
    if (reminder !== undefined) task.reminder = reminder;

    await task.save();
    await task.populate('subject', 'name color');
    
    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark task as completed
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'completed';
    task.completedAt = new Date();
    
    // Update user stats
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 'stats.completedTasks': 1 }
    });

    await task.save();
    await task.populate('subject', 'name color');
    
    res.json(task);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for calendar view
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.userId,
      dueDate: { $gte: startDate, $lte: endDate }
    }).populate('subject', 'name color');

    res.json(tasks);
  } catch (error) {
    console.error('Get calendar tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
