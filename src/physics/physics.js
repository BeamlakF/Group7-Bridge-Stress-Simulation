import * as CANNON from 'cannon-es';

export function setupPhysics(world) {
  // Set up world
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.solver.iterations = 10;
  world.defaultContactMaterial.friction = 0.3;

  // Create ground
  const ground = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: new CANNON.Material('ground')
  });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  ground.position.set(0, -3, 0);
  world.addBody(ground);

  // Create bridge physics
  const bridgePhysics = {
    bodies: [],
    constraints: [],
    
    createBridgeSegment: function(x, width, height, depth) {
      const body = new CANNON.Body({
        mass: 1000,
        shape: new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)),
        material: new CANNON.Material('bridge')
      });
      body.position.set(x, 0, 0);
      body.linearDamping = 0.5;
      body.angularDamping = 0.5;
      world.addBody(body);
      this.bodies.push(body);
      return body;
    },
    
    createPillar: function(x, height) {
      const body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Cylinder(0.5, 0.5, height, 8),
        material: new CANNON.Material('pillar')
      });
      body.position.set(x, -height/2, 0);
      world.addBody(body);
      this.bodies.push(body);
      return body;
    },
    
    connectSegments: function(bodyA, bodyB) {
      const constraint = new CANNON.PointToPointConstraint(
        bodyA,
        new CANNON.Vec3(width/2, 0, 0),
        bodyB,
        new CANNON.Vec3(-width/2, 0, 0)
      );
      world.addConstraint(constraint);
      this.constraints.push(constraint);
    },
    
    applyStress: function(stressLevel) {
      this.bodies.forEach((body, index) => {
        // Apply force based on stress level and position
        const force = new CANNON.Vec3(
          Math.sin(index * 0.5) * stressLevel * 1000,
          -stressLevel * 500,
          0
        );
        body.applyForce(force, body.position);
      });
    },
    
    reset: function() {
      this.bodies.forEach(body => {
        body.position.set(body.position.x, 0, 0);
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
      });
    }
  };

  return bridgePhysics;
}
