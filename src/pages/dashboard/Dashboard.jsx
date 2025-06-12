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
  DollarSign as DollarSignIcon,
  TrendingUp,
  Activity,
  Calendar
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
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'month':
        startDate.setDate(1);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    return { startDate, endDate };
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
            icon: 'car',
            gradient: 'from-blue-500 to-blue-600'
          },
          { 
            title: 'Active Rentals', 
            value: activeRentals.toString(), 
            change: '+0.0%', // Assuming no previous period data for rentals
            icon: 'clipboard',
            gradient: 'from-green-500 to-green-600'
          },
          { 
            title: 'Revenue', 
            value: `$${currentRevenue.toFixed(2)}`, 
            change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
            icon: 'dollar',
            isIncreasing: revenueChange >= 0,
            gradient: 'from-purple-500 to-purple-600'
          },
          { 
            title: 'Customers', 
            value: totalCustomers.toString(), 
            change: '+0.0%', // Assuming no previous period data for customers
            icon: 'users',
            gradient: 'from-orange-500 to-orange-600'
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
        return <CarIcon className="h-7 w-7" />;
      case 'clipboard':
        return <ClipboardListIcon className="h-7 w-7" />;
      case 'dollar':
        return <DollarSignIcon className="h-7 w-7" />;
      case 'users':
        return <UsersIcon className="h-7 w-7" />;
      default:
        return <CarIcon className="h-7 w-7" />;
    }
  };
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="space-y-8 p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time insights into your car rental business
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>Time Range:</span>
              </div>
              <select 
                className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium transition-all duration-200 hover:bg-white dark:hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          
          {/* Stats Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {summaryData.map((item, index) => (
                <div key={index} className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300`}>
                        {renderSummaryIcon(item.icon)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        item.isIncreasing !== false 
                          ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30' 
                          : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                      }`}>
                        {item.isIncreasing !== false ? (
                          <ChevronUp className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        )}
                        {item.change}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">vs. previous period</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map Section - Takes 2/3 width */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fleet Location</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Real-time locations of cars and stations</p>
                    </div>
                  </div>
                </div>
                <div className="h-[500px]">
                  <MapView stations={mapData.stations} cars={mapData.cars} />
                </div>
              </div>
            </div>
            
            {/* Activity Panel - Takes 1/3 width */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/50">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Latest rental transactions</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 max-h-[420px] overflow-y-auto">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
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
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                        </div>
                      ) : (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                            <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 h-10 w-10 flex items-center justify-center text-white shadow-md">
                              <ClipboardListIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.customerName || 'Unknown Customer'} {activity.status === 'Completed' ? 'returned' : 'rented'} a vehicle
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          </div>
          
          {/* Trend Chart Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/50">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rental Trends</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Number of rentals and revenue over time</p>
                </div>
              </div>
            </div>
            <div className="p-6 h-[450px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="period" 
                      className="text-gray-600 dark:text-gray-400"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left" 
                      className="text-gray-600 dark:text-gray-400"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      className="text-gray-600 dark:text-gray-400"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="rentals" 
                      name="Rentals" 
                      fill="url(#blueGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="revenue" 
                      name="Revenue ($)" 
                      fill="url(#greenGradient)" 
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
