import { AdjacencyList, Lift, Node, RawEdge, Slope } from './interfaces/data';
import {
	buildAdjacencyList,
	extractNodes,
	mapLifts,
	mapSlopes,
	splitSlopesAtJunctions,
	findRoute,
	pathToEdges
} from './util/data';
import { readFromFile, writeToFile } from './util/file';
import { getSlopes, getLifts } from './util/map';

async function init() {
	// getRawEdges();
	// await mapEdges();
	// await getNodes();
	// await splitSlopes();

	// await getAdjacencyList();
	await getRoute();
}

async function getRawEdges() {
	const area = 'Courchevel';

	try {
		const rawSlopes = await getSlopes(area);
		const rawLifts = await getLifts(area);

		await writeToFile('./src/data/raw_slopes.json', rawSlopes);
		await writeToFile('./src/data/raw_lifts.json', rawLifts);

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

		await writeToFile('./src/data/slopes.json', slopes);
		await writeToFile('./src/data/lifts.json', lifts);

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

		await writeToFile('./src/data/nodes.json', nodes);

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

		await writeToFile('./src/data/slopes.json', edges);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

async function getAdjacencyList() {
	try {
		const nodes: Node[] = await readFromFile('./src/data/nodes.json');

		const slopes: Slope[] = await readFromFile('./src/data/slopes.json');
		const lifts: Lift[] = await readFromFile('./src/data/lifts.json');

		const adjacencyList = buildAdjacencyList(nodes, [...lifts, ...slopes]);

		await writeToFile('./src/data/adjacency_list.json', adjacencyList);

		console.log('Adjacency List created.');
	} catch (error) {
		console.error(error);
	}
}

async function getRoute() {
	const start = 324040137;
	const end = 262903324;

	try {
		const adjacencyList: AdjacencyList = await readFromFile('./src/data/adjacency_list.json');

		const route = await findRoute(adjacencyList, start, end);

		await writeToFile('./src/data/route.json', route);

		const slopes: Slope[] = await readFromFile('./src/data/slopes.json');
		const lifts: Lift[] = await readFromFile('./src/data/lifts.json');

		const edges = pathToEdges(route.path, [...slopes, ...lifts]);

		await writeToFile('./src/data/route.json', { edges, ...route });

		console.log('Route calculated.');
	} catch (error) {
		console.error(error);
	}
}

init();
