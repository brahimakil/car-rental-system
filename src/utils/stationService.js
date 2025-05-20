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

const COLLECTION_NAME = 'stations';

// Get all stations
export const getAllStations = async () => {
  try {
    const stationsCollection = collection(db, COLLECTION_NAME);
    const stationsSnapshot = await getDocs(stationsCollection);
    return stationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stations:', error);
    throw error;
  }
};

// Get stations by region
export const getStationsByRegion = async (region) => {
  try {
    const stationsCollection = collection(db, COLLECTION_NAME);
    const q = query(stationsCollection, where("region", "==", region));
    const stationsSnapshot = await getDocs(q);
    return stationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stations by region:', error);
    throw error;
  }
};

// Get a single station by ID
export const getStation = async (stationId) => {
  try {
    const stationDoc = doc(db, COLLECTION_NAME, stationId);
    const stationSnapshot = await getDoc(stationDoc);
    
    if (stationSnapshot.exists()) {
      return {
        id: stationSnapshot.id,
        ...stationSnapshot.data()
      };
    } else {
      throw new Error('Station not found');
    }
  } catch (error) {
    console.error('Error getting station:', error);
    throw error;
  }
};

// Add a new station
export const addStation = async (stationData) => {
  try {
    const stationsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(stationsCollection, {
      ...stationData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return {
      id: docRef.id,
      ...stationData
    };
  } catch (error) {
    console.error('Error adding station:', error);
    throw error;
  }
};

// Update a station
export const updateStation = async (stationId, stationData) => {
  try {
    const stationDoc = doc(db, COLLECTION_NAME, stationId);
    await updateDoc(stationDoc, {
      ...stationData,
      updatedAt: new Date()
    });
    return {
      id: stationId,
      ...stationData
    };
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  }
};

// Delete a station
export const deleteStation = async (stationId) => {
  try {
    const stationDoc = doc(db, COLLECTION_NAME, stationId);
    await deleteDoc(stationDoc);
    return stationId;
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
};

// Update available cars count
export const updateStationCarCount = async (stationId, count) => {
  try {
    const stationDoc = doc(db, COLLECTION_NAME, stationId);
    await updateDoc(stationDoc, {
      availableCars: count,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating station car count:', error);
    throw error;
  }
};
