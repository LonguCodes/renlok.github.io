import { POKEDEX } from './data/db';
import { BallCatchRate, PokedexFlags } from './enums';
import { mergeArray, pokeByName } from './utilities';
import { lastSave } from './config';
import { Pokemon } from './pokemon';
import { ROUTES } from './routes';

/**
 * For initialLevel property of a Pokemon's constructor
 * there was a `false` used here.
 * This replaced all of its instances.
 * @see Pokemon
 */
const FALSE_LEVEL = 0;

export const Player = {
	pokemons: [] as Pokemon[],
	storage: [],
	pokedexData: [],
	pokedexHighestID: 0,
	activePokeID: 0,
	lastHeal: Date.now(),
	selectedBall: 'pokeball',
	ballsAmount: {
		pokeball: 20,
		greatball: 0,
		ultraball: 0,
	},
	unlocked: {
		shinyDex: 0,
		completeDex: 0,
		razzBerry: 0,
		fishing: 0,
	},
	currency: 0,
	settings: {
		currentRegionId: 'Kanto',
		currentRouteId: 'route',
		listView: 'roster',
		autoSort: true,
		dexView: 'all',
		dexVersion: 194, // check if users dex is out of date
		spriteChoice: 'back',
		catching: false,
	},
	skills: {
		breeding: 0,
		throwing: 0,
		training: 0,
	},
	statistics: {
		seen: 0,
		caught: 0,
		released: 0,
		sold: 0,
		beaten: 0,
		shinySeen: 0,
		shinyCaught: 0,
		shinyReleased: 0,
		shinyBeaten: 0,
		totalDamage: 0,
		totalThrows: 0,
		successfulThrows: 0,
		pokeballThrows: 0,
		pokeballSuccessfulThrows: 0,
		greatballThrows: 0,
		greatballSuccessfulThrows: 0,
		ultraballThrows: 0,
		ultraballSuccessfulThrows: 0,
		totalCurrency: 0,
		totalExp: 0,
	},
	badges: {},
	purgeData: false,
	canHeal() {
		if (Date.now() - this.lastHeal > 30000) {
			return true;
		}
		return Date.now() - this.lastHeal;
	},
	checksum(s) {
		let chk = 0x12345678;
		const len = s.length;
		for (let i = 0; i < len; i++) {
			chk += s.charCodeAt(i) * (i + 1);
		}
		return (chk & 0xffffffff).toString(16);
	},
	addPoke(pokemon: Pokemon) {
		if (this.pokemons.length < 6) {
			this.pokemons.push(pokemon);
		} else {
			this.storage.push(pokemon);
		}
		return this;
	},
	findDexIndex: (p) =>
		POKEDEX.findIndex((x) => x.pokemon[0].Pokemon == p.name),
	addPokedex(pokeName, flag) {
		// helper to search dex array for a string
		function findFlag(obj) {
			return this == obj.name;
		}

		const dexEntry = this.pokedexData.find(findFlag, pokeName);
		let reloadDex = false;
		if (typeof dexEntry === 'object') {
			if (
				dexEntry.flag < flag ||
				// own can be released
				(dexEntry.flag == PokedexFlags.OWN_SHINY &&
					flag == PokedexFlags.RELEASED_SHINY) ||
				(dexEntry.flag == PokedexFlags.OWN_NORMAL &&
					flag == PokedexFlags.RELEASED_NORMAL) ||
				// own can become (previously) owned
				(dexEntry.flag == PokedexFlags.OWN_SHINY &&
					flag == PokedexFlags.OWNED_SHINY) ||
				(dexEntry.flag == PokedexFlags.OWNED_NORMAL &&
					flag == PokedexFlags.OWNED_NORMAL)
			) {
				if (
					this.pokedexData[this.pokedexData.indexOf(dexEntry)]
						.flag !== flag
				) {
					reloadDex = true;
					this.pokedexData[this.pokedexData.indexOf(dexEntry)].flag =
						flag;
				}
			}
		} else {
			reloadDex = true;
			this.pokedexData.push({ name: pokeName, flag });
		}
		if (Player.settings.listView == 'pokeDex' && reloadDex) {
			// is it a new highest entry?
			const dexID = this.findDexIndex(dexEntry);
			if (this.pokedexHighestID < dexID) {
				this.pokedexHighestID = dexID;
			}
			// fixme
			dom.renderPokeDex();
		}
	},
	hasDexEntry(pokeName, flag, exact = false) {
		function findFlag(obj) {
			return this == obj.name;
		}

		const dexEntry = this.pokedexData.find(findFlag, pokeName);
		if (typeof dexEntry !== 'undefined') {
			if (
				(exact && dexEntry.flag == flag) ||
				(!exact && dexEntry.flag >= flag)
			) {
				return true;
			}
		}
		return false;
	},
	getHighestPokeDex() {
		const dex = (lhs, rhs) =>
			this.findDexIndex(rhs) - this.findDexIndex(lhs);
		this.pokedexHighestID = Player.getPokedexData().sort(dex)[0];
		return this.pokedexHighestID;
	},
	countPokedex(flag, exactMatch = false) {
		let counter = 0;
		let i;
		let pData;
		for (i in this.pokedexData) {
			pData = this.pokedexData[i];
			if (exactMatch && flag == pData.flag) {
				counter++;
			} else if (!exactMatch && flag <= pData.flag) {
				counter++;
			}
		}
		return counter;
	},
	setActive(index) {
		this.activePokeID = index;
	},
	alivePokeIndexes() {
		const alive = this.getPokemon().filter((poke, index) => {
			if (poke.alive()) {
				return true;
			}
		});
		return alive;
	},
	activePoke() {
		return this.pokemons[this.activePokeID];
	},
	getPokemon() {
		return this.pokemons;
	},
	getPokedexData() {
		return this.pokedexData;
	},
	reorderPokes(newList, list = 'roster') {
		if (list === 'roster') {
			this.pokemons = newList;
		} else {
			this.storage = newList;
		}
	},
	cmpFunctions: {
		lvl: (lhs, rhs) => lhs.level() - rhs.level(),
		dex: (lhs, rhs) => {
			const index = (p) =>
				POKEDEX.findIndex((x) => x.pokemon[0].Pokemon == p.pokeName());
			return index(lhs) - index(rhs);
		},
		vlv: (lhs, rhs) =>
			lhs.level() - rhs.level() || lhs.avgAttack() - rhs.avgAttack(),
		time: (lhs, rhs) => lhs.caughtAt - rhs.caughtAt,
	},
	inverseCmp(cmpFunc) {
		return (lhs, rhs) => -cmpFunc(lhs, rhs);
	},
	// fixme
	sortPokemon() {
		const dirSelect = document.getElementById('pokeSortDirSelect');
		const direction = dirSelect.options[dirSelect.selectedIndex].value;
		const orderSelect = document.getElementById('pokeSortOrderSelect');
		const sortOrder = orderSelect.options[orderSelect.selectedIndex].value;
		let cmpFunc = this.cmpFunctions[sortOrder];
		if (direction === 'desc') {
			cmpFunc = this.inverseCmp(cmpFunc);
		}
		Player.reorderPokes(Player.storage.sort(cmpFunc), 'storage');
	},
	healAllPokemons() {
		if (this.canHeal() === true) {
			this.pokemons.forEach((poke) => poke.heal());
			this.lastHeal = Date.now();
			return 'healed';
		}
		return this.canHeal();
	},
	hasPokemon(pokemonName, shiny) {
		const allPokes = mergeArray(this.pokemons, this.storage);
		return (
			typeof allPokes.find(
				function(obj: Pokemon) {
					return this[0] == obj.name && this[1] == obj.isShiny;
				},
				[pokemonName, shiny],
			) !== 'undefined'
		);
	},
	deletePoke(index, from = 'roster') {
		if (from == 'roster') {
			if (index !== this.activePokeID) {
				this.pokemons.splice(index, 1);
				if (index < this.activePokeID) {
					this.activePokeID -= 1;
				}
			}
		} else {
			this.storage.splice(index, 1);
		}
	},
	ballRNG(ballName) {
		return BallCatchRate[ballName];
	},
	changeSelectedBall(newBall) {
		this.selectedBall = newBall;
	},
	consumeBall(ballName) {
		if (this.ballsAmount[ballName] > 0) {
			this.ballsAmount[ballName] -= 1;
			return true;
		}
		return false;
	},
	bestAvailableBall() {
		const ballsFromBestToWorst = ['ultraball', 'greatball', 'pokeball'];
		for (let i = 0; i < ballsFromBestToWorst.length; i++) {
			if (this.ballsAmount[ballsFromBestToWorst[i]] > 0) {
				return ballsFromBestToWorst[i];
			}
		}
	},
	addBalls(ballName, amount) {
		this.ballsAmount[ballName] += amount;
	},
	addCurrency(amount) {
		this.currency += amount;
		this.statistics.totalCurrency += amount;
		// fixme
		dom.renderCurrency();
	},
	meetsCriteria(criteriaObj) {
		for (const group in criteriaObj) {
			if (typeof criteriaObj[group] === 'object') {
				for (const criteria in criteriaObj[group]) {
					// if pokedex criteria
					if (group == 'dex') {
						if (
							criteria == 'caughtCount' &&
							this.countPokedex(PokedexFlags.RELEASED_NORMAL) <
							criteriaObj[group][criteria]
						) {
							return false;
						}
					} else if (typeof Player[group][criteria] === 'undefined') {
						return false;
					} else if (
						typeof criteriaObj[group][criteria] === 'boolean' &&
						Player[group][criteria] < criteriaObj[group][criteria]
					) {
						return false;
					} else if (
						Player[group][criteria] < criteriaObj[group][criteria]
					) {
						return false;
					}
				}
			} else if (Player[group] < criteriaObj[group]) {
				return false;
			}
		}
		return true;
	},
	regionUnlocked(region) {
		const unlockData = ROUTES[region]._unlock;
		if (unlockData) {
			return this.meetsCriteria(unlockData);
		}
		return true;
	},
	routeUnlocked(region, route) {
		const routeData = ROUTES[region][route];
		if (routeData.fishing && Player.unlocked.fishing < routeData.fishing) {
			return false;
		}
		if (routeData._unlock) {
			return this.meetsCriteria(routeData._unlock);
		}
		return true;
	},
	// Load and Save functions
	savePokes(force = false) {
		// Don't save more then every 60 seconds
		if (force || lastSave.time + 1000 * 60 < Date.now()) {
			lastSave.time = Date.now();
			localStorage.setItem('totalPokes', this.pokemons.length);
			this.pokemons.forEach((poke, index) => {
				localStorage.setItem(
					`poke${index}`,
					JSON.stringify(poke.save()),
				);
			});
			localStorage.setItem('totalStorage', this.storage.length);
			this.storage.forEach((poke, index) => {
				localStorage.setItem(
					`storage${index}`,
					JSON.stringify(poke.save()),
				);
			});
			localStorage.setItem(
				'ballsAmount',
				JSON.stringify(this.ballsAmount),
			);
			localStorage.setItem(
				'pokedexData',
				JSON.stringify(this.pokedexData),
			);
			localStorage.setItem('statistics', JSON.stringify(this.statistics));
			localStorage.setItem('settings', JSON.stringify(this.settings));
			localStorage.setItem('badges', JSON.stringify(this.badges));
			localStorage.setItem('unlocked', JSON.stringify(this.unlocked));
			localStorage.setItem('currency', JSON.stringify(this.currency));
		}
	},
	saveToString() {
		const saveData = JSON.stringify({
			pokes: this.pokemons.map((poke) => poke.save()),
			storage: this.storage.map((poke) => poke.save()),
			pokedexData: this.pokedexData,
			statistics: this.statistics,
			settings: this.settings,
			ballsAmount: this.ballsAmount,
			ballsAmmount: this.ballsAmount, // preserve backwards compatibility
			badges: this.badges,
			unlocked: this.unlocked,
			currency: this.currency,
		});
		return btoa(`${this.checksum(saveData)}|${saveData}`);
	},
	loadPokes() {
		// reset pokemon array
		this.pokemons = [];
		let pokeCount = 0;
		// reset storage array
		this.storage = [];
		Array(Number(localStorage.getItem('totalPokes')))
			.fill(0)
			.forEach((el, index) => {
				const loadedPoke = JSON.parse(
					localStorage.getItem(`poke${index}`),
				);
				if (loadedPoke) {
					const pokeName = loadedPoke[0];
					const exp = loadedPoke[1];
					const shiny = loadedPoke[2] === true;
					const caughtAt = loadedPoke[3];
					if (pokeCount < 6) {
						this.pokemons.push(
							new Pokemon(
								pokeByName(pokeName),
								FALSE_LEVEL,
								Number(exp),
								shiny,
								caughtAt,
							),
						);
					} else {
						this.storage.push(
							new Pokemon(
								pokeByName(pokeName),
								FALSE_LEVEL,
								Number(exp),
								shiny,
								caughtAt,
							),
						);
					}
					pokeCount++;
				}
			});
		Array(Number(localStorage.getItem('totalStorage')))
			.fill(0)
			.forEach((el, index) => {
				const loadedPoke = JSON.parse(
					localStorage.getItem(`storage${index}`),
				);
				if (loadedPoke) {
					const pokeName = loadedPoke[0];
					const exp = loadedPoke[1];
					const shiny = loadedPoke[2] === true;
					const caughtAt = loadedPoke[3];
					this.storage.push(
						new Pokemon(
							pokeByName(pokeName),
							0,
							Number(exp),
							shiny,
							caughtAt,
						),
					);
				}
			});
		if (JSON.parse(localStorage.getItem('ballsAmount'))) {
			this.ballsAmount = JSON.parse(localStorage.getItem('ballsAmount'));
		}
		if (JSON.parse(localStorage.getItem('pokedexData'))) {
			this.pokedexData = JSON.parse(localStorage.getItem('pokedexData'));
		} else {
			this.pokedexData = [];
		}
		if (JSON.parse(localStorage.getItem('statistics'))) {
			const loadedStats = JSON.parse(localStorage.getItem('statistics'));
			this.statistics = { ...this.statistics, ...loadedStats };
		}
		if (JSON.parse(localStorage.getItem('settings'))) {
			this.settings = JSON.parse(localStorage.getItem('settings'));
		}
		if (JSON.parse(localStorage.getItem('badges'))) {
			this.badges = JSON.parse(localStorage.getItem('badges'));
		}
		if (JSON.parse(localStorage.getItem('unlocked'))) {
			const loadedUnlocked = JSON.parse(localStorage.getItem('unlocked'));
			this.unlocked = { ...this.unlocked, ...loadedUnlocked };
		}
		if (JSON.parse(localStorage.getItem('currency'))) {
			this.currency = JSON.parse(localStorage.getItem('currency'));
		}
	},
	loadFromString(saveData) {
		saveData = atob(saveData);
		saveData = saveData.split('|');
		if (this.checksum(saveData[1]) === saveData[0]) {
			try {
				saveData = JSON.parse(saveData[1]);
			} catch (err) {
				alert('Failed to parse save data, loading canceled!');
				return;
			}
			this.pokemons = [];
			let pokeCount = 0;
			this.storage = [];
			saveData.pokes.forEach((loadedPoke) => {
				const pokeName = loadedPoke[0];
				const exp = loadedPoke[1];
				const shiny = loadedPoke[2] === true;
				const caughtAt = loadedPoke[3];
				if (pokeCount < 6) {
					this.pokemons.push(
						new Pokemon(
							pokeByName(pokeName),
							FALSE_LEVEL,
							Number(exp),
							shiny,
							caughtAt,
						),
					);
				} else {
					this.storage.push(
						new Pokemon(
							pokeByName(pokeName),
							FALSE_LEVEL,
							Number(exp),
							shiny,
							caughtAt,
						),
					);
				}
				pokeCount++;
			});
			saveData.storage.forEach((loadedPoke) => {
				const pokeName = loadedPoke[0];
				const exp = loadedPoke[1];
				const shiny = loadedPoke[2] === true;
				const caughtAt = loadedPoke[3];
				this.storage.push(
					new Pokemon(
						pokeByName(pokeName),
						FALSE_LEVEL,
						Number(exp),
						shiny,
						caughtAt,
					),
				);
			});
			this.ballsAmount = saveData.ballsAmount || saveData.ballsAmmount; // import from old spelling mistake
			this.pokedexData = saveData.pokedexData ? saveData.pokedexData : [];
			const loadedStats = saveData.statistics ? saveData.statistics : {};
			this.statistics = { ...this.statistics, ...loadedStats };
			if (saveData.settings) {
				this.settings = saveData.settings;
			}
			this.badges = saveData.badges ? saveData.badges : {};
			const loadedUnlocked = saveData.unlocked ? saveData.unlocked : [];
			this.unlocked = { ...this.unlocked, ...loadedUnlocked };
			this.currency = saveData.currency ? saveData.currency : 0;
		} else {
			alert('Invalid save data, loading canceled!');
		}
	},
};
