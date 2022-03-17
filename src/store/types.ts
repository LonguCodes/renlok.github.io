import {
	AddCurrencyAction,
	AddPokeballAction,
	AddPokemonAction,
	HealAllPokemonAction,
	PlayerAction,
	SelectPokeballAction,
	SetActivePokemonAction,
	UsePokeballAction,
} from './actions/player.action';

export type ActionType = PlayerAction;
export enum ActionDomain {
	PLAYER = 'player',
}

export type BaseAction<T> = {
	payload: T;
	type: string;
};

export type Action =
	| AddPokemonAction
	| SetActivePokemonAction
	| HealAllPokemonAction
	| AddCurrencyAction
	| AddPokeballAction
	| UsePokeballAction
	| SelectPokeballAction;
