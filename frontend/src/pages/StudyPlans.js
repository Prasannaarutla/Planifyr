import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Target, Clock, Zap, BookOpen } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subjects: [],
    settings: {
      dailyStudyHours: 4,
      breakDuration: 15,
      difficulty: 'intermediate'
    }
  });
  const [generateFormData, setGenerateFormData] = useState({
    subjects: [],
    examDate: '',
    dailyStudyHours: 4,
    difficulty: 'intermediate',
    preferences: {
      preferredStudyTimes: []
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subjectsRes] = await Promise.all([
        axios.get('/api/plans'),
        axios.get('/api/subjects')
      ]);
      
      setPlans(plansRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPlan) {
        const response = await axios.put(`/api/plans/${editingPlan._id}`, formData);
        setPlans(plans.map(plan => 
          plan._id === editingPlan._id ? response.data : plan
        ));
        toast.success('Study plan updated successfully');
      } else {
        const response = await axios.post('/api/plans', formData);
        setPlans([...plans, response.data]);
        toast.success('Study plan created successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving study plan:', error);
      toast.error('Failed to save study plan');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/plans/generate', generateFormData);
      setPlans([...plans, response.data]);
      toast.success('AI study plan generated successfully');
      resetGenerateForm();
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error('Failed to generate study plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this study plan?')) return;
    
    try {
      await axios.delete(`/api/plans/${planId}`);
      setPlans(plans.filter(plan => plan._id !== planId));
      toast.success('Study plan deleted successfully');
    } catch (error) {
      console.error('Error deleting study plan:', error);
      toast.error('Failed to delete study plan');
    }
  };

  const handleToggleActive = async (planId) => {
    try {
      const plan = plans.find(p => p._id === planId);
      const response = await axios.put(`/api/plans/${planId}`, {
        isActive: !plan.isActive
      });
      setPlans(plans.map(p => 
        p._id === planId ? response.data : p
      ));
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast.error('Failed to update plan status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subjects: [],
      settings: {
        dailyStudyHours: 4,
        breakDuration: 15,
        difficulty: 'intermediate'
      }
    });
    setEditingPlan(null);
    setShowModal(false);
  };

  const resetGenerateForm = () => {
    setGenerateFormData({
      subjects: [],
      examDate: '',
      dailyStudyHours: 4,
      difficulty: 'intermediate',
      preferences: {
        preferredStudyTimes: []
      }
    });
    setShowGenerateModal(false);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      subjects: plan.subjects,
      settings: plan.settings
    });
    setShowModal(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Plans</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage your AI-generated study schedules
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-secondary inline-flex items-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            Generate AI Plan
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Plans grid */}
      {plans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className={`card ${plan.isActive ? 'ring-2 ring-primary-500' : ''}`}>
              {/* Plan header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {plan.name}
                    {plan.aiGenerated && (
                      <Zap className="h-4 w-4 text-yellow-500 ml-2" />
                    )}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(plan.settings.difficulty)}`}>
                      {plan.settings.difficulty}
                    </span>
                    {plan.isActive && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full text-green-600 bg-green-100 dark:bg-green-900/20">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(plan._id)}
                    className={`p-2 ${plan.isActive ? 'text-green-600' : 'text-gray-400'} hover:text-green-700`}
                  >
                    {plan.isActive ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => openEditModal(plan)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Plan details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Daily Study Hours</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.settings.dailyStudyHours} hours
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Break Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.settings.breakDuration} minutes
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subjects</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.subjects.length} subjects
                  </span>
                </div>

                {plan.settings.examDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Exam Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(plan.settings.examDate)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.progress.totalTasks}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium text-green-600">
                    {plan.progress.completedTasks}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              {plan.progress.totalTasks > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(plan.progress.adherenceRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${plan.progress.adherenceRate}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Subjects preview */}
              {plan.subjects.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: subject.subject?.color }}
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {subject.subject?.name || 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No study plans yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first study plan or generate an AI-powered schedule to get started.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="btn-secondary inline-flex items-center"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate AI Plan
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingPlan ? 'Edit Study Plan' : 'Create Study Plan'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Final Exam Study Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    className="input"
                    value={formData.settings.dailyStudyHours}
                    onChange={(e) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, dailyStudyHours: parseInt(e.target.value)}
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    className="input"
                    value={formData.settings.breakDuration}
                    onChange={(e) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, breakDuration: parseInt(e.target.value)}
                    })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    className="input"
                    value={formData.settings.difficulty}
                    onChange={(e) => setFormData({
                      ...formData, 
                      settings: {...formData.settings, difficulty: e.target.value}
                    })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingPlan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate AI Plan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Generate AI Study Plan
            </h2>
            
            <form onSubmit={handleGenerate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Subjects *
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {subjects.map(subject => (
                      <label key={subject._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={generateFormData.subjects.some(s => s.subject === subject._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGenerateFormData({
                                ...generateFormData,
                                subjects: [...generateFormData.subjects, { 
                                  subject: subject._id, 
                                  weight: 1, 
                                  targetHours: 0 
                                }]
                              });
                            } else {
                              setGenerateFormData({
                                ...generateFormData,
                                subjects: generateFormData.subjects.filter(s => s.subject !== subject._id)
                              });
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {subject.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="input"
                    value={generateFormData.examDate}
                    onChange={(e) => setGenerateFormData({...generateFormData, examDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Study Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    className="input"
                    value={generateFormData.dailyStudyHours}
                    onChange={(e) => setGenerateFormData({...generateFormData, dailyStudyHours: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    className="input"
                    value={generateFormData.difficulty}
                    onChange={(e) => setGenerateFormData({...generateFormData, difficulty: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetGenerateForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlans;
