import * as THREE from 'three';

export function setupLights(scene) {
  // Ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Main directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  
  // Configure shadow properties
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  
  scene.add(directionalLight);

  // Add point lights for better stress visualization
  const pointLight1 = new THREE.PointLight(0xff0000, 0.5, 20);
  pointLight1.position.set(-10, 5, 0);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x0000ff, 0.5, 20);
  pointLight2.position.set(10, 5, 0);
  scene.add(pointLight2);

  // Add helper methods
  const lights = {
    updateStressLights: function(stressLevel) {
      // Update point light intensities based on stress
      pointLight1.intensity = stressLevel * 0.5;
      pointLight2.intensity = (1 - stressLevel) * 0.5;
    },
    
    updateTimeOfDay: function(time) {
      // Simulate day/night cycle
      const dayIntensity = Math.sin(time) * 0.5 + 0.5;
      directionalLight.intensity = dayIntensity;
      ambientLight.intensity = 0.4 + (dayIntensity * 0.2);
    }
  };

  return lights;
}
