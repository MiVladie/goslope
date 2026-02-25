import fs from 'fs/promises';
import path from 'path';

export async function writeToFile(location: string, content: any) {
	try {
		const dir = path.dirname(location);

		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(location, JSON.stringify(content, null, 2));
	} catch (error: any) {
		throw error;
	}
}

export async function readFromFile(location: string) {
	try {
		const jsonData = await fs.readFile(location, 'utf-8');
		const data = JSON.parse(jsonData);

		return data;
	} catch (error) {
		throw error;
	}
}
