import React from 'react';

// Mock data for demonstration
const activityLogs = [
  { id: 1, action: 'Added new car', user: 'Admin User', timestamp: '2023-07-15 09:23:45', details: 'Added Toyota Camry (ABC123)' },
  { id: 2, action: 'Updated rental', user: 'Admin User', timestamp: '2023-07-14 15:30:22', details: 'Extended rental #1234 by 2 days' },
  { id: 3, action: 'Deleted station', user: 'System Admin', timestamp: '2023-07-14 11:15:37', details: 'Removed Airport Pickup Point' },
  { id: 4, action: 'Modified user', user: 'Admin User', timestamp: '2023-07-13 16:42:18', details: 'Updated John Doe\'s contact information' },
  { id: 5, action: 'Added promotion', user: 'Marketing Admin', timestamp: '2023-07-12 10:05:29', details: 'Created Summer Sale promotion' },
];

const ActivityLog = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit & Activity Logs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Recent system activity and changes</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {activityLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {log.user}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing 5 of 245 logs
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            Previous
          </button>
          <button className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
