import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { ChevronLeft, ChevronRight, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const response = await axios.get(`/api/tasks/calendar/${year}/${month}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch calendar tasks');
    } finally {
      setLoading(false);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = getTasksForDate(date);
      if (dayTasks.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="flex space-x-1">
              {dayTasks.slice(0, 3).map((task, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full ${getPriorityColor(task.priority)}`}
                  title={task.title}
                />
              ))}
              {dayTasks.length > 3 && (
                <div className="w-1 h-1 rounded-full bg-gray-400" />
              )}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayTasks = getTasksForDate(date);
      const hasHighPriority = dayTasks.some(task => task.priority === 'high');
      const hasOverdue = dayTasks.some(task => task.status === 'overdue');
      
      let classes = [];
      if (dayTasks.length > 0) classes.push('has-tasks');
      if (hasHighPriority) classes.push('has-high-priority');
      if (hasOverdue) classes.push('has-overdue');
      if (date.toDateString() === new Date().toDateString()) classes.push('today');
      
      return classes.join(' ');
    }
    return null;
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View your tasks and deadlines in calendar format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="react-calendar-wrapper">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="react-calendar"
              />
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-400">High Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Medium Priority</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks for selected date */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {formatDate(selectedDate)}
            </h3>
            
            {selectedDateTasks.length > 0 ? (
              <div className="space-y-4">
                {selectedDateTasks.map((task) => (
                  <div key={task._id} className="border-l-4 border-primary-500 pl-4 py-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium text-gray-900 dark:text-white ${
                        task.status === 'completed' ? 'line-through' : ''
                      }`}>
                        {task.title}
                      </h4>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.subject?.color }}
                        />
                        <span>{task.subject?.name}</span>
                      </div>
                      
                      <div className={`flex items-center space-x-1 ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? (
                          <CheckSquare className="h-3 w-3" />
                        ) : task.status === 'overdue' ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        <span>{task.status.replace('_', ' ')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedTime}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No tasks scheduled for this date
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Month Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Tasks</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="font-medium text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Overdue</span>
                  <span className="font-medium text-red-600">
                    {tasks.filter(t => t.status === 'overdue').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">High Priority</span>
                  <span className="font-medium text-red-600">
                    {tasks.filter(t => t.priority === 'high').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .react-calendar-wrapper {
          font-family: inherit;
        }
        
        .react-calendar {
          width: 100%;
          border: none;
          background: transparent;
          color: inherit;
        }
        
        .react-calendar__tile {
          background: transparent;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }
        
        .react-calendar__tile:hover {
          background: rgba(59, 130, 246, 0.1);
        }
        
        .react-calendar__tile--active {
          background: rgba(59, 130, 246, 0.2);
          color: rgb(59, 130, 246);
        }
        
        .react-calendar__tile--has-tasks {
          font-weight: 600;
        }
        
        .react-calendar__tile--today {
          background: rgba(59, 130, 246, 0.1);
          color: rgb(59, 130, 246);
        }
        
        .react-calendar__tile--has-overdue {
          background: rgba(239, 68, 68, 0.1);
        }
        
        .react-calendar__month-view__days__day--weekend {
          color: rgba(239, 68, 68, 0.7);
        }
        
        .dark .react-calendar {
          color: #f9fafb;
        }
        
        .dark .react-calendar__tile:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        
        .dark .react-calendar__tile--active {
          background: rgba(59, 130, 246, 0.3);
        }
        
        .dark .react-calendar__month-view__days__day--weekend {
          color: rgba(248, 113, 113, 0.7);
        }
        
        .react-calendar__navigation button {
          color: inherit;
        }
        
        .react-calendar__navigation button:hover {
          background-color: rgba(59, 130, 246, 0.1);
        }
        
        .dark .react-calendar__navigation button:hover {
          background-color: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CalendarPage;
