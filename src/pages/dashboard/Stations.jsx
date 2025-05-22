import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Modal from '@/components/ui/Modal';
import StationForm from '@/components/stations/StationForm';
import { getAllStations, addStation, updateStation, deleteStation } from '@/utils/stationService';
import { getAllCategories } from '@/utils/categoryService';
import { MapPinIcon, PencilIcon, TrashIcon } from 'lucide-react';

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentStation, setCurrentStation] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All Regions');

  useEffect(() => {
    fetchStationsAndCategories();
  }, []);

  const fetchStationsAndCategories = async () => {
    setLoading(true);
    try {
      const [stationsData, categoriesData] = await Promise.all([
        getAllStations(),
        getAllCategories()
      ]);
      
      setStations(stationsData);
      
      const catMap = {};
      categoriesData.forEach(cat => {
        catMap[cat.id] = cat.name;
      });
      setCategoriesMap(catMap);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load stations or categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async (stationData) => {
    try {
      await addStation(stationData);
      await fetchStationsAndCategories();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding station:', err);
      setError('Failed to add station. Please try again.');
    }
  };

  const handleEditStation = async (stationData) => {
    try {
      await updateStation(currentStation.id, stationData);
      await fetchStationsAndCategories();
      setIsEditModalOpen(false);
      setCurrentStation(null);
    } catch (err) {
      console.error('Error updating station:', err);
      setError('Failed to update station. Please try again.');
    }
  };

  const handleDeleteStation = async () => {
    try {
      await deleteStation(currentStation.id);
      await fetchStationsAndCategories();
      setIsDeleteModalOpen(false);
      setCurrentStation(null);
    } catch (err) {
      console.error('Error deleting station:', err);
      setError('Failed to delete station. Please try again.');
    }
  };

  const openEditModal = (station) => {
    setCurrentStation(station);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (station) => {
    setCurrentStation(station);
    setIsDeleteModalOpen(true);
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = searchTerm === '' || 
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = filterRegion === 'All Regions' || station.region === filterRegion;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stations Management</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Add New Station
          </button>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Rental Stations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your rental pickup and drop-off locations</p>
            </div>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Search stations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
              <select 
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
              >
                <option>All Regions</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Station Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Region
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Available Categories
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No stations found. Add a new station to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredStations.map((station) => (
                        <tr key={station.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <MapPinIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {station.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: {station.id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              {station.address}
                            </div>
                            <div>
                              {station.city}, {station.state} {station.zipCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>
                              {station.contactPhone}
                            </div>
                            <div>
                              {station.contactEmail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {station.region}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {station.categories && station.categories.length > 0 
                              ? station.categories.map(catId => categoriesMap[catId] || 'Unknown Category').join(', ')
                              : 'No categories'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              station.isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {station.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => openEditModal(station)}
                              className="text-primary hover:text-primary/80 mr-3"
                            >
                              <span className="flex items-center">
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </span>
                            </button>
                            <button 
                              onClick={() => openDeleteModal(station)}
                              className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-700"
                            >
                              <span className="flex items-center">
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredStations.length} of {stations.length} stations
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Add Station Modal */}
      <Modal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Station"
      >
        <StationForm
          onSubmit={handleAddStation}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Station Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Station"
      >
        <StationForm
          station={currentStation}
          onSubmit={handleEditStation}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the station "{currentStation?.name}"? This action cannot be undone.
          </p>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteStation}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Station
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Stations;
