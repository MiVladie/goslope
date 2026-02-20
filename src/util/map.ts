// @ts-ignore
import overpass from '@derhuerst/query-overpass';

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
