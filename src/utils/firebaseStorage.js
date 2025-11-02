// Firebase Storage utility for file operations with role-based access
import { storage } from '../firebase.js';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { auth } from '../firebase.js';

// Get the current user's role from localStorage (simpler approach)
function getUserRole() {
  return localStorage.getItem('encg_user_role') || null;
}

function isAdmin() {
  return getUserRole() === 'admin';
}

function isAuthenticated() {
  return !!getUserRole();
}

// Determine storage path based on file type
function getStoragePath(fileName, type) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') {
    return `pdfs/${fileName}`;
  } else if (ext === 'ppt' || ext === 'pptx') {
    return `pptx/${fileName}`;
  } else {
    // Default to public_materials for other file types
    return `public_materials/${fileName}`;
  }
}

export const firebaseStorage = {
  // Upload file to Firebase Storage
  async uploadFile(file, fileName, year, type) {
    if (!isAuthenticated()) {
      throw new Error('Authentication required to upload files');
    }

    if (!isAdmin()) {
      throw new Error('Admin access required to upload files');
    }

    try {
      const storagePath = getStoragePath(fileName, type);
      const storageRef = ref(storage, storagePath);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        id: snapshot.metadata.name,
        name: fileName,
        url: downloadURL,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        year: year,
        ext: fileName.split('.').pop().toLowerCase(),
        type: file.type,
        originalName: file.name,
        isUploaded: true,
        firebasePath: storagePath,
        firebaseRef: snapshot.ref.fullPath
      };
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  },

  // Get download URL for a file
  async getFileUrl(file) {
    // If file has a direct URL (public files), return it without authentication
    if (file.url && !file.firebasePath) {
      return file.url;
    }

    // For Firebase Storage files, try to get URL even if not authenticated
    // This will work if Storage rules allow public access or if user is authenticated
    try {
      if (file.firebasePath) {
        // File is in Firebase Storage
        const storageRef = ref(storage, file.firebasePath);
        return await getDownloadURL(storageRef);
      } else if (file.url) {
        // File has a direct URL (public files or already uploaded)
        return file.url;
      } else {
        throw new Error('File does not have a valid URL or storage path');
      }
    } catch (error) {
      console.error('Firebase Storage get URL error:', error);
      
      // If authentication error, provide helpful message
      if (error.code === 'storage/unauthorized' || error.message?.includes('Permission denied')) {
        throw new Error('Permission denied: File access requires authentication');
      }
      
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  },

  // Delete file from Firebase Storage
  async deleteFile(file) {
    if (!isAuthenticated()) {
      throw new Error('Authentication required to delete files');
    }

    if (!isAdmin()) {
      throw new Error('Admin access required to delete files');
    }

    try {
      if (file.firebasePath) {
        const storageRef = ref(storage, file.firebasePath);
        await deleteObject(storageRef);
        return { success: true };
      } else {
        throw new Error('File is not stored in Firebase Storage');
      }
    } catch (error) {
      console.error('Firebase Storage delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },

  // List all files for a specific type (cours or td)
  async listFilesByType(type) {
    if (!isAuthenticated()) {
      throw new Error('Authentication required to list files');
    }

    try {
      const files = [];
      const paths = type === 'cours' 
        ? ['pdfs', 'pptx', 'public_materials']
        : ['pdfs', 'pptx', 'public_materials']; // Same paths for both types

      for (const folder of paths) {
        try {
          const storageRef = ref(storage, folder);
          const result = await listAll(storageRef);
          
          const folderFiles = await Promise.all(
            result.items.map(async (itemRef) => {
              try {
                const url = await getDownloadURL(itemRef);
                const fileName = itemRef.name;
                const ext = fileName.split('.').pop()?.toLowerCase() || '';
                
                // Extract year from filename if it contains year info, or use default
                // You may want to store year as metadata, but for now we'll extract from path or filename
                let year = '3eme'; // Default
                if (fileName.includes('year3') || fileName.includes('3eme')) year = '3eme';
                else if (fileName.includes('year4') || fileName.includes('4eme')) year = '4eme';
                else if (fileName.includes('year5') || fileName.includes('5eme')) year = '5eme';
                
                return {
                  id: itemRef.name,
                  name: fileName,
                  url: url,
                  size: 0, // Size not available from listAll, would need metadata
                  uploadedAt: new Date().toISOString(), // Would need metadata
                  year: year,
                  ext: ext,
                  type: firebaseStorage.getMimeType(ext),
                  originalName: fileName,
                  isUploaded: true,
                  firebasePath: itemRef.fullPath,
                  firebaseRef: itemRef.fullPath
                };
              } catch (urlError) {
                console.warn(`Failed to get URL for ${itemRef.name}:`, urlError);
                return null;
              }
            })
          );
          
          files.push(...folderFiles.filter(f => f !== null));
        } catch (folderError) {
          // Folder might not exist, continue with other folders
          console.warn(`Failed to list files in ${folder}:`, folderError);
        }
      }

      return files;
    } catch (error) {
      console.error('Firebase Storage list error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  },

  // Helper to get MIME type from extension
  getMimeType(ext) {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
};

