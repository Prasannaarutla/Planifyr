import React from 'react';
import { BookOpen, Github, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand and description */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              StudyPlanner
            </span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            © 2024 StudyPlanner. Made with{' '}
            <Heart className="inline h-4 w-4 text-red-500 mx-1" />
            for better learning.
          </div>

          {/* Social links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:support@studyplanner.com"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
