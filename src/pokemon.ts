import {cloneJsonObject, pokeByName} from "./utilities";
import {EXP_TABLE} from "./db";
import {EVOLUTIONS} from "./evolutions";
import {PokedexFlags} from "./enums";


/**
 * A Pokemon
 */
export class Pokemon {
    poke: object;
    expTable: any;
    exp: any;
    #hp: number;


    constructor(pokeModel, initialLevel: number, initialExp: number, private shiny: boolean, private caughtAt?: number) {
        this.poke = cloneJsonObject(pokeModel);
        this.expTable = EXP_TABLE[this.poke.stats[0]["growth rate"]];
        this.exp = initialLevel && this.expTable[initialLevel - 1] || initialExp;
        this.caughtAt = caughtAt || Date.now();
        this.#hp = this.setHpValue(this.poke.stats[0].hp) * 3;
    }


    setHpValue(rawHp) {
        return Math.floor(((rawHp * this.currentLevel()) / 40))
    }

    get currentLevel() {
        return this.expTable
            .filter((xp_requirement) => xp_requirement <= this.exp)
            .length;
    }

    statValue(raw: number) {
        return Math.floor((((raw + 50) * this.currentLevel()) / 150))
    }

    tryEvolve(player, shiny){
        const pokemonHasEvolution =
            EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined;
        if (pokemonHasEvolution) {
            const oldPokemon = this.poke.pokemon[0].Pokemon;
            const evolution = EVOLUTIONS[this.poke.pokemon[0].Pokemon].to;
            const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
            if (this.currentLevel() >= levelToEvolve) {
                this.poke = cloneJsonObject(pokeByName(evolution));
                player.addPokedex(evolution, (shiny ? PokedexFlags.OWN_SHINY : PokedexFlags.OWN_NORMAL));
                if (!player.hasPokemon(oldPokemon, shiny)) {
                    player.addPokedex(oldPokemon, (shiny ? PokedexFlags.OWNED_SHINY : PokedexFlags.OWNED_NORMAL))
                }
            }
        }
    }

    canEvolve(){
        if (EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined) {
            const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
            if (this.currentLevel() >= levelToEvolve) {
                return true;
            }
        }
        return false;
    }

    get hp(){
        return this.#hp;
    }

    set hp(value){
        this.#hp = value;
    }

    get maxHp(){
        return this.setHpValue(this.poke.stats[0].hp) * 3;
    }

    get attack() {
        return this.statValue(this.poke.stats[0].attack);
    }
    get defense(){
        return this.statValue(this.poke.stats[0].defense);
    }

    get spAttack(){
        return this.statValue(this.poke.stats[0]['sp atk']);
    }

    get spDefense(){
        return this.statValue(this.poke.stats[0]['sp def']);
    }

    get speed(){
        return this.statValue(this.poke.stats[0].speed);
    }

    get avgDefense(){
        return (this.defense + this.spDefense) / 2;
    }

    get name(){
        return this.poke.pokemon[0].Pokemon;
    }
}
Pokemon.prototype.image = function () {
    const imageType = (this.isShiny ? 'shiny' : 'normal');
    return {
        front: this.poke.images[imageType].front,
        back: this.poke.images[imageType].back
    }
};
Pokemon.prototype.shiny = function () {
    return this.isShiny
};
Pokemon.prototype.types = function () {
    return this.poke.stats[0].types;
};
Pokemon.prototype.catchRate = function () {
    return Number(this.poke.stats[0]['catch rate']);
};
Pokemon.prototype.lifeAsText = function () {
    return '' + (this.getHp() < 0 ? 0 : this.getHp()) + ' / ' + this.maxHp();
};
Pokemon.prototype.alive = function () {
    return this.getHp() > 0;
};
Pokemon.prototype.giveExp = function (amount) {
    this.exp += amount;
};
Pokemon.prototype.currentExp = function () {
    return this.exp;
};
Pokemon.prototype.nextLevelExp = function () {
    return this.expTable[this.currentLevel()];
};
Pokemon.prototype.thisLevelExp = function () {
    return this.expTable[this.currentLevel() - 1] || 10;
};
Pokemon.prototype.level = function () {
    return this.currentLevel();
};
Pokemon.prototype.attackSpeed = function () {
    const speed = Math.floor(1000 / (500 + this.speed()) * 800);
    if (speed <= 300) {
        return 300;
    } else {
        return speed;
    }
};
Pokemon.prototype.avgAttack = function () {
    return (this.attack() + this.spAttack()) / 2;
};
Pokemon.prototype.takeDamage = function (enemyAttack) {
    const damageToTake = (enemyAttack - this.avgDefense() / 10) > 0
        && Math.ceil((enemyAttack - this.avgDefense() / 10) * ((Math.random() + 0.1) * 2) / 100)
        || 0;
    this.setHp(this.getHp() - damageToTake);
    return damageToTake;
};
Pokemon.prototype.baseExp = function () {
    return Number(this.poke.exp[0]['base exp']);
};
Pokemon.prototype.heal = function () {
    return this.setHp(this.maxHp());
};
Pokemon.prototype.save = function () {
    return [this.poke.pokemon[0].Pokemon, this.exp, this.isShiny, this.caughtAt];
};

const makeRandomPoke = (level) => new Pokemon(randomArrayElement(POKEDEX), level);