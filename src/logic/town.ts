import { Player } from './player';
import { PokedexFlags } from './enums';
import { $, pokeByName } from './utilities';
import { dom } from './config';
import { Pokemon } from './pokemon';

const shopItems = [
	{
		name: 'Complete Pokedex',
		cost: 100000,
		unlockable: 'completeDex'
	},
	{
		name: 'Pokeball',
		cost: 10,
		ball: 'pokeball'
	},
	{
		name: 'Greatball',
		cost: 100,
		ball: 'greatball'
	},
	{
		name: 'Ultraball',
		cost: 1000,
		ball: 'ultraball'
	},
	{
		name: 'Razz Berry',
		cost: 250000,
		unlockable: 'razzBerry'
	},
	{
		name: 'Old Rod',
		cost: 1000,
		fishing: 1
	},
	{
		name: 'Good Rod',
		cost: 10000,
		fishing: 2
	},
	{
		name: 'Super Rod',
		cost: 100000,
		fishing: 3
	}
];

export const Town = {
	shopItems,
	renderShop() {
		let shopHTML = '';
		for (let i = 0; i < this.shopItems.length; i++) {
			let canBuy = true;
			let own = false;
			if (Player.currency < this.shopItems[i].cost) {
				canBuy = false;
			}
			if (
				this.shopItems[i].unlockable &&
				Player.unlocked[this.shopItems[i].unlockable]
			) {
				canBuy = false;
				own = true;
			}
			if (
				this.shopItems[i].fishing &&
				Player.unlocked.fishing >= this.shopItems[i].fishing
			) {
				canBuy = false;
				own = true;
			}
			const disableButton = !canBuy || own ? ' disabled="true"' : '';
			const buttonText = own ? 'Own' : 'Buy';
			const buttonHTML = ` <button onclick="town.buyItem('${i}')"${disableButton}>${buttonText}</button>`;
			shopHTML += `<li>${this.shopItems[i].name}: ¤${this.shopItems[i].cost}${buttonHTML}</li>`;
		}
		$('#shopItems').innerHTML = shopHTML;
	},
	buyItem(index) {
		const item = this.shopItems[index];
		if (Player.currency < item.cost) {
			return false;
		}
		Player.currency -= item.cost;
		if (item.ball) {
			Player.ballsAmount[item.ball]++;
			dom.renderBalls();
		}
		if (item.unlockable) {
			Player.unlocked[item.unlockable] = 1;
			dom.renderListBox();
		}
		if (item.fishing && item.fishing > Player.unlocked.fishing) {
			Player.unlocked.fishing = item.fishing;
			dom.renderListBox();
		}
		this.renderShop(); // force refresh of shop
		dom.renderCurrency();
		return true;
	},
	renderSellTrader() {
		let traderHTML = '';
		let poke;
		let pokeValue;
		let pokeStatus;
		let classValue;
		let buttonHTML;
		const storageLength = Player.storage.length;
		for (let i = 0; i < storageLength; i++) {
			poke = Player.storage[i];
			pokeValue = this.calculatePokeValue(poke);
			pokeStatus = dom.pokeStatus(poke);
			classValue = `pokeListName ${pokeStatus}`;
			buttonHTML = ` <button onclick="town.sellPoke('${i}')">Sell</button>`;
			traderHTML += `<li class='${classValue}'>${poke.pokeName()}: ¤${pokeValue}${buttonHTML}</li>`;
		}
		if (storageLength == 0) {
			traderHTML +=
				'<li>Nothing to sell, you can only sell pokemon from your storage</li>';
		}
		$('#traderSellList').innerHTML = traderHTML;
	},
	traderPoke: ['Farfetchd', 'Jynx', 'Lickitung', 'Mr. Mime'],
	renderBuyTrader() {
		let traderHTML = '';
		let poke;
		let pokeValue;
		let buttonHTML;
		let canBuy;
		for (let i = 0; i < this.traderPoke.length; i++) {
			poke = this.traderPoke[i];
			pokeValue = 100000;
			canBuy = true;
			if (Player.currency < pokeValue) {
				canBuy = false;
			}
			const disableButton = !canBuy ? ' disabled="true"' : '';
			buttonHTML = ` <button onclick="town.buyPoke('${i}')" ${disableButton}>Buy</button>`;
			traderHTML += `<li>${poke}: ¤${pokeValue}${buttonHTML}</li>`;
		}
		$('#traderBuyList').innerHTML = traderHTML;
	},
	renderTrader() {
		this.renderSellTrader();
		this.renderBuyTrader();
	},
	calculatePokeValue(poke, demandMult = 1) {
		const shinyMult = poke.shiny() ? 1500 : 1;
		return Math.floor((poke.level() / 4) * shinyMult * demandMult);
	},
	sellPoke(index) {
		const poke = Player.storage[index];
		const soldValue = this.calculatePokeValue(poke);
		Player.addCurrency(soldValue);
		dom.gameConsoleLog(
			`Sold ${poke.pokeName()} for ¤${soldValue}!!`,
			'purple'
		);
		Player.deletePoke(index, 'storage');
		Player.statistics.sold++;
		this.renderSellTrader();
		dom.renderPokeList();
		return false;
	},
	buyPoke(index) {
		const pokeValue = 100000;
		if (Player.currency < pokeValue) {
			return false;
		}
		const poke = pokeByName(this.traderPoke[index]);
		const newPoke = new Pokemon(poke, 30, 0, Math.random() < 1 / (1 << 13));
		Player.currency -= pokeValue;
		dom.gameConsoleLog(
			`Bought ${newPoke.name} for ¤${pokeValue}!!`,
			'purple'
		);
		Player.addPoke(newPoke);
		Player.addPokedex(
			newPoke.name,
			newPoke.isShiny ? PokedexFlags.OWN_SHINY : PokedexFlags.OWNED_NORMAL
		);
		dom.renderPokeList();
		dom.renderCurrency();
		return false;
	}
};
