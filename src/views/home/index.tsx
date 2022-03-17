// @flow\

import * as React from 'react';
import { useEffect } from 'react';
import { Pokemon } from '../../logic/pokemon';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerState } from '../../store/reducers/player.reducer';
import { PlayerActions } from '../../store/actions/player.action';
import { RootState } from '../../store/reducers';
import { PokeballType } from '../../logic/enums';

export function Home() {
	const dispatch = useDispatch();
	const player: PlayerState = useSelector((state: RootState) => state.player);

	useEffect(() => {
		dispatch(PlayerActions.AddPokemon(Pokemon.Factory.random(1)));
		dispatch(PlayerActions.AddPokemon(Pokemon.Factory.random(10)));
	}, []);

	const handleAddExp = () => {
		dispatch(PlayerActions.AddPokemonExp(player.pokemon[0].id, 10));
	};

	const handleAddPokeball = () => {
		dispatch(PlayerActions.AddPokeball(PokeballType.POKEBALL, 10));
	};

	const handleUsePokeball = () => {
		dispatch(PlayerActions.UsePokeball(PokeballType.POKEBALL));
		dispatch(PlayerActions.AddPokemon(Pokemon.Factory.random(10)));
	};

	console.log(player.pokemon[0]);

	return (
		<div>
			<div>
				{player.pokemon.map((pokemon, key) => {
					return (
						<div key={key}>
							{pokemon.name} {pokemon.currentLevel}
							<img src={pokemon.archetype.images.normal.front} />
						</div>
					);
				})}
				<button onClick={handleAddExp}>EXP!</button>
				<button onClick={handleAddPokeball}>
					Pokeball! {player.pokeballAmount[PokeballType.POKEBALL]}
				</button>

				<button onClick={handleUsePokeball}>Throw!</button>
			</div>
		</div>
	);
}
