import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// --- 1. SİBER SES MOTORU (Dışarıdan mp3 yüklemeye gerek yok) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playCyberBeep() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square'; // Fütüristik retro ses
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// Butonlara tıklandığında ses çalsın
document.querySelectorAll('.tool-btn, #scene-graph li').forEach(el => {
    el.addEventListener('pointerdown', playCyberBeep);
});

// --- 2. SAHNE VE RENDER KURULUMU ---
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(5, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- 3. OBJELER VE IŞIKLAR ---
const gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x111111);
scene.add(gridHelper);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Purpleguy Ana Objesi
const proGeo = new THREE.IcosahedronGeometry(1.5, 0);
const proMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xbc13fe, emissiveIntensity: 0.5, wireframe: false });
const mainObject = new THREE.Mesh(proGeo, proMat);
mainObject.position.y = 2;
mainObject.name = "P_Core_Neon";
scene.add(mainObject);

const interactableObjects = [mainObject]; // Tıklanabilir objeler listesi

// --- 4. KONTROLLER (Orbit & Transform) ---
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.05;

// Sürükle, Döndür, Ölçeklendir aracı (Gizmo)
const transformControl = new TransformControls(camera, renderer.domElement);
transformControl.addEventListener('dragging-changed', (event) => {
    orbit.enabled = !event.value; // Obje sürüklenirken kamerayı kitle
});
transformControl.addEventListener('change', () => {
    // Inspector UI Güncellemesi
    if(transformControl.object) {
        document.getElementById('pos-x').value = transformControl.object.position.x.toFixed(2);
        document.getElementById('pos-y').value = transformControl.object.position.y.toFixed(2);
        document.getElementById('pos-z').value = transformControl.object.position.z.toFixed(2);
    }
});
scene.add(transformControl);

// --- 5. RAYCASTER (Obje Seçme Sistemi) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (event) => {
    if (transformControl.dragging) return; // Gizmo'yu çekerken boşa tıklamayı engelle

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        if (!document.getElementById('btn-select').classList.contains('active')) {
            transformControl.attach(intersects[0].object);
        }
        document.getElementById('inspector-title').innerText = "Özellikler (" + intersects[0].object.name + ")";
        playCyberBeep();
    } else {
        transformControl.detach(); // Boşa tıklanınca seçimi bırak
    }
});

// --- 6. UI BUTON BAĞLANTILARI ---
const tools = {
    'btn-select': null,
    'btn-translate': 'translate',
    'btn-rotate': 'rotate',
    'btn-scale': 'scale'
};

for (const [id, mode] of Object.entries(tools)) {
    document.getElementById(id).addEventListener('click', (e) => {
        // Aktif buton stilini değiştir
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        if (mode === null) {
            transformControl.detach(); // Sadece seç modundayken gizmo'yu gizle
        } else {
            transformControl.setMode(mode);
            if(interactableObjects[0]) transformControl.attach(interactableObjects[0]);
        }
    });
}

// --- 7. ANİMASYON DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    orbit.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
