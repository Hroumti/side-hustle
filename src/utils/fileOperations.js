// File operations utility for admin dashboard
// This simulates backend operations using localStorage for persistence

export const fileOperations = {
  // Upload a file
  async uploadFile(file, fileName, year, type) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const fileContent = e.target.result;
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Store the file content in localStorage with a unique key
          const fileStorageKey = `encg_file_content_${fileId}`;
          localStorage.setItem(fileStorageKey, fileContent);
          
          const newFile = {
            id: fileId,
            name: fileName,
            url: `/api/files/${type}/${fileId}`, // Use a proper URL structure
            size: file.size,
            uploadedAt: new Date().toISOString(),
            year: year,
            ext: file.name.split('.').pop().toLowerCase(),
            type: file.type,
            originalName: file.name,
            isUploaded: true // Flag to identify uploaded files
          };
          
          // Get current files from localStorage
          const storageKey = `encg_${type}_files`;
          const currentFiles = JSON.parse(localStorage.getItem(storageKey) || '[]');
          
          // Add new file
          currentFiles.push(newFile);
          
          // Save back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(currentFiles));
          
          // Dispatch custom event to notify components of changes
          window.dispatchEvent(new CustomEvent('filesUpdated', { 
            detail: { type, files: currentFiles } 
          }));
          
          console.log('File uploaded and saved:', newFile);
          resolve(newFile);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read file as base64
      reader.readAsDataURL(file);
    });
  },

  // Delete a file
  async deleteFile(fileName, year, type) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Get current files from localStorage
          const storageKey = `encg_${type}_files`;
          const currentFiles = JSON.parse(localStorage.getItem(storageKey) || '[]');
          
          // Find the file to delete
          const fileToDelete = currentFiles.find(file => 
            file.name === fileName && file.year === year
          );
          
          // Remove the file content from localStorage if it's an uploaded file
          if (fileToDelete && fileToDelete.isUploaded) {
            const fileStorageKey = `encg_file_content_${fileToDelete.id}`;
            localStorage.removeItem(fileStorageKey);
          }
          
          // Remove the file from the list
          const updatedFiles = currentFiles.filter(file => 
            !(file.name === fileName && file.year === year)
          );
          
          // Save back to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedFiles));
          
          // Dispatch custom event to notify components of changes
          window.dispatchEvent(new CustomEvent('filesUpdated', { 
            detail: { type, files: updatedFiles } 
          }));
          
          console.log('File deleted:', { fileName, year, type });
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // Get files list
  async getFiles(type) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // First try to get from localStorage
          const storageKey = `encg_${type}_files`;
          const storedFiles = localStorage.getItem(storageKey);
          
          if (storedFiles) {
            resolve(JSON.parse(storedFiles));
            return;
          }
          
          // If no stored files, fetch from original JSON and store them
          fetch(`/${type}/index.json`)
            .then(response => response.json())
            .then(data => {
              // Store the original data in localStorage
              localStorage.setItem(storageKey, JSON.stringify(data));
              resolve(data);
            })
            .catch(error => {
              // If fetch fails, return empty array
              localStorage.setItem(storageKey, JSON.stringify([]));
              resolve([]);
            });
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  // Update files index
  async updateFilesIndex(files, type) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const storageKey = `encg_${type}_files`;
          localStorage.setItem(storageKey, JSON.stringify(files));
          
          // Dispatch custom event to notify components of changes
          window.dispatchEvent(new CustomEvent('filesUpdated', { 
            detail: { type, files } 
          }));
          
          console.log('Files index updated:', { files, type });
          resolve({ success: true });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  },

  // Get files for public consumption (used by cours.jsx and td.jsx)
  getPublicFiles(type) {
    const storageKey = `encg_${type}_files`;
    const storedFiles = localStorage.getItem(storageKey);
    
    if (storedFiles) {
      return JSON.parse(storedFiles);
    }
    
    // Return empty array if no stored files
    return [];
  },

  // Get file content by ID (for serving uploaded files)
  getFileContent(fileId) {
    const fileStorageKey = `encg_file_content_${fileId}`;
    return localStorage.getItem(fileStorageKey);
  },

  // Create a blob URL for uploaded files
  createBlobUrl(fileId) {
    const fileContent = this.getFileContent(fileId);
    if (!fileContent) return null;
    
    // Convert base64 to blob
    const byteCharacters = atob(fileContent.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Determine MIME type from file content
    const mimeType = fileContent.split(',')[0].split(':')[1].split(';')[0];
    const blob = new Blob([byteArray], { type: mimeType });
    
    return URL.createObjectURL(blob);
  }
};

// User operations utility
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
