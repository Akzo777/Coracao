import * as THREE from 'https://esm.sh/three@0.136.0';
import { GLTFLoader } from 'https://esm.sh/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.136.0/examples/jsm/controls/OrbitControls.js';

// 1. CONFIGURAÇÃO DA CENA E CÂMERA
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x05010d, 50, 160);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 80); 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, -5, 0); 
controls.autoRotate = true; 
controls.autoRotateSpeed = 0.3; 
controls.enableDamping = true; 

function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}
const particleTexture = createParticleTexture();

const grid = new THREE.GridHelper(300, 60, 0x220033, 0x220033);
grid.position.y = -25;
scene.add(grid);

// 2. CORAÇÃO CENTRAL DENSO
const countHeart = 12000;
const positionsHeart = new Float32Array(countHeart * 3);
const basePositionsHeart = new Float32Array(countHeart * 3);
const colorsHeart = new Float32Array(countHeart * 3);
const colorChoices = [new THREE.Color(0xff00ff), new THREE.Color(0x00ffff), new THREE.Color(0xffffff)];

for (let i = 0; i < countHeart; i++) {
  const i3 = i * 3;
  const t = Math.random() * Math.PI * 2;
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
  
  positionsHeart[i3] = x + (Math.random() - 0.5) * 0.5;
  const limitedY = Math.max(-18, y + (Math.random() - 0.5) * 0.5);
  positionsHeart[i3 + 1] = limitedY;
  positionsHeart[i3 + 2] = (Math.random() - 0.5) * 0.8;
  
  basePositionsHeart[i3] = positionsHeart[i3];
  basePositionsHeart[i3+1] = positionsHeart[i3+1];
  basePositionsHeart[i3+2] = positionsHeart[i3+2];
  const col = colorChoices[Math.floor(Math.random() * colorChoices.length)];
  colorsHeart[i3] = col.r; colorsHeart[i3+1] = col.g; colorsHeart[i3+2] = col.b;
}

const geoHeart = new THREE.BufferGeometry();
geoHeart.setAttribute('position', new THREE.BufferAttribute(positionsHeart, 3));
geoHeart.setAttribute('color', new THREE.BufferAttribute(colorsHeart, 3));
const heartSystem = new THREE.Points(geoHeart, new THREE.PointsMaterial({ size: 0.35, map: particleTexture, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 }));
scene.add(heartSystem);

// 3. GALÁXIA DE FUNDO
const countGalaxy = 100000; 
const posGalaxy = new Float32Array(countGalaxy * 3);
for (let i = 0; i < countGalaxy; i++) {
  const i3 = i * 3;
  const radius = 30 + Math.random() * 150; 
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  posGalaxy[i3] = radius * Math.sin(phi) * Math.cos(theta);
  posGalaxy[i3 + 1] = Math.max(-20, (radius * Math.sin(phi) * Math.sin(theta)) + 15);
  posGalaxy[i3 + 2] = radius * Math.cos(phi);
}
const geoGalaxy = new THREE.BufferGeometry();
geoGalaxy.setAttribute('position', new THREE.BufferAttribute(posGalaxy, 3));
const galaxySystem = new THREE.Points(geoGalaxy, new THREE.PointsMaterial({ size: 0.3, color: 0x8888cc, transparent: true, opacity: 0.6, map: particleTexture, blending: THREE.AdditiveBlending }));
scene.add(galaxySystem);

// 4. MINI CORAÇÕES "EM PÉ"
const miniHearts = [];
const placedPositions = [];

function createMiniHeart(s, p) {
  const count = 180;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const t = Math.random() * Math.PI * 2;
    const x = (16 * Math.pow(Math.sin(t), 3)) * s;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * s;
    pos[i3] = x; pos[i3+1] = y; pos[i3+2] = (Math.random()-0.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.4, color: 0xff0088, map: particleTexture, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.8 }));
  
  return { mesh: points, basePos: p.clone(), seed: Math.random() * 100, speed: 0.2 + Math.random() * 0.4 };
}

for (let i = 0; i < 15; i++) {
  const angle = (i / 15) * Math.PI * 2;
  const radius = 30 + Math.random() * 15;
  const p = new THREE.Vector3(Math.cos(angle) * radius, (Math.random()-0.5)*50, Math.sin(angle) * radius);
  
  let valid = true;
  placedPositions.forEach(oldP => { if(p.distanceTo(oldP) < 20) valid = false; });
  
  if(valid) {
    const heartObj = createMiniHeart(0.12 + Math.random()*0.1, p);
    miniHearts.push(heartObj);
    scene.add(heartObj.mesh);
    placedPositions.push(p);
  }
}

// 5. MODELO 3D CENTRAL (ATUALIZADO PARA O NOVO REPOSITÓRIO)
let loadedHeart;
new GLTFLoader().load('https://cdn.jsdelivr.net/gh/Akzo777/Coracao/Heart.glb', (gltf) => {
  loadedHeart = gltf.scene;
  const box = new THREE.Box3().setFromObject(loadedHeart);
  loadedHeart.position.sub(box.getCenter(new THREE.Vector3()));
  loadedHeart.scale.set(2.5, 2.5, 2.5);
  loadedHeart.position.y = -6;
  loadedHeart.traverse(n => { if(n.isMesh) { n.material.roughness = 0.1; n.material.metalness = 0.9; }});
  scene.add(loadedHeart);
});

// 6. LUZES
const ambientLight = new THREE.AmbientLight(0x606060, 1.2); scene.add(ambientLight);

const l1 = new THREE.PointLight(0xffffff, 8); 
l1.position.set(0, 15, 30); 
scene.add(l1);

const lMagenta = new THREE.PointLight(0xff00ff, 10);
lMagenta.position.set(-25, 5, 10);
scene.add(lMagenta);

const lCyan = new THREE.PointLight(0x00ffff, 10);
lCyan.position.set(25, 5, 10);
scene.add(lCyan);

// 7. ANIMAÇÃO
function animate() {
  requestAnimationFrame(animate);
  const time = Date.now() * 0.001;
  
  const hPos = geoHeart.attributes.position;
  for (let i = 0; i < countHeart; i++) {
    const i3 = i * 3;
    hPos.array[i3] = basePositionsHeart[i3] + Math.sin(time * 5 + i) * 0.05;
    hPos.array[i3+1] = basePositionsHeart[i3+1] + Math.cos(time * 5 + i) * 0.05;
    hPos.array[i3+2] = basePositionsHeart[i3+2] + Math.sin(time * 5 + i) * 0.05;
  }
  hPos.needsUpdate = true;

  miniHearts.forEach(h => {
    h.mesh.position.x = h.basePos.x + Math.sin(time * h.speed + h.seed) * 8;
    h.mesh.position.y = h.basePos.y + Math.cos(time * h.speed * 0.8 + h.seed) * 6;
    h.mesh.position.z = h.basePos.z + Math.sin(time * h.speed * 1.2 + h.seed) * 4;
    h.mesh.rotation.y = 0; 
    h.mesh.rotation.z = 0; 
  });

  if (loadedHeart) loadedHeart.rotation.y += 0.01;
  galaxySystem.rotation.y += 0.0001;

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();