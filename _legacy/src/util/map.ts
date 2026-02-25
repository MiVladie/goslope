// @ts-ignore
import overpass from '@derhuerst/query-overpass';

import { Coordinates } from '../interfaces/data';

const timeout = 20000;

export async function getSlopes(area: string) {
	try {
		const slopes = await overpass(`
            [out:json][timeout:${timeout}];
                area["name"="${area}"]->.searchArea;
                (
                    way["piste:type"="downhill"](area.searchArea);
                );
                out geom;
            `);

		return slopes;
	} catch (error: any) {
		throw error;
	}
}

export async function getLifts(area: string) {
	try {
		const lifts = await overpass(`
        [out:json][timeout:${timeout}];
            area["name"="${area}"]->.searchArea;
            (
                way["aerialway"](area.searchArea);
            );
            out geom;
        `);

		return lifts;
	} catch (error: any) {
		throw error;
	}
}

export function convertCoordinatesToDistance(coordinateOne: Coordinates, coordinateTwo: Coordinates) {
	function toRad(degree: any) {
		return (degree * Math.PI) / 180;
	}

	const lat1 = toRad(coordinateOne.lat);
	const lon1 = toRad(coordinateOne.lon);
	const lat2 = toRad(coordinateTwo.lat);
	const lon2 = toRad(coordinateTwo.lon);

	const { sin, cos, sqrt, atan2 } = Math;

	const R = 6371; // earth radius in km
	const dLat = lat2 - lat1;
	const dLon = lon2 - lon1;
	const a = sin(dLat / 2) * sin(dLat / 2) + cos(lat1) * cos(lat2) * sin(dLon / 2) * sin(dLon / 2);
	const c = 2 * atan2(sqrt(a), sqrt(1 - a));
	const d = R * c;
	return d * 1000; // distance in m
}
