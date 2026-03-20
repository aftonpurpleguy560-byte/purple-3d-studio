/* Purple-3D-Studio Core Engine - V1.5
    Author: Purpleguy © 2026 - tablet power
    Features: Color Palette, Emissive Control, Load System, Raycasting
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

// Post-Processing (Bloom) Importları
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// --- 1. DEĞİŞKENLER VE KONSOL ---
let isUnsaved = false;
let interactableObjects = [];
let selectedObject = null; // Şu an seçili olan obje
const consoleOutput = document.getElementById('console-output');

function logToConsole(msg, type = "info") {
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? '#ff4444' : type === 'success' ? '#bc13fe' : '#00ff41';
    if(consoleOutput) {
        consoleOutput.innerHTML += `<div class="log-entry" style="color: ${color}">[${time}] > ${msg}</div>`;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
}

// --- 2. SAHNE VE RENDERER ---
const container = document.getElementById('viewport-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x010101);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(8, 6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// --- 3. BLOOM (PARLAMA) EFEKTİ KURULUMU ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2; // Hangi parlaklıktan sonra parlayacak
bloomPass.strength = 1.0;  // Parlama gücü
bloomPass.radius = 0.5;    // Yayılma yarıçapı

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// --- 4. IŞIKLANDIRMA VE YARDIMCILAR ---
const gridHelper = new THREE.GridHelper(100, 100, 0x1a1a1a, 0x0a0a0a);
scene.add(gridHelper);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// --- 5. KONTROLLER VE SEÇME SİSTEMİ (RAYCASTER) ---
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true; // Daha yumuşak hareket

const transformControl = new TransformControls(camera, renderer.domElement);
transformControl.setSpace('local'); // Objeye göre hareket etsin
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
        selectObject(intersects[0].object);
    } else if (event.target.tagName === 'CANVAS') {
        deselectObject();
    }
});

function selectObject(obj) {
    selectedObject = obj;
    transformControl.attach(obj);
    updateInspector(obj);
    updateExplorerHighlight();
    logToConsole(`${obj.name} seçildi.`, "success");
}

function deselectObject() {
    selectedObject = null;
    transformControl.detach();
    updateExplorerHighlight();
}

// Transform Değişince Kaydetme ve Inspector Güncelleme
transformControl.addEventListener('dragging-changed', (e) => {
    orbit.enabled = !e.value;
    if(!e.value && transformControl.object) {
        markAsUnsaved();
        updateInspector(transformControl.object);
    }
});

// --- 6. INSPECTOR GÜNCELLEME VE ETKİLEŞİM ---
function updateInspector(obj) {
    // Transform Değerleri
    document.getElementById('pos-x').value = obj.position.x.toFixed(2);
    document.getElementById('pos-y').value = obj.position.y.toFixed(2);
    document.getElementById('pos-z').value = obj.position.z.toFixed(2);
    
    // Materyal Değerleri (Renk ve Parlama)
    if (obj.material && obj.material.color) {
        const hex = "#" + obj.material.color.getHexString();
        document.getElementById('obj-color').value = hex;
        
        if (obj.material.emissiveIntensity !== undefined) {
            document.getElementById('obj-emissive').value = obj.material.emissiveIntensity;
        }
    } else if (obj.isPointLight) {
        // Neon Işık ise kendi rengini al
        const hex = "#" + obj.color.getHexString();
        document.getElementById('obj-color').value = hex;
    }
}

// Inspector Input Etkileşimleri
['pos-x', 'pos-y', 'pos-z'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        if (!selectedObject) return;
        const val = parseFloat(e.target.value);
        if (id === 'pos-x') selectedObject.position.x = val;
        if (id === 'pos-y') selectedObject.position.y = val;
        if (id === 'pos-z') selectedObject.position.z = val;
        markAsUnsaved();
    });
});

// RENK DEĞİŞTİRME ÖZELLİĞİ
document.getElementById('obj-color').addEventListener('input', (e) => {
    if (!selectedObject) return;
    const newColor = e.target.value;
    
    if (selectedObject.material) {
        selectedObject.material.color.set(newColor);
        if (selectedObject.material.emissive) selectedObject.material.emissive.set(newColor);
    }
    if (selectedObject.isPointLight) {
        selectedObject.color.set(newColor);
        if(selectedObject.userData.helper) selectedObject.userData.helper.update();
    }
    markAsUnsaved();
});

// PARLAMA (EMISSIVE) AYARI
document.getElementById('obj-emissive').addEventListener('input', (e) => {
    if (!selectedObject || !selectedObject.material || selectedObject.material.emissiveIntensity === undefined) return;
    selectedObject.material.emissiveIntensity = parseFloat(e.target.value);
    markAsUnsaved();
});

// --- 7. KAYIT VE YÜKLEME SİSTEMİ ---
function markAsUnsaved() {
    isUnsaved = true;
    const status = document.getElementById('statusbar');
    if(status) status.innerHTML = `<span style="color: #ff4444;">● Kaydedilmemiş Değişiklikler</span>`;
}

// Çıkış Uyarısı (F5 Koruması)
window.addEventListener('beforeunload', (e) => {
    if (isUnsaved) {
        e.preventDefault();
        e.returnValue = 'Yaptığınız değişiklikler kaydedilmedi, çıkmak istiyor musunuz?';
    }
});

// KAYDET Butonu
document.getElementById('btn-save').addEventListener('click', () => {
    const saveData = interactableObjects.map(obj => ({
        name: obj.name,
        type: obj.geometry ? obj.geometry.type : (obj.isPointLight ? 'PointLight' : 'Sprite'),
        position: obj.position.toArray(),
        rotation: obj.rotation.toArray(),
        scale: obj.scale.toArray(),
        color: obj.material ? "#" + obj.material.color.getHexString() : (obj.isPointLight ? "#" + obj.color.getHexString() : "#bc13fe"),
        emissiveIntensity: obj.material ? obj.material.emissiveIntensity : 0.6
    }));

    localStorage.setItem('PurpleEngine_Save_v1', JSON.stringify(saveData));
    isUnsaved = false;
    logToConsole("Proje tarayıcıya kazındı!", "success");
    document.getElementById('statusbar').innerText = "🟢 Proje Güvende | LocalStorage";
});

// YÜKLE Butonu
document.getElementById('btn-load').addEventListener('click', () => {
    const rawData = localStorage.getItem('PurpleEngine_Save_v1');
    if (!rawData) {
        logToConsole("Kayıtlı proje bulunamadı.", "error");
        return;
    }

    // Sahneyi temizle
    deselectObject();
    interactableObjects.forEach(obj => {
        if(obj.userData.helper) scene.remove(obj.userData.helper);
        scene.remove(obj);
    });
    interactableObjects = [];

    const savedData = JSON.parse(rawData);
    savedData.forEach(data => {
        let typeKey = 'box';
        if(data.type.includes('Sphere')) typeKey = 'sphere';
        if(data.type.includes('Torus')) typeKey = 'torus';
        if(data.type === 'PointLight') typeKey = 'neon';
        // Sprite desteği şimdilik placeholder

        createObject(typeKey);
        const newObj = interactableObjects[interactableObjects.length - 1];
        newObj.name = data.name;
        newObj.position.fromArray(data.position);
        newObj.rotation.fromArray(data.rotation);
        newObj.scale.fromArray(data.scale);
        
        if(newObj.material) {
            newObj.material.color.set(data.color);
            if(newObj.material.emissive) newObj.material.emissive.set(data.color);
            newObj.material.emissiveIntensity = data.emissiveIntensity;
        }
        if(newObj.isPointLight) {
            newObj.color.set(data.color);
            if(newObj.userData.helper) newObj.userData.helper.update();
        }
    });

    updateExplorerUI();
    isUnsaved = false;
    logToConsole("Proje LocalStorage'dan yüklendi!", "success");
});

// --- 8. OBJE YÖNETİMİ ---
function updateExplorerUI() {
    const list = document.getElementById('scene-graph');
    if(!list) return;
    list.innerHTML = "";
    interactableObjects.forEach(obj => {
        const li = document.createElement('li');
        li.innerText = obj.name;
        li.dataset.objId = obj.uuid; // Eşleşme için
        li.onclick = () => selectObject(obj);
        list.appendChild(li);
    });
    updateExplorerHighlight();
}

function updateExplorerHighlight() {
    const items = document.querySelectorAll('#scene-graph li');
    items.forEach(li => {
        if (selectedObject && li.dataset.objId === selectedObject.uuid) {
            li.classList.add('selected');
        } else {
            li.classList.remove('selected');
        }
    });
}

function createObject(type) {
    let mesh;
    // Standart Neon Materyal
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
    
    // Neon Işık (PointLight)
    if(type === 'neon') {
        const light = new THREE.PointLight(0xbc13fe, 3, 10);
        light.name = `LIGHT_${interactableObjects.length + 1}`;
        light.position.set(Math.random()*2, 2, Math.random()*2);
        
        // Işık yardımcısı
        const helper = new THREE.PointLightHelper(light, 0.3, 0xbc13fe);
        scene.add(helper);
        light.userData.helper = helper; // Yardımcıyı ışığa bağla
        mesh = light; // Işığı ana obje gibi davranmaya zorla (seçim için)
    }

    if(mesh) {
        if(!mesh.name) mesh.name = `${type.toUpperCase()}_${interactableObjects.length + 1}`;
        if(type !== 'neon') mesh.position.set(Math.random()*4-2, 0.5, Math.random()*4-2);
        scene.add(mesh);
        interactableObjects.push(mesh);
        updateExplorerUI();
        markAsUnsaved();
        if(type !== 'neon') logToConsole(`${mesh.name} oluşturuldu.`, "info");
    }
}

document.getElementById('confirm-add').onclick = () => {
    createObject(document.getElementById('obj-type').value);
    document.getElementById('add-menu').style.display = 'none';
};

document.getElementById('btn-delete').onclick = () => {
    if(!selectedObject) return;
    if(selectedObject.userData.helper) scene.remove(selectedObject.userData.helper); // Işık yardımcısını sil
    scene.remove(selectedObject);
    interactableObjects = interactableObjects.filter(o => o !== selectedObject);
    deselectObject();
    updateExplorerUI();
    markAsUnsaved();
    logToConsole(`${selectedObject ? selectedObject.name : 'Obje'} silindi.`, "error");
};

// --- 9. ARAÇLAR (TRANSFORM MODLARI) ---
const tools = { 'btn-translate': 'translate', 'btn-rotate': 'rotate', 'btn-scale': 'scale' };
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

logToConsole("Purple Engine Canlandı. Keyifli tasarımlar Efe!", "success");
