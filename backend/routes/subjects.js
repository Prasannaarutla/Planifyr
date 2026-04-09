const express = require('express');
const { body, validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects for a user
router.get('/', auth, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single subject
router.get('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new subject
router.post('/', auth, [
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('targetDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, priority, targetDate, topics } = req.body;

    const subject = new Subject({
      name,
      description,
      color: color || '#3B82F6',
      priority: priority || 'medium',
      targetDate,
      user: req.userId,
      topics: topics || []
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a subject
router.put('/:id', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('color').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('targetDate').optional().isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, priority, targetDate, topics } = req.body;

    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update fields
    if (name !== undefined) subject.name = name;
    if (description !== undefined) subject.description = description;
    if (color !== undefined) subject.color = color;
    if (priority !== undefined) subject.priority = priority;
    if (targetDate !== undefined) subject.targetDate = targetDate;
    if (topics !== undefined) subject.topics = topics;

    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a topic to a subject
router.post('/:id/topics', auth, [
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('estimatedTime').optional().isInt({ min: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, difficulty, estimatedTime } = req.body;

    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const newTopic = {
      name,
      description,
      difficulty: difficulty || 'medium',
      estimatedTime: estimatedTime || 60,
      completed: false
    };

    subject.topics.push(newTopic);
    await subject.save();

    res.status(201).json(subject);
  } catch (error) {
    console.error('Add topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a topic in a subject
router.put('/:id/topics/:topicIndex', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('estimatedTime').optional().isInt({ min: 5 }),
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, difficulty, estimatedTime, completed } = req.body;
    const topicIndex = parseInt(req.params.topicIndex);

    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (topicIndex < 0 || topicIndex >= subject.topics.length) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Update topic fields
    const topic = subject.topics[topicIndex];
    if (name !== undefined) topic.name = name;
    if (description !== undefined) topic.description = description;
    if (difficulty !== undefined) topic.difficulty = difficulty;
    if (estimatedTime !== undefined) topic.estimatedTime = estimatedTime;
    if (completed !== undefined) topic.completed = completed;

    await subject.save();
    res.json(subject);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const subject = await Subject.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
