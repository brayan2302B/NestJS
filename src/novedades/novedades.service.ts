import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novedad } from './entities/novedad.entity';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { UpdateNovedadDto } from './dto/update-novedad.dto';

@Injectable()
export class NovedadesService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepository: Repository<Novedad>,
  ) {}

  create(createNovedadDto: CreateNovedadDto) {
    const novedad = this.novedadRepository.create(createNovedadDto);
    return this.novedadRepository.save(novedad);
  }
  findAll() { return this.novedadRepository.find({ relations: { version: true } }); }
  findOne(id: number) { return this.novedadRepository.findOne({ where: { id_novedad: id }, relations: { version: true } }); }
  update(id: number, updateNovedadDto: UpdateNovedadDto) { return this.novedadRepository.update(id, updateNovedadDto); }
  remove(id: number) { return this.novedadRepository.delete(id); }
}