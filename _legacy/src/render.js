import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js?module';

// Scene & Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(200, 200, 200);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(100, 200, 100);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// Load PNG heightmap
const loader = new THREE.TextureLoader();
loader.load('/src/assets/courchevel.png', (texture) => {
	// loader.load('/src/assets/courchevel-heightmap.png', (texture) => {
	const img = texture.image;

	const downsample = 4; // reduce geometry to ~360x360
	const width = img.width;
	const height = img.height;
	const segX = Math.floor(width / downsample);
	const segY = Math.floor(height / downsample);

	// Draw image to canvas
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	// Create geometry
	const geometry = new THREE.PlaneGeometry(200, 200, segX - 1, segY - 1);
	const vertices = geometry.attributes.position.array;

	// Function to get average grayscale in a block
	function getAverageHeight(x0, y0, blockSize) {
		let sum = 0;
		let count = 0;
		for (let y = 0; y < blockSize; y++) {
			for (let x = 0; x < blockSize; x++) {
				const px = Math.min(x0 + x, width - 1);
				const py = Math.min(y0 + y, height - 1);
				const idx = (py * width + px) * 4;
				const r = data[idx];
				const g = data[idx + 1];
				const b = data[idx + 2];
				const gray = (r + g + b) / 3;
				sum += gray;
				count++;
			}
		}
		return sum / count / 255; // normalize 0-1
	}

	// Assign heights to vertices
	for (let y = 0; y < segY; y++) {
		for (let x = 0; x < segX; x++) {
			const imgX = x * downsample;
			const imgY = y * downsample;
			const heightValue = getAverageHeight(imgX, imgY, downsample);
			const vertexIndex = (y * segX + x) * 3;
			vertices[vertexIndex + 2] = heightValue * 15; // adjust vertical scale
		}
	}

	geometry.computeVertexNormals();
	const material = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, flatShading: true });
	const terrain = new THREE.Mesh(geometry, material);
	terrain.rotation.x = -Math.PI / 2;
	scene.add(terrain);
});

// Resize handler
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();
