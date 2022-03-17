import { Display } from './display';
import { makeEnemy } from './enemy';

class Save {
	get time(): number {
		return this.#time;
	}

	set time(value: number) {
		this.#time = value;
	}

	#time: number;

	constructor(date?: number) {
		this.#time = date ?? Date.now();
	}
}

export const dom = Display;
export const enemy = makeEnemy();

export const lastSave = new Save();