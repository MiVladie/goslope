import { Color, Lift, RawEdge, Slope } from '../interfaces/data';

interface MapSlopesOptions {
	removeUnknown?: boolean;
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

	if (options?.removeUnknown) {
		slopes = slopes.filter((s) => !!s.tags.name);
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
