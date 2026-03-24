import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel : Model<Pokemon>
  ){}
  
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }
    catch(error){
      this.handleExceptions( error);
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    
    if (!isNaN(+term))
    {
      let pokemon = await this.pokemonModel.findOne({ no: +term});
      if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no ${term} not found.`)
      return pokemon;
    }

    if (isValidObjectId(term)) {
      let pokemon = await this.pokemonModel.findById( term);
      if (!pokemon) throw new NotFoundException(`Not found pokemon with id ${term}`);
      return pokemon;
    }

    let pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    if (!pokemon) throw new NotFoundException(`Not found pokemon with name ${term}`);
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      const updatedPokemon = await pokemon.updateOne( updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    }
    catch(error){
      this.handleExceptions( error);  
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return {id};
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if (deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return;
  }

  private handleExceptions( error: any) {
    if (error.code === 11000) {
        throw new BadRequestException(`Pokemons exists in db ${JSON.stringify(error.keyValue)}`);
    }
    throw new InternalServerErrorException(`Can't update Pokemon - Check server logs.`);
  }
}
