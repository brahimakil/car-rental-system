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

const COLLECTION_NAME = 'rentals';

// Get all rentals
export const getAllRentals = async () => {
  try {
    const rentalsCollection = collection(db, COLLECTION_NAME);
    const rentalsSnapshot = await getDocs(rentalsCollection);
    return rentalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting rentals:', error);
    throw error;
  }
};

// Get rentals by status
export const getRentalsByStatus = async (status) => {
  try {
    const rentalsCollection = collection(db, COLLECTION_NAME);
    const q = query(rentalsCollection, where("status", "==", status));
    const rentalsSnapshot = await getDocs(q);
    return rentalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting rentals by status:', error);
    throw error;
  }
};

// Get rentals by car
export const getRentalsByCar = async (carId) => {
  try {
    const rentalsCollection = collection(db, COLLECTION_NAME);
    const q = query(rentalsCollection, where("carId", "==", carId));
    const rentalsSnapshot = await getDocs(q);
    return rentalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting rentals by car:', error);
    throw error;
  }
};

// Get rentals by customer
export const getRentalsByCustomer = async (customerId) => {
  try {
    const rentalsCollection = collection(db, COLLECTION_NAME);
    const q = query(rentalsCollection, where("customerId", "==", customerId));
    const rentalsSnapshot = await getDocs(q);
    return rentalsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting rentals by customer:', error);
    throw error;
  }
};

// Get a single rental by ID
export const getRental = async (rentalId) => {
  try {
    const rentalDoc = doc(db, COLLECTION_NAME, rentalId);
    const rentalSnapshot = await getDoc(rentalDoc);
    
    if (rentalSnapshot.exists()) {
      return {
        id: rentalSnapshot.id,
        ...rentalSnapshot.data()
      };
    } else {
      throw new Error('Rental not found');
    }
  } catch (error) {
    console.error('Error getting rental:', error);
    throw error;
  }
};

// Add a new rental
export const addRental = async (rentalData) => {
  try {
    const rentalsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(rentalsCollection, {
      ...rentalData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      id: docRef.id,
      ...rentalData
    };
  } catch (error) {
    console.error('Error adding rental:', error);
    throw error;
  }
};

// Update a rental
export const updateRental = async (rentalId, rentalData) => {
  try {
    const rentalDoc = doc(db, COLLECTION_NAME, rentalId);
    await updateDoc(rentalDoc, {
      ...rentalData,
      updatedAt: new Date()
    });
    return {
      id: rentalId,
      ...rentalData
    };
  } catch (error) {
    console.error('Error updating rental:', error);
    throw error;
  }
};

// Delete a rental
export const deleteRental = async (rentalId) => {
  try {
    const rentalDoc = doc(db, COLLECTION_NAME, rentalId);
    await deleteDoc(rentalDoc);
    return rentalId;
  } catch (error) {
    console.error('Error deleting rental:', error);
    throw error;
  }
};

// Update rental status
export const updateRentalStatus = async (rentalId, status) => {
  try {
    const rentalDoc = doc(db, COLLECTION_NAME, rentalId);
    await updateDoc(rentalDoc, {
      status,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating rental status:', error);
    throw error;
  }
};
