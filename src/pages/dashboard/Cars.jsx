import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Modal from '@/components/ui/Modal';
import { getAllCars, addCar, updateCar, deleteCar } from '@/utils/carService';
import { getAllCategories } from '@/utils/categoryService';
import { getAllStations } from '@/utils/stationService';
import { getAllColors } from '@/utils/colorService';
import { CarIcon, PencilIcon, TrashIcon } from 'lucide-react';

const CarForm = ({ car, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    year: '',
    licensePlate: '',
    color: '',
    categoryId: '',
    stationId: '',
    description: '',
    status: 'Available',
    photo: '',
    dailyRate: '',
    mileage: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [stations, setStations] = useState([]);
  const [colors, setColors] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [loadingColors, setLoadingColors] = useState(true);
  const [previewPhoto, setPreviewPhoto] = useState('');

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [categoriesData, stationsData, colorsData] = await Promise.all([
          getAllCategories(),
          getAllStations(),
          getAllColors()
        ]);
        
        setCategories(categoriesData);
        setStations(stationsData);
        setColors(colorsData);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      } finally {
        setLoadingDependencies(false);
      }
    };

    fetchDependencies();
  }, []);

  useEffect(() => {
    if (car) {
      setFormData({
        name: car.name || '',
        model: car.model || '',
        year: car.year || '',
        licensePlate: car.licensePlate || '',
        color: car.color || '',
        categoryId: car.categoryId || '',
        stationId: car.stationId || '',
        description: car.description || '',
        status: car.status || 'Available',
        photo: car.photo || '',
        dailyRate: car.dailyRate ? String(car.dailyRate) : '',
        mileage: car.mileage ? String(car.mileage) : '',
      });
      
      if (car.photo) {
        setPreviewPhoto(car.photo);
      }
    }
  }, [car]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Vehicle name is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.year) newErrors.year = 'Year is required';
    else if (!/^\d{4}$/.test(formData.year)) newErrors.year = 'Year must be a 4-digit number';
    if (!formData.licensePlate) newErrors.licensePlate = 'License plate is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.stationId) newErrors.stationId = 'Station is required';
    if (!formData.dailyRate) newErrors.dailyRate = 'Daily rate is required';
    else if (isNaN(Number(formData.dailyRate))) newErrors.dailyRate = 'Daily rate must be a number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Photo size must be less than 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Photo = event.target.result;
      setFormData(prev => ({ ...prev, photo: base64Photo }));
      setPreviewPhoto(base64Photo);
      setErrors(prev => ({ ...prev, photo: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Convert string values to numbers where needed
        const processedData = {
          ...formData,
          year: Number(formData.year),
          dailyRate: Number(formData.dailyRate),
          mileage: formData.mileage ? Number(formData.mileage) : 0,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Vehicle Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Model*
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model}</p>}
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Year*
          </label>
          <input
            type="text"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
        </div>

        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            License Plate*
          </label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.licensePlate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.licensePlate && <p className="mt-1 text-xs text-red-500">{errors.licensePlate}</p>}
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color
          </label>
          <div className="mt-1 flex items-center">
            {formData.color && (
              <div 
                className="w-6 h-6 mr-2 rounded-full border border-gray-200 dark:border-gray-700"
                style={{ 
                  backgroundColor: colors.find(c => c.name === formData.color)?.hexValue || formData.color 
                }}
              ></div>
            )}
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Color</option>
              {colors.filter(color => color.isActive).map(color => (
                <option key={color.id} value={color.name}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category*
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div>
          <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Station*
          </label>
          <select
            id="stationId"
            name="stationId"
            value={formData.stationId}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.stationId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          >
            <option value="">Select Station</option>
            {stations.map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
          {errors.stationId && <p className="mt-1 text-xs text-red-500">{errors.stationId}</p>}
        </div>

        <div>
          <label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Rate*
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="dailyRate"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              className={`block w-full pl-7 rounded-md border ${errors.dailyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </div>
          {errors.dailyRate && <p className="mt-1 text-xs text-red-500">{errors.dailyRate}</p>}
        </div>

        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mileage
          </label>
          <input
            type="text"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Vehicle Photo
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {previewPhoto && (
              <div className="flex-shrink-0 h-24 w-32 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img src={previewPhoto} alt="Vehicle preview" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-grow">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label
                htmlFor="photo"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {previewPhoto ? 'Change Photo' : 'Upload Photo'}
              </label>
              {previewPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, photo: '' }));
                    setPreviewPhoto('');
                  }}
                  className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {errors.photo && <p className="mt-1 text-xs text-red-500">{errors.photo}</p>}
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
          {isSubmitting ? 'Saving...' : car ? 'Update Vehicle' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCar, setCurrentCar] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStation, setFilterStation] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [stations, setStations] = useState([]);
  const [colors, setColors] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [categoriesData, stationsData, colorsData] = await Promise.all([
          getAllCategories(),
          getAllStations(),
          getAllColors()
        ]);
        
        setCategories(categoriesData);
        setStations(stationsData);
        setColors(colorsData);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      } finally {
        setLoadingDependencies(false);
      }
    };

    fetchDependencies();
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const carsData = await getAllCars();
      setCars(carsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (carData) => {
    try {
      await addCar(carData);
      await fetchCars();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding car:', err);
      setError('Failed to add car. Please try again.');
    }
  };

  const handleEditCar = async (carData) => {
    try {
      await updateCar(currentCar.id, carData);
      await fetchCars();
      setIsEditModalOpen(false);
      setCurrentCar(null);
    } catch (err) {
      console.error('Error updating car:', err);
      setError('Failed to update car. Please try again.');
    }
  };

  const handleDeleteCar = async () => {
    try {
      await deleteCar(currentCar.id);
      await fetchCars();
      setIsDeleteModalOpen(false);
      setCurrentCar(null);
    } catch (err) {
      console.error('Error deleting car:', err);
      setError('Failed to delete car. Please try again.');
    }
  };

  const openEditModal = (car) => {
    setCurrentCar(car);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (car) => {
    setCurrentCar(car);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Rented':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Unavailable':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'Unknown';
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = searchTerm === '' || 
      car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || car.categoryId === filterCategory;
    const matchesStation = filterStation === '' || car.stationId === filterStation;
    
    return matchesSearch && matchesCategory && matchesStation;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Add New Vehicle
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Fleet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your available vehicles</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input 
                type="text" 
                placeholder="Search vehicles..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
              <select 
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select 
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
              >
                <option value="">All Stations</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="p-8 text-center">
              <CarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No vehicles found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm || filterCategory || filterStation 
                  ? "No vehicles match your search criteria." 
                  : "Start by adding a vehicle to your fleet."}
              </p>
              {(searchTerm || filterCategory || filterStation) && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                    setFilterStation('');
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
                      Vehicle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Daily Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCars.map(car => (
                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {car.photo ? (
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={car.photo} 
                                alt={car.name} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <CarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {car.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {car.model} ({car.year})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {car.licensePlate}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {car.color ? `${car.color}, ` : ''}{getCategoryName(car.categoryId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getStationName(car.stationId)}
                        </div>
                        {car.mileage && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {car.mileage.toLocaleString()} miles
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(car.status)}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${car.dailyRate?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(car)}
                          className="text-primary hover:text-primary/80 mr-3"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(car)}
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
          title="Add New Vehicle"
        >
          <CarForm
            onSubmit={handleAddCar}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </Modal>
      )}

      {isEditModalOpen && currentCar && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Vehicle"
        >
          <CarForm
            car={currentCar}
            onSubmit={handleEditCar}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </Modal>
      )}

      {isDeleteModalOpen && currentCar && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Vehicle"
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the vehicle "{currentCar?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCar}
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

export default Cars;
