import * as THREE from 'https://cdn.skypack.dev/three@0.160.0';

// 1. Sahne, Kamera ve Renderer Kurulumu
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Arka planı simsiyah yapalım

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, // Kenar yumuşatma (Tablet ekranında daha net görünür)
    alpha: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Yüksek çözünürlüklü ekranlar için (Retina/OLED)
document.body.appendChild(renderer.domElement);

// 2. Işıklandırma (Siyah ekranın en büyük düşmanı)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Her yeri biraz aydınlat
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xbc13fe, 15); // Senin ikonik mor renginde bir ışık
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// 3. İlk 3D Obje: Neon Mor Küp
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xbc13fe, // Ana renk mor
    roughness: 0.3,
    metalness: 0.8,
    emissive: 0xbc13fe, // Kendi kendine ışık saçma (Neon etkisi)
    emissiveIntensity: 0.2
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 4. Kamera Pozisyonu
camera.position.z = 6;

// 5. Animasyon Döngüsü
function animate() {
    requestAnimationFrame(animate);
    
    // Küpü iki eksende döndürerek 3D olduğunu hissettirelim
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // Hafif bir yüzer gibi hareket (Floating effect)
    cube.position.y = Math.sin(Date.now() * 0.002) * 0.2;
    
    renderer.render(scene, camera);
}

// 6. Responsive Tasarım (Tableti yan çevirirsen bozulmasın)
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
});

// Başlat!
animate();

console.log("Purple 3D Studio Engine Başlatıldı! 🚀");
