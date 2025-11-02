// File server utility for handling uploaded files
// Uses Firebase Storage exclusively

import { fileOperations } from './fileOperations.js';

export const fileServer = {
  // Get the proper URL for a file (Firebase Storage or direct URL)
  async getFileUrl(file) {
    // Use fileOperations to get URL from Firebase Storage
    return fileOperations.getFileUrl(file);
  },

  // Handle file preview/viewing
  async handleFileView(file) {
    try {
      const url = await this.getFileUrl(file);
      if (!url) {
        console.error('Could not create URL for file:', file);
        return;
      }

      const fileExt = file.ext?.toLowerCase() || '';
      const isPpt = fileExt === 'ppt' || fileExt === 'pptx';
      const isPdf = fileExt === 'pdf';
      const isFirebaseUrl = url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
      const isPublicUrl = url.startsWith('http://') || url.startsWith('https://');
      const isBlobUrl = url.startsWith('blob:');

      if (isPpt) {
        // For PPT/PPTX files:
        // - Try Office Online Viewer for public URLs (including Firebase download URLs)
        // - If that fails, download directly
        if (isPublicUrl && !isBlobUrl) {
          // Public URL (including Firebase Storage signed URLs) - try Office Online Viewer
          const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
          const viewerWindow = window.open(viewerUrl, '_blank', 'noopener,noreferrer');
          
          // If the window was blocked or failed, fallback to download
          if (!viewerWindow || viewerWindow.closed || typeof viewerWindow.closed === 'undefined') {
            console.warn('Could not open Office Online Viewer, downloading instead');
            await this.handleFileDownload(file);
          }
        } else {
          // Non-public URL or blob URL (legacy) - trigger download
          await this.handleFileDownload(file);
        }
      } else if (isPdf) {
        // PDF files can be viewed directly in browser
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Other file types - try to open directly
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to open file preview:', error);
      // Fallback to download if preview fails
      try {
        await this.handleFileDownload(file);
      } catch (downloadError) {
        console.error('Failed to download file as fallback:', downloadError);
      }
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

};
