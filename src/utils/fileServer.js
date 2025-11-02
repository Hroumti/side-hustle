// File server utility for handling uploaded files
// Uses Firebase Storage exclusively

import { fileOperations } from './fileOperations.js';

export const fileServer = {
  // Get the proper URL for a file (Firebase Storage or direct URL)
  async getFileUrl(file) {
    // Use fileOperations to get URL from Firebase Storage
    return fileOperations.getFileUrl(file);
  },

  // Get proper MIME type for file extension
  getMimeType(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes = {
      'pdf': 'application/pdf',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  },

  // Sanitize filename for download
  sanitizeFileName(fileName) {
    if (!fileName) return 'download';
    
    // Remove or replace invalid characters
    return fileName
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_{2,}/g, '_')
      .trim();
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
  async handleFileDownload(file, showNotification = null) {
    try {
      const url = await this.getFileUrl(file);
      if (!url) {
        console.error('Could not create URL for file:', file);
        throw new Error('Unable to get file URL');
      }

      const fileName = this.sanitizeFileName(file.name || file.originalName || 'download');
      const mimeType = this.getMimeType(fileName);
      const isFirebaseUrl = url.includes('firebasestorage.googleapis.com') || url.includes('firebase');

      // Show download start notification
      if (showNotification) {
        showNotification(`Téléchargement de ${fileName} en cours...`, 'info', 2000);
      }

      if (isFirebaseUrl) {
        // For Firebase Storage URLs, use fetch to download and create blob
        try {
          console.log('Starting download for:', fileName);
          
          // Create AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          // Get content length for progress tracking
          const contentLength = response.headers.get('content-length');
          const total = contentLength ? parseInt(contentLength, 10) : 0;
          
          let loaded = 0;
          const reader = response.body.getReader();
          const chunks = [];
          
          // Read the response stream
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            loaded += value.length;
            
            // Log progress and show notification for large files
            if (total > 0) {
              const progress = Math.round((loaded / total) * 100);
              console.log(`Download progress: ${progress}%`);
              
              // Show progress notification for large files (>5MB) at 50% and 90%
              if (total > 5 * 1024 * 1024 && showNotification) {
                if (progress === 50) {
                  showNotification(`Téléchargement de ${fileName}: 50%`, 'info', 1500);
                } else if (progress === 90) {
                  showNotification(`Téléchargement de ${fileName}: 90%`, 'info', 1500);
                }
              }
            }
          }
          
          // Create blob from chunks
          const blob = new Blob(chunks, { 
            type: response.headers.get('content-type') || mimeType 
          });
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create download link with blob URL
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up blob URL after a short delay
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
          
          console.log('File downloaded successfully:', fileName);
          
          // Show success notification
          if (showNotification) {
            showNotification(`${fileName} téléchargé avec succès!`, 'success');
          }
        } catch (fetchError) {
          console.warn('Fetch download failed, trying alternative method:', fetchError);
          
          // Handle timeout specifically
          if (fetchError.name === 'AbortError') {
            if (showNotification) {
              showNotification('Téléchargement interrompu (timeout). Ouverture dans un nouvel onglet...', 'warning');
            }
            // Open in new tab as fallback for timeout
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
          }
          
          // Fallback: Try to modify Firebase URL for download
          try {
            const downloadUrl = new URL(url);
            downloadUrl.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);
            downloadUrl.searchParams.set('response-content-type', 'application/octet-stream');
            
            const link = document.createElement('a');
            link.href = downloadUrl.toString();
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (urlError) {
            console.warn('URL modification failed, opening in new tab:', urlError);
            // Last resort: open in new tab
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }
      } else {
        // For regular URLs, try direct download
        try {
          console.log('Downloading regular URL:', fileName);
          
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
          }, 1000);
          
          console.log('Regular URL downloaded successfully:', fileName);
          
          // Show success notification
          if (showNotification) {
            showNotification(`${fileName} téléchargé avec succès!`, 'success');
          }
        } catch (fetchError) {
          console.warn('Fetch failed, trying direct link:', fetchError);
          // Fallback to direct link with download attribute
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log('Used direct link fallback for:', fileName);
          
          // Show info notification for fallback
          if (showNotification) {
            showNotification(`${fileName} ouvert dans un nouvel onglet`, 'info');
          }
        }
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('Permission denied') || error.message.includes('unauthorized')
        ? 'Vous devez être connecté pour télécharger ce fichier.'
        : error.message.includes('Network')
        ? 'Erreur réseau: Vérifiez votre connexion internet.'
        : 'Erreur lors du téléchargement du fichier. Veuillez réessayer.';
      
      if (showNotification) {
        showNotification(errorMessage, 'error');
      } else {
        alert(errorMessage);
      }
      
      throw error;
    }
  },

};
