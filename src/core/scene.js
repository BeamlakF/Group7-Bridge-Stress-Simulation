import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  
  // Set sky blue background
  scene.background = new THREE.Color(0x87CEEB);
  
  // Add fog for depth perception
  scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
  
  // Add helper methods
  scene.updateFog = function(density) {
    scene.fog.density = density;
  };
  
  return scene;
}
