import { POKEDEX } from './data/db';
import { $, pokeById } from './utilities';
import { Pokemon } from './pokemon';
import { Player } from './player';
import { dom, enemy } from './config';
import { PokedexFlags } from './enums';
import { renderView } from './display';

const displayStory = (story: typeof Story) => (title, content, canClose) => {
	story.canClose = canClose;
	$(`#storyContainer`).style.display = 'block';
	$(`#storyClose`).style.display = canClose ? 'block' : 'none';
	$(`#storyTitle`).innerHTML = title;
	$(`#storyContent`).innerHTML = content;
};

// fixme
export const Story = {
	canClose: true,
	stories: {
		firstPoke: function () {
			let title = 'Welcome to the world of pokemon';
			let storyHTML =
				'<p>To help you get started please take one of my old pokemon</p>';
			storyHTML +=
				'<p><img src="' +
				Story.helpers.getPokeImg(1) +
				'" onclick="story.helpers.selectFirstPoke(1)">';
			storyHTML +=
				'<img src="' +
				Story.helpers.getPokeImg(4) +
				'" onclick="story.helpers.selectFirstPoke(4)">';
			storyHTML +=
				'<img src="' +
				Story.helpers.getPokeImg(7) +
				'" onclick="story.helpers.selectFirstPoke(7)"></p>';
			displayStory(this)(title, storyHTML, false);
		}
	},
	helpers: {
		getPokeImg: function (id) {
			return POKEDEX[id - 1]['images']['normal']['front'];
		},
		selectFirstPoke: function (id) {
			let starterPoke = new Pokemon(pokeById(id), 5);
			Player.addPoke(starterPoke);
			Player.addPokedex(starterPoke.name, PokedexFlags.OWN_NORMAL);
			dom.gameConsoleLog(
				'You received a ' + Player.activePoke().pokeName(),
				'purple'
			);
			Player.setActive(0);
			Combat.unpause();
			renderView(dom, enemy, Player);
			dom.renderListBox();
			$(`#storyContainer`).style.display = 'none';
		}
	}
};
