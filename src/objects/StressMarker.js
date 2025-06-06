import * as THREE from 'three';

export function createStressMarker() {
  const markerGroup = new THREE.Group();
  
  // Create marker geometry
  const geometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 32);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      stressLevel: { value: 0.0 },
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float stressLevel;
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        // Create pulsing effect
        float pulse = sin(time * 3.0) * 0.1 + 0.9;
        
        // Mix colors based on stress level
        vec3 lowStress = vec3(0.0, 0.0, 1.0);  // Blue
        vec3 highStress = vec3(1.0, 0.0, 0.0); // Red
        vec3 color = mix(lowStress, highStress, stressLevel);
        
        // Add glow effect
        float glow = 0.5 + 0.5 * sin(time * 2.0);
        color += vec3(glow * stressLevel);
        
        gl_FragColor = vec4(color, 0.8);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const marker = new THREE.Mesh(geometry, material);
  markerGroup.add(marker);
  
  // Add update method
  markerGroup.updateStress = function(time, stressLevel) {
    material.uniforms.stressLevel.value = stressLevel;
    material.uniforms.time.value = time;
    
    // Scale marker based on stress
    const scale = 1.0 + stressLevel * 0.5;
    marker.scale.set(scale, 1, scale);
  };
  
  // Add positioning method
  markerGroup.setPosition = function(x, y, z) {
    markerGroup.position.set(x, y, z);
  };
  
  return markerGroup;
}
