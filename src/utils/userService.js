import { db, auth } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  deleteUser as firebaseDeleteUser,
  getAuth,
  signInWithEmailAndPassword
} from 'firebase/auth';

const COLLECTION_NAME = 'users';

// Get all users
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, COLLECTION_NAME);
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

// Get a single user by ID
export const getUser = async (userId) => {
  try {
    const userDoc = doc(db, COLLECTION_NAME, userId);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      return {
        id: userSnapshot.id,
        ...userSnapshot.data()
      };
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Add a new user
export const addUser = async (userData) => {
  try {
    // Create a temporary auth instance to avoid affecting the current admin session
    const tempAuth = getAuth();
    const currentAuth = auth.currentUser;
    
    // Keep track of the current admin auth state
    let adminUserCredential = null;
    
    // If there's a current admin user, we'll sign them back in after creating the new user
    if (currentAuth) {
      try {
        // Store admin credentials for later
        const adminEmail = localStorage.getItem('adminEmail');
        const adminPassword = localStorage.getItem('adminPassword');
        
        if (adminEmail && adminPassword) {
          adminUserCredential = { email: adminEmail, password: adminPassword };
        }
      } catch (error) {
        console.warn("Could not retrieve admin credentials from localStorage");
      }
    }

    // Create the user in Firebase Authentication
    await createUserWithEmailAndPassword(tempAuth, userData.email, userData.password);
    
    // Add user to Firestore without the password
    const { password, ...userDataWithoutPassword } = userData;
    
    const usersCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(usersCollection, {
      ...userDataWithoutPassword,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // If we had admin credentials, sign back in with them
    if (adminUserCredential) {
      await signInWithEmailAndPassword(auth, adminUserCredential.email, adminUserCredential.password);
    }
    
    return {
      id: docRef.id,
      ...userDataWithoutPassword
    };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userId, userData) => {
  try {
    // Update Firestore document
    const userDoc = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userDoc, {
      ...userData,
      updatedAt: new Date()
    });
    return {
      id: userId,
      ...userData
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId, authUid) => {
  try {
    // Delete from Firestore
    const userDoc = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(userDoc);
    
    // If we have the auth UID, we can delete the user from Firebase Auth too
    // This would typically be handled on the backend for security reasons
    if (authUid) {
      try {
        // This would need a cloud function in a production app
        // as client-side deletion is limited to the current user
        console.warn("Auth user deletion should be handled by a Cloud Function");
      } catch (authError) {
        console.error('Error deleting auth user:', authError);
      }
    }
    
    return userId;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
