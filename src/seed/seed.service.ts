import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter)
  {}

  async executeSeed() {
    await this.pokemonService.removeAll();
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: {name: string, no: number}[] = [];

    await data.results.forEach(({ name, url })=>{
      const segments = url.split('/');
      const no: number = +segments[segments.length -2];
      pokemonToInsert.push({ name, no });
    });

    this.pokemonService.createMany(pokemonToInsert);
    
    return 'Seed success!';
  }
}
