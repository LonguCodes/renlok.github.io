import { Player } from './player';
import { dom, enemy, lastSave } from './config';
import { UserActions } from './actions';
import { Story } from './story';
import { renderView } from './display';

const userInteractions = UserActions;

const gameVersionMajor = '0';
const gameVersionMinor = '1';
const gameVersionPatch = '5';
const gameVersion = `${gameVersionMajor}.${gameVersionMinor}.${gameVersionPatch}`;

// load everything we need
lastSave.time = Date.now();

// load old save data
if (localStorage.getItem('totalPokes') !== null) {
	Player.loadPokes();
	dom.refreshCatchOption(Player.settings.catching);
	userInteractions.changeRoute(Player.settings.currentRouteId);
} else {
	Combat.pause();
	Story.stories.firstPoke();
}

if (Player.settings.spriteChoice === 'front') {
	document.getElementById('spriteChoiceFront').checked = true;
	document.getElementById('player').className += ' frontSprite';
} else {
	document.getElementById('spriteChoiceBack').checked = true;
}

dom.bindEvents();
dom.renderBalls();
dom.renderCurrency();

renderView(dom, enemy, Player);
dom.renderListBox();
dom.renderRegionSelect();
dom.renderPokeSort();

Combat.init();

requestAnimationFrame(function renderTime() {
	dom.renderHeal(Player.canHeal());
	requestAnimationFrame(renderTime);
});
