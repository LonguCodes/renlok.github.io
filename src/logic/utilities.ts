import { POKEDEX, PokedexEntry } from './data/db';

function RNG(chance) {
	const rnd = Math.random() * 100;
	return rnd < chance;
}

export function pokeByName(name): PokedexEntry {
	return POKEDEX.find((el) => el.pokemon[0].Pokemon === name);
}

export function cloneJsonObject(object) {
	return JSON.parse(JSON.stringify(object));
}

export function randomArrayElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

export function mergeArray<T>(arr1: T[], arr2: T[]) {
	if (arr1.length === 0 && arr2.length > 0) {
		return arr2;
	}
	if (arr2.length === 0 && arr1.length > 0) {
		return arr1;
	}
	if (arr1.length > 0 && arr2.length > 0) {
		return arr1.concat(arr2);
	}
	return [];
}

export function isEmpty(obj) {
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function camalCaseToString(text) {
	const result = text.replace(/([A-Z])/g, ' $1');
	return result.charAt(0).toUpperCase() + result.slice(1);
}

export function flash(element) {
	let op = 1; // initial opacity
	let fadeOut = true;
	const timer = setInterval(() => {
		if (op <= 0.1) {
			fadeOut = false;
		}
		if (op >= 1 && !fadeOut) {
			clearInterval(timer);
		}
		element.style.opacity = op;
		element.style.filter = `alpha(opacity=${op * 100})`;
		if (fadeOut) {
			op -= op * 0.1;
		} else {
			op += op * 0.1;
		}
	}, 10);
}

export const $ = (cssQuery) => document.querySelector(cssQuery);
export const pokeById = (id) => POKEDEX[id - 1];
