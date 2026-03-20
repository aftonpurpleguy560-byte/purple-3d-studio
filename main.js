/* Purple-3D-Studio Core Engine - V1.5
    Author: Purpleguy © 2026
    Features: Multi-lang, Save System, Anti-F5, 3D Editor Tools
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { translateUI, getLanguage } from './translations.js';

// --- 1. DEĞİŞKENLER VE KONSOL ---
let isUnsaved = false;
let interactableObjects = [];
const consoleOutput = document.getElementById('console-output');

function logToConsole(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? '#ff4444' : type === 'success' ? '#bc13fe' : '#00ff41';
    consoleOutput.innerHTML += `<div class="log-entry" style="color: ${color}">[${time}] > ${msg}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// --- 2. DİL VE UI BAŞLATMA ---
const dict = translateUI(); // Sayfa açılınca dili algıla ve çevir
logToConsole(`Sistem Dili: ${getLanguage().toUpperCase()}`, "success");

// --- 3. SAHNE VE RENDERER ---
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(10, 8, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- 4. GROUND & GRID ---
const gridHelper = new THREE.GridHelper(100, 100, 0x333333, 0x151515);
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// --- 5. KONTROLLER ---
const orbit = new OrbitControls(camera, renderer.domElement);
const transformControl = new TransformControls(camera, renderer.domElement);

transformControl.addEventListener('dragging-changed', (e) => {
    orbit.enabled = !e.value;
    if(!e.value) markAsUnsaved(); // Sürükleme bitince kayıt uyarısını tetikle
});
scene.add(transformControl);

// --- 6. KAYIT VE GÜVENLİK SİSTEMİ (F5 KORUMASI) ---
function markAsUnsaved() {
    isUnsaved = true;
    const status = document.getElementById('statusbar');
    if(status) status.innerHTML = `<span style="color: #ff4444;">● ${dict.unsaved_changes}</span>`;
}

// Kaydet Butonu
document.getElementById('btn-save').addEventListener('click', () => {
    const sceneData = scene.toJSON();
    localStorage.setItem('purple_studio_save', JSON.stringify(sceneData));
    isUnsaved = false;
    logToConsole("Proje Kaydedildi! (LocalStorage)", "success");
    document.getElementById('statusbar').innerText = "🟢 Proje Güvende | Sakarya Studio";
});

// Sayfa Kapatma/F5 Uyarısı
window.addEventListener('beforeunload', (e) => {
    if (isUnsaved) {
        e.preventDefault();
        e.returnValue = dict.unsaved_changes; // Tarayıcı standart kutusunu açar
    }
});

// --- 7. OBJE YÖNETİMİ (EKLE/SİL) ---
function updateExplorerUI() {
    const list = document.getElementById('scene-graph');
    list.innerHTML = "";
    scene.children.forEach(child => {
        if(child.name && child.type !== 'GridHelper') {
            const li = document.createElement('li');
            li.innerText = child.name;
            li.onclick = () => {
                transformControl.attach(child);
                logToConsole(`${child.name} seçildi.`);
            };
            list.appendChild(li);
        }
    });
}

function createObject(type) {
    let mesh;
    const mat = new THREE.MeshStandardMaterial({ color: 0xbc13fe, metalness: 0.6, roughness: 0.2 });
    
    if(type === 'box') mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), mat);
    if(type === 'sphere') mesh = new THREE.Mesh(new THREE.SphereGeometry(0.7,32,32), mat);
    
    if(mesh) {
        mesh.name = `${type.toUpperCase()}_${scene.children.length}`;
        mesh.position.set(Math.random()*4-2, 0.5, Math.random()*4-2);
        scene.add(mesh);
        interactableObjects.push(mesh);
        updateExplorerUI();
        markAsUnsaved();
        logToConsole(`${mesh.name} doğuruldu.`, "info");
    }
}

// UI Buton Bağlantıları
document.getElementById('confirm-add').onclick = () => {
    const type = document.getElementById('obj-type').value;
    createObject(type);
    document.getElementById('add-menu').style.display = 'none';
};

document.getElementById('btn-delete').onclick = () => {
    if(transformControl.object) {
        const obj = transformControl.object;
        logToConsole(`${obj.name} silindi.`, "error");
        scene.remove(obj);
        transformControl.detach();
        updateExplorerUI();
        markAsUnsaved();
    }
};

// --- 8. TRANSFORM MODLARI ---
document.getElementById('btn-translate').onclick = () => transformControl.setMode('translate');
document.getElementById('btn-rotate').onclick = () => transformControl.setMode('rotate');
document.getElementById('btn-scale').onclick = () => transformControl.setMode('scale');

// --- 9. RENDER DÖNGÜSÜ ---
function animate() {
    requestAnimationFrame(animate);
    orbit.update();
    renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

logToConsole("Purple Engine Başlatıldı. Keyifli tasarımlar Efe!", "success");
