export enum PokedexFlags {
	UNSEEN,
	SEEN_NORMAL,
	SEEN_SHINY,
	RELEASED_NORMAL,
	RELEASED_SHINY,
	OWNED_NORMAL,
	OWN_NORMAL,
	OWNED_SHINY,
	OWN_SHINY,
}

export enum BallCatchRate {
	POKE_BALL = 1,
	GREAT_BALL = 1.5,
	ULTRA_BALL = 2,
}

const COLORS = {
	route: {
		locked: 'rgb(167, 167, 167)',
		unlocked: 'rgb(53, 50, 103)',
		current: 'rgb(51, 111, 22)',
	},
};
export enum PokeballType {
	POKEBALL,
	GREATBALL,
	ULTRABALL,
}