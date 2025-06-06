import * as THREE from 'three';

export function createBridge() {
  console.log('Starting bridge creation...');
  const bridgeGroup = new THREE.Group();
  
  // Bridge parameters
  const numSegments = 15;
  const segmentLength = 25;
  const segmentWidth = 15;
  const segmentHeight = 3;
  const pillarHeight = 20;
  const pillarRadius = 2;

  console.log('Bridge parameters:', {
    numSegments,
    segmentLength,
    segmentWidth,
    segmentHeight,
    pillarHeight,
    pillarRadius
  });

  // Create bridge segments
  const segments = [];
  const segmentGeometry = new THREE.BoxGeometry(segmentLength, segmentHeight, segmentWidth);
  const segmentMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    metalness: 0.7,
    roughness: 0.3
  });

  for (let i = 0; i < numSegments; i++) {
    const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
    segment.position.set(
      (i - (numSegments - 1) / 2) * segmentLength,
      segmentHeight / 2,
      0
    );
    segment.castShadow = true;
    segment.receiveShadow = true;
    segment.userData.originalY = segmentHeight / 2;
    segment.userData.originalRotation = 0;
    bridgeGroup.add(segment);
    segments.push(segment);
  }

  // Create support pillars
  for (let i = 0; i <= numSegments; i++) {
    const pillarGeometry = new THREE.CylinderGeometry(
      pillarRadius,
      pillarRadius * 1.2,
      pillarHeight,
      8
    );
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: 0x5C4033, // Dark brown for pillars
      roughness: 0.9,
      metalness: 0.1
    });
    
    const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar.position.set(
      (i - numSegments / 2) * segmentLength,
      -pillarHeight / 2,
      0
    );
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    bridgeGroup.add(pillar);
  }

  // Create side railings
  const railingHeight = 3;
  const railingWidth = 0.3;
  const postSpacing = 5;
  const numPosts = Math.floor(numSegments * segmentLength / postSpacing);

  // Create posts
  for (let i = 0; i <= numPosts; i++) {
    const postGeometry = new THREE.BoxGeometry(railingWidth, railingHeight, railingWidth);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513, // Saddle brown for posts
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Left side posts
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(
      (i - numPosts / 2) * postSpacing,
      segmentHeight / 2 + railingHeight / 2,
      -segmentWidth / 2
    );
    leftPost.castShadow = true;
    leftPost.receiveShadow = true;
    bridgeGroup.add(leftPost);
    
    // Right side posts
    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(
      (i - numPosts / 2) * postSpacing,
      segmentHeight / 2 + railingHeight / 2,
      segmentWidth / 2
    );
    rightPost.castShadow = true;
    rightPost.receiveShadow = true;
    bridgeGroup.add(rightPost);
  }

  // Create horizontal rails
  const railGeometry = new THREE.BoxGeometry(numSegments * segmentLength, railingWidth, railingWidth);
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Saddle brown for rails
    roughness: 0.8,
    metalness: 0.1
  });
  
  // Top rails
  const topRailLeft = new THREE.Mesh(railGeometry, railMaterial);
  topRailLeft.position.set(
    0,
    segmentHeight / 2 + railingHeight - railingWidth / 2,
    -segmentWidth / 2
  );
  topRailLeft.castShadow = true;
  topRailLeft.receiveShadow = true;
  bridgeGroup.add(topRailLeft);
  
  const topRailRight = new THREE.Mesh(railGeometry, railMaterial);
  topRailRight.position.set(
    0,
    segmentHeight / 2 + railingHeight - railingWidth / 2,
    segmentWidth / 2
  );
  topRailRight.castShadow = true;
  topRailRight.receiveShadow = true;
  bridgeGroup.add(topRailRight);
  
  // Middle rails
  const middleRailLeft = new THREE.Mesh(railGeometry, railMaterial);
  middleRailLeft.position.set(
    0,
    segmentHeight / 2 + railingHeight / 2,
    -segmentWidth / 2
  );
  middleRailLeft.castShadow = true;
  middleRailLeft.receiveShadow = true;
  bridgeGroup.add(middleRailLeft);
  
  const middleRailRight = new THREE.Mesh(railGeometry, railMaterial);
  middleRailRight.position.set(
    0,
    segmentHeight / 2 + railingHeight / 2,
    segmentWidth / 2
  );
  middleRailRight.castShadow = true;
  middleRailRight.receiveShadow = true;
  bridgeGroup.add(middleRailRight);

  // Weight points
  const weightPoints = [];
  const weightGeometry = new THREE.SphereGeometry(4, 32, 32);
  const weightMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    emissive: 0x886600,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });

  for (let i = 0; i < numSegments; i++) {
    const weightPoint = new THREE.Mesh(weightGeometry, weightMaterial);
    weightPoint.position.set(
      (i - (numSegments - 1) / 2) * segmentLength,
      segmentHeight + 10,
      0
    );
    weightPoint.userData.weight = 0;
    weightPoint.userData.index = i;
    weightPoint.castShadow = true;
    weightPoint.userData.isWeightPoint = true;
    weightPoint.userData.isClickable = true;
    bridgeGroup.add(weightPoint);
    weightPoints.push(weightPoint);
  }

  // Add stress visualization
  const stressGeometry = new THREE.PlaneGeometry(numSegments * segmentLength, segmentWidth);
  const stressMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      stressLevel: { value: 0 },
      stressPoint: { value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float stressLevel;
      uniform vec3 stressPoint;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        float dist = length(vPosition.xz - stressPoint.xz);
        float stressFactor = 1.0 - smoothstep(0.0, 20.0, dist);
        float pulse = sin(time * 5.0) * 0.5 + 0.5; // Increased flash speed
        
        // Adjusted color thresholds for more dramatic effect
        vec3 safeColor = vec3(0.0, 1.0, 0.0);    // Green
        vec3 warningColor = vec3(1.0, 0.5, 0.0); // Brighter Orange
        vec3 dangerColor = vec3(1.0, 0.0, 0.0);  // Red
        
        vec3 stressColor;
        if (stressLevel < 0.3) {
          stressColor = mix(safeColor, warningColor, stressLevel / 0.3);
        } else {
          stressColor = mix(warningColor, dangerColor, (stressLevel - 0.3) / 0.7);
        }
        
        // Enhanced flashing effect for warning levels
        if (stressLevel >= 0.3 && stressLevel < 0.6) {
          float flash = sin(time * 8.0) * 0.5 + 0.5; // Fast flash for warning
          stressColor = mix(stressColor, vec3(1.0, 0.8, 0.0), flash * 0.5); // Mix with bright yellow
        }
        
        stressColor = stressColor * stressFactor * pulse;
        float glow = 0.5 + 0.5 * sin(time * 2.0);
        stressColor += vec3(glow * stressLevel * stressFactor);
        float alpha = 0.4 + stressLevel * stressFactor * 0.6;
        gl_FragColor = vec4(stressColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  const stressPlane = new THREE.Mesh(stressGeometry, stressMaterial);
  stressPlane.rotation.x = -Math.PI / 2;
  stressPlane.position.y = segmentHeight / 2 + 0.01;
  bridgeGroup.add(stressPlane);

  // Add weight indicator
  const weightIndicatorDiv = document.createElement('div');
  weightIndicatorDiv.style.position = 'absolute';
  weightIndicatorDiv.style.top = '50%';
  weightIndicatorDiv.style.left = '50%';
  weightIndicatorDiv.style.transform = 'translate(-50%, -50%)';
  weightIndicatorDiv.style.color = 'white';
  weightIndicatorDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  weightIndicatorDiv.style.padding = '15px';
  weightIndicatorDiv.style.borderRadius = '5px';
  weightIndicatorDiv.style.fontFamily = 'Arial, sans-serif';
  weightIndicatorDiv.style.fontSize = '24px';
  weightIndicatorDiv.style.display = 'none';
  document.body.appendChild(weightIndicatorDiv);

  // Function to update bridge deformation
  function updateBridgeDeformation() {
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const weight = weightPoints[i].userData.weight;
      
      // Calculate deformation based on weight and distance from center
      const distanceFromCenter = Math.abs(i - (numSegments - 1) / 2);
      const maxDeformation = 8; // Increased maximum deformation
      const deformation = weight * maxDeformation * (1 - distanceFromCenter / (numSegments / 2));
      
      // Apply vertical deformation
      segment.position.y = segment.userData.originalY - deformation;
      
      // Apply rotation for more realistic bending
      const maxRotation = Math.PI / 8; // Increased rotation (22.5 degrees)
      const rotation = weight * maxRotation * (1 - distanceFromCenter / (numSegments / 2));
      segment.rotation.z = i < numSegments / 2 ? rotation : -rotation;
      
      // Add slight horizontal movement for more realistic deformation
      const horizontalShift = weight * 1.0 * (1 - distanceFromCenter / (numSegments / 2)); // Increased horizontal shift
      segment.position.x = (i - (numSegments - 1) / 2) * segmentLength + (i < numSegments / 2 ? horizontalShift : -horizontalShift);
    }
  }

  console.log('Bridge creation completed');
  return {
    mesh: bridgeGroup,
    weightPoints: weightPoints,
    addWeight: function(index, amount) {
      if (weightPoints[index]) {
        // Add weight continuously
        const currentWeight = weightPoints[index].userData.weight;
        const newWeight = Math.min(1.0, currentWeight + amount);
        
        console.log(`Adding weight to point ${index}: ${currentWeight} -> ${newWeight}`); // Debug log
        
        // Apply weight
        weightPoints[index].userData.weight = newWeight;
        
        // Scale based on actual weight
        const scale = 1 + newWeight * 2;
        weightPoints[index].scale.set(scale, scale, scale);
        
        // Update stress visualization
        stressMaterial.uniforms.stressLevel.value = newWeight;
        stressMaterial.uniforms.stressPoint.value.copy(weightPoints[index].position);
        
        // Update bridge deformation
        updateBridgeDeformation();
        
        // Update weight indicator with color
        const weightPercent = Math.round(newWeight * 100);
        let color, status;
        if (weightPercent < 30) {
          color = '#00ff00';
          status = 'Safe';
        } else if (weightPercent < 60) {
          color = '#ffa500';
          status = 'Warning';
        } else {
          color = '#ff0000';
          status = 'Danger!';
        }
        
        weightIndicatorDiv.style.display = 'block';
        weightIndicatorDiv.innerHTML = `
          <div style="color: ${color}; font-weight: bold;">
            Weight: ${weightPercent}%
          </div>
          <div style="font-size: 16px; margin-top: 5px;">
            ${status}
          </div>
        `;
      }
    },
    removeWeight: function(index, amount) {
      if (weightPoints[index]) {
        // Remove weight continuously
        const currentWeight = weightPoints[index].userData.weight;
        const newWeight = Math.max(0.0, currentWeight - amount);
        
        console.log(`Removing weight from point ${index}: ${currentWeight} -> ${newWeight}`); // Debug log
        
        // Apply weight
        weightPoints[index].userData.weight = newWeight;
        
        // Scale based on actual weight
        const scale = 1 + newWeight * 2;
        weightPoints[index].scale.set(scale, scale, scale);
        
        // Update stress visualization
        stressMaterial.uniforms.stressLevel.value = newWeight;
        stressMaterial.uniforms.stressPoint.value.copy(weightPoints[index].position);
        
        // Update bridge deformation
        updateBridgeDeformation();
        
        // Update weight indicator
        if (newWeight > 0) {
          const weightPercent = Math.round(newWeight * 100);
          let color, status;
          if (weightPercent < 30) {
            color = '#00ff00';
            status = 'Safe';
          } else if (weightPercent < 60) {
            color = '#ffa500';
            status = 'Warning';
          } else {
            color = '#ff0000';
            status = 'Danger!';
          }
          weightIndicatorDiv.innerHTML = `
            <div style="color: ${color}; font-weight: bold;">
              Weight: ${weightPercent}%
            </div>
            <div style="font-size: 16px; margin-top: 5px;">
              ${status}
            </div>
          `;
        } else {
          weightIndicatorDiv.style.display = 'none';
        }
      }
    },
    update: function(time) {
      stressMaterial.uniforms.time.value = time;
    }
  };
}
