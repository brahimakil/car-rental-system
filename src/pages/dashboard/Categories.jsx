import React, { useState, useEffect } from 'react';
import MainLayout from '@/layouts/MainLayout';
import Modal from '@/components/ui/Modal';
import { getAllCategories, addCategory, updateCategory, deleteCategory } from '@/utils/categoryService';
import { getAllCars } from '@/utils/carService';
import { PencilIcon, TrashIcon } from 'lucide-react';

const CategoryForm = ({ category, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    availableCars: 0,
    totalRentals: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewIcon, setPreviewIcon] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || '',
        availableCars: category.availableCars || 0,
        totalRentals: category.totalRentals || 0,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
      if (category.icon) {
        setPreviewIcon(category.icon);
      }
    }
  }, [category]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Category name is required';
    
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

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrors(prev => ({ ...prev, icon: 'Icon size must be less than 1MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Icon = event.target.result;
      setFormData(prev => ({ ...prev, icon: base64Icon }));
      setPreviewIcon(base64Icon);
      setErrors(prev => ({ ...prev, icon: null }));
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
          availableCars: Number(formData.availableCars),
          totalRentals: Number(formData.totalRentals),
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
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Name*
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
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category Icon
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {previewIcon && (
              <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                <img src={previewIcon} alt="Category icon preview" className="h-full w-full object-contain" />
              </div>
            )}
            <div className="flex-grow">
              <input
                type="file"
                id="icon"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
              <label
                htmlFor="icon"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {previewIcon ? 'Change Icon' : 'Upload Icon'}
              </label>
              {previewIcon && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, icon: '' }));
                    setPreviewIcon('');
                  }}
                  className="ml-2 text-sm text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {errors.icon && <p className="mt-1 text-xs text-red-500">{errors.icon}</p>}
        </div>

        <div className="md:col-span-2">
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
              Active Category
            </label>
          </div>
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
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
        </button>
      </div>
    </form>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [categoriesData, carsData] = await Promise.all([
        getAllCategories(),
        getAllCars()
      ]);
      setCategories(categoriesData);
      setCars(carsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate available cars for a category
  const getAvailableCarsCount = (categoryId) => {
    return cars.filter(car => 
      car.categoryId === categoryId && 
      car.status === 'Available'
    ).length;
  };

  // Helper function to calculate total rentals for a category (if you have rental data)
  const getTotalRentalsCount = (categoryId) => {
    // For now, return the stored value or 0
    // You can implement actual rental counting later
    return cars.filter(car => car.categoryId === categoryId).length;
  };

  const handleAddCategory = async (categoryData) => {
    try {
      await addCategory(categoryData);
      await fetchCategories();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    }
  };

  const handleEditCategory = async (categoryData) => {
    try {
      await updateCategory(currentCategory.id, categoryData);
      await fetchCategories();
      setIsEditModalOpen(false);
      setCurrentCategory(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(currentCategory.id);
      await fetchCategories();
      setIsDeleteModalOpen(false);
      setCurrentCategory(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    }
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle Categories</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
          >
            Add New Category
          </button>
        </div>
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Categories</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your vehicle categories</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {categories.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                  No categories found. Add a new category to get started.
                </div>
              ) : (
                categories.map((category) => {
                  const availableCars = getAvailableCarsCount(category.id);
                  const totalCars = getTotalRentalsCount(category.id);
                  
                  return (
                    <div key={category.id} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {category.icon && (
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                              <img src={category.icon} alt={category.name} className="h-full w-full object-contain" />
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => openEditModal(category)}
                            className="p-1 text-primary hover:text-primary/80"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(category)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {category.description && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                            <span>Available Cars:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{availableCars}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span>Total Cars:</span>
                            <span className="font-medium">{totalCars}</span>
                          </div>
                          <div className="flex justify-between py-2 border-t border-gray-100 dark:border-gray-800">
                            <span>Status:</span>
                            <span className={`font-medium ${category.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Category Modal */}
      <Modal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
      >
        <CategoryForm
          category={currentCategory}
          onSubmit={handleEditCategory}
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
            Are you sure you want to delete the category "{currentCategory?.name}"? This action cannot be undone.
          </p>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCategory}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default Categories;
