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

const COLLECTION_NAME = 'cars';

// Get all cars
export const getAllCars = async () => {
  try {
    const carsCollection = collection(db, COLLECTION_NAME);
    const carsSnapshot = await getDocs(carsCollection);
    return carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting cars:', error);
    throw error;
  }
};

// Get cars by category
export const getCarsByCategory = async (categoryId) => {
  try {
    const carsCollection = collection(db, COLLECTION_NAME);
    const q = query(carsCollection, where("categoryId", "==", categoryId));
    const carsSnapshot = await getDocs(q);
    return carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting cars by category:', error);
    throw error;
  }
};

// Get cars by station
export const getCarsByStation = async (stationId) => {
  try {
    const carsCollection = collection(db, COLLECTION_NAME);
    const q = query(carsCollection, where("stationId", "==", stationId));
    const carsSnapshot = await getDocs(q);
    return carsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting cars by station:', error);
    throw error;
  }
};

// Get a single car by ID
export const getCar = async (carId) => {
  try {
    const carDoc = doc(db, COLLECTION_NAME, carId);
    const carSnapshot = await getDoc(carDoc);
    
    if (carSnapshot.exists()) {
      return {
        id: carSnapshot.id,
        ...carSnapshot.data()
      };
    } else {
      throw new Error('Car not found');
    }
  } catch (error) {
    console.error('Error getting car:', error);
    throw error;
  }
};

// Add a new car
export const addCar = async (carData) => {
  try {
    const carsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(carsCollection, {
      ...carData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      id: docRef.id,
      ...carData
    };
  } catch (error) {
    console.error('Error adding car:', error);
    throw error;
  }
};

// Update a car
export const updateCar = async (carId, carData) => {
  try {
    const carDoc = doc(db, COLLECTION_NAME, carId);
    await updateDoc(carDoc, {
      ...carData,
      updatedAt: new Date()
    });
    return {
      id: carId,
      ...carData
    };
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

// Delete a car
export const deleteCar = async (carId) => {
  try {
    const carDoc = doc(db, COLLECTION_NAME, carId);
    await deleteDoc(carDoc);
    return carId;
  } catch (error) {
    console.error('Error deleting car:', error);
    throw error;
  }
};

// Update car status
export const updateCarStatus = async (carId, status) => {
  try {
    const carDoc = doc(db, COLLECTION_NAME, carId);
    await updateDoc(carDoc, {
      status,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating car status:', error);
    throw error;
  }
};
