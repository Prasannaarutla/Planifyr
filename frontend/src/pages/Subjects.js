import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, CheckCircle, Circle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    priority: 'medium',
    targetDate: ''
  });
  const [topicFormData, setTopicFormData] = useState({
    name: '',
    description: '',
    difficulty: 'medium',
    estimatedTime: 60
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingSubject) {
        const response = await axios.put(`/api/subjects/${editingSubject._id}`, formData);
        setSubjects(subjects.map(subject => 
          subject._id === editingSubject._id ? response.data : subject
        ));
        toast.success('Subject updated successfully');
      } else {
        const response = await axios.post('/api/subjects', formData);
        setSubjects([...subjects, response.data]);
        toast.success('Subject created successfully');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject');
    }
  };

  const handleDelete = async (subjectId) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await axios.delete(`/api/subjects/${subjectId}`);
      setSubjects(subjects.filter(subject => subject._id !== subjectId));
      toast.success('Subject deleted successfully');
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`/api/subjects/${selectedSubject._id}/topics`, topicFormData);
      setSubjects(subjects.map(subject => 
        subject._id === selectedSubject._id ? response.data : subject
      ));
      toast.success('Topic added successfully');
      setTopicFormData({ name: '', description: '', difficulty: 'medium', estimatedTime: 60 });
      setShowTopicModal(false);
    } catch (error) {
      console.error('Error adding topic:', error);
      toast.error('Failed to add topic');
    }
  };

  const toggleTopicComplete = async (subjectId, topicIndex) => {
    try {
      const subject = subjects.find(s => s._id === subjectId);
      const topic = subject.topics[topicIndex];
      
      const response = await axios.put(`/api/subjects/${subjectId}/topics/${topicIndex}`, {
        completed: !topic.completed
      });
      
      setSubjects(subjects.map(s => s._id === subjectId ? response.data : s));
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      priority: 'medium',
      targetDate: ''
    });
    setEditingSubject(null);
    setShowModal(false);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      color: subject.color,
      priority: subject.priority,
      targetDate: subject.targetDate ? new Date(subject.targetDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const openTopicModal = (subject) => {
    setSelectedSubject(subject);
    setShowTopicModal(true);
  };

  const getProgressPercentage = (subject) => {
    if (subject.totalTopics === 0) return 0;
    return Math.round((subject.completedTopics / subject.totalTopics) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subjects and track topics
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </button>
      </div>

      {/* Subjects grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject._id} className="card">
              {/* Subject header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {subject.name}
                    </h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(subject.priority)}`}>
                      {subject.priority}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(subject)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject._id)}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {subject.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {subject.description}
                </p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subject.completedTopics}/{subject.totalTopics} topics
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(subject)}%` }}
                  />
                </div>
              </div>

              {/* Topics preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Recent Topics
                  </span>
                  <button
                    onClick={() => openTopicModal(subject)}
                    className="text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Add Topic
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {subject.topics.slice(0, 3).map((topic, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleTopicComplete(subject._id, index)}
                          className="text-gray-400 hover:text-primary-600"
                        >
                          {topic.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <span className={`truncate ${topic.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                          {topic.name}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {topic.estimatedTime}m
                      </div>
                    </div>
                  ))}
                  {subject.topics.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{subject.topics.length - 3} more topics
                    </p>
                  )}
                </div>
              </div>

              {/* Target date */}
              {subject.targetDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Target: {new Date(subject.targetDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No subjects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first subject to get started with organizing your studies.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Subject
          </button>
        </div>
      )}

      {/* Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingSubject ? 'Edit Subject' : 'Create Subject'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Mathematics, Physics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the subject"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      className="input h-10"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      className="input"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  />
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
                  {editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Topic to {selectedSubject.name}
            </h2>
            
            <form onSubmit={handleAddTopic}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Topic Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    value={topicFormData.name}
                    onChange={(e) => setTopicFormData({...topicFormData, name: e.target.value})}
                    placeholder="e.g., Algebra, Thermodynamics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows={2}
                    value={topicFormData.description}
                    onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                    placeholder="Brief description of the topic"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty
                    </label>
                    <select
                      className="input"
                      value={topicFormData.difficulty}
                      onChange={(e) => setTopicFormData({...topicFormData, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Est. Time (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      className="input"
                      value={topicFormData.estimatedTime}
                      onChange={(e) => setTopicFormData({...topicFormData, estimatedTime: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subjects;
