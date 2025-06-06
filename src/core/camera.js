import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    1000 // Far plane
  );
  
  // Set initial position for better bridge view
  camera.position.set(0, 10, 30);
  
  // Add helper methods
  camera.updateAspect = function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  
  return camera;
}
