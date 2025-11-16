import * as THREE from 'three';

// Multiplayer-Status
const multiplayer = {
    isHost: false,
    isConnected: false,
    peer: null,
    connection: null,
    lobbyId: null,
    otherPlayer: null
};

// Spielzustand
const gameState = {
    score: 0,
    health: 100,
    ammo: 30,
    maxAmmo: 30,
    reserveAmmo: 90,
    gameStarted: false,
    gameOver: false,
    enemies: [],
    isMultiplayer: false
};

// Szene, Kamera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('gameContainer').appendChild(renderer.domElement);

// Beleuchtung
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

// First-Person-Kamera Position
camera.position.set(0, 1.6, 0);

// Maus-Look
let pitch = 0;
let yaw = 0;
const mouseSensitivity = 0.002;
let isPointerLocked = false;

renderer.domElement.addEventListener('click', () => {
    if (!gameState.gameStarted) return;
    renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;
});

document.addEventListener('mousemove', (e) => {
    if (!isPointerLocked || !gameState.gameStarted) return;
    
    yaw -= e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Bewegung
const direction = new THREE.Vector3();
const moveSpeed = 0.1;
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Boden
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x90EE90,
    roughness: 0.8
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Wände (Arena)
const wallHeight = 5;
const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    roughness: 0.7
});

const walls = [];
const wallPositions = [
    { pos: [0, wallHeight/2, -50], rot: [0, 0, 0], size: [200, wallHeight, 1] },
    { pos: [0, wallHeight/2, 50], rot: [0, 0, 0], size: [200, wallHeight, 1] },
    { pos: [-50, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [200, wallHeight, 1] },
    { pos: [50, wallHeight/2, 0], rot: [0, Math.PI/2, 0], size: [200, wallHeight, 1] }
];

wallPositions.forEach(wall => {
    const wallGeometry = new THREE.BoxGeometry(...wall.size);
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.position.set(...wall.pos);
    wallMesh.rotation.set(...wall.rot);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);
    walls.push(wallMesh);
});

// Anderer Spieler (Multiplayer)
function createOtherPlayer() {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 1.6, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x4444ff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0.8, 0);
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
}

// Feinde
class Enemy {
    constructor(x, z, id = null) {
        this.id = id || Math.random().toString(36).substr(2, 9);
        this.geometry = new THREE.BoxGeometry(1, 2, 1);
        this.material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, 1, z);
        this.mesh.castShadow = true;
        this.health = 100;
        this.speed = 0.02;
        this.alive = true;
        
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        this.leftEye.position.set(-0.2, 0.3, 0.5);
        this.rightEye.position.set(0.2, 0.3, 0.5);
        this.mesh.add(this.leftEye);
        this.mesh.add(this.rightEye);
        
        scene.add(this.mesh);
    }
    
    update() {
        if (!this.alive) return;
        
        const playerPos = camera.position;
        const enemyPos = this.mesh.position;
        
        const dx = playerPos.x - enemyPos.x;
        const dz = playerPos.z - enemyPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance > 0.5) {
            this.mesh.position.x += (dx / distance) * this.speed;
            this.mesh.position.z += (dz / distance) * this.speed;
            this.mesh.lookAt(playerPos.x, enemyPos.y, playerPos.z);
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }
    
    die() {
        this.alive = false;
        scene.remove(this.mesh);
    }
}

function spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 15 + Math.random() * 10;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    return new Enemy(x, z);
}

// Initiale Feinde
for (let i = 0; i < 5; i++) {
    gameState.enemies.push(spawnEnemy());
}

// Raycasting für Schüsse
const raycaster = new THREE.Raycaster();

// Schieß-Mechanik
let canShoot = true;
const shootCooldown = 100;

function shoot() {
    if (!canShoot || gameState.ammo <= 0) return;
    
    canShoot = false;
    gameState.ammo--;
    updateUI();
    
    setTimeout(() => {
        canShoot = true;
    }, shootCooldown);
    
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    createMuzzleFlash();
    
    if (intersects.length > 0) {
        const hit = intersects[0];
        
        for (let i = 0; i < gameState.enemies.length; i++) {
            const enemy = gameState.enemies[i];
            if (enemy.alive && (hit.object === enemy.mesh || hit.object.parent === enemy.mesh)) {
                if (enemy.takeDamage(50)) {
                    gameState.score++;
                    updateUI();
                    
                    // Synchronisiere Kill mit anderem Spieler
                    if (multiplayer.isConnected && multiplayer.connection) {
                        multiplayer.connection.send({
                            type: 'enemyKilled',
                            enemyId: enemy.id
                        });
                    }
                    
                    gameState.enemies[i] = spawnEnemy();
                }
                break;
            }
        }
        
        createImpactEffect(hit.point);
    }
    
    // Sende Schuss an anderen Spieler
    if (multiplayer.isConnected && multiplayer.connection) {
        multiplayer.connection.send({
            type: 'shoot',
            position: camera.position.toArray(),
            rotation: [pitch, yaw]
        });
    }
}

function createMuzzleFlash() {
    const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    
    const flashPos = new THREE.Vector3(0, -0.2, -0.5);
    flashPos.applyQuaternion(camera.quaternion);
    flash.position.copy(camera.position).add(flashPos);
    
    scene.add(flash);
    
    let opacity = 1;
    const fade = () => {
        opacity -= 0.1;
        flashMaterial.opacity = opacity;
        if (opacity > 0) {
            requestAnimationFrame(fade);
        } else {
            scene.remove(flash);
        }
    };
    fade();
}

function createImpactEffect(position) {
    const particleCount = 10;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        const geometry = new THREE.SphereGeometry(0.05, 4, 4);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffaa00,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        particle.userData.velocity = velocity;
        
        scene.add(particle);
        particles.push({ mesh: particle, material, velocity });
    }
    
    let frame = 0;
    const animateParticles = () => {
        frame++;
        particles.forEach(({ mesh, material, velocity }) => {
            mesh.position.add(velocity);
            velocity.multiplyScalar(0.95);
            material.opacity -= 0.05;
            
            if (material.opacity <= 0) {
                scene.remove(mesh);
            }
        });
        
        if (frame < 20) {
            requestAnimationFrame(animateParticles);
        } else {
            particles.forEach(({ mesh }) => scene.remove(mesh));
        }
    };
    animateParticles();
}

function reload() {
    if (gameState.reserveAmmo === 0 || gameState.ammo === gameState.maxAmmo) return;
    
    const needed = gameState.maxAmmo - gameState.ammo;
    const reloadAmount = Math.min(needed, gameState.reserveAmmo);
    
    gameState.ammo += reloadAmount;
    gameState.reserveAmmo -= reloadAmount;
    updateUI();
}

renderer.domElement.addEventListener('click', () => {
    if (gameState.gameStarted && isPointerLocked) {
        shoot();
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && gameState.gameStarted) {
        reload();
    }
});

// Multiplayer-Funktionen
function generateLobbyId() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

function hostLobby() {
    multiplayer.isHost = true;
    multiplayer.lobbyId = generateLobbyId();
    
    document.getElementById('multiplayerOptions').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'block';
    document.getElementById('lobbyTitle').textContent = 'Lobby erstellt';
    document.getElementById('lobbyId').textContent = multiplayer.lobbyId;
    document.getElementById('lobbyIdDisplay').style.display = 'block';
    document.getElementById('joinLobbyScreen').style.display = 'none';
    document.getElementById('connectionStatus').textContent = 'Warte auf Spieler...';
    
    // Peer erstellen
    multiplayer.peer = new Peer(multiplayer.lobbyId, {
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true
    });
    
    multiplayer.peer.on('open', (id) => {
        console.log('Lobby geöffnet:', id);
        document.getElementById('connectionStatus').textContent = 'Lobby bereit! Warte auf Verbindung...';
    });
    
    multiplayer.peer.on('connection', (conn) => {
        console.log('Spieler verbunden!');
        multiplayer.connection = conn;
        multiplayer.isConnected = true;
        
        document.getElementById('connectionStatus').textContent = '🟢 Spieler verbunden!';
        document.getElementById('startGameBtn').style.display = 'block';
        document.getElementById('multiplayerStatus').style.display = 'block';
        
        setupConnection(conn);
    });
    
    multiplayer.peer.on('error', (err) => {
        console.error('Peer Fehler:', err);
        document.getElementById('connectionStatus').textContent = 'Fehler: ' + err.message;
    });
}

function joinLobby() {
    document.getElementById('multiplayerOptions').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'block';
    document.getElementById('lobbyTitle').textContent = 'Lobby beitreten';
    document.getElementById('lobbyIdDisplay').style.display = 'none';
    document.getElementById('joinLobbyScreen').style.display = 'block';
    document.getElementById('connectionStatus').textContent = 'Lobby-ID eingeben';
}

function connectToLobby() {
    const lobbyId = document.getElementById('lobbyIdInput').value.trim().toUpperCase();
    if (!lobbyId) {
        alert('Bitte eine Lobby-ID eingeben!');
        return;
    }
    
    multiplayer.lobbyId = lobbyId;
    document.getElementById('connectionStatus').textContent = 'Verbinde...';
    
    // Peer erstellen
    multiplayer.peer = new Peer(undefined, {
        host: '0.peerjs.com',
        port: 443,
        path: '/',
        secure: true
    });
    
    multiplayer.peer.on('open', (id) => {
        console.log('Verbinde mit Lobby:', lobbyId);
        const conn = multiplayer.peer.connect(lobbyId);
        
        conn.on('open', () => {
            console.log('Verbunden!');
            multiplayer.connection = conn;
            multiplayer.isConnected = true;
            
            document.getElementById('connectionStatus').textContent = '🟢 Verbunden!';
            document.getElementById('joinLobbyScreen').style.display = 'none';
            document.getElementById('multiplayerStatus').style.display = 'block';
            
            setupConnection(conn);
        });
        
        conn.on('error', (err) => {
            console.error('Verbindungsfehler:', err);
            document.getElementById('connectionStatus').textContent = 'Fehler beim Verbinden';
        });
    });
    
    multiplayer.peer.on('error', (err) => {
        console.error('Peer Fehler:', err);
        document.getElementById('connectionStatus').textContent = 'Fehler: ' + err.message;
    });
}

function setupConnection(conn) {
    conn.on('data', (data) => {
        handleNetworkMessage(data);
    });
    
    conn.on('close', () => {
        console.log('Verbindung geschlossen');
        multiplayer.isConnected = false;
        document.getElementById('connectionStatus').textContent = '🔴 Verbindung getrennt';
        document.getElementById('multiplayerStatus').style.display = 'none';
    });
    
    // Anderen Spieler erstellen
    if (!multiplayer.otherPlayer) {
        multiplayer.otherPlayer = createOtherPlayer();
    }
}

function handleNetworkMessage(data) {
    switch (data.type) {
        case 'playerUpdate':
            if (multiplayer.otherPlayer) {
                multiplayer.otherPlayer.position.set(...data.position);
                multiplayer.otherPlayer.rotation.set(...data.rotation);
            }
            break;
        case 'shoot':
            // Schuss-Effekt vom anderen Spieler
            createMuzzleFlash();
            break;
        case 'enemyKilled':
            // Feind wurde vom anderen Spieler getötet
            const enemy = gameState.enemies.find(e => e.id === data.enemyId);
            if (enemy && enemy.alive) {
                enemy.die();
                const index = gameState.enemies.indexOf(enemy);
                gameState.enemies[index] = spawnEnemy();
            }
            break;
        case 'gameStart':
            if (!multiplayer.isHost) {
                startGame();
            }
            break;
    }
}

// Sende Spieler-Updates
let lastUpdateTime = 0;
const updateInterval = 50; // 20 FPS für Netzwerk

function sendPlayerUpdate() {
    if (multiplayer.isConnected && multiplayer.connection) {
        const now = Date.now();
        if (now - lastUpdateTime > updateInterval) {
            multiplayer.connection.send({
                type: 'playerUpdate',
                position: camera.position.toArray(),
                rotation: [pitch, yaw]
            });
            lastUpdateTime = now;
        }
    }
}

function updateUI() {
    document.getElementById('score').textContent = `Kills: ${gameState.score}`;
    document.getElementById('health').textContent = `❤️ ${gameState.health}`;
    document.getElementById('hud').textContent = `Health: ${gameState.health}`;
    document.getElementById('ammo').textContent = `Munition: ${gameState.ammo}/${gameState.reserveAmmo}`;
}

function endGame() {
    gameState.gameOver = true;
    gameState.gameStarted = false;
    document.exitPointerLock();
    document.body.classList.remove('game-active');
    document.getElementById('finalKills').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
}

function resetGame() {
    gameState.score = 0;
    gameState.health = 100;
    gameState.ammo = 30;
    gameState.reserveAmmo = 90;
    gameState.gameOver = false;
    gameState.gameStarted = false;
    
    camera.position.set(0, 1.6, 0);
    pitch = 0;
    yaw = 0;
    
    document.body.classList.remove('game-active');
    
    gameState.enemies.forEach(enemy => {
        if (enemy.alive) {
            scene.remove(enemy.mesh);
        }
    });
    gameState.enemies = [];
    
    for (let i = 0; i < 5; i++) {
        gameState.enemies.push(spawnEnemy());
    }
    
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    updateUI();
}

function startGame() {
    gameState.gameStarted = true;
    gameState.isMultiplayer = multiplayer.isConnected;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('lobbyScreen').style.display = 'none';
    document.body.classList.add('game-active');
    
    // Sende Start-Signal an anderen Spieler
    if (multiplayer.isHost && multiplayer.isConnected && multiplayer.connection) {
        multiplayer.connection.send({ type: 'gameStart' });
    }
    
    renderer.domElement.requestPointerLock();
}

// Event Listener
document.getElementById('hostBtn').addEventListener('click', hostLobby);
document.getElementById('joinBtn').addEventListener('click', joinLobby);
document.getElementById('soloBtn').addEventListener('click', () => {
    gameState.isMultiplayer = false;
    startGame();
});
document.getElementById('connectBtn').addEventListener('click', connectToLobby);
document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('lobbyScreen').style.display = 'none';
    document.getElementById('multiplayerOptions').style.display = 'block';
    if (multiplayer.peer) {
        multiplayer.peer.destroy();
        multiplayer.peer = null;
        multiplayer.connection = null;
        multiplayer.isConnected = false;
    }
});
document.getElementById('restartBtn').addEventListener('click', resetGame);

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    if (!gameState.gameStarted || gameState.gameOver) {
        renderer.render(scene, camera);
        return;
    }
    
    // Kamera-Rotation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    
    // Bewegung
    direction.set(0, 0, 0);
    
    if (keys['w']) direction.z -= 1;
    if (keys['s']) direction.z += 1;
    if (keys['a']) direction.x -= 1;
    if (keys['d']) direction.x += 1;
    
    direction.normalize();
    direction.multiplyScalar(moveSpeed);
    
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
    
    const moveVector = new THREE.Vector3();
    moveVector.addScaledVector(cameraDirection, -direction.z);
    moveVector.addScaledVector(right, direction.x);
    
    camera.position.add(moveVector);
    
    // Netzwerk-Updates senden
    sendPlayerUpdate();
    
    // Feinde aktualisieren
    gameState.enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.update();
            
            const distance = camera.position.distanceTo(enemy.mesh.position);
            if (distance < 1.5) {
                gameState.health -= 0.5;
                updateUI();
                
                if (gameState.health <= 0) {
                    gameState.health = 0;
                    endGame();
                }
            }
        }
    });
    
    // Waffe animieren
    const weapon = document.getElementById('weapon');
    if (weapon) {
        const time = Date.now() * 0.001;
        weapon.style.transform = `translateX(-50%) translateY(${Math.sin(time * 10) * 2}px)`;
    }
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

updateUI();
animate();
