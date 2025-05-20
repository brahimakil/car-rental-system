import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

const COLLECTION_NAME = 'colors';

// Get all colors
export const getAllColors = async () => {
  try {
    const colorsCollection = collection(db, COLLECTION_NAME);
    const colorsSnapshot = await getDocs(colorsCollection);
    return colorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting colors:', error);
    throw error;
  }
};

// Get a single color by ID
export const getColor = async (colorId) => {
  try {
    const colorDoc = doc(db, COLLECTION_NAME, colorId);
    const colorSnapshot = await getDoc(colorDoc);
    
    if (colorSnapshot.exists()) {
      return {
        id: colorSnapshot.id,
        ...colorSnapshot.data()
      };
    } else {
      throw new Error('Color not found');
    }
  } catch (error) {
    console.error('Error getting color:', error);
    throw error;
  }
};

// Add a new color
export const addColor = async (colorData) => {
  try {
    const colorsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colorsCollection, {
      ...colorData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      id: docRef.id,
      ...colorData
    };
  } catch (error) {
    console.error('Error adding color:', error);
    throw error;
  }
};

// Update a color
export const updateColor = async (colorId, colorData) => {
  try {
    const colorDoc = doc(db, COLLECTION_NAME, colorId);
    await updateDoc(colorDoc, {
      ...colorData,
      updatedAt: new Date()
    });
    return {
      id: colorId,
      ...colorData
    };
  } catch (error) {
    console.error('Error updating color:', error);
    throw error;
  }
};

// Delete a color
export const deleteColor = async (colorId) => {
  try {
    const colorDoc = doc(db, COLLECTION_NAME, colorId);
    await deleteDoc(colorDoc);
    return colorId;
  } catch (error) {
    console.error('Error deleting color:', error);
    throw error;
  }
};
