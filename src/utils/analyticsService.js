import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  startAfter,
  Timestamp,
  getCountFromServer
} from 'firebase/firestore';

// Get total count of cars
export const getTotalCarsCount = async () => {
  try {
    const carsCollection = collection(db, 'cars');
    const snapshot = await getCountFromServer(carsCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting total cars count:', error);
    throw error;
  }
};

// Get count of active rentals
export const getActiveRentalsCount = async () => {
  try {
    const rentalsCollection = collection(db, 'rentals');
    const q = query(rentalsCollection, where("status", "==", "Active"));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting active rentals count:', error);
    throw error;
  }
};

// Get total customer count
export const getCustomersCount = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("role", "==", "customer"));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting customers count:', error);
    throw error;
  }
};

// Calculate total revenue for a given time period
export const getRevenue = async (startDate, endDate) => {
  try {
    const rentalsCollection = collection(db, 'rentals');
    const carsCollection = collection(db, 'cars');
    
    // Get all cars first to have access to daily rates
    const carsSnapshot = await getDocs(carsCollection);
    const cars = {};
    carsSnapshot.docs.forEach(doc => {
      cars[doc.id] = { ...doc.data() };
    });
    
    // Convert dates to Firestore timestamps if needed
    const start = startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const end = endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;
    
    let q;
    if (start && end) {
      q = query(
        rentalsCollection, 
        where("startDate", ">=", start),
        where("startDate", "<=", end)
      );
    } else {
      q = query(rentalsCollection);
    }
    
    const snapshot = await getDocs(q);
    
    // Calculate total revenue based on daily rate * number of days
    let totalRevenue = 0;
    snapshot.forEach(doc => {
      const rental = doc.data();
      const car = cars[rental.carId];
      
      if (car && car.dailyRate && rental.startDate && rental.endDate) {
        // Convert dates if needed
        let rentalStart, rentalEnd;
        try {
          rentalStart = rental.startDate?.toDate ? rental.startDate.toDate() : 
                       rental.startDate ? new Date(rental.startDate) : null;
          rentalEnd = rental.endDate?.toDate ? rental.endDate.toDate() : 
                     rental.endDate ? new Date(rental.endDate) : null;
        } catch (error) {
          console.error('Error converting dates:', error);
          totalRevenue += Number(rental.totalAmount || 0); // Fallback to stored amount
          return;
        }
        
        if (rentalStart && rentalEnd) {
          const diffInTime = rentalEnd.getTime() - rentalStart.getTime();
          const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
          
          if (diffInDays > 0) {
            totalRevenue += car.dailyRate * diffInDays;
          } else {
            totalRevenue += Number(rental.totalAmount || 0); // Fallback
          }
        } else {
          totalRevenue += Number(rental.totalAmount || 0); // Fallback
        }
      } else {
        totalRevenue += Number(rental.totalAmount || 0); // Fallback
      }
    });
    
    return totalRevenue;
  } catch (error) {
    console.error('Error calculating revenue:', error);
    throw error;
  }
};

// Get recent rentals for activity log
export const getRecentRentals = async (count = 5) => {
  try {
    const rentalsCollection = collection(db, 'rentals');
    const snapshot = await getDocs(rentalsCollection);
    
    // Convert to array, sort by creation date (most recent first)
    const rentals = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => {
        // Handle Firestore Timestamp objects or regular date strings
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, count);
    
    return rentals;
  } catch (error) {
    console.error('Error getting recent rentals:', error);
    throw error;
  }
};

// Get top-performing cars (most rentals)
export const getTopPerformingCars = async (count = 5) => {
  try {
    // Get all rentals
    const rentalsCollection = collection(db, 'rentals');
    const rentalsSnapshot = await getDocs(rentalsCollection);
    
    // Get all cars to access daily rates
    const carsCollection = collection(db, 'cars');
    const carsSnapshot = await getDocs(carsCollection);
    const carMap = {};
    carsSnapshot.docs.forEach(doc => {
      carMap[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    // Count rentals per car and calculate revenue
    const carRentalCount = {};
    const carRevenue = {};
    
    rentalsSnapshot.forEach(doc => {
      const rental = doc.data();
      if (rental.carId) {
        carRentalCount[rental.carId] = (carRentalCount[rental.carId] || 0) + 1;
        
        // Calculate revenue based on daily rate * number of days
        const car = carMap[rental.carId];
        if (car && car.dailyRate && rental.startDate && rental.endDate) {
          // Convert dates if needed
          let rentalStart, rentalEnd;
          try {
            rentalStart = rental.startDate?.toDate ? rental.startDate.toDate() : 
                         rental.startDate ? new Date(rental.startDate) : null;
            rentalEnd = rental.endDate?.toDate ? rental.endDate.toDate() : 
                       rental.endDate ? new Date(rental.endDate) : null;
          } catch (error) {
            console.error('Error converting dates:', error);
            carRevenue[rental.carId] = (carRevenue[rental.carId] || 0) + Number(rental.totalAmount || 0);
            return;
          }
          
          if (rentalStart && rentalEnd) {
            const diffInTime = rentalEnd.getTime() - rentalStart.getTime();
            const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
            
            if (diffInDays > 0) {
              carRevenue[rental.carId] = (carRevenue[rental.carId] || 0) + (car.dailyRate * diffInDays);
            } else {
              carRevenue[rental.carId] = (carRevenue[rental.carId] || 0) + Number(rental.totalAmount || 0);
            }
          } else {
            carRevenue[rental.carId] = (carRevenue[rental.carId] || 0) + Number(rental.totalAmount || 0);
          }
        } else {
          carRevenue[rental.carId] = (carRevenue[rental.carId] || 0) + Number(rental.totalAmount || 0);
        }
      }
    });
    
    // Sort cars by rental count
    const sortedCarIds = Object.keys(carRentalCount)
      .sort((a, b) => carRentalCount[b] - carRentalCount[a])
      .slice(0, count);
    
    // Get category details
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    
    const categoryMap = {};
    categoriesSnapshot.forEach(doc => {
      categoryMap[doc.id] = { id: doc.id, ...doc.data() };
    });
    
    // Build top cars list with details
    const topCars = sortedCarIds.map(carId => {
      const car = carMap[carId] || { id: carId, name: 'Unknown', model: 'Unknown' };
      const category = car.categoryId ? categoryMap[car.categoryId] : null;
      
      // Calculate utilization rate (simple formula for demonstration)
      const utilizationRate = Math.min(Math.round(carRentalCount[carId] * 20), 100);
      
      return {
        ...car,
        categoryName: category ? category.name : 'Unknown',
        rentalCount: carRentalCount[carId],
        revenue: carRevenue[carId],
        utilizationRate
      };
    });
    
    return topCars;
  } catch (error) {
    console.error('Error getting top performing cars:', error);
    throw error;
  }
};

// Get station performance (rentals by station)
export const getStationPerformance = async () => {
  try {
    // Get all stations
    const stationsCollection = collection(db, 'stations');
    const stationsSnapshot = await getDocs(stationsCollection);
    const stations = stationsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      rentals: 0,
      revenue: 0
    }));
    
    // Get all cars to access daily rates
    const carsCollection = collection(db, 'cars');
    const carsSnapshot = await getDocs(carsCollection);
    const cars = {};
    carsSnapshot.docs.forEach(doc => {
      cars[doc.id] = { ...doc.data() };
    });
    
    // Get all rentals
    const rentalsCollection = collection(db, 'rentals');
    const rentalsSnapshot = await getDocs(rentalsCollection);
    
    // Calculate statistics per station
    rentalsSnapshot.forEach(doc => {
      const rental = doc.data();
      if (rental.pickupStationId) {
        const stationIndex = stations.findIndex(s => s.id === rental.pickupStationId);
        if (stationIndex !== -1) {
          stations[stationIndex].rentals += 1;
          
          // Calculate revenue based on daily rate * number of days
          const car = cars[rental.carId];
          if (car && car.dailyRate && rental.startDate && rental.endDate) {
            // Convert dates if needed
            let rentalStart, rentalEnd;
            try {
              rentalStart = rental.startDate?.toDate ? rental.startDate.toDate() : 
                           rental.startDate ? new Date(rental.startDate) : null;
              rentalEnd = rental.endDate?.toDate ? rental.endDate.toDate() : 
                         rental.endDate ? new Date(rental.endDate) : null;
            } catch (error) {
              console.error('Error converting dates:', error);
              stations[stationIndex].revenue += Number(rental.totalAmount || 0);
              return;
            }
            
            if (rentalStart && rentalEnd) {
              const diffInTime = rentalEnd.getTime() - rentalStart.getTime();
              const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
              
              if (diffInDays > 0) {
                stations[stationIndex].revenue += car.dailyRate * diffInDays;
              } else {
                stations[stationIndex].revenue += Number(rental.totalAmount || 0);
              }
            } else {
              stations[stationIndex].revenue += Number(rental.totalAmount || 0);
            }
          } else {
            stations[stationIndex].revenue += Number(rental.totalAmount || 0);
          }
        }
      }
    });
    
    // Sort by number of rentals
    return stations.sort((a, b) => b.rentals - a.rentals);
  } catch (error) {
    console.error('Error getting station performance:', error);
    throw error;
  }
};

// Get rentals over time (for charts)
export const getRentalsTrend = async (period = 'monthly', count = 6) => {
  try {
    const now = new Date();
    const rentalsCollection = collection(db, 'rentals');
    const rentalsSnapshot = await getDocs(rentalsCollection);
    
    // Process all rentals
    const allRentals = rentalsSnapshot.docs.map(doc => {
      const data = doc.data();
      let startDate;
      
      // Handle different date formats safely
      try {
        startDate = data.startDate?.toDate ? data.startDate.toDate() : 
                   data.startDate ? new Date(data.startDate) : null;
      } catch (error) {
        console.error('Error converting date:', error);
        startDate = null;
      }
      
      return {
        id: doc.id,
        ...data,
        startDate,
        totalAmount: Number(data.totalAmount || 0)
      };
    }).filter(rental => rental.startDate); // Filter out rentals with invalid dates
    
    const results = [];
    
    if (period === 'monthly') {
      // Get data for the last `count` months
      for (let i = 0; i < count; i++) {
        const year = now.getFullYear();
        const month = now.getMonth() - i;
        const adjustedYear = month < 0 ? year - 1 : year;
        const adjustedMonth = month < 0 ? 12 + month : month;
        
        const startDate = new Date(adjustedYear, adjustedMonth, 1);
        const endDate = new Date(adjustedYear, adjustedMonth + 1, 0); // Last day of month
        
        // Filter rentals for this month
        const monthRentals = allRentals.filter(rental => 
          rental.startDate >= startDate && rental.startDate <= endDate
        );
        
        // Calculate total revenue for the month
        const monthlyRevenue = monthRentals.reduce((sum, rental) => sum + rental.totalAmount, 0);
        
        results.push({
          period: startDate.toLocaleString('default', { month: 'short' }) + ' ' + adjustedYear,
          rentals: monthRentals.length,
          revenue: monthlyRevenue
        });
      }
    } else if (period === 'weekly') {
      // Get data for the last `count` weeks
      for (let i = 0; i < count; i++) {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() - (i * 7));
        
        const startOfWeek = new Date(endOfWeek);
        startOfWeek.setDate(endOfWeek.getDate() - 6);
        
        // Filter rentals for this week
        const weekRentals = allRentals.filter(rental => 
          rental.startDate >= startOfWeek && rental.startDate <= endOfWeek
        );
        
        // Calculate total revenue for the week
        const weeklyRevenue = weekRentals.reduce((sum, rental) => sum + rental.totalAmount, 0);
        
        results.push({
          period: `Week ${count - i}`,
          rentals: weekRentals.length,
          revenue: weeklyRevenue
        });
      }
    }
    
    // If no actual rental data, provide mock data
    if (results.every(item => item.rentals === 0 && item.revenue === 0)) {
      console.log('No rental data found, providing sample data for chart visualization');
      if (period === 'monthly') {
        // Generate sample monthly data
        return [
          { period: 'Jan', rentals: 0, revenue: 0 },
          { period: 'Feb', rentals: 0, revenue: 0 },
          { period: 'Mar', rentals: 0, revenue: 0 },
          { period: 'Apr', rentals: 0, revenue: 0 },
          { period: 'May', rentals: 0, revenue: 0 },
          { period: 'Jun', rentals: 0, revenue: 0 }
        ];
      } else {
        // Generate sample weekly data
        return Array.from({ length: count }, (_, i) => ({
          period: `Week ${i+1}`,
          rentals: 0,
          revenue: 0
        }));
      }
    }
    
    // Return in chronological order
    return results.reverse();
  } catch (error) {
    console.error('Error getting rentals trend:', error);
    // Return fallback data to prevent UI errors
    return Array.from({ length: 6 }, (_, i) => ({
      period: `Period ${i+1}`,
      rentals: 0,
      revenue: 0
    }));
  }
};

// Get category performance
export const getCategoryPerformance = async () => {
  try {
    // Get all categories
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      rentals: 0,
      revenue: 0
    }));
    
    // Get all cars with their category info
    const carsCollection = collection(db, 'cars');
    const carsSnapshot = await getDocs(carsCollection);
    const carCategories = {};
    carsSnapshot.forEach(doc => {
      const carData = doc.data();
      if (carData.categoryId) {
        carCategories[doc.id] = carData.categoryId;
      }
    });
    
    // Get all rentals
    const rentalsCollection = collection(db, 'rentals');
    const rentalsSnapshot = await getDocs(rentalsCollection);
    
    // Calculate statistics per category
    rentalsSnapshot.forEach(doc => {
      const rentalData = doc.data();
      if (rentalData.carId && carCategories[rentalData.carId]) {
        const categoryId = carCategories[rentalData.carId];
        const categoryIndex = categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          categories[categoryIndex].rentals += 1;
          categories[categoryIndex].revenue += Number(rentalData.totalAmount || 0);
        }
      }
    });
    
    // Sort by revenue
    return categories.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error('Error getting category performance:', error);
    throw error;
  }
};
