import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Modal from '@/components/ui/Modal';
import { getAllRentals, addRental, updateRental, deleteRental, updateRentalStatus } from '@/utils/rentalService';
import { getAllCars } from '@/utils/carService';
import { getAllStations } from '@/utils/stationService';
import { getAllUsers } from '@/utils/userService';
import { ClipboardList, PencilIcon, TrashIcon, CheckCircle, XCircle } from 'lucide-react';

const RentalForm = ({ rental, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    carId: '',
    pickupStationId: '',
    returnStationId: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    totalAmount: '',
    paymentStatus: 'Pending',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [carsData, stationsData, usersData] = await Promise.all([
          getAllCars(),
          getAllStations(),
          getAllUsers()
        ]);
        
        setCars(carsData);
        setStations(stationsData);
        setUsers(usersData.filter(user => user.isActive));
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      } finally {
        setLoadingDependencies(false);
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (rental) {
      setFormData({
        userId: rental.userId || '',
        customerName: rental.customerName || '',
        customerEmail: rental.customerEmail || '',
        customerPhone: rental.customerPhone || '',
        customerAddress: rental.customerAddress || '',
        carId: rental.carId || '',
        pickupStationId: rental.pickupStationId || '',
        returnStationId: rental.returnStationId || '',
        startDate: rental.startDate ? formatDateForInput(rental.startDate) : '',
        endDate: rental.endDate ? formatDateForInput(rental.endDate) : '',
        status: rental.status || 'Active',
        totalAmount: rental.totalAmount ? String(rental.totalAmount) : '',
        paymentStatus: rental.paymentStatus || 'Pending',
        notes: rental.notes || '',
      });
    }
  }, [rental]);

  const formatDateForInput = (dateValue) => {
    // If it's already a Date object, format it to YYYY-MM-DD
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    // If it's a Firestore Timestamp, convert to Date then format
    if (dateValue && dateValue.toDate) {
      return dateValue.toDate().toISOString().split('T')[0];
    }
    
    // If it's a string, check if it's a valid date and format it
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.userId) newErrors.userId = 'Customer selection is required';
    if (!formData.carId) newErrors.carId = 'Car is required';
    if (!formData.pickupStationId) newErrors.pickupStationId = 'Pickup station is required';
    if (!formData.returnStationId) newErrors.returnStationId = 'Return station is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.totalAmount) newErrors.totalAmount = 'Total amount is required';
    else if (isNaN(Number(formData.totalAmount))) newErrors.totalAmount = 'Total amount must be a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If car changes, calculate new total based on car daily rate and dates
    if (name === 'carId' || name === 'startDate' || name === 'endDate') {
      calculateTotal();
    }
  };

  const calculateTotal = () => {
    if (formData.carId && formData.startDate && formData.endDate) {
      const car = cars.find(c => c.id === formData.carId);
      if (car && car.dailyRate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 0) {
          const total = (car.dailyRate * daysDiff).toFixed(2);
          setFormData(prev => ({
            ...prev,
            totalAmount: total
          }));
        }
      }
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    if (!userId) {
      // If no user selected, clear customer fields
      setFormData(prev => ({
        ...prev,
        userId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
      }));
      return;
    }
    
    // Find the selected user
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      // Populate customer fields with user data
      setFormData(prev => ({
        ...prev,
        userId,
        customerName: selectedUser.name || '',
        customerEmail: selectedUser.email || '',
        customerPhone: selectedUser.phone || '',
        customerAddress: selectedUser.address || '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Convert string values to numbers or dates where needed
        const processedData = {
          ...formData,
          totalAmount: Number(formData.totalAmount),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate)
        };
        await onSubmit(processedData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loadingDependencies) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getAvailableCars = () => {
    return cars.filter(car => {
      // If editing, include the car that's already selected
      if (rental && car.id === rental.carId) return true;
      
      // Otherwise, only include cars that are available
      return car.status === 'Available';
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Customer*
          </label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleUserChange}
            className={`mt-1 block w-full rounded-md border ${errors.userId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Customer</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
        </div>

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer Name
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer Email
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer Phone
          </label>
          <input
            type="text"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Customer Address
          </label>
          <input
            type="text"
            id="customerAddress"
            name="customerAddress"
            value={formData.customerAddress}
            readOnly
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-gray-900 dark:text-white shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="carId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Car*
          </label>
          <select
            id="carId"
            name="carId"
            value={formData.carId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.carId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Car</option>
            {getAvailableCars().map(car => (
              <option key={car.id} value={car.id}>
                {car.name} - {car.model} ({car.licensePlate})
              </option>
            ))}
          </select>
          {errors.carId && <p className="mt-1 text-xs text-red-500">{errors.carId}</p>}
        </div>

        <div>
          <label htmlFor="pickupStationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Pickup Station*
          </label>
          <select
            id="pickupStationId"
            name="pickupStationId"
            value={formData.pickupStationId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.pickupStationId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Pickup Station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          {errors.pickupStationId && <p className="mt-1 text-xs text-red-500">{errors.pickupStationId}</p>}
        </div>

        <div>
          <label htmlFor="returnStationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Return Station*
          </label>
          <select
            id="returnStationId"
            name="returnStationId"
            value={formData.returnStationId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.returnStationId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Return Station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          {errors.returnStationId && <p className="mt-1 text-xs text-red-500">{errors.returnStationId}</p>}
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Start Date*
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            End Date*
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rental Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Active">Active</option>
            <option value="Pending Return">Pending Return</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Total Amount*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="totalAmount"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              className={`block w-full pl-7 rounded-md border ${errors.totalAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </div>
          {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount}</p>}
        </div>

        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : rental ? 'Update Rental' : 'Add Rental'}
        </button>
      </div>
    </form>
  );
};

const Rents = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRental, setCurrentRental] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [cars, setCars] = useState([]);
  const [stations, setStations] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [carsData, stationsData] = await Promise.all([
          getAllCars(),
          getAllStations()
        ]);
        
        setCars(carsData);
        setStations(stationsData);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      } finally {
        setLoadingDependencies(false);
      }
    };

    fetchDependencies();
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const rentalsData = await getAllRentals();
      setRentals(rentalsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError('Failed to load rentals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRental = async (rentalData) => {
    try {
      await addRental(rentalData);
      await fetchRentals();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding rental:', err);
      setError('Failed to add rental. Please try again.');
    }
  };

  const handleEditRental = async (rentalData) => {
    try {
      await updateRental(currentRental.id, rentalData);
      await fetchRentals();
      setIsEditModalOpen(false);
      setCurrentRental(null);
    } catch (err) {
      console.error('Error updating rental:', err);
      setError('Failed to update rental. Please try again.');
    }
  };

  const handleDeleteRental = async () => {
    try {
      await deleteRental(currentRental.id);
      await fetchRentals();
      setIsDeleteModalOpen(false);
      setCurrentRental(null);
    } catch (err) {
      console.error('Error deleting rental:', err);
      setError('Failed to delete rental. Please try again.');
    }
  };

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
      await fetchRentals();
    } catch (err) {
      console.error('Error updating rental status:', err);
      setError('Failed to update rental status. Please try again.');
    }
  };

  const openEditModal = (rental) => {
    setCurrentRental(rental);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (rental) => {
    setCurrentRental(rental);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Pending Return':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Overdue':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCarDetails = (carId) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.name} - ${car.model} (${car.licensePlate})` : 'Unknown';
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'Unknown';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    // If it's a Firestore Timestamp, convert to Date
    if (dateValue && dateValue.toDate) {
      dateValue = dateValue.toDate();
    }
    
    // If it's a string, convert to Date
    if (typeof dateValue === 'string') {
      dateValue = new Date(dateValue);
    }
    
    // Format the date
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    }
    
    return '';
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    // Convert to Date objects if they're not already
    if (startDate && startDate.toDate) {
      startDate = startDate.toDate();
    } else if (typeof startDate === 'string') {
      startDate = new Date(startDate);
    }
    
    if (endDate && endDate.toDate) {
      endDate = endDate.toDate();
    } else if (typeof endDate === 'string') {
      endDate = new Date(endDate);
    }
    
    // Calculate the difference in days
    if (startDate instanceof Date && endDate instanceof Date && 
        !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const diffInTime = endDate.getTime() - startDate.getTime();
      const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    }
    
    return '';
  };

  const calculateTotalPayment = (rental) => {
    // Find the car to get its daily rate
    const car = cars.find(c => c.id === rental.carId);
    if (!car || !car.dailyRate) return rental.totalAmount || 0;
    
    let startDate, endDate;
    
    // Handle different date formats safely
    try {
      startDate = rental.startDate?.toDate ? rental.startDate.toDate() : 
                 rental.startDate ? new Date(rental.startDate) : null;
               
      endDate = rental.endDate?.toDate ? rental.endDate.toDate() : 
               rental.endDate ? new Date(rental.endDate) : null;
    } catch (error) {
      console.error('Error converting dates:', error);
      return rental.totalAmount || 0;
    }
    
    if (!startDate || !endDate) return rental.totalAmount || 0;
    
    // Calculate number of days including both start and end dates
    const diffInTime = endDate.getTime() - startDate.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffInDays <= 0) return rental.totalAmount || 0;
    
    return car.dailyRate * diffInDays;
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = searchTerm === '' || 
      rental.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCarDetails(rental.carId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || rental.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && loadingDependencies) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rental Management</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Add New Rental
          </button>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Rentals</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage ongoing rentals</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input 
                type="text" 
                placeholder="Search rentals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
              <select 
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Return">Pending Return</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredRentals.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No rentals found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm || filterStatus
                  ? "No rentals match your search criteria." 
                  : "Start by adding a rental."}
              </p>
              {(searchTerm || filterStatus) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('');
                  }}
                  className="mt-3 text-primary hover:text-primary/80"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dates & Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stations
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Payments
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRentals.map(rental => (
                    <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {rental.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {rental.customerEmail}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {rental.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getCarDetails(rental.carId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateDuration(rental.startDate, rental.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          Pickup: {getStationName(rental.pickupStationId)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Return: {getStationName(rental.returnStationId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(rental.status)}`}>
                          {rental.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${rental.totalAmount?.toFixed(2)}
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(rental.paymentStatus)}`}>
                          {rental.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          ${calculateTotalPayment(rental).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(rental)}
                          className="text-primary hover:text-primary/80 mr-3"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(rental)}
                          className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {isAddModalOpen && (
        <Modal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Rental"
        >
          <RentalForm
            onSubmit={handleAddRental}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}
      
      {isEditModalOpen && currentRental && (
        <Modal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Rental"
        >
          <RentalForm
            rental={currentRental}
            onSubmit={handleEditRental}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}
      
      {isDeleteModalOpen && currentRental && (
        <Modal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Rental"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the rental for "{currentRental.customerName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRental}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};

export default Rents;
