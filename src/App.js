import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { createBridge } from './objects/Bridge';
import { createEnvironment } from './environment/Environment';
import { setupPhysics } from './physics/physics';
import { stressVertexShader, stressFragmentShader } from './shaders/stressShader';

export function initApp() {
  try {
    console.log('Initializing scene...');
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 200); // Adjusted position to see the entire bridge

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Add UI instructions
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.position = 'absolute';
    instructionsDiv.style.top = '10px';
    instructionsDiv.style.left = '10px';
    instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructionsDiv.style.color = 'white';
    instructionsDiv.style.padding = '15px';
    instructionsDiv.style.borderRadius = '5px';
    instructionsDiv.style.fontFamily = 'Arial, sans-serif';
    instructionsDiv.style.zIndex = '1000';
    instructionsDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0">Bridge Stress Simulation</h3>
      <p style="margin: 5px 0"><strong>How to Use:</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px">
        <li>Click and drag the gold spheres to add weight</li>
        <li>Release to remove some weight</li>
        <li>Use mouse wheel to zoom in/out</li>
        <li>Right-click and drag to rotate view</li>
      </ul>
      <p style="margin: 5px 0"><strong>Color Guide:</strong></p>
      <ul style="margin: 5px 0; padding-left: 20px">
        <li><span style="color: #0000ff">Blue</span> = Low Stress (Safe)</li>
        <li><span style="color: #ff0000">Red</span> = High Stress (Danger)</li>
      </ul>
    `;
    document.body.appendChild(instructionsDiv);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    controls.minDistance = 10;
    controls.maxDistance = 200;

    // Create bridge
    console.log('Creating bridge...');
    const bridge = createBridge();
    console.log('Bridge created:', bridge);
    scene.add(bridge.mesh);
    console.log('Bridge added to scene');

    // Create environment
    const environment = createEnvironment(scene);

    // Physics setup
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    const bridgePhysics = setupPhysics(world);

    // Create stress visualization material
    const stressMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        stressLevel: { value: 0 },
        stressPoint: { value: new THREE.Vector3(0, 0, 0) },
        stressRadius: { value: 10 }
      },
      vertexShader: stressVertexShader,
      fragmentShader: stressFragmentShader,
      transparent: true
    });

    // Apply stress material to bridge
    bridge.weightPoints.forEach((point) => {
      point.material = stressMaterial;
    });

    // Create physics bodies for bridge segments
    bridge.weightPoints.forEach((point, index) => {
      if (point.geometry instanceof THREE.BoxGeometry) {
        const body = new CANNON.Body({
          mass: 1000,
          shape: new CANNON.Box(new CANNON.Vec3(point.geometry.parameters.width/2, point.geometry.parameters.height/2, point.geometry.parameters.depth/2)),
          position: new CANNON.Vec3(point.position.x, point.position.y, point.position.z),
          material: new CANNON.Material({ friction: 0.5 })
        });
        world.addBody(body);
        point.userData.physicsBody = body;
      }
    });

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedWeightPoint = null;
    let lastMouseY = 0;

    function onMouseDown(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastMouseY = event.clientY;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bridge.weightPoints);

      if (intersects.length > 0) {
        selectedWeightPoint = intersects[0].object;
      }
    }

    function onMouseMove(event) {
      if (selectedWeightPoint) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Calculate weight change based on mouse movement
        const deltaY = event.clientY - lastMouseY;
        const weightChange = -deltaY * 0.005; // Adjust sensitivity here
        lastMouseY = event.clientY;

        const index = bridge.weightPoints.indexOf(selectedWeightPoint);
        if (weightChange > 0) {
          bridge.addWeight(index, weightChange);
        } else {
          bridge.removeWeight(index, -weightChange);
        }

        // Update position
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([bridge.mesh]);
        if (intersects.length > 0) {
          selectedWeightPoint.position.copy(intersects[0].point);
          selectedWeightPoint.position.y = bridge.mesh.position.y + 5;
        }
      }
    }

    function onMouseUp() {
      selectedWeightPoint = null;
    }

    // Event listeners
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let lastTime = 0;
    function animate(time) {
      requestAnimationFrame(animate);

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      // Update controls
      controls.update();

      // Update bridge
      bridge.update(time * 0.001);

      // Update environment
      environment.update(time * 0.001);

      // Render scene
      renderer.render(scene, camera);
    }
    animate(0);

    // Handle window resize
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);

    // Return cleanup function
    return function cleanup() {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      document.body.removeChild(instructionsDiv);
      renderer.dispose();
      document.body.removeChild(renderer.domElement);
    };
  } catch (error) {
    console.error('Error in App initialization:', error);
    // Display error on screen
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '50%';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translate(-50%, -50%)';
    errorDiv.style.color = 'red';
    errorDiv.style.backgroundColor = 'white';
    errorDiv.style.padding = '20px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.fontFamily = 'Arial, sans-serif';
    errorDiv.innerHTML = `Error: ${error.message}`;
    document.body.appendChild(errorDiv);
    
    // Return empty cleanup function
    return () => {};
  }
}
