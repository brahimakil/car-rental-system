// src/components/stations/StationForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllCategories } from '@/utils/categoryService';

// Fix Leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// This is needed to properly display the Leaflet marker icons in React
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const StationForm = ({ station, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    contactEmail: '',
    region: 'North',
    isActive: true,
    latitude: '',
    longitude: '',
    categories: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || '',
        address: station.address || '',
        city: station.city || '',
        state: station.state || '',
        zipCode: station.zipCode || '',
        contactPhone: station.contactPhone || '',
        contactEmail: station.contactEmail || '',
        region: station.region || 'North',
        isActive: station.isActive !== undefined ? station.isActive : true,
        latitude: station.latitude || '',
        longitude: station.longitude || '',
        categories: station.categories || [],
      });
    }
  }, [station]);

  // Initialize map once DOM is ready
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Add click event to the map
      mapInstance.current.on('click', function(e) {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        setFormData(prev => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }));
      });
    }

    // Ensure map is properly sized
    setTimeout(() => {
      mapInstance.current.invalidateSize();
    }, 100);

    return () => {
      // Cleanup function
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerRef.current = null;
      }
    };
  }, [mapRef.current]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!mapInstance.current) return;

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      updateMarker(lat, lng);
      mapInstance.current.setView([lat, lng], 15);
    }
  }, [formData.latitude, formData.longitude]);

  const updateMarker = (lat, lng) => {
    // Remove existing marker if it exists
    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
    }
    
    // Add new marker
    markerRef.current = L.marker([lat, lng], { icon: DefaultIcon }).addTo(mapInstance.current);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Station name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zipCode) newErrors.zipCode = 'Zip code is required';
    if (!formData.contactPhone) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.contactEmail) newErrors.contactEmail = 'Contact email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) newErrors.contactEmail = 'Email address is invalid';
    if (!formData.latitude) newErrors.latitude = 'Latitude is required';
    else if (isNaN(Number(formData.latitude))) newErrors.latitude = 'Latitude must be a number';
    if (!formData.longitude) newErrors.longitude = 'Longitude is required';
    else if (isNaN(Number(formData.longitude))) newErrors.longitude = 'Longitude must be a number';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category must be selected';
    
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

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const updatedCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Convert string values to numbers where needed
        const processedData = {
          ...formData,
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude)
        };
        await onSubmit(processedData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Station Name*
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
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Region*
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Address*
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            City*
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            State*
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
        </div>

        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Zip Code*
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Phone*
          </label>
          <input
            type="text"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.contactPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone}</p>}
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contact Email*
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.contactEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
          />
          {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail}</p>}
        </div>
      </div>

      {/* Map Selector */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location on Map* (Click to set marker)
        </label>
        <div 
          ref={mapRef} 
          className="h-80 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
        ></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Latitude*
            </label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.latitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.latitude && <p className="mt-1 text-xs text-red-500">{errors.latitude}</p>}
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Longitude*
            </label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.longitude ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.longitude && <p className="mt-1 text-xs text-red-500">{errors.longitude}</p>}
          </div>
        </div>
      </div>

      {/* Category Selector */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Car Categories at this Station*
        </label>
        {loadingCategories ? (
          <div className="flex justify-center items-center p-4 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/30">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-center border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900/30">
            <p className="text-gray-500 dark:text-gray-400">No categories available. Please add categories first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-start">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  checked={formData.categories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 mt-1 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center">
                    {category.icon && (
                      <img 
                        src={category.icon} 
                        alt={category.name} 
                        className="h-6 w-6 object-contain mr-2" 
                      />
                    )}
                    <span>{category.name}</span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
        {errors.categories && <p className="mt-1 text-xs text-red-500">{errors.categories}</p>}
      </div>

      <div className="mt-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Station is Active
          </label>
        </div>
      </div>

      <div className="pt-4 flex justify-end space-x-2 border-t border-gray-200 dark:border-gray-700 mt-6">
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
          {isSubmitting ? 'Saving...' : station ? 'Update Station' : 'Add Station'}
        </button>
      </div>
    </form>
  );
};

export default StationForm;