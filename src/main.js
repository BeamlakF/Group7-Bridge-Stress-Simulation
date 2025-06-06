import { initApp } from './App';

// Initialize the application
const cleanup = initApp();

// Handle cleanup when the page is unloaded
window.addEventListener('unload', cleanup);
