export const stressVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const stressFragmentShader = `
  uniform float time;
  uniform float stressLevel;
  uniform vec3 stressPoint;
  uniform float stressRadius;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  // Noise functions
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    // Base stress color gradient
    vec3 lowStress = vec3(0.0, 0.0, 1.0);  // Blue
    vec3 highStress = vec3(1.0, 0.0, 0.0); // Red
    
    // Calculate distance from stress point
    float dist = length(vPosition - stressPoint);
    float stressFactor = 1.0 - smoothstep(0.0, stressRadius, dist);
    
    // Add noise for visual interest
    float noiseValue = noise(vUv * 10.0 + time * 0.5);
    stressFactor += noiseValue * 0.1;
    
    // Calculate final stress level
    float finalStress = stressLevel * stressFactor;
    
    // Mix colors based on stress
    vec3 color = mix(lowStress, highStress, finalStress);
    
    // Add pulsing effect
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    color *= pulse;
    
    // Add normal-based lighting
    float lighting = dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)));
    color *= 0.5 + 0.5 * lighting;
    
    // Add glow effect for high stress areas
    float glow = smoothstep(0.7, 1.0, finalStress);
    color += vec3(glow * 0.5);
    
    gl_FragColor = vec4(color, 0.8);
  }
`;
