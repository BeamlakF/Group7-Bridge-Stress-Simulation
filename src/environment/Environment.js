import * as THREE from 'three';

export function createEnvironment(scene) {
  // Create ground
  const groundSize = 1000;
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a7e4f,
    roughness: 0.8,
    metalness: 0.2,
    map: new THREE.TextureLoader().load('/textures/grass.jpg', (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(50, 50);
    })
  });
  
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Create trees
  const treeCount = 100;
  const treePositions = [];
  
  // Tree trunk material
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d2926,
    roughness: 0.9,
    metalness: 0.1
  });
  
  // Tree leaves material
  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5a27,
    roughness: 0.8,
    metalness: 0.1
  });

  for (let i = 0; i < treeCount; i++) {
    // Random position within ground bounds
    const x = (Math.random() - 0.5) * groundSize * 0.8;
    const z = (Math.random() - 0.5) * groundSize * 0.8;
    
    // Skip if too close to bridge
    if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;
    
    treePositions.push({ x, z });
    
    // Create tree trunk
    const trunkHeight = 5 + Math.random() * 5;
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, trunkHeight / 2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // Create tree leaves
    const leavesSize = 3 + Math.random() * 2;
    const leavesGeometry = new THREE.ConeGeometry(leavesSize, leavesSize * 2, 8);
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, trunkHeight + leavesSize, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    scene.add(leaves);
  }

  // Add fog for atmosphere
  scene.fog = new THREE.FogExp2(0x87ceeb, 0.002);

  // Enhanced lighting setup
  // Main sun light
  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  scene.add(sunLight);

  // Ambient light for overall scene brightness
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  // Add point lights for better illumination
  const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
  pointLight1.position.set(0, 20, 0);
  pointLight1.castShadow = true;
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
  pointLight2.position.set(50, 15, 50);
  pointLight2.castShadow = true;
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffffff, 0.8, 100);
  pointLight3.position.set(-50, 15, -50);
  pointLight3.castShadow = true;
  scene.add(pointLight3);

  // Add spotlights for dramatic effect
  const spotLight1 = new THREE.SpotLight(0xffffff, 1);
  spotLight1.position.set(0, 50, 0);
  spotLight1.angle = Math.PI / 6;
  spotLight1.penumbra = 0.1;
  spotLight1.decay = 2;
  spotLight1.distance = 200;
  spotLight1.castShadow = true;
  scene.add(spotLight1);

  // Add water under the bridge
  const waterGeometry = new THREE.PlaneGeometry(100, 100);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x0077be,
    transparent: true,
    opacity: 0.8,
    metalness: 0.1,
    roughness: 0.1
  });
  
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -5;
  water.receiveShadow = true;
  scene.add(water);

  // Add rocks near the water
  const rockCount = 20;
  for (let i = 0; i < rockCount; i++) {
    const rockGeometry = new THREE.DodecahedronGeometry(1 + Math.random() * 2, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
      metalness: 0.1
    });
    
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = 30 + Math.random() * 20;
    rock.position.set(
      Math.cos(angle) * radius,
      -4 + Math.random() * 2,
      Math.sin(angle) * radius
    );
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.scale.set(
      0.5 + Math.random() * 0.5,
      0.5 + Math.random() * 0.5,
      0.5 + Math.random() * 0.5
    );
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }

  return {
    update: (time) => {
      // Animate water
      waterMaterial.opacity = 0.7 + Math.sin(time * 0.5) * 0.1;
      
      // Animate trees slightly
      scene.children.forEach(child => {
        if (child.material === leavesMaterial) {
          child.rotation.y = Math.sin(time * 0.2 + child.position.x) * 0.1;
        }
      });

      // Animate lights
      pointLight1.position.y = 20 + Math.sin(time * 0.5) * 2;
      pointLight2.position.y = 15 + Math.sin(time * 0.5 + 1) * 2;
      pointLight3.position.y = 15 + Math.sin(time * 0.5 + 2) * 2;
    }
  };
} 