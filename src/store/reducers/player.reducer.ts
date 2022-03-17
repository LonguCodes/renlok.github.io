import { Action, ActionDomain } from '../types';
import { Pokemon } from '../../logic/pokemon';
import { PokeballType } from '../../logic/enums';
import {
	AddCurrencyAction,
	AddPokeballAction,
	AddPokemonAction,
	AddPokemonExpAction,
	HealAllPokemonAction,
	PlayerAction,
	SelectPokeballAction,
	SetActivePokemonAction,
	UsePokeballAction
} from '../actions/player.action';
import { createSlice } from '@reduxjs/toolkit';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

export interface PlayerState {
	pokemon: Pokemon[];
	storage: Pokemon[];
	pokedexData: [];
	activePokemon: number;
	lastHeal: number;
	selectedBall: PokeballType;
	pokeballAmount: Record<PokeballType, number>;
	currency: number;
}
export const playerSlice = createSlice<
	PlayerState,
	SliceCaseReducers<PlayerState>
>({
	name: 'player',
	initialState: {
		pokemon: [],
		storage: [],
		pokedexData: [],
		activePokemon: 0,
		lastHeal: 0,
		selectedBall: PokeballType.POKEBALL,
		pokeballAmount: {
			[PokeballType.POKEBALL]: 0,
			[PokeballType.GREATBALL]: 0,
			[PokeballType.ULTRABALL]: 0
		},
		currency: 0
	},
	reducers: {
		[PlayerAction.ADD_CURRENCY]: (state, action: AddCurrencyAction) => {
			state.currency += action.payload.amount;
		},
		[PlayerAction.ADD_POKEBALL]: (state, action: AddPokeballAction) => {
			state.pokeballAmount[action.payload.type] += action.payload.amount;
		},
		[PlayerAction.USE_POKEBALL]: (state, action: UsePokeballAction) => {
			state.pokeballAmount[action.payload.type]--;
		},
		[PlayerAction.SELECT_POKEBALL]: (
			state,
			action: SelectPokeballAction
		) => {
			state.selectedBall = action.payload.type;
		},
		[PlayerAction.SET_ACTIVE_POKEMON]: (
			state,
			action: SetActivePokemonAction
		) => {
			state.activePokemon = state.pokemon.findIndex(
				(pokemon) => pokemon.id === action.payload.id
			);
		},
		[PlayerAction.HEAL_ALL_POKEMON]: (state) => {
			state.pokemon = state.pokemon.map((pokemon) => pokemon.heal());
		},
		[PlayerAction.ADD_POKEMON]: (state, action: AddPokemonAction) => {
			if (state.pokemon.length < 6)
				state.pokemon.push(action.payload.pokemon);
			else state.storage.push(action.payload.pokemon);
		},
		[PlayerAction.ADD_POKEMON_EXP]: (
			state,
			action: AddPokemonExpAction
		) => {
			state.pokemon = state.pokemon.map((pokemon) => {
				if (pokemon.id === action.payload.id)
					pokemon.exp += action.payload.amount;
				return pokemon;
			});
			state.storage = state.storage.map((pokemon) => {
				if (pokemon.id === action.payload.id)
					pokemon.exp += action.payload.amount;
				return pokemon;
			});
		}
	}
});
