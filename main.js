import * as THREE from 'three';

// 1. Sahne ve Kamera Kurulumu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. İlk 3D Obje (Küp)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0xbc13fe }); // Neon Mor
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 3. Işıklandırma (Görünürlük için şart)
const light = new THREE.PointLight(0xffffff, 50, 100);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040)); // Yumuşak genel ışık

camera.position.z = 5;

// 4. Animasyon Döngüsü
function animate() {
    requestAnimationFrame(animate);
    
    // Küpü döndürelim
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
}

// Pencere boyutu değişirse sahneyi güncelle
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

