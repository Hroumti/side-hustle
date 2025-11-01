// File server utility for handling uploaded files
// This creates a virtual file server using blob URLs

import { fileOperations } from './fileOperations.js';

export const fileServer = {
  // Get the proper URL for a file (either original URL or blob URL for uploaded files)
  async getFileUrl(file) {
    if (file.isUploaded && file.id) {
      // For uploaded files, create a blob URL
      return fileOperations.createBlobUrl(file.id);
    }
    // For original files, use the direct URL
    return file.url;
  },

  // Handle file preview/viewing
  async handleFileView(file) {
    let previewWindow = null;
    try {
      if (file.isUploaded) {
        previewWindow = window.open('', '_blank', 'noopener,noreferrer');
      }

      const url = await this.getFileUrl(file);
      if (url) {
        if (previewWindow) {
          previewWindow.location = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      } else {
        if (previewWindow) {
          previewWindow.close();
        }
        console.error('Could not create URL for file:', file);
      }
    } catch (error) {
      if (previewWindow) {
        previewWindow.close();
      }
      console.error('Failed to open file preview:', error);
    }
  },

  // Handle file download
  async handleFileDownload(file) {
    try {
      const url = await this.getFileUrl(file);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || file.originalName || 'download';
        link.click();
      } else {
        console.error('Could not create URL for file:', file);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  },

  // Clean up blob URLs to prevent memory leaks
  async revokeBlobUrl(fileId) {
    try {
      const fileContent = await fileOperations.getFileContent(fileId);
      if (!fileContent) return;

      const byteCharacters = atob(fileContent.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      const mimeType = fileContent.split(',')[0].split(':')[1].split(';')[0];
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to revoke blob URL:', error);
    }
  }
};
