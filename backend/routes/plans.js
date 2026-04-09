const express = require('express');
const { body, validationResult } = require('express-validator');
const StudyPlan = require('../models/StudyPlan');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all study plans for a user
router.get('/', auth, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ user: req.userId })
      .populate('subjects.subject', 'name color')
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (error) {
    console.error('Get study plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single study plan
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate('subjects.subject', 'name color');

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new study plan
router.post('/', auth, [
  body('name').notEmpty().trim().escape(),
  body('subjects').isArray(),
  body('settings.dailyStudyHours').optional().isInt({ min: 1, max: 16 }),
  body('settings.breakDuration').optional().isInt({ min: 5, max: 60 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subjects, settings, aiGenerated, aiPrompt } = req.body;

    // Verify all subjects belong to user
    if (subjects && subjects.length > 0) {
      const subjectIds = subjects.map(s => s.subject);
      const userSubjects = await Subject.find({ 
        _id: { $in: subjectIds }, 
        user: req.userId 
      });
      
      if (userSubjects.length !== subjectIds.length) {
        return res.status(400).json({ message: 'Invalid subjects provided' });
      }
    }

    const studyPlan = new StudyPlan({
      name,
      subjects: subjects || [],
      settings: {
        dailyStudyHours: 4,
        breakDuration: 15,
        preferredStudyTimes: [],
        difficulty: 'intermediate',
        ...settings
      },
      aiGenerated: aiGenerated || false,
      aiPrompt,
      user: req.userId
    });

    await studyPlan.save();
    await studyPlan.populate('subjects.subject', 'name color');
    
    res.status(201).json(studyPlan);
  } catch (error) {
    console.error('Create study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI study plan
router.post('/generate', auth, [
  body('subjects').isArray({ min: 1 }),
  body('examDate').isISO8601().toDate(),
  body('dailyStudyHours').isInt({ min: 1, max: 16 }),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subjects, examDate, dailyStudyHours, difficulty, preferences } = req.body;

    // Verify subjects belong to user
    const subjectIds = subjects.map(s => s.subject);
    const userSubjects = await Subject.find({ 
      _id: { $in: subjectIds }, 
      user: req.userId 
    });
    
    if (userSubjects.length !== subjectIds.length) {
      return res.status(400).json({ message: 'Invalid subjects provided' });
    }

    // Generate study schedule (mock AI logic)
    const generatedSchedule = generateStudySchedule(subjects, examDate, dailyStudyHours, difficulty);

    const studyPlan = new StudyPlan({
      name: `AI Generated Study Plan - ${new Date().toLocaleDateString()}`,
      subjects,
      schedule: generatedSchedule,
      settings: {
        dailyStudyHours,
        breakDuration: 15,
        examDate,
        difficulty,
        preferredStudyTimes: preferences?.preferredStudyTimes || []
      },
      aiGenerated: true,
      aiPrompt: `Generate study plan for ${subjects.length} subjects, ${dailyStudyHours} hours/day, exam on ${examDate}`,
      user: req.userId
    });

    await studyPlan.save();
    await studyPlan.populate('subjects.subject', 'name color');
    
    res.status(201).json(studyPlan);
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a study plan
router.put('/:id', auth, [
  body('name').optional().notEmpty().trim().escape(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, isActive, schedule, settings } = req.body;

    const plan = await StudyPlan.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update fields
    if (name !== undefined) plan.name = name;
    if (isActive !== undefined) plan.isActive = isActive;
    if (schedule !== undefined) plan.schedule = schedule;
    if (settings !== undefined) plan.settings = { ...plan.settings, ...settings };

    await plan.save();
    await plan.populate('subjects.subject', 'name color');
    
    res.json(plan);
  } catch (error) {
    console.error('Update study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a study plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('Delete study plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock AI study schedule generator
function generateStudySchedule(subjects, examDate, dailyHours, difficulty) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const schedule = [];
  
  const totalDays = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  const studyDays = Math.min(totalDays, 30); // Limit to 30 days for demo
  
  for (let i = 0; i < studyDays; i++) {
    const daySchedule = {
      day: days[i % 7],
      tasks: []
    };
    
    // Distribute subjects across days
    subjects.forEach((subject, index) => {
      const dayOffset = (i + index) % subjects.length;
      if (dayOffset === 0) {
        const sessionDuration = Math.min(dailyHours * 60 / subjects.length, 120); // Max 2 hours per session
        
        daySchedule.tasks.push({
          subject: subject.subject,
          topic: `Study Session ${i + 1}`,
          startTime: '09:00',
          endTime: '11:00',
          duration: sessionDuration,
          priority: subject.priority || 'medium'
        });
      }
    });
    
    schedule.push(daySchedule);
  }
  
  return schedule;
}

module.exports = router;
