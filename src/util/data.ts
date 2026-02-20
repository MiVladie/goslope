import { Color, Edge, Lift, Node, RawEdge, Slope, Coordinates } from '../interfaces/data';

interface MapSlopesOptions {
	removeLoops?: boolean;
}

export function mapSlopeColor(difficulty: RawEdge['tags']['piste:difficulty']): Color {
	switch (difficulty) {
		case 'novice':
			return Color.GREEN;

		case 'easy':
			return Color.BLUE;

		case 'intermediate':
			return Color.RED;

		case 'advanced':
			return Color.BLACK;

		default:
			return Color.BLACK;
	}
}

export function mapSlopes(rawSlopes: RawEdge[], options?: MapSlopesOptions): Slope[] {
	let slopes = rawSlopes;

	if (options?.removeLoops) {
		slopes = slopes.filter((s) => s.nodes[0] !== s.nodes[s.nodes.length - 1]);
	}

	return slopes.map((e) => ({
		id: e.id,
		name: e.tags.name || 'Unknown',
		from: e.nodes[0],
		to: e.nodes[e.nodes.length - 1],
		geometry: e.geometry,
		color: mapSlopeColor(e.tags['piste:difficulty'])
	}));
}

export function mapLifts(rawLifts: RawEdge[]): Lift[] {
	return rawLifts.map((e) => ({
		id: e.id,
		name: e.tags.name || 'Unknown',
		from: e.nodes[0],
		to: e.nodes[e.nodes.length - 1],
		geometry: e.geometry,
		type: e.tags.aerialway || 'unknown'
	}));
}

export function extractNodes(edges: Edge[]): Node[] {
	const nodesMap = new Map<number, Node>();
	const coordMap = new Map<string, number>();

	edges.forEach((edge) => {
		edge.geometry.forEach(({ lat, lon }) => {
			const key = `${lat.toFixed(7)},${lon.toFixed(7)}`;

			coordMap.set(key, (coordMap.get(key) || 0) + 1);
		});

		const fromNode: Node = {
			id: edge.from,
			name: edge.name,
			coordinates: edge.geometry[0]
		};

		const toNode: Node = {
			id: edge.to,
			name: edge.name,
			coordinates: edge.geometry[edge.geometry.length - 1]
		};

		if (!nodesMap.has(fromNode.id)) {
			nodesMap.set(fromNode.id, fromNode);
		}

		if (!nodesMap.has(toNode.id)) {
			nodesMap.set(toNode.id, toNode);
		}
	});

	const existingSet = new Set(
		Array.from(nodesMap.values()).map((n) => `${n.coordinates.lat.toFixed(7)},${n.coordinates.lon.toFixed(7)}`)
	);

	let nextId = 1_000_000_000;

	for (const [key, count] of coordMap.entries()) {
		if (count >= 2 && !existingSet.has(key)) {
			const [lat, lon] = key.split(',').map(Number);

			nodesMap.set(nextId, {
				id: nextId++,
				name: 'Unknown',
				coordinates: { lat, lon }
			});
		}
	}

	return Array.from(nodesMap.values());
}

export function splitSlopesAtJunctions(slopes: Slope[], junctions: Node[]): Slope[] {
	const newSlopes: Slope[] = [];
	let nextSlopeId = Math.max(...slopes.map((e) => e.id)) + 1;

	for (const slope of slopes) {
		// Start with the full geometry
		let currentStartNodeId = slope.from;
		let currentGeometry: Coordinates[] = [slope.geometry[0]];

		// Go through all points in geometry (skip first, it’s already in currentGeometry)
		for (let i = 1; i < slope.geometry.length; i++) {
			const point = slope.geometry[i];
			const junction = junctions.find(
				(j) => Math.abs(j.coordinates.lat - point.lat) < 1e-7 && Math.abs(j.coordinates.lon - point.lon) < 1e-7
			);

			if (junction) {
				// Found a junction → finish current edge
				currentGeometry.push(point);

				newSlopes.push({
					id: nextSlopeId++,
					name: slope.name,
					from: currentStartNodeId,
					to: junction.id,
					geometry: [...currentGeometry],
					color: slope.color
				});

				// Start a new edge from this junction
				currentStartNodeId = junction.id;
				currentGeometry = [point]; // start new geometry
			} else {
				currentGeometry.push(point);
			}
		}

		// Add the final segment to the original edge’s 'to' node
		if (currentGeometry.length > 1) {
			newSlopes.push({
				id: nextSlopeId++,
				name: slope.name,
				from: currentStartNodeId,
				to: slope.to,
				geometry: currentGeometry,
				color: slope.color
			});
		}
	}

	return newSlopes;
}
