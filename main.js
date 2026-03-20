import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 1. Motor Kurulumu ve Viewport Bağlantısı
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a); // Derin karanlık uzay
scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02); // Ufuk çizgisine derinlik (Sis)

// 2. Kamera ve Unreal Engine Tarzı Render Ayarları
const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 4, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Gerçekçi Gölgeler ve Renk Tonlaması (Sinematik Görünüm)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; 
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

// 3. Dokunmatik Kontroller (Tablet parmak kaydırması için)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Kaydırmayı yumuşatır
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2; // Yerin altına inmeyi engeller

// 4. Stüdyo Işıklandırması
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048; // Ultra HD Gölgeler
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

const neonLight = new THREE.PointLight(0xbc13fe, 100, 20); // Ana objeden yayılan neon ışık
scene.add(neonLight);

// 5. Zemin (Yansıtıcı, PBR Tabanlı)
const groundGeo = new THREE.PlaneGeometry(50, 50);
const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x111111, roughness: 0.2, metalness: 0.8 
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x111111);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// 6. Purpleguy Masterpiece Objesi (Kristal / İkozahedron)
const proGeo = new THREE.IcosahedronGeometry(1.5, 1);
const proMat = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    emissive: 0xbc13fe,
    emissiveIntensity: 0.6, // Çekirdek parlaması
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 1.0, // Camımsı parlama yüzeyi
    clearcoatRoughness: 0.1,
});
const mainObject = new THREE.Mesh(proGeo, proMat);
mainObject.position.y = 2;
mainObject.castShadow = true;
scene.add(mainObject);

// 7. Animasyon ve Fizik Motoru
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    controls.update(); // Damping için şart
    
    // Yüzen ve dönen efsanevi obje
    mainObject.rotation.y += 0.005;
    mainObject.rotation.x += 0.002;
    mainObject.position.y = 2.5 + Math.sin(time * 2) * 0.3; 
    
    neonLight.position.copy(mainObject.position); // Işık objeyi takip etsin

    renderer.render(scene, camera);
}
animate();

// 8. Pencere / Panel Boyutu Değişince Otomatik Ayarlama
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

console.log("Purple Engine V1 Tam Güçte Devrede! 🚀");
