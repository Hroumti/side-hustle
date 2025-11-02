// File operations utility for admin dashboard
// Uses Firebase Storage exclusively (no localStorage fallback)

import { firebaseStorage } from './firebaseStorage';
import { database, ref, set, get, push, remove } from '../firebase.js';
import { authService } from './auth.js';

// Store file metadata in Firebase Database
// Structure: files/{type}/{fileId}
function getFilesMetadataPath(type) {
  return `files/${type}`;
}

function getFileMetadataPath(type, fileId) {
  return `files/${type}/${fileId}`;
}

// Encode filename to be safe for Firebase Database paths
// Firebase Database paths cannot contain: . # $ [ ]
function encodeFirebasePath(filename) {
  return filename
    .replace(/\./g, '_DOT_')
    .replace(/#/g, '_HASH_')
    .replace(/\$/g, '_DOLLAR_')
    .replace(/\[/g, '_LBRACKET_')
    .replace(/\]/g, '_RBRACKET_')
    .replace(/\//g, '_SLASH_');
}

// Decode Firebase path back to original filename
function decodeFirebasePath(encodedPath) {
  return encodedPath
    .replace(/_DOT_/g, '.')
    .replace(/_HASH_/g, '#')
    .replace(/_DOLLAR_/g, '$')
    .replace(/_LBRACKET_/g, '[')
    .replace(/_RBRACKET_/g, ']')
    .replace(/_SLASH_/g, '/');
}

export const fileOperations = {
  // Upload a file to Firebase Storage
  async uploadFile(file, fileName, year, type) {
    const userRole = localStorage.getItem('encg_user_role');
    if (!userRole) {
      throw new Error('Authentication required to upload files');
    }
    
    if (userRole !== 'admin') {
      throw new Error('Admin access required to upload files');
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const normalizedFileName = (() => {
      const trimmed = fileName.trim();
      if (!trimmed) return file.name;
      const lowerTrimmed = trimmed.toLowerCase();
      return lowerTrimmed.endsWith(`.${fileExtension}`)
        ? trimmed
        : `${trimmed}.${fileExtension}`;
    })();

    try {
      // Upload to Firebase Storage
      const newFile = await firebaseStorage.uploadFile(file, normalizedFileName, year, type);
      
      // Store metadata in Firebase Database using structure: files/{type}/{encodedFileId}
      try {
        const fileId = encodeFirebasePath(newFile.name || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        const fileMetadataPath = getFileMetadataPath(type, fileId);
        const fileMetadataRef = ref(database, fileMetadataPath);
        
        // Store individual file metadata
        await set(fileMetadataRef, {
          ...newFile,
          id: fileId,
          originalName: newFile.name // Keep original name for display
        });
        
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('filesUpdated', { 
          detail: { type, file: newFile } 
        }));
      } catch (dbError) {
        // If database write fails, still return the uploaded file
        console.warn('Failed to update Firebase Database metadata:', dbError);
        console.warn('File uploaded to Storage but metadata not saved');
      }
      
      console.log('File uploaded to Firebase Storage:', newFile);
      return newFile;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('Permission denied') || error.code === 'PERMISSION_DENIED') {
        throw new Error('Permission denied: Make sure you are authenticated as admin and Firebase rules allow uploads');
      }
      
      throw error;
    }
  },

  // Delete a file from Firebase Storage
  async deleteFile(fileName, year, type) {
    const userRole = localStorage.getItem('encg_user_role');
    if (!userRole) {
      throw new Error('Authentication required to delete files');
    }
    
    if (userRole !== 'admin') {
      throw new Error('Admin access required to delete files');
    }

    try {
      // Get files metadata from Firebase Database (structure: files/{type}/{fileId})
      const metadataPath = getFilesMetadataPath(type);
      const filesRef = ref(database, metadataPath);
      const snapshot = await get(filesRef);
      
      if (!snapshot.exists()) {
        throw new Error('File not found in metadata');
      }
      
      // Convert object structure to array to find the file
      const filesData = snapshot.val();
      let fileToDelete = null;
      let fileIdToDelete = null;
      
      for (const fileId in filesData) {
        const file = filesData[fileId];
        // Compare with both original name and decoded fileId
        const decodedFileName = decodeFirebasePath(fileId);
        if ((file.name === fileName || file.originalName === fileName || decodedFileName === fileName) && file.year === year) {
          fileToDelete = { ...file, id: fileId };
          fileIdToDelete = fileId;
          break;
        }
      }
      
      if (!fileToDelete || !fileIdToDelete) {
        throw new Error('File not found');
      }

      // Delete from Firebase Storage
      try {
        await firebaseStorage.deleteFile(fileToDelete);
      } catch (storageError) {
        // If storage delete fails but file exists, still try to remove from metadata
        console.warn('Firebase Storage delete failed, removing from metadata only:', storageError);
      }
      
      // Remove from metadata (structure: files/{type}/{fileId})
      const fileMetadataPath = getFileMetadataPath(type, fileIdToDelete);
      try {
        await remove(ref(database, fileMetadataPath));
      } catch (dbError) {
        console.warn('Failed to delete from Firebase Database:', dbError);
        // Still return success if storage delete worked
        if (!fileToDelete.firebasePath) {
          throw dbError;
        }
      }
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('filesUpdated', { 
        detail: { type, file: fileToDelete } 
      }));
      
      console.log('File deleted:', { fileName, year, type });
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      
      if (error.message?.includes('Permission denied') || error.code === 'PERMISSION_DENIED') {
        throw new Error('Permission denied: Make sure you are authenticated as admin and Firebase rules allow deletes');
      }
      
      throw error;
    }
  },

  // Get files list from Firebase (requires authentication for admin operations)
  async getFiles(type) {
    const userRole = authService.userRole || localStorage.getItem('encg_user_role');
    
    // For non-authenticated users, fallback to JSON
    if (!userRole) {
      try {
        const response = await fetch(`/${type}/index.json`);
        if (response.ok) {
          return await response.json();
        }
      } catch (fetchError) {
        console.warn('Failed to fetch from JSON:', fetchError);
      }
      return [];
    }

    try {
      // First try to get from Firebase Database metadata
      // Structure: files/{type}/{fileId}
      const metadataPath = getFilesMetadataPath(type);
      const filesRef = ref(database, metadataPath);
      const snapshot = await get(filesRef);
      
      if (snapshot.exists()) {
        const filesData = snapshot.val();
        // Convert object structure to array
        const files = [];
        for (const fileId in filesData) {
          const file = filesData[fileId];
          files.push({
            ...file,
            id: fileId,
            // Ensure we have the original name for display
            name: file.originalName || file.name || decodeFirebasePath(fileId)
          });
        }
        return files;
      }
      
      // If no metadata exists and user is admin, try to list from Firebase Storage
      if (userRole === 'admin') {
        try {
          const files = await firebaseStorage.listFilesByType(type);
          
          // Store in metadata for future use (structure: files/{type}/{encodedFileId})
          if (files.length > 0) {
            for (const file of files) {
              const fileId = encodeFirebasePath(file.name || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
              const fileMetadataPath = getFileMetadataPath(type, fileId);
              await set(ref(database, fileMetadataPath), {
                ...file,
                id: fileId,
                originalName: file.name
              });
            }
          }
          
          return files;
        } catch (storageError) {
          console.warn('Failed to list from Firebase Storage:', storageError);
        }
      }
      
      // Fallback to static JSON
      try {
        const response = await fetch(`/${type}/index.json`);
        if (response.ok) {
          return await response.json();
        }
      } catch (fetchError) {
        console.warn('Failed to fetch from JSON:', fetchError);
      }
      
      return [];
    } catch (error) {
      console.error('Get files error:', error);
      
      // Fallback: try to fetch from original JSON (for existing static files)
      try {
        const response = await fetch(`/${type}/index.json`);
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (fetchError) {
        console.warn('Failed to fetch from JSON:', fetchError);
      }
      
      return [];
    }
  },

  // Update files index in Firebase Database
  // Note: This is used by FileManager but with new structure we store individual files
  // This method can still be called but will update individual file entries
  async updateFilesIndex(files, type) {
    try {
      // With new structure files/{type}/{encodedFileId}, we store each file individually
      for (const file of files) {
        const fileId = encodeFirebasePath(file.name || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
        const fileMetadataPath = getFileMetadataPath(type, fileId);
        await set(ref(database, fileMetadataPath), { 
          ...file, 
          id: fileId,
          originalName: file.name
        });
      }
      
      // Dispatch custom event to notify components of changes
      window.dispatchEvent(new CustomEvent('filesUpdated', { 
        detail: { type, files } 
      }));
      
      console.log('Files index updated in Firebase:', { files, type });
      return { success: true };
    } catch (error) {
      console.error('Update files index error:', error);
      throw error;
    }
  },

  // Get files for public consumption (used by cours.jsx and td.jsx)
  // This should work without authentication
  async getPublicFiles(type) {
    // Always try Firebase first if authenticated, otherwise use JSON
    const userRole = authService.userRole || localStorage.getItem('encg_user_role');
    
    if (userRole) {
      try {
        return await this.getFiles(type);
      } catch (error) {
        console.warn('Failed to get files from Firebase, falling back to JSON:', error);
      }
    }
    
    // Fallback to static JSON (works without authentication)
    try {
      const response = await fetch(`/${type}/index.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (fetchError) {
      console.warn('Failed to fetch public files from JSON:', fetchError);
    }
    
    return [];
  },

  // Get file URL from Firebase Storage
  async getFileUrl(file) {
    try {
      return await firebaseStorage.getFileUrl(file);
    } catch (error) {
      console.error('Get file URL error:', error);
      // Fallback to direct URL if available
      return file.url || null;
    }
  }
};

// User operations utility (still uses localStorage for user management)
export const userOperations = {
  // Get all users
  getUsers() {
    const savedUsers = localStorage.getItem('encg_users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  },

  // Save users
  saveUsers(users) {
    localStorage.setItem('encg_users', JSON.stringify(users));
  },

  // Add new user
  addUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Check if username already exists
    if (users.find(user => user.username === newUser.username)) {
      throw new Error('Username already exists');
    }
    
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  // Update user
  updateUser(userId, userData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Check if username already exists (excluding current user)
    if (users.find(user => user.username === userData.username && user.id !== userId)) {
      throw new Error('Username already exists');
    }
    
    users[userIndex] = { ...users[userIndex], ...userData };
    this.saveUsers(users);
    return users[userIndex];
  },

  // Delete user
  deleteUser(userId) {
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    this.saveUsers(filteredUsers);
    return { success: true };
  },

  // Toggle user status
  toggleUserStatus(userId) {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex].isActive = !users[userIndex].isActive;
    this.saveUsers(users);
    return users[userIndex];
  }
};
