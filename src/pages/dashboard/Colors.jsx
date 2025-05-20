import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Modal from '@/components/ui/Modal';
import { getAllColors, addColor, updateColor, deleteColor } from '@/utils/colorService';
import { PencilIcon, TrashIcon, PaletteIcon } from 'lucide-react';

const ColorForm = ({ color, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    hexValue: '#000000',
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (color) {
      setFormData({
        name: color.name || '',
        hexValue: color.hexValue || '#000000',
        description: color.description || '',
        isActive: color.isActive !== undefined ? color.isActive : true,
      });
    }
  }, [color]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Color name is required';
    if (!formData.hexValue) newErrors.hexValue = 'Color value is required';
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color Name*
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
          <label htmlFor="hexValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Color Value*
          </label>
          <div className="mt-1 flex space-x-3">
            <input
              type="color"
              id="hexValue"
              name="hexValue"
              value={formData.hexValue}
              onChange={handleChange}
              className="h-10 w-10 rounded-md border border-gray-300 dark:border-gray-700 cursor-pointer"
            />
            <input
              type="text"
              name="hexValue"
              value={formData.hexValue}
              onChange={handleChange}
              className={`block flex-1 rounded-md border ${errors.hexValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`}
            />
          </div>
          {errors.hexValue && <p className="mt-1 text-xs text-red-500">{errors.hexValue}</p>}
        </div>

        <div>
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Active
          </label>
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
          {isSubmitting ? 'Saving...' : color ? 'Update Color' : 'Add Color'}
        </button>
      </div>
    </form>
  );
};

const Colors = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const colorsData = await getAllColors();
      setColors(colorsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching colors:', err);
      setError('Failed to load colors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = async (colorData) => {
    try {
      await addColor(colorData);
      await fetchColors();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding color:', err);
      setError('Failed to add color. Please try again.');
    }
  };

  const handleEditColor = async (colorData) => {
    try {
      await updateColor(currentColor.id, colorData);
      await fetchColors();
      setIsEditModalOpen(false);
      setCurrentColor(null);
    } catch (err) {
      console.error('Error updating color:', err);
      setError('Failed to update color. Please try again.');
    }
  };

  const handleDeleteColor = async () => {
    try {
      await deleteColor(currentColor.id);
      await fetchColors();
      setIsDeleteModalOpen(false);
      setCurrentColor(null);
    } catch (err) {
      console.error('Error deleting color:', err);
      setError('Failed to delete color. Please try again.');
    }
  };

  const openEditModal = (color) => {
    setCurrentColor(color);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (color) => {
    setCurrentColor(color);
    setIsDeleteModalOpen(true);
  };

  const filteredColors = colors.filter(color => {
    return searchTerm === '' || 
      color.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.description?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Color Management</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Add New Color
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Colors</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your vehicle color options</p>
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Search colors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredColors.length === 0 ? (
            <div className="p-8 text-center">
              <PaletteIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No colors found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm ? "No colors match your search criteria." : "Start by adding a color to your collection."}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-3 text-primary hover:text-primary/80"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              {filteredColors.map(color => (
                <div 
                  key={color.id} 
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 mr-3 rounded-full border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: color.hexValue }}
                      ></div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={color.name}>
                        {color.name}
                      </h3>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditModal(color)}
                        className="p-1 text-primary hover:text-primary/80"
                        aria-label="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(color)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                        aria-label="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {color.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{color.description}</p>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                        <span>Hex Value:</span>
                        <span className="font-medium">{color.hexValue}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                        <span>Status:</span>
                        <span className={`font-medium ${color.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {color.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Color Modal */}
      <Modal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Color"
      >
        <ColorForm
          onSubmit={handleAddColor}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Color Modal */}
      <Modal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Color"
      >
        <ColorForm
          color={currentColor}
          onSubmit={handleEditColor}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Color"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the color "{currentColor?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteColor}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Colors;
