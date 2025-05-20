import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'categories';

// Get all categories
export const getAllCategories = async () => {
  try {
    const categoriesCollection = collection(db, COLLECTION_NAME);
    const categoriesSnapshot = await getDocs(categoriesCollection);
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get a single category by ID
export const getCategory = async (categoryId) => {
  try {
    const categoryDoc = doc(db, COLLECTION_NAME, categoryId);
    const categorySnapshot = await getDoc(categoryDoc);
    
    if (categorySnapshot.exists()) {
      return {
        id: categorySnapshot.id,
        ...categorySnapshot.data()
      };
    } else {
      throw new Error('Category not found');
    }
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

// Add a new category
export const addCategory = async (categoryData) => {
  try {
    const categoriesCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(categoriesCollection, {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      id: docRef.id,
      ...categoryData
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const categoryDoc = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryDoc, {
      ...categoryData,
      updatedAt: new Date()
    });
    return {
      id: categoryId,
      ...categoryData
    };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (categoryId) => {
  try {
    const categoryDoc = doc(db, COLLECTION_NAME, categoryId);
    await deleteDoc(categoryDoc);
    return categoryId;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Update category stats
export const updateCategoryStats = async (categoryId, availableCars, totalRentals) => {
  try {
    const categoryDoc = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryDoc, {
      availableCars,
      totalRentals,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating category stats:', error);
    throw error;
  }
};
