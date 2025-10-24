// Initialize file system with existing JSON data
// This ensures that existing files are available in localStorage

export const initializeFiles = async () => {
  try {
    // Initialize courses
    const coursKey = 'encg_cours_files';
    if (!localStorage.getItem(coursKey)) {
      try {
        const response = await fetch('/cours/index.json');
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(coursKey, JSON.stringify(data));
          console.log('Initialized courses from JSON:', data.length, 'files');
        }
      } catch (error) {
        console.log('No existing courses JSON found, starting with empty array');
        localStorage.setItem(coursKey, JSON.stringify([]));
      }
    }

    // Initialize TDs
    const tdKey = 'encg_td_files';
    if (!localStorage.getItem(tdKey)) {
      try {
        const response = await fetch('/td/index.json');
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem(tdKey, JSON.stringify(data));
          console.log('Initialized TDs from JSON:', data.length, 'files');
        }
      } catch (error) {
        console.log('No existing TDs JSON found, starting with empty array');
        localStorage.setItem(tdKey, JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error('Error initializing files:', error);
  }
};
