/* Purple-3D-Studio Professional Core - V1.5
    Author: Purpleguy © 2026 - tablet power
    Features: Splash Screen Logic, Daily Notifications, Bloom, Save/Load
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// --- 1. GLOBAL DEĞİŞKENLER ---
let isUnsaved = false;
let interactableObjects = [];
let selectedObject = null;
const consoleOutput = document.getElementById('console-output');

function logToConsole(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? '#ff4444' : type === 'success' ? '#bc13fe' : '#00ff41';
    if(consoleOutput) {
        consoleOutput.innerHTML += `<div class="log-entry" style="color: ${color}">[${time}] > ${msg}</div>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

// --- 2. BAŞLANGIÇ MENÜSÜ & BİLDİRİM SİSTEMİ ---
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('btn-start');

// 5 Günlük Menü Kontrolü
const lastSeen = localStorage.getItem('PurpleEngine_LastSeen');
const now = Date.now();
const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;

if (lastSeen && (now - lastSeen < fiveDaysInMs)) {
    startMenu.style.display = 'none';
}

startBtn.onclick = () => {
    startMenu.style.display = 'none';
    localStorage.setItem('PurpleEngine_LastSeen', Date.now());
    logToConsole("Purple 3D Studio'ya hoş geldin, Efe!", "success");
};

// Günlük 3 Bildirim Mantığı
function checkDailyNotifications() {
    const lastNotifDate = localStorage.getItem('PurpleEngine_NotifDate');
    const today = new Date().toDateString();

    if (lastNotifDate !== today) {
        const messages = [
            "📢 Bug bildirmek için: aftonpurpleguy560@gmail.com",
            "💡 İpucu: Objeleri seçip Inspector'dan parlatabilirsin.",
            "🚀 Bugün yeni bir dünya inşa etmeye ne dersin?"
        ];
        messages.forEach((msg, i) => {
            setTimeout(() => logToConsole(msg, "info"), (i + 1) * 2500);
        });
        localStorage.setItem('PurpleEngine_NotifDate', today);
    }
}
setTimeout(checkDailyNotifications, 3000);

// --- 3. ÜÇ BOYUTLU SAHNE KURULUMU ---
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010101);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(8, 6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// --- 4. POST-PROCESSING (BLOOM) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.0, 0.4, 0.85);
bloomPass.threshold = 0.25;
bloomPass.strength = 1.2;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// --- 5. KONTROLLER VE YARDIMCILAR ---
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;

const transformControl = new TransformControls(camera, renderer.domElement);
scene.add(transformControl);

const grid = new THREE.GridHelper(50, 50, 0x222222, 0x111111);
scene.add(grid);

const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

// --- 6. ETKİLEŞİM VE SEÇİM ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

container.addEventListener('pointerdown', (e) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactableObjects);

    if (intersects.length > 0) {
        selectObject(intersects[0].object);
    } else if (e.target.tagName === 'CANVAS') {
        deselectObject();
    }
});

function selectObject(obj) {
    selectedObject = obj;
    transformControl.attach(obj);
    updateInspector(obj);
    updateExplorerHighlight();
}

function deselectObject() {
    selectedObject = null;
    transformControl.detach();
    updateExplorerHighlight();
}

transformControl.addEventListener('dragging-changed', (e) => {
    orbit.enabled = !e.value;
    if(!e.value) { markAsUnsaved(); updateInspector(selectedObject); }
});

// --- 7. INSPECTOR VE MATERYAL YÖNETİMİ ---
function updateInspector(obj) {
    if(!obj) return;
    document.getElementById('pos-x').value = obj.position.x.toFixed(2);
    document.getElementById('pos-y').value = obj.position.y.toFixed(2);
    document.getElementById('pos-z').value = obj.position.z.toFixed(2);
    
    if (obj.material && obj.material.color) {
        document.getElementById('obj-color').value = "#" + obj.material.color.getHexString();
        document.getElementById('obj-emissive').value = obj.material.emissiveIntensity || 0;
    }
}

document.getElementById('obj-color').addEventListener('input', (e) => {
    if (!selectedObject || !selectedObject.material) return;
    selectedObject.material.color.set(e.target.value);
    if(selectedObject.material.emissive) selectedObject.material.emissive.set(e.target.value);
    markAsUnsaved();
});

document.getElementById('obj-emissive').addEventListener('input', (e) => {
    if (!selectedObject || !selectedObject.material) return;
    selectedObject.material.emissiveIntensity = parseFloat(e.target.value);
    markAsUnsaved();
});

// --- 8. KAYIT SİSTEMİ VE F5 KORUMASI ---
function markAsUnsaved() {
    isUnsaved = true;
    document.getElementById('statusbar').innerHTML = `<span style="color:#ff4444">● Kaydedilmemiş Değişiklikler</span>`;
}

window.onbeforeunload = (e) => {
    if (isUnsaved) return "Kayıt edilmemiş verileriniz var. Ayrılmak istiyor musunuz?";
};

document.getElementById('btn-save').onclick = () => {
    const data = interactableObjects.map(obj => ({
        name: obj.name,
        type: obj.geometry.type,
        pos: obj.position.toArray(),
        rot: obj.rotation.toArray(),
        color: "#" + obj.material.color.getHexString(),
        emi: obj.material.emissiveIntensity
    }));
    localStorage.setItem('PurpleEngine_Project', JSON.stringify(data));
    isUnsaved = false;
    document.getElementById('statusbar').innerText = "🟢 Proje Kaydedildi";
    logToConsole("Proje başarıyla kaydedildi.", "success");
};

document.getElementById('btn-load').onclick = () => {
    const raw = localStorage.getItem('PurpleEngine_Project');
    if(!raw) return logToConsole("Kayıt bulunamadı!", "error");
    
    // Temizlik
    interactableObjects.forEach(o => scene.remove(o));
    interactableObjects = [];
    
    JSON.parse(raw).forEach(d => {
        createObject('box', false); // Basitçe box oluşturup veriyi basıyoruz
        const o = interactableObjects[interactableObjects.length - 1];
        o.name = d.name;
        o.position.fromArray(d.pos);
        o.rotation.fromArray(d.rot);
        o.material.color.set(d.color);
        o.material.emissive.set(d.color);
        o.material.emissiveIntensity = d.emi;
    });
    updateExplorerUI();
    logToConsole("Proje yüklendi.", "success");
};

// --- 9. OBJE OLUŞTURMA ---
function createObject(type) {
    let geo;
    if(type === 'box') geo = new THREE.BoxGeometry(1,1,1);
    else if(type === 'sphere') geo = new THREE.SphereGeometry(0.7, 32, 32);
    else geo = new THREE.TorusGeometry(0.5, 0.2, 16, 100);

    const mat = new THREE.MeshStandardMaterial({ 
        color: 0xbc13fe, emissive: 0xbc13fe, emissiveIntensity: 0.6 
    });
    
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = type.toUpperCase() + "_" + (interactableObjects.length + 1);
    mesh.position.set(Math.random()*4-2, 0.5, Math.random()*4-2);
    
    scene.add(mesh);
    interactableObjects.push(mesh);
    updateExplorerUI();
    markAsUnsaved();
}

function updateExplorerUI() {
    const list = document.getElementById('scene-graph');
    list.innerHTML = "";
    interactableObjects.forEach(obj => {
        const li = document.createElement('li');
        li.innerText = obj.name;
        if(selectedObject === obj) li.classList.add('selected');
        li.onclick = () => selectObject(obj);
        list.appendChild(li);
    });
}

function updateExplorerHighlight() {
    updateExplorerUI();
}

document.getElementById('confirm-add').onclick = () => {
    createObject(document.getElementById('obj-type').value);
};

document.getElementById('btn-delete').onclick = () => {
    if(!selectedObject) return;
    scene.remove(selectedObject);
    interactableObjects = interactableObjects.filter(o => o !== selectedObject);
    deselectObject();
    updateExplorerUI();
    markAsUnsaved();
};

// --- 10. DÖNGÜ VE ARAÇLAR ---
const tools = { 'btn-translate': 'translate', 'btn-rotate': 'rotate', 'btn-scale': 'scale' };
Object.keys(tools).forEach(id => {
    document.getElementById(id).onclick = () => {
        Object.keys(tools).forEach(b => document.getElementById(b).classList.remove('active'));
        document.getElementById(id).classList.add('active');
        transformControl.setMode(tools[id]);
    };
});

function animate() {
    requestAnimationFrame(animate);
    orbit.update();
    composer.render();
}
animate();

window.onresize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    composer.setSize(container.clientWidth, container.clientHeight);
};

logToConsole("Motor hazır. Purpleguy © 2026", "success");
