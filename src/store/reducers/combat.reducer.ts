
import {
	AddCurrencyAction,

	PlayerAction,

} from '../actions/player.action';
import { createSlice } from '@reduxjs/toolkit';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { Enemy } from '../../logic/enemy';

export interface CombatState {
	isCombat: boolean;
	enemy: Enemy | null;
}
export const combatSlice = createSlice<
	CombatState,
	SliceCaseReducers<CombatState>
>({
	name: 'combat',
	initialState: {
		isCombat: false,
		enemy: null
	},
	reducers: {
		[PlayerAction.ADD_CURRENCY]: (state, action: AddCurrencyAction) => {
			state.currency += action.payload.amount;
		},
	}
});
