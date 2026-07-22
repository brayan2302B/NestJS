import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Obligacione } from './entities/obligacione.entity';
import { CreateObligacioneDto } from './dto/create-obligacione.dto';

@Injectable()
export class ObligacionesService {
  constructor(
    @InjectRepository(Obligacione)
    private obligacionesRepository: Repository<Obligacione>,
  ) {}

  create(createObligacioneDto: CreateObligacioneDto) {
    const obligacion = this.obligacionesRepository.create(createObligacioneDto);
    return this.obligacionesRepository.save(obligacion);
  }

  findAll() {
    return this.obligacionesRepository.find();
  }

  findOne(id: number) {
    return this.obligacionesRepository.findOneBy({ id_obligaciones: id });
  }

  update(id: number, updateObligacioneDto: Partial<CreateObligacioneDto>) {
    return this.obligacionesRepository.update(id, updateObligacioneDto);
  }

  remove(id: number) {
    return this.obligacionesRepository.delete(id);
  }
}
