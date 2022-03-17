import { Player } from './player';
import { dom, enemy } from './config';
import { ROUTES } from './routes';
import { renderView } from './display';
import { PokedexFlags } from './enums';
import { $ } from './utilities';

// fixme
export const UserActions = {
	changeRoute: function (newRouteId, force = false) {
		if (!force && Player.alivePokeIndexes().length == 0) {
			dom.gameConsoleLog(
				'It is too dangerous to travel without a pokemon.',
				'red',
			);
			return false;
		}
		if (Combat.trainer) {
			dom.gameConsoleLog(
				'You cannot run away from a trainer battle.',
				'red',
			);
			return false;
		}
		if (
			!Player.routeUnlocked(Player.settings.currentRegionId, newRouteId)
		) {
			dom.gameConsoleLog('You cannot do that yet.', 'red');
			return false;
		}
		Player.settings.currentRouteId = newRouteId;
		if (
			ROUTES[Player.settings.currentRegionId][
				Player.settings.currentRouteId
			]['town']
		) {
			Combat.pause();
		} else {
			Combat.unpause();
		}
		renderView(dom, enemy, Player);
		Player.savePokes();
		dom.renderRouteList();
	},
	changePokemon: function(newActiveIndex) {
		Player.setActive(newActiveIndex);
		Combat.changePlayerPoke(Player.activePoke());
		renderView(dom, enemy, Player);
	},
	deletePokemon: function(event, index, from = 'roster') {
		const pokeList =
			from === 'roster' ? Player.getPokemon() : Player.storage;
		if (event.shiftKey) {
			// you must keep at least one active pokemon
			if (from !== 'roster' || pokeList.length > 1) {
				const pokemon = pokeList[index];
				Player.deletePoke(index, from);
				const hasPoke = Player.hasPokemon(
					pokemon.pokeName(),
					pokemon.shiny(),
				);
				if (!hasPoke) {
					Player.addPokedex(
						pokemon.pokeName(),
						pokemon.shiny()
							? PokedexFlags.RELEASED_SHINY
							: PokedexFlags.RELEASED_NORMAL,
					);
				}
				if (from === 'roster') {
					Combat.changePlayerPoke(Player.activePoke());
					renderView(dom, enemy, Player);
				} else {
					dom.renderStorage();
				}
				Player.savePokes();
				if (pokemon.isShiny) {
					Player.statistics.shinyReleased++;
				} else {
					Player.statistics.released++;
				}
			} else {
				dom.showPopup('You must have one active pokemon!');
			}
		} else {
			alert('Hold shift while clicking the X to release a pokemon');
		}
	},
	changeRegion: function() {
		const regionSelect = document.getElementById('regionSelect');
		const regionId = regionSelect.options[regionSelect.selectedIndex].value;
		if (Player.regionUnlocked(regionId)) {
			Player.settings.currentRegionId = regionId;
			if (
				Object.keys(ROUTES[Player.settings.currentRegionId])[0].charAt(
					0,
				) !== '_'
			) {
				this.changeRoute(
					Object.keys(ROUTES[Player.settings.currentRegionId])[0],
				);
			} else if (
				Object.keys(ROUTES[Player.settings.currentRegionId])[1].charAt(
					0,
				) !== '_'
			) {
				this.changeRoute(
					Object.keys(ROUTES[Player.settings.currentRegionId])[1],
				);
			} else {
				this.changeRoute(
					Object.keys(ROUTES[Player.settings.currentRegionId])[2],
				);
			}
		}
		return false;
	},
	enablePokeListDelete: function() {
		Player.settings.listView = 'roster';
		dom.renderListBox();
	},
	enablePokeListAutoSort: function() {
		Player.settings.autoSort = $('#autoSort').checked;
		// hide or show sort dropdowns
		dom.renderPokeSort();
		dom.renderListBox();
	},
	changeDexView: function() {
		const regionSelect = document.getElementById('dexView');
		Player.settings.dexView =
			regionSelect.options[regionSelect.selectedIndex].value;
		dom.renderPokeDex();
	},
	changeCatchOption: function(newCatchOption) {
		Combat.changeCatch(newCatchOption);
	},
	changeListView: function(view) {
		Player.settings.listView = view;
		dom.renderListBox();
	},
	clearGameData: function() {
		if (dom.checkConfirmed('#confirmClearData')) {
			localStorage.clear();
			Player.purgeData = true;
			window.location.reload(true);
		}
	},
	clearConsole: function() {
		dom.gameConsoleClear();
	},
	changeSelectedBall: function(newBall) {
		Player.changeSelectedBall(newBall);
	},
	pokemonToFirst: function(pokemonIndex, from = 'roster') {
		const pokeList =
			from === 'roster' ? Player.getPokemon() : Player.storage;
		const moveToFirst = (index, arr) => {
			arr.splice(0, 0, arr.splice(index, 1)[0]);
		};

		moveToFirst(pokemonIndex, pokeList);
		Player.savePokes();
		if (from === 'roster') {
			Combat.changePlayerPoke(Player.activePoke());
			dom.renderPokeList();
		} else {
			dom.renderStorage();
		}
	},
	pokemonToDown: function(pokemonIndex, from = 'roster') {
		const pokeList =
			from === 'roster' ? Player.getPokemon() : Player.storage;
		const moveToDown = (index) => (arr) =>
			[
				...arr.slice(0, parseInt(index)),
				arr[parseInt(index) + 1],
				arr[parseInt(index)],
				...arr.slice(parseInt(index) + 2),
			];
		if (pokeList[pokemonIndex + 1]) {
			const newPokemonList = moveToDown(pokemonIndex)(pokeList);
			Player.reorderPokes(newPokemonList, from);
			if (from === 'roster') {
				Combat.changePlayerPoke(Player.activePoke());
				dom.renderPokeList();
			} else {
				dom.renderStorage();
			}
			Player.savePokes();
		}
	},
	pokemonToUp: function(pokemonIndex, from = 'roster') {
		const pokeList =
			from === 'roster' ? Player.getPokemon() : Player.storage;
		const moveToUp = (index) => (arr) =>
			[
				...arr.slice(0, parseInt(index) - 1),
				arr[parseInt(index)],
				arr[parseInt(index) - 1],
				...arr.slice(parseInt(index) + 1),
			];
		if (pokeList[pokemonIndex - 1]) {
			const newPokemonList = moveToUp(pokemonIndex)(pokeList);
			Player.reorderPokes(newPokemonList, from);
			if (from === 'roster') {
				Combat.changePlayerPoke(Player.activePoke());
				dom.renderPokeList();
			} else {
				dom.renderStorage();
			}
			Player.savePokes();
		}
	},
	evolvePokemon: function(pokemonIndex) {
		player
			.getPokemon()
			[pokemonIndex].tryEvolve(Player.getPokemon()[pokemonIndex].shiny());
		renderView(dom, enemy, player);
	},
	moveToStorage: function(pokemonIndex) {
		// you must keep at least one active pokemon
		if (Player.pokemons.length > 1) {
			const poke = Player.getPokemon()[pokemonIndex];
			Player.pokemons.splice(pokemonIndex, 1);
			Player.storage.push(poke);
			dom.renderPokeList();
		} else {
			dom.showPopup('You must have at least one active pokemon!');
		}
	},
	moveToRoster: function(pokemonIndex) {
		// check you have space
		if (Player.pokemons.length < 6) {
			const poke = Player.storage[pokemonIndex];
			Player.storage.splice(pokemonIndex, 1);
			Player.pokemons.push(poke);
			dom.renderStorage();
		} else {
			dom.showPopup('You can only have six active pokemon!');
		}
	},
	forceSave: function() {
		Player.savePokes();
		$(`#forceSave`).style.display = 'inline';
	},
	exportSaveDialog: function() {
		document.getElementById('saveDialogTitle').innerHTML =
			'Export your save';
		if (document.queryCommandSupported('copy')) {
			document.getElementById('copySaveText').style.display = 'initial';
		}
		document.getElementById('saveText').value = Player.saveToString();
		document.getElementById('loadButtonContainer').style.display = 'none';
		document.getElementById('saveDialogContainer').style.display = 'block';
		$(`#settingsContainer`).style.display = 'none';
	},
	importSaveDialog: function() {
		document.getElementById('saveDialogTitle').innerHTML = 'Import a save';
		document.getElementById('copySaveText').style.display = 'none';
		document.getElementById('saveText').value = '';
		document.getElementById('loadButtonContainer').style.display = 'block';
		document.getElementById('saveDialogContainer').style.display = 'block';
		$(`#settingsContainer`).style.display = 'none';
	},
	importSave: function() {
		if (
			window.confirm(
				'Loading a save will overwrite your current progress, are you sure you wish to continue?',
			)
		) {
			Player.loadFromString(
				document.getElementById('saveText').value.trim(),
			);
			document.getElementById('saveDialogContainer').style.display =
				'none';
			// reload everything
			renderView(dom, enemy, player);
			dom.renderListBox();
			dom.renderPokeSort();
			dom.renderBalls();
			dom.renderCurrency();
		}
	},
	copySaveText: function() {
		document.getElementById('saveText').select();
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
	},
	changePokeSortOrder: function() {
		Player.sortPokemon();
		Player.savePokes();
		dom.renderStorage();
	},
	changeSpriteChoice: function() {
		if (document.getElementById('spriteChoiceFront').checked) {
			Player.settings.spriteChoice = 'front';
			document.getElementById('player').className =
				'container poke frontSprite';
		} else {
			Player.settings.spriteChoice = 'back';
			document.getElementById('player').className = 'container poke';
		}
		Player.savePokes();
		renderView(dom, enemy, player);
	},
	viewStatistics: function() {
		let statisticStrings = {
			seen: 'Pokemon Seen',
			caught: 'Pokemon Caught',
			released: 'Pokemon Released',
			sold: 'Pokemon Sold',
			beaten: 'Pokemon Beaten',
			shinySeen: 'Shiny Pokemon Seen',
			shinyCaught: 'Shiny Pokemon Caught',
			shinyReleased: 'Shiny Pokemon Released',
			shinyBeaten: 'Shiny Pokemon Beaten',
			totalDamage: 'Total Damage Dealt',
			totalThrows: 'Total Catch Attempts',
			successfulThrows: 'Successfully Caught',
			pokeballThrows: 'Pokeball Throws',
			pokeballSuccessfulThrows: 'Caught with Pokeball',
			greatballThrows: 'Greatball Throws',
			greatballSuccessfulThrows: 'Caught with Greatball',
			ultraballThrows: 'Ultraball Throws',
			ultraballSuccessfulThrows: 'Caught with Ultraball',
			totalCurrency: 'Total Coin Obtained',
			totalExp: 'Total Experience Earned',
		};
		let statList = '';
		for (let statValue in Player.statistics) {
			statList +=
				'<li>' +
				statisticStrings[statValue] +
				': ' +
				Player.statistics[statValue] +
				'</li>';
		}
		document.getElementById('statisticsList').innerHTML = statList;
		document.getElementById('statisticsContainer').style.display = 'block';
	},
	viewSettings: function() {
		document.getElementById('settingsContainer').style.display = 'block';
		$(`#forceSave`).style.display = 'none';
	},
	viewAchievements: function() {
		let achievementHTML = '';
		let completeState, complete;
		for (let subgroup in ACHIEVEMENTS['statistics']) {
			for (
				let i = 0, count = ACHIEVEMENTS['statistics'][subgroup].length;
				i < count;
				i++
			) {
				complete =
					player['statistics'][subgroup] >=
					ACHIEVEMENTS['statistics'][subgroup][i].value;
				completeState = complete
					? ACHIEVEMENTS['statistics'][subgroup][i].value
					: player['statistics'][subgroup];
				achievementHTML +=
					'<li' +
					(complete ? ' class="complete"' : '') +
					'><b>' +
					ACHIEVEMENTS['statistics'][subgroup][i].name +
					'</b>: ' +
					camalCaseToString(subgroup) +
					' ' +
					completeState +
					'/' +
					ACHIEVEMENTS['statistics'][subgroup][i].value +
					'</li>';
			}
		}
		for (
			let i = 0, count = ACHIEVEMENTS['dex']['caughtCount'].length;
			i < count;
			i++
		) {
			let progress = Player.countPokedex(POKEDEXFLAGS.releasedNormal);
			complete = progress >= ACHIEVEMENTS['dex']['caughtCount'][i].value;
			completeState = complete
				? ACHIEVEMENTS['dex']['caughtCount'][i].value
				: progress;
			achievementHTML +=
				'<li' +
				(complete ? ' class="complete"' : '') +
				'><b>' +
				ACHIEVEMENTS['dex']['caughtCount'][i].name +
				'</b>: Unique Caught ' +
				completeState +
				'/' +
				ACHIEVEMENTS['dex']['caughtCount'][i].value +
				'</li>';
		}
		for (
			let i = 0, count = ACHIEVEMENTS['dex']['caught'].length;
			i < count;
			i++
		) {
			let progress = 0;
			let needed = ACHIEVEMENTS['dex']['caught'][i]['pokes'].length;
			let string = '';
			for (let j = 0; j < needed; j++) {
				let pokeName = ACHIEVEMENTS['dex']['caught'][i]['pokes'][j];
				string += j > 0 ? ', ' : '';
				if (Player.hasDexEntry(pokeName, POKEDEXFLAGS.releasedNormal)) {
					string += '<s>' + pokeName + '</s>';
					progress++;
				} else {
					string += pokeName;
				}
			}
			complete = progress >= needed;
			completeState = complete ? needed : progress;
			achievementHTML +=
				'<li' +
				(complete ? ' class="complete"' : '') +
				'><b>' +
				ACHIEVEMENTS['dex']['caught'][i].name +
				'</b>: Catch ' +
				string +
				'</li>';
		}
		document.getElementById('achievementsList').innerHTML = achievementHTML;
		document.getElementById('achievementsContainer').style.display =
			'block';
	},
	viewInventory: function() {
		if (!isEmpty(Player.badges)) {
			let badgesHTML = '';
			for (let badge in Player.badges) {
				badgesHTML += '<li>' + badge + '</li>';
			}
			document.getElementById('badgeList').innerHTML = badgesHTML;
		}
		let inventoryHTML = 'To do';
		document.getElementById('inventoryList').innerHTML = inventoryHTML;
		document.getElementById('inventoryContainer').style.display = 'block';
	},
	viewTown: function() {
		town.renderShop();
		town.renderTrader();
		document.getElementById('townContainer').style.display = 'block';
	},
	trainerBattle: function() {
		const routeData =
			ROUTES[Player.settings.currentRegionId][
				Player.settings.currentRouteId
				];
		if (routeData['trainer'] && routeData['trainer']['poke'].length > 0) {
			Combat.trainer = {
				name: routeData['trainer']['name'],
				badge: routeData['trainer']['badge'],
			};
			Combat.trainerPoke = Object.values(
				Object.assign({}, routeData['trainer']['poke']),
			);
			Combat.unpause();
			Combat.refresh();
		}
	},
	closeStory: function() {
		if (story.canClose) {
			$(`#storyContainer`).style.display = 'none';
		}
	},
};
