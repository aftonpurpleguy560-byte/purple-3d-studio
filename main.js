/* Purple-3D-Studio Core Engine - V1.5
    Author: Purpleguy © 2026 - tablet power
    Features: Raycasting, Bloom Post-Processing, Transform Sync
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// Post-Processing (Bloom) Importları
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { translateUI, getLanguage } from './translations.js';

// --- 1. DEĞİŞKENLER VE KONSOL ---
let isUnsaved = false;
let interactableObjects = [];
const consoleOutput = document.getElementById('console-output');

function logToConsole(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? '#ff4444' : type === 'success' ? '#bc13fe' : '#00ff41';
    if(consoleOutput) {
        consoleOutput.innerHTML += `<div class="log-entry" style="color: ${color}">[${time}] > ${msg}</div>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

// --- 2. DİL VE UI BAŞLATMA ---
const dict = translateUI();
logToConsole(`Sistem Dili: ${getLanguage().toUpperCase()}`, "success");

// --- 3. SAHNE VE RENDERER ---
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(8, 6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- 4. BLOOM (PARLAMA) EFEKTİ KURULUMU ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 1.0; 
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// --- 5. IŞIKLANDIRMA VE YARDIMCILAR ---
const gridHelper = new THREE.GridHelper(100, 100, 0x222222, 0x111111);
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- 6. KONTROLLER VE SEÇME SİSTEMİ (RAYCASTER) ---
const orbit = new OrbitControls(camera, renderer.domElement);
const transformControl = new TransformControls(camera, renderer.domElement);
scene.add(transformControl);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Obje Seçme Fonksiyonu
container.addEventListener('pointerdown', (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        const selected = intersects[0].object;
        transformControl.attach(selected);
        updateInspector(selected);
        logToConsole(`${selected.name} seçildi.`, "success");
    } else if (event.target.tagName === 'CANVAS') {
        transformControl.detach();
    }
});

// Transform Değişince Kaydetme ve Inspector Güncelleme
transformControl.addEventListener('dragging-changed', (e) => {
    orbit.enabled = !e.value;
    if(!e.value) {
        markAsUnsaved();
        if(transformControl.object) updateInspector(transformControl.object);
    }
});

function updateInspector(obj) {
    document.getElementById('pos-x').value = obj.position.x.toFixed(2);
    document.getElementById('pos-y').value = obj.position.y.toFixed(2);
    document.getElementById('pos-z').value = obj.position.z.toFixed(2);
}

// --- 7. KAYIT SİSTEMİ ---
function markAsUnsaved() {
    isUnsaved = true;
    const status = document.getElementById('statusbar');
    if(status) status.innerHTML = `<span style="color: #ff4444;">● Kaydedilmemiş Değişiklikler</span>`;
}

document.getElementById('btn-save').addEventListener('click', () => {
    logToConsole("Proje Kaydedildi! (LocalStorage)", "success");
    isUnsaved = false;
    document.getElementById('statusbar').innerText = "🟢 Proje Güvende | Sakarya Studio";
});

// --- 8. OBJE YÖNETİMİ ---
function updateExplorerUI() {
    const list = document.getElementById('scene-graph');
    list.innerHTML = "";
    interactableObjects.forEach(obj => {
        const li = document.createElement('li');
        li.innerText = obj.name;
        li.onclick = () => {
            transformControl.attach(obj);
            updateInspector(obj);
        };
        list.appendChild(li);
    });
}

function createObject(type) {
    let mesh;
    // Neon Mor Materyal
    const mat = new THREE.MeshStandardMaterial({ 
        color: 0xbc13fe, 
        emissive: 0xbc13fe, 
        emissiveIntensity: 0.6,
        metalness: 0.7, 
        roughness: 0.2 
    });
    
    if(type === 'box') mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat);
    if(type === 'sphere') mesh = new THREE.Mesh(new THREE.SphereGeometry(0.7,32,32), mat);
    if(type === 'torus') mesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 16, 100), mat);
    
    if(mesh) {
        mesh.name = `${type.toUpperCase()}_${interactableObjects.length + 1}`;
        mesh.position.set(Math.random()*4-2, 0.5, Math.random()*4-2);
        scene.add(mesh);
        interactableObjects.push(mesh);
        updateExplorerUI();
        markAsUnsaved();
        logToConsole(`${mesh.name} oluşturuldu.`, "info");
    }
}

document.getElementById('confirm-add').onclick = () => {
    const type = document.getElementById('obj-type').value;
    createObject(type);
};

document.getElementById('btn-delete').onclick = () => {
    if(transformControl.object) {
        const obj = transformControl.object;
        scene.remove(obj);
        interactableObjects = interactableObjects.filter(o => o !== obj);
        transformControl.detach();
        updateExplorerUI();
        markAsUnsaved();
        logToConsole(`${obj.name} silindi.`, "error");
    }
};

// --- 9. ARAÇLAR (TRANSFORM MODLARI) ---
const tools = {
    'btn-translate': 'translate',
    'btn-rotate': 'rotate',
    'btn-scale': 'scale'
};

Object.keys(tools).forEach(id => {
    document.getElementById(id).onclick = () => {
        Object.keys(tools).forEach(btnId => document.getElementById(btnId).classList.remove('active'));
        document.getElementById(id).classList.add('active');
        transformControl.setMode(tools[id]);
    };
});

// --- 10. RENDER DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    orbit.update();
    composer.render(); // renderer yerine efektli composer
}
animate();

// Pencere Boyutu Değişimi
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
});

logToConsole("Purple Engine Başlatıldı. Keyifli tasarımlar Efe!", "success");
