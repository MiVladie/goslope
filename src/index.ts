import { RawEdge } from './interfaces/data';
import { mapLifts, mapSlopes } from './util/data';
import { readFromFile, writeToFile } from './util/file';
import { getSlopes, getLifts } from './util/map';

async function init() {
	mapEdges();
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

		const slopes = mapSlopes(rawSlopes, { removeUnknown: true });
		const lifts = mapLifts(rawLifts);

		writeToFile('./src/data/slopes.json', slopes);
		writeToFile('./src/data/lifts.json', lifts);

		console.log('written to files.');
	} catch (error) {
		console.error(error);
	}
}

init();
