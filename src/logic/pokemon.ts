import { cloneJsonObject, pokeByName, randomArrayElement } from './utilities';
import { EXP_TABLE, POKEDEX, PokedexEntry } from './data/db';
import { EVOLUTIONS } from './data/evolutions';
import { PokedexFlags } from './enums';
import { Player } from './player';
import { v4 } from 'uuid';

export class Pokemon {
	private readonly _id: string;
	private _hp: number;
	private readonly _caughtAt: number;
	private _archetype: PokedexEntry;
	private readonly _expTable: number[];
	private _exp: number;
	private readonly _isShiny: boolean;

	constructor(
		pokeModel: PokedexEntry,
		initialLevel: number,
		initialExp: number = 0,
		isShiny = false,
		caughtAt?: number
	) {
		this._id = v4();
		this._archetype = cloneJsonObject(pokeModel);
		this._expTable = EXP_TABLE[this.archetype.stats[0]['growth rate']];
		this._exp =
			(initialLevel && this.expTable[initialLevel - 1]) || initialExp;
		this._caughtAt = caughtAt || Date.now();
		this._hp = this.setHpValue(this.archetype.stats[0].hp) * 3;
		this._isShiny = isShiny;
	}

	get id() {
		return this._id;
	}

	get archetype() {
		return this._archetype;
	}
	set archetype(value) {
		this._archetype = value;
	}
	set exp(value) {
		this._exp = value;
	}

	get hp() {
		return this._hp;
	}
	set hp(value) {
		this._hp = value;
	}

	get expTable() {
		return this._expTable;
	}

	get exp() {
		return this._exp;
	}

	setHpValue(rawHp) {
		return Math.floor((rawHp * this.currentLevel) / 40);
	}

	get currentLevel() {
		return this.expTable.filter(
			(xp_requirement) => xp_requirement <= this.exp
		).length;
	}

	statValue(raw: string) {
		const numeric = parseFloat(raw);
		return Math.floor(((numeric + 50) * this.currentLevel) / 150);
	}

	tryEvolve(shiny) {
		const pokemonHasEvolution =
			EVOLUTIONS[this.archetype.pokemon[0].Pokemon] !== undefined;
		if (pokemonHasEvolution) {
			const oldPokemon = this.archetype.pokemon[0].Pokemon;
			const evolution = EVOLUTIONS[this.archetype.pokemon[0].Pokemon].to;
			const levelToEvolve = Number(
				EVOLUTIONS[this.archetype.pokemon[0].Pokemon].level
			);
			if (this.currentLevel >= levelToEvolve) {
				this.archetype = cloneJsonObject(pokeByName(evolution));
				Player.addPokedex(
					evolution,
					shiny ? PokedexFlags.OWN_SHINY : PokedexFlags.OWN_NORMAL
				);
				if (!Player.hasPokemon(oldPokemon, shiny)) {
					Player.addPokedex(
						oldPokemon,
						shiny
							? PokedexFlags.OWNED_SHINY
							: PokedexFlags.OWNED_NORMAL
					);
				}
			}
		}
	}

	canEvolve() {
		if (EVOLUTIONS[this.archetype.pokemon[0].Pokemon] !== undefined) {
			const levelToEvolve = Number(
				EVOLUTIONS[this.archetype.pokemon[0].Pokemon].level
			);
			if (this.currentLevel >= levelToEvolve) {
				return true;
			}
		}
		return false;
	}

	get maxHp() {
		return this.setHpValue(this.archetype.stats[0].hp) * 3;
	}

	get attack() {
		return this.statValue(this.archetype.stats[0].attack);
	}

	get defense() {
		return this.statValue(this.archetype.stats[0].defense);
	}

	get spAttack() {
		return this.statValue(this.archetype.stats[0]['sp atk']);
	}

	get spDefense() {
		return this.statValue(this.archetype.stats[0]['sp def']);
	}

	get speed() {
		return this.statValue(this.archetype.stats[0].speed);
	}

	get avgDefense() {
		return (this.defense + this.spDefense) / 2;
	}

	get name() {
		return this.archetype.pokemon[0].Pokemon;
	}

	get image() {
		const imageType = this.isShiny ? 'shiny' : 'normal';
		return {
			front: this.archetype.images[imageType].front,
			back: this.archetype.images[imageType].back
		};
	}

	get isShiny() {
		return this._isShiny;
	}

	get types() {
		return this.archetype.stats[0].types;
	}

	get catchRate() {
		return Number(this.archetype.stats[0]['catch rate']);
	}

	get lifeAsText() {
		return '' + (this.hp < 0 ? 0 : this.hp) + ' / ' + this.maxHp;
	}

	get alive() {
		return this.hp > 0;
	}

	giveExp(amount: number) {
		this.exp += amount;
	}

	get currentExp() {
		return this.exp;
	}

	get nextLevelExp() {
		return this.expTable[this.currentLevel];
	}

	get thisLevelExp() {
		return this.expTable[this.currentLevel - 1] || 10;
	}

	get attackSpeed() {
		return Math.max(300, Math.floor((1000 / (500 + this.speed)) * 800));
	}

	get avgAttack() {
		return (this.attack + this.spAttack) / 2;
	}

	takeDamage(enemyAttack: number) {
		const damageToTake =
			(enemyAttack - this.avgDefense / 10 > 0 &&
				Math.ceil(
					((enemyAttack - this.avgDefense / 10) *
						((Math.random() + 0.1) * 2)) /
						100
				)) ||
			0;
		this.hp -= damageToTake;
		return damageToTake;
	}

	get baseExp() {
		return Number(this.archetype.exp[0]['base exp']);
	}

	heal() {
		this.hp = this.maxHp;
		return this;
	}

	get save() {
		return [
			this.archetype.pokemon[0].Pokemon,
			this.exp,
			this.isShiny,
			this._caughtAt
		];
	}
}

export namespace Pokemon {
	export class Factory {
		public static random(level: number) {
			return new Pokemon(randomArrayElement(POKEDEX), level);
		}

		public static fromName(
			name: string,
			initialLevel: number,
			initialExp: number = 0,
			isShiny = false,
			caughtAt?: number
		) {
			return new Pokemon(
				pokeByName(name),
				initialLevel,
				initialExp,
				isShiny,
				caughtAt
			);
		}
	}
}
