import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

export function setupPointerLockControls(camera, domElement, scene) {
  const controls = new PointerLockControls(camera, domElement);
  
  // Movement speed
  const moveSpeed = 0.1;
  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };
  
  // Handle key presses
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW': keys.forward = true; break;
      case 'KeyS': keys.backward = true; break;
      case 'KeyA': keys.left = true; break;
      case 'KeyD': keys.right = true; break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW': keys.forward = false; break;
      case 'KeyS': keys.backward = false; break;
      case 'KeyA': keys.left = false; break;
      case 'KeyD': keys.right = false; break;
    }
  });
  
  // Handle pointer lock
  domElement.addEventListener('click', () => {
    if (!controls.isLocked) {
      controls.lock();
    }
  });
  
  controls.addEventListener('lock', () => {
    console.log('Pointer locked - Use WASD to move, mouse to look');
  });
  
  controls.addEventListener('unlock', () => {
    console.log('Pointer unlocked');
  });
  
  // Add movement update method
  controls.updateMovement = function() {
    if (controls.isLocked) {
      const direction = new THREE.Vector3();
      const rotation = camera.rotation.y;
      
      if (keys.forward) {
        direction.z = -Math.cos(rotation);
        direction.x = -Math.sin(rotation);
      }
      if (keys.backward) {
        direction.z = Math.cos(rotation);
        direction.x = Math.sin(rotation);
      }
      if (keys.left) {
        direction.x = -Math.cos(rotation);
        direction.z = Math.sin(rotation);
      }
      if (keys.right) {
        direction.x = Math.cos(rotation);
        direction.z = -Math.sin(rotation);
      }
      
      direction.normalize();
      camera.position.addScaledVector(direction, moveSpeed);
    }
  };
  
  return controls;
}
