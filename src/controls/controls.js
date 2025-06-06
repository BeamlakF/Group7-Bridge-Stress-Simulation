import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  
  // Enable smooth damping
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Set limits for better bridge viewing
  controls.minDistance = 10;
  controls.maxDistance = 100;
  controls.minPolarAngle = Math.PI / 6; // Limit how high you can go
  controls.maxPolarAngle = Math.PI / 2; // Limit how low you can go
  
  // Disable panning for better focus on bridge
  controls.enablePan = false;
  
  // Add helper methods
  controls.resetView = function() {
    camera.position.set(0, 10, 30);
    controls.target.set(0, 0, 0);
    controls.update();
  };
  
  return controls;
}
