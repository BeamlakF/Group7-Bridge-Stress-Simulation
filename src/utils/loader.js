import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export function loadBridgeModel(scene) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    // Add DRACO compression support
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);
    
    const progressBar = document.createElement('div');
    progressBar.style.position = 'absolute';
    progressBar.style.top = '50%';
    progressBar.style.left = '50%';
    progressBar.style.transform = 'translate(-50%, -50%)';
    progressBar.style.color = 'white';
    progressBar.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(progressBar);
    
    loader.load(
      '/assets/models/bridge.glb',
      (gltf) => {
        // Remove progress bar
        document.body.removeChild(progressBar);
        
        // Process the loaded model
        const model = gltf.scene;
        
        // Enable shadows
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Add stress visualization material if needed
            if (child.material) {
              child.material = new THREE.MeshStandardMaterial({
                ...child.material,
                metalness: 0.5,
                roughness: 0.7
              });
            }
          }
        });
        
        // Add to scene
        scene.add(model);
        resolve(model);
      },
      (progress) => {
        // Update progress bar
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        progressBar.textContent = `Loading bridge model: ${percent}%`;
      },
      (error) => {
        // Remove progress bar
        document.body.removeChild(progressBar);
        
        console.error('Error loading model:', error);
        reject(error);
      }
    );
  });
}
