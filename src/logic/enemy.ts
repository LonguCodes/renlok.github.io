import { mergeArray, pokeByName, randomArrayElement } from './utilities';
import { Pokemon } from './pokemon';
import { PokeModel, ROUTES } from './routes';
import { Player } from './player';
import { PokedexEntry } from './data/db';

export abstract class Enemy {
	abstract get pokemons(): Pokemon[];
	abstract get currentPokemon(): Pokemon;
}

/**
 * An abstraction of a Pokemon trainer
 */
export class Trainer extends Enemy {
	private readonly _pokemons: Pokemon[];
	private _currentPokemonIndex: number;

	public get pokemons(): Pokemon[] {
		return this._pokemons;
	}

	get currentPokemon(): Pokemon {
		return this._pokemons[this._currentPokemonIndex];
	}

	constructor(private readonly name: string, pokemonModels) {
		super();
		this._pokemons = pokemonModels.map(([name, level]: PokeModel) => {
			return Pokemon.Factory.fromName(name, level);
		});
	}
}

export class WildPokemon extends Enemy {
	get pokemons(): Pokemon[] {
		return [this.pokemon];
	}

	get currentPokemon(): Pokemon {
		return this.pokemon;
	}

	constructor(private readonly pokemon: Pokemon) {
		super();
	}
}

export const makeEnemy = (starter = null) => {
	let active = starter;

	const trainerPoke = (pokemonList) => {
		const selected = Math.round(Math.random() * (pokemonList.length - 1));
		Combat.trainerCurrentID = selected;
		/**
		 * Archetype of the pokemon based on its pokedex entry.
		 * @see PokedexEntry
		 * @see POKEDEX
		 */
		const archetype: PokedexEntry = pokeByName(pokemonList[selected][0]);
		return new Pokemon(archetype, pokemonList[selected][1]);
	};

	const generateNew = (regionId, routeId) => {
		const regionData = ROUTES[regionId];
		const routeData = regionData[routeId];
		let pokemonList = [];

		if (routeData.fishing) {
			for (let i = Player.unlocked.fishing; i > 0; i--) {
				if (routeData.pokes[i]) {
					pokemonList = mergeArray(pokemonList, routeData.pokes[i]);
				}
			}
		} else {
			pokemonList = routeData.pokes;
		}
		if (regionData._global) {
			if (regionData._global.pokes && Math.random() < 1 / (1 << 8)) {
				pokemonList = mergeArray(pokemonList, regionData._global.pokes);
			}
			if (regionData._global.rarePokes && Math.random() < 1 / (1 << 14)) {
				pokemonList = mergeArray(
					pokemonList,
					regionData._global.rarePokes
				);
			}
			if (regionData._global.superRare && Math.random() < 1 / (1 << 16)) {
				pokemonList = mergeArray(
					pokemonList,
					regionData._global.superRare
				);
			}
		}
		const poke = pokeByName(randomArrayElement(pokemonList));
		const level =
			routeData.minLevel +
			Math.round(
				Math.random() * (routeData.maxLevel - routeData.minLevel)
			);
		return new Pokemon(poke, level);
	};

	return {
		activePoke: () => active,
		clear: () => (active = null),
		trainerPoke: (pokemonList) => (active = trainerPoke(pokemonList)),
		generateNew: (regionId, routeId) =>
			(active = generateNew(regionId, routeId))
	};
};
