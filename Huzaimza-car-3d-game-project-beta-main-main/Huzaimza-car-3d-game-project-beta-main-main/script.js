// SCENE SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LIGHTING
const ambientLight = new THREE.AmbientLight(0x404040); // soft light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// GROUND
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// CAR
const car = new THREE.Group();
scene.add(car);

// Car body
const body = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
body.castShadow = true;
car.add(body);

// Windshield
const windshield = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.4, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 })
);
windshield.position.set(0, 0.4, 1.1);
car.add(windshield);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 24);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const wheels = [];
const wheelPositions = [
  [0.9, -0.3, 1.5],  // front right
  [-0.9, -0.3, 1.5], // front left
  [0.9, -0.3, -1.5], // rear right
  [-0.9, -0.3, -1.5] // rear left
];
for (let i = 0; i < 4; i++) {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(...wheelPositions[i]);
  wheel.castShadow = true;
  car.add(wheel);
  wheels.push(wheel);
}

// Side mirrors
const mirrorGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.4);
const mirrorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
leftMirror.position.set(-1.15, 0.25, 1.2);
car.add(leftMirror);
const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
rightMirror.position.set(1.15, 0.25, 1.2);
car.add(rightMirror);

// HEADLIGHTS
const leftLight = new THREE.SpotLight(0xffffff, 1);
leftLight.position.set(0.8, 0.4, -1.9);
leftLight.target.position.set(0.8, 0.4, -4);
leftLight.castShadow = true;
car.add(leftLight);
car.add(leftLight.target);

const rightLight = new THREE.SpotLight(0xffffff, 1);
rightLight.position.set(-0.8, 0.4, -1.9);
rightLight.target.position.set(-0.8, 0.4, -4);
rightLight.castShadow = true;
car.add(rightLight);
car.add(rightLight.target);

// WALLS for crashing
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const walls = [];
function addWall(x, z, w, h) {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w, 2, h),
    wallMaterial
  );
  wall.position.set(x, 1, z);
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  walls.push(wall);
}
addWall(0, -100, 100, 2);
addWall(0, 100, 100, 2);
addWall(-100, 0, 2, 100);
addWall(100, 0, 2, 100);

// --- SIGNBOARD CREATION ---
function createSignboard(text, x, z, rotationY) {
  const group = new THREE.Group();
  
  // Signboard post (vertical pole)
  const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 8);
  const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const post = new THREE.Mesh(postGeometry, postMaterial);
  post.position.y = 3;
  group.add(post);
  
  // Signboard (larger size)
  const boardGeometry = new THREE.BoxGeometry(4, 2, 0.1);
  const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 });
  const board = new THREE.Mesh(boardGeometry, boardMaterial);
  board.position.y = 5.5;
  group.add(board);
  
  // Text on the signboard
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#FFFFFF';
  context.font = 'Bold 120px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width/2, canvas.height/2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const textMaterial = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const textMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 1.5),
    textMaterial
  );
  textMesh.position.y = 5.5;
  textMesh.position.z = 0.06;
  group.add(textMesh);
  
  // Position and rotate the entire signboard
  group.position.set(x, 0, z);
  group.rotation.y = rotationY;
  
  // Enable shadows
  post.castShadow = true;
  post.receiveShadow = true;
  board.castShadow = true;
  board.receiveShadow = true;
  
  return group;
}

// --- TREES ON BORDERS ---
function createTree() {
  const tree = new THREE.Group();
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B5A2B });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);
  // Foliage
  const foliageGeometry = new THREE.SphereGeometry(0.5, 12, 12);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.y = 1.1;
  foliage.castShadow = true;
  foliage.receiveShadow = true;
  tree.add(foliage);
  return tree;
}

// Place trees along the borders
const borderMin = -100, borderMax = 100;
const interval = 8;

// Add signboards at each corner
scene.add(createSignboard('Huzaimza', -80, -80, Math.PI/4));
scene.add(createSignboard('&', 80, -80, -Math.PI/4));
scene.add(createSignboard('Zeejay', 80, 80, -3*Math.PI/4));
scene.add(createSignboard('Best Friends!', -80, 80, 3*Math.PI/4));
// Top and Bottom borders (z = borderMin, borderMax)
for (let x = borderMin + 4; x < borderMax; x += interval) {
  let tree1 = createTree();
  tree1.position.set(x, 0, borderMin - 2.5);
  scene.add(tree1);
  let tree2 = createTree();
  tree2.position.set(x, 0, borderMax + 2.5);
  scene.add(tree2);
}
// Left and Right borders (x = borderMin, borderMax)
for (let z = borderMin + 4; z < borderMax; z += interval) {
  let tree1 = createTree();
  tree1.position.set(borderMin - 2.5, 0, z);
  scene.add(tree1);
  let tree2 = createTree();
  tree2.position.set(borderMax + 2.5, 0, z);
  scene.add(tree2);
}

// CAMERA POSITION
camera.position.set(0, 5, 10);
camera.lookAt(car.position);

// CONTROLS
let speed = 0;
let angle = 0;
const keys = {};

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function checkCollision(object) {
  const carBox = new THREE.Box3().setFromObject(object);
  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (carBox.intersectsBox(wallBox)) return true;
  }
  return false;
}

// ANIMATION
function animate() {
  requestAnimationFrame(animate);

  // More realistic physics for acceleration, braking, and turning
  const maxSpeed = 1.2;
  const accel = 0.025;
  const brake = 0.04;
  const turnSpeed = 0.035;
  const friction = 0.97;

  if (keys["ArrowUp"]) speed = Math.min(speed + accel, maxSpeed);
  if (keys["ArrowDown"]) speed = Math.max(speed - brake, -maxSpeed * 0.5);
  if (keys[" "] || keys["Space"]) speed *= 0.92; // Space for handbrake
  if (keys["ArrowLeft"]) angle += turnSpeed * (speed / maxSpeed);
  if (keys["ArrowRight"]) angle -= turnSpeed * (speed / maxSpeed);

  // Friction
  speed *= friction;

  // Save old position
  const oldPosition = car.position.clone();
  const oldRotation = angle;

  // Move car
  car.rotation.y = angle;
  car.position.x -= Math.sin(angle) * speed;
  car.position.z -= Math.cos(angle) * speed;

  // Animate wheels
  for (let i = 0; i < wheels.length; i++) {
    wheels[i].rotation.x += speed * 0.25;
  }

  // Collision check
  if (checkCollision(car)) {
    car.position.copy(oldPosition);
    speed = -speed * 0.3;
  }

  // Camera follows
  camera.position.x = car.position.x + Math.sin(angle) * 10;
  camera.position.z = car.position.z + Math.cos(angle) * 10;
  camera.position.y = car.position.y + 5;
  camera.lookAt(car.position);

  renderer.render(scene, camera);
}
animate();
