import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeriodoCarga } from './entities/periodo-carga.entity';
import { CreatePeriodoCargaDto } from './dto/create-periodo-carga.dto';
import { UpdatePeriodoCargaDto } from './dto/update-periodo-carga.dto';

@Injectable()
export class PeriodosCargaService {
  constructor(
    @InjectRepository(PeriodoCarga)
    private readonly periodoCargaRepository: Repository<PeriodoCarga>,
  ) {}

  create(createPeriodoCargaDto: CreatePeriodoCargaDto) {
    const periodo = this.periodoCargaRepository.create(createPeriodoCargaDto);
    return this.periodoCargaRepository.save(periodo);
  }

  findAll() {
    return this.periodoCargaRepository.find();
  }

  findOne(id: number) {
    return this.periodoCargaRepository.findOne({ where: { id_periodo: id } });
  }

  update(id: number, updatePeriodoCargaDto: UpdatePeriodoCargaDto) {
    return this.periodoCargaRepository.update(id, updatePeriodoCargaDto);
  }

  remove(id: number) {
    return this.periodoCargaRepository.softDelete(id);
  }
}
