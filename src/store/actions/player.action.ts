import { ActionDomain, BaseAction } from '../types';
import { Pokemon } from '../../logic/pokemon';
import { PokeballType } from '../../logic/enums';
import { PayloadAction, PayloadActionCreator } from '@reduxjs/toolkit';
import { RootState } from '../reducers';

export enum PlayerAction {
	ADD_POKEMON = 'add pokemon',
	SET_ACTIVE_POKEMON = 'set active pokemon',
	HEAL_ALL_POKEMON = 'heal all pokemon',
	SELECT_POKEBALL = 'select pokeball',
	USE_POKEBALL = 'use pokeball',
	ADD_POKEBALL = 'add pokeball',
	ADD_CURRENCY = 'add currency',
	ADD_POKEMON_EXP = 'add pokemon exp'
}

export type AddPokemonAction = PayloadAction<{ pokemon: Pokemon }>;
export type SetActivePokemonAction = PayloadAction<{ id: string }>;
export type HealAllPokemonAction = PayloadAction<undefined>;
export type SelectPokeballAction = PayloadAction<{ type: PokeballType }>;
export type UsePokeballAction = PayloadAction<{ type: PokeballType }>;
export type AddPokeballAction = PayloadAction<{
	type: PokeballType;
	amount: number;
}>;
export type AddCurrencyAction = PayloadAction<{ amount: number }>;
export type AddPokemonExpAction = PayloadAction<{ amount: number; id: string }>;

export namespace PlayerActions {
	export function AddPokemon(pokemon: Pokemon): AddPokemonAction {
		return {
			type: `${ActionDomain.PLAYER}/${PlayerAction.ADD_POKEMON}`,
			payload: {
				pokemon
			}
		};
	}

	export function SetActivePokemon(id: string): SetActivePokemonAction {
		return {
			type: `${ActionDomain.PLAYER}/${PlayerAction.SET_ACTIVE_POKEMON}`,
			payload: {
				id
			}
		};
	}

	export function AddPokemonExp(
		id: string,
		amount: number
	): AddPokemonExpAction {
		return {
			type: `${ActionDomain.PLAYER}/${PlayerAction.ADD_POKEMON_EXP}`,
			payload: {
				id,
				amount
			}
		};
	}

	export function AddPokeball(
		type: PokeballType,
		amount: number
	): AddPokeballAction {
		return {
			type: `${ActionDomain.PLAYER}/${PlayerAction.ADD_POKEBALL}`,
			payload: {
				type,
				amount
			}
		};
	}

	export function UsePokeball(type: PokeballType): UsePokeballAction {
		return {
			type: `${ActionDomain.PLAYER}/${PlayerAction.USE_POKEBALL}`,
			payload: {
				type
			}
		};
	}

	export function ThrowPokeball() {
		return (dispatch, getState) => {
			const { player } = getState() as RootState;
			if (player.pokeballAmount[player.selectedBall] <= 0) return;
			dispatch(UsePokeball(player.selectedBall));
			// Try to catch pokemon
		};
	}
}
