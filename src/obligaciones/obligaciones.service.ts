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
    const obligacion = this.obligacionesRepository.create({
      descripcion: createObligacioneDto.descripcion,
      contrato: { id_contrato: createObligacioneDto.id_contrato } as any,
    });
    return this.obligacionesRepository.save(obligacion);
  }

  findAll() {
    return this.obligacionesRepository.find({ relations: { contrato: true } });
  }

  findOne(id: number) {
    return this.obligacionesRepository.findOne({ where: { id_obligacion: id }, relations: { contrato: true } });
  }

  update(id: number, updateObligacioneDto: Partial<CreateObligacioneDto>) {
    return this.obligacionesRepository.update(id, {
      descripcion: updateObligacioneDto.descripcion,
      contrato: updateObligacioneDto.id_contrato ? ({ id_contrato: updateObligacioneDto.id_contrato } as any) : undefined,
    });
  }

  remove(id: number) {
    return this.obligacionesRepository.softDelete(id);
  }
}
