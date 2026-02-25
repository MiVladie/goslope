// terrain.ts
require('dotenv').config({ path: '.env' });

import fetch from 'node-fetch';
import { createCanvas, loadImage, Image } from 'canvas';
import { writeToFile } from './util/file';
import fs from 'fs';
import path from 'path';

const COURCHEVEL_COORDINATES = {
	minLat: 45.39,
	maxLat: 45.44,
	minLon: 6.6,
	maxLon: 6.67
};

const TERRAIN_CONFIG = {
	zoom: 12,
	resolution: 1028 // final square resolution (kept large; you can reduce to 512 for smaller JSON)
};

function latLonToTile(lat: number, lon: number, z: number) {
	const n = 2 ** z;
	const x = Math.floor(((lon + 180) / 360) * n);
	const latRad = (lat * Math.PI) / 180;
	const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
	return { x, y };
}

async function downloadTile(x: number, y: number, z: number) {
	const url = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to download tile ${x},${y} — ${res.status}`);
	const buffer = await res.buffer();
	return await loadImage(buffer);
}

async function downloadAllTiles(xMin: number, xMax: number, yMin: number, yMax: number, zoom: number) {
	const tiles: Image[][] = [];
	for (let y = yMin; y <= yMax; y++) {
		const row: Image[] = [];
		for (let x = xMin; x <= xMax; x++) {
			try {
				const img = await downloadTile(x, y, zoom);
				row.push(img);
				console.log(`Downloaded tile x=${x}, y=${y}`);
			} catch (err) {
				console.error(`Error downloading tile ${x},${y}:`, err);
				// push a blank tile so stitching keeps alignment
				const blank = createCanvas(256, 256);
				// @ts-ignore
				row.push(blank);
			}
		}
		tiles.push(row);
	}
	return tiles;
}

function stitchTiles(tiles: Image[][], tilePixelSize = 256, finalResolution = TERRAIN_CONFIG.resolution) {
	if (!tiles.length || !tiles[0].length) throw new Error('No tiles to stitch');
	const tilesHigh = tiles.length;
	const tilesWide = tiles[0].length;
	const stitchedWidth = tilesWide * tilePixelSize;
	const stitchedHeight = tilesHigh * tilePixelSize;

	const canvas = createCanvas(stitchedWidth, stitchedHeight);
	const ctx = canvas.getContext('2d');

	for (let row = 0; row < tilesHigh; row++) {
		for (let col = 0; col < tilesWide; col++) {
			ctx.drawImage(tiles[row][col], col * tilePixelSize, row * tilePixelSize, tilePixelSize, tilePixelSize);
		}
	}

	// Downscale to final resolution (square)
	const downCanvas = createCanvas(finalResolution, finalResolution);
	const downCtx = downCanvas.getContext('2d');
	downCtx.drawImage(canvas, 0, 0, finalResolution, finalResolution);
	return downCanvas;
}

function extractHeightMap(canvas: ReturnType<typeof createCanvas>) {
	const ctx = canvas.getContext('2d');
	const { width, height } = canvas;
	const imageData = ctx.getImageData(0, 0, width, height).data;

	const heights = new Float32Array(width * height);
	let minHeight = Infinity;
	let maxHeight = -Infinity;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4;
			const R = imageData[idx];
			const G = imageData[idx + 1];
			const B = imageData[idx + 2];
			// Mapbox terrain-rgb decode:
			const H = -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
			heights[y * width + x] = H;
			if (H < minHeight) minHeight = H;
			if (H > maxHeight) maxHeight = H;
		}
	}

	// Convert to plain array for JSON serialization
	const heightsArray: number[] = Array.from(heights);

	return {
		width,
		height,
		minHeight,
		maxHeight,
		heights: heightsArray
	};
}

async function init() {
	const topLeft = latLonToTile(COURCHEVEL_COORDINATES.maxLat, COURCHEVEL_COORDINATES.minLon, TERRAIN_CONFIG.zoom);
	const bottomRight = latLonToTile(COURCHEVEL_COORDINATES.minLat, COURCHEVEL_COORDINATES.maxLon, TERRAIN_CONFIG.zoom);

	// Make sure min <= max for x and y
	const xMin = Math.min(topLeft.x, bottomRight.x);
	const xMax = Math.max(topLeft.x, bottomRight.x);
	const yMin = Math.min(topLeft.y, bottomRight.y);
	const yMax = Math.max(topLeft.y, bottomRight.y);

	const tiles = await downloadAllTiles(xMin, xMax, yMin, yMax, TERRAIN_CONFIG.zoom);
	const stitchedCanvas = stitchTiles(tiles);
	console.log('Terrain canvas ready:', stitchedCanvas.width, 'x', stitchedCanvas.height);

	// Ensure directories exist
	fs.mkdirSync(path.resolve('./src/assets'), { recursive: true });
	fs.mkdirSync(path.resolve('./src/data'), { recursive: true });

	// Save PNG heightmap (for quick visual debug)
	const out = fs.createWriteStream('./src/assets/courchevel-heightmap.png');
	const stream = stitchedCanvas.createPNGStream();
	stream.pipe(out);
	await new Promise((res, rej) => {
		out.on('finish', res);
		out.on('error', rej);
	});

	// Extract and save JSON with min/max (heights as plain array)
	const heightMap = extractHeightMap(stitchedCanvas);
	await writeToFile('./src/data/heights.json', heightMap);

	console.log('Saved ./src/assets/courchevel-heightmap.png and ./src/data/heights.json');
}

// init()
