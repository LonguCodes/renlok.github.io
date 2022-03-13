import {POKEDEX} from 'db'
import {Pokemon} from "./pokemon";
import {pokeByName} from "./utilities";

const pokeById = (id) => POKEDEX[id - 1];



const COLORS = {
    route: {
        locked: 'rgb(167, 167, 167)',
        unlocked: 'rgb(53, 50, 103)',
        current: 'rgb(51, 111, 22)'
    }
};


const gameVersionMajor = '0';
const gameVersionMinor = '1';
const gameVersionPatch = '5';
const gameVersion = gameVersionMajor + '.' + gameVersionMinor + '.' + gameVersionPatch;


const makeEnemy = (starter) => {
    let active = starter;

    const generator = (poke, level) => {
        return new Pokemon(
            poke,
            level,
            0,
            false
        )
    };

    const trainerPoke = (pokemonList) => {
        const selected = Math.floor(Math.random() * pokemonList.length);
        combatLoop.trainerCurrentID = selected;
        const poke = pokeByName(pokemonList[selected][0]);
        return generator(poke, pokemonList[selected][1]);

    };

    const generateNew = (regionId, routeId) => {
        const regionData = ROUTES[regionId];
        const routeData = regionData[routeId];
        let pokemonList = [];
        if (routeData.fishing) {
            for (let i = player.unlocked.fishing; i > 0; i--) {
                if (routeData.pokes[i]) {
                    pokemonList = mergeArray(pokemonList, routeData.pokes[i]);
                }
            }
        } else {
            pokemonList = routeData.pokes;
        }
        if (regionData['_global']) {
            if (regionData['_global']['pokes'] && Math.random() < (1 / (1 << 8))) {
                pokemonList = mergeArray(pokemonList, regionData['_global']['pokes']);
            }
            if (regionData['_global']['rarePokes'] && Math.random() < (1 / (1 << 14))) {
                pokemonList = mergeArray(pokemonList, regionData['_global']['rarePokes']);
            }
            if (regionData['_global']['superRare'] && Math.random() < (1 / (1 << 16))) {
                pokemonList = mergeArray(pokemonList, regionData['_global']['superRare']);
            }
        }
        const poke = pokeByName(randomArrayElement(pokemonList));
        const level = routeData.minLevel + Math.round((Math.random() * (routeData.maxLevel - routeData.minLevel)));
        return generator(poke, level);
    };

    return {
        activePoke: () => active,
        clear: () => active = null,
        trainerPoke: (pokemonList) => active = trainerPoke(pokemonList),
        generateNew: (regionId, routeId) => active = generateNew(regionId, routeId)
    }
};

// load everything we need
let lastSave = Date.now();
let player = Player;
let enemy = makeEnemy();
const town = Town;
const dom = Display;
const combatLoop = Combat;
const userInteractions = UserActions;
const story = Story;
// load old save data
if (localStorage.getItem(`totalPokes`) !== null) {
    player.loadPokes();
    dom.refreshCatchOption(player.settings.catching);
    userInteractions.changeRoute(player.settings.currentRouteId);
} else {
    combatLoop.pause();
    story.stories.firstPoke();
}

if (player.settings.spriteChoice === 'front') {
    document.getElementById('spriteChoiceFront').checked = true;
    document.getElementById('player').className += ' frontSprite'
} else {
    document.getElementById('spriteChoiceBack').checked = true
}

dom.bindEvents();
dom.renderBalls();
dom.renderCurrency();

renderView(dom, enemy, player);
dom.renderListBox();
dom.renderRegionSelect();
dom.renderPokeSort();

combatLoop.init();

requestAnimationFrame(function renderTime() {
    dom.renderHeal(player.canHeal());
    requestAnimationFrame(renderTime)
});
