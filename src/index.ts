import { Lift, Node, RawEdge, Slope } from './interfaces/data';
import { extractNodes, mapLifts, mapSlopes, splitSlopesAtJunctions } from './util/data';
import { readFromFile, writeToFile } from './util/file';
import { getSlopes, getLifts } from './util/map';

async function init() {
	// mapEdges();
	// getRawEdges();

	// getNodes();
	splitSlopes();
}

async function getRawEdges() {
	const area = 'Courchevel';

	try {
		const rawSlopes = await getSlopes(area);
		const rawLifts = await getLifts(area);

		writeToFile('./src/data/raw_slopes.json', rawSlopes);
		writeToFile('./src/data/raw_lifts.json', rawLifts);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

async function mapEdges() {
	try {
		const rawSlopes: RawEdge[] = await readFromFile('./src/data/raw_slopes.json');
		const rawLifts: RawEdge[] = await readFromFile('./src/data/raw_lifts.json');

		const slopes = mapSlopes(rawSlopes, { removeLoops: true });
		const lifts = mapLifts(rawLifts);

		writeToFile('./src/data/slopes.json', slopes);
		writeToFile('./src/data/lifts.json', lifts);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

async function getNodes() {
	try {
		const slopes: Slope[] = await readFromFile('./src/data/slopes.json');
		const lifts: Lift[] = await readFromFile('./src/data/lifts.json');

		const nodes = extractNodes([...slopes, ...lifts]);
		// const edges = splitEdgesAtJunctions(slopes, nodes);

		writeToFile('./src/data/nodes.json', nodes);
		// writeToFile('./src/data/slopes.json', edges);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

async function splitSlopes() {
	try {
		const nodes: Node[] = await readFromFile('./src/data/nodes.json');

		const slopes: Slope[] = await readFromFile('./src/data/slopes.json');
		const edges = splitSlopesAtJunctions(slopes, nodes);

		writeToFile('./src/data/slopes.json', edges);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

init();
