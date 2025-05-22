import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import MapView from '@/components/dashboard/MapView';
import { 
  getTotalCarsCount, 
  getActiveRentalsCount, 
  getCustomersCount, 
  getRevenue,
  getRecentRentals,
  getRentalsTrend
} from '@/utils/analyticsService';
import { getAllStations } from '@/utils/stationService';
import { getAllCars } from '@/utils/carService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  ChevronUp, 
  ChevronDown, 
  Car as CarIcon, 
  ClipboardList as ClipboardListIcon, 
  Users as UsersIcon, 
  DollarSign as DollarSignIcon
} from 'lucide-react';

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState([
    { title: 'Total Cars', value: '0', change: '0%', icon: 'car' },
    { title: 'Active Rentals', value: '0', change: '0%', icon: 'clipboard' },
    { title: 'Revenue (MTD)', value: '$0', change: '0%', icon: 'dollar' },
    { title: 'Customers', value: '0', change: '0%', icon: 'users' },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapData, setMapData] = useState({ stations: [], cars: [] });
  
  // Helper function to get date range based on selected time range
  const getDateRange = (range) => {
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }
    
    return { startDate, endDate: now };
  };
  
  // Helper to format dates from Firestore timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get date range based on selected time period
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Fetch summary data in parallel
        const [totalCars, activeRentals, totalCustomers, currentRevenue] = await Promise.all([
          getTotalCarsCount(),
          getActiveRentalsCount(),
          getCustomersCount(),
          getRevenue(startDate, endDate)
        ]);
        
        // Get previous period data for comparison
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        previousStartDate.setTime(previousStartDate.getTime() - timeDiff);
        previousEndDate.setTime(previousEndDate.getTime() - timeDiff);
        
        const previousRevenue = await getRevenue(previousStartDate, previousEndDate);
        
        // Calculate percentage changes
        const revenueChange = previousRevenue > 0 
          ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
          : '+0.0';
          
        // Update summary data with real values
        setSummaryData([
          { 
            title: 'Total Cars', 
            value: totalCars.toString(), 
            change: '+0.0%', // Assuming no previous period data for cars
            icon: 'car' 
          },
          { 
            title: 'Active Rentals', 
            value: activeRentals.toString(), 
            change: '+0.0%', // Assuming no previous period data for rentals
            icon: 'clipboard' 
          },
          { 
            title: 'Revenue', 
            value: `$${currentRevenue.toFixed(2)}`, 
            change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
            icon: 'dollar',
            isIncreasing: revenueChange >= 0
          },
          { 
            title: 'Customers', 
            value: totalCustomers.toString(), 
            change: '+0.0%', // Assuming no previous period data for customers
            icon: 'users' 
          },
        ]);
        
        // Get trend data for chart
        const period = timeRange === '7days' || timeRange === '30days' ? 'weekly' : 'monthly';
        const count = timeRange === '3months' ? 3 : timeRange === 'year' ? 12 : 6;
        const trendData = await getRentalsTrend(period, count);
        setTrendData(trendData);
        
        // Get recent activity
        const recentRentals = await getRecentRentals(5);
        setRecentActivity(recentRentals);
        
        // Get map data
        const [stations, cars] = await Promise.all([
          getAllStations(),
          getAllCars()
        ]);
        
        setMapData({
          stations: stations.map(station => ({
            id: station.id,
            lat: station.latitude,
            lng: station.longitude,
            name: station.name,
            address: station.address,
            city: station.city,
            state: station.state,
            zipCode: station.zipCode,
            contactPhone: station.contactPhone,
            contactEmail: station.contactEmail,
            cars: station.availableCars || 0
          })),
          cars: cars
            .filter(car => car.status === 'Available' && car.latitude && car.longitude)
            .map(car => ({
              id: car.id,
              lat: car.latitude,
              lng: car.longitude,
              name: `${car.name} - ${car.model}`,
              status: car.status
            }))
        });
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [timeRange]);
  
  const renderSummaryIcon = (icon) => {
    switch (icon) {
      case 'car':
        return <CarIcon className="h-8 w-8" />;
      case 'clipboard':
        return <ClipboardListIcon className="h-8 w-8" />;
      case 'dollar':
        return <DollarSignIcon className="h-8 w-8" />;
      case 'users':
        return <UsersIcon className="h-8 w-8" />;
      default:
        return <CarIcon className="h-8 w-8" />;
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex space-x-2">
            <select 
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="month">This month</option>
              <option value="3months">Last 3 months</option>
              <option value="year">This year</option>
            </select>
          </div>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {summaryData.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {renderSummaryIcon(item.icon)}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-sm font-medium ${item.isIncreasing !== false ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                    {item.isIncreasing !== false ? (
                      <ChevronUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-1" />
                    )}
                    {item.change}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs. previous period</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map view - 2/3 width on larger screens */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fleet Location</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current locations of cars and stations</p>
            </div>
            <div className="h-[400px]">
              <MapView stations={mapData.stations} cars={mapData.cars} />
            </div>
          </div>
          
          {/* Activity log - 1/3 width on larger screens */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Latest rental transactions</p>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                        <div className="rounded-full bg-primary/10 h-8 w-8 flex items-center justify-center text-primary">
                          <ClipboardListIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.customerName || 'Unknown Customer'} {activity.status === 'Completed' ? 'returned' : 'rented'} a vehicle
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.createdAt ? formatDate(activity.createdAt) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trend chart - full width */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rental Trend</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Number of rentals and revenue over time</p>
          </div>
          <div className="p-4 h-[400px]">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="rentals" name="Rentals" fill="#3b82f6" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
