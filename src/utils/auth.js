// Simplified authentication utility that works with existing system
import { auth } from '../firebase.js';
import { 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { dbUtils } from './db-utils.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = localStorage.getItem('encg_user_role') || null;
    this.authStateListeners = [];
    
    // Listen to Firebase Auth state changes
    onAuthStateChanged(auth, (firebaseUser) => {
      this.handleAuthStateChange(firebaseUser);
    });
  }

  async handleAuthStateChange(firebaseUser) {
    this.currentUser = firebaseUser;
    
    // Get role from localStorage (set during login)
    this.userRole = localStorage.getItem('encg_user_role') || null;
    
    // Notify listeners
    this.authStateListeners.forEach(listener => {
      listener(this.currentUser, this.userRole);
    });
  }

  // Login with username/password (simplified approach)
  async loginWithCredentials(username, password) {
    try {
      // 1. Verify credentials against database
      const userCredential = await dbUtils.findUserForLogin(username, password);
      
      if (!userCredential) {
        throw new Error('Invalid credentials');
      }

      if (!userCredential.isActive) {
        throw new Error('Account is inactive');
      }

      // 2. Sign in anonymously to Firebase Auth (simpler approach)
      let firebaseUser;
      try {
        const authResult = await signInAnonymously(auth);
        firebaseUser = authResult.user;
      } catch (authError) {
        throw new Error('Authentication service unavailable');
      }

      // 3. Store role mapping in Firebase Database for security rules
      try {
        const { ref, set } = await import('firebase/database');
        const { database } = await import('../firebase.js');
        const userRoleRef = ref(database, `user_roles/${firebaseUser.uid}`);
        await set(userRoleRef, {
          role: userCredential.role,
          username: username,
          updated_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.warn('Failed to store role mapping:', dbError);
        // Continue anyway - role is still in localStorage
      }

      // 4. Update local state
      this.currentUser = firebaseUser;
      this.userRole = userCredential.role;
      
      localStorage.setItem('encg_user_role', userCredential.role);
      localStorage.setItem('encg_firebase_uid', firebaseUser.uid);
      localStorage.setItem('encg_current_user', JSON.stringify({
        uid: userCredential.uid,
        username: username,
        role: userCredential.role,
        isActive: userCredential.isActive,
        firebaseUid: firebaseUser.uid
      }));

      // Immediately notify listeners of the state change
      this.authStateListeners.forEach(listener => {
        listener(this.currentUser, this.userRole);
      });

      return {
        success: true,
        user: userCredential,
        firebaseUser: firebaseUser
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }



  // Logout
  async logout() {
    try {
      const firebaseUid = this.currentUser?.uid;
      
      // Clear local state first
      this.currentUser = null;
      this.userRole = null;
      
      // Clear localStorage
      localStorage.removeItem('encg_user_role');
      localStorage.removeItem('encg_firebase_uid');
      localStorage.removeItem('encg_current_user');
      
      // Remove role mapping from database
      if (firebaseUid) {
        try {
          const { ref, remove } = await import('firebase/database');
          const { database } = await import('../firebase.js');
          const userRoleRef = ref(database, `user_roles/${firebaseUid}`);
          await remove(userRoleRef);
        } catch (dbError) {
          console.warn('Failed to remove role mapping:', dbError);
        }
      }
      
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        listener(null, null);
      });
      
      return { success: true };
    } catch (error) {
      // Even if Firebase signOut fails, clear local state
      this.currentUser = null;
      this.userRole = null;
      localStorage.removeItem('encg_user_role');
      localStorage.removeItem('encg_firebase_uid');
      localStorage.removeItem('encg_current_user');
      
      return { success: false, error: error.message };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Check if user is admin
  isAdmin() {
    return this.userRole === 'admin';
  }

  // Check if user is regular user
  isUser() {
    return this.userRole === 'user';
  }

  // Get current user info
  getCurrentUser() {
    return {
      firebaseUser: this.currentUser,
      role: this.userRole,
      isAuthenticated: this.isAuthenticated(),
      isAdmin: this.isAdmin(),
      isUser: this.isUser()
    };
  }

  // Add auth state listener
  onAuthStateChange(listener) {
    this.authStateListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Initialize auth service
  async initialize() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export for backward compatibility
export const isAuthenticated = () => authService.isAuthenticated();
export const isAdmin = () => authService.isAdmin();
export const getCurrentUser = () => authService.getCurrentUser();