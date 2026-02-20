interface Coordinates {
	lat: number;
	lon: number;
}

type LiftType = 'chair_lift' | 'gondola' | 'drag_lift' | 't-bar' | 'cable_car';

export interface RawEdge {
	id: number;
	type: 'node' | 'way' | 'relation';
	bounds: {
		minlat: number;
		minlon: number;
		maxlat: number;
		maxlon: number;
	};
	nodes: number[];
	geometry: Coordinates[];
	tags: {
		// General
		name?: string;

		// Piste-related tags
		'piste:difficulty'?: 'novice' | 'easy' | 'intermediate' | 'advanced' | 'expert';
		'piste:type'?: string;

		// Lift-related tags
		aerialway?: LiftType;
		'aerialway:bubble'?: string;
		'aerialway:capacity'?: string;
		'aerialway:heating'?: string;
		'aerialway:length'?: string;
		'aerialway:occupancy'?: string;
		'seasonal:summer'?: string;
		'seasonal:winter'?: string;
	};
}

export interface Edge {
	id: number;
	name: string;
	from: number;
	to: number;
	geometry: Coordinates[];
}

export enum Color {
	GREEN,
	BLUE,
	RED,
	BLACK
}

export interface Slope extends Edge {
	color: Color;
}

export interface Lift extends Edge {
	type: LiftType | 'unknown';
}
