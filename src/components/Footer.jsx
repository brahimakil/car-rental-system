import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            &copy; {year} Car Rental System. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0">
            <ul className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="#" className="hover:text-primary dark:hover:text-primary-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary dark:hover:text-primary-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary dark:hover:text-primary-foreground">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
