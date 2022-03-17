import { playerSlice, PlayerState } from './player.reducer';

export const rootReducer = {
	player: playerSlice
};

export interface RootState {
	player: PlayerState;
}
