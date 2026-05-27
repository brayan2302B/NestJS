import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {

  constructor(
    @InjectRepository(Actividad)
    private readonly actividadRepository: Repository<Actividad>,
  ) {}

  create(createActividadDto: CreateActividadDto) {
    const actividad = this.actividadRepository.create(createActividadDto);
    return this.actividadRepository.save(actividad);
  }

  findAll() {
    return this.actividadRepository.find();
  }

  async findOne(id: number) {
    const actividad = await this.actividadRepository.findOneBy({ id_actividad: id });
    if (!actividad) throw new NotFoundException(`Actividad #${id} no encontrada`);
    return actividad;
  }

  async update(id: number, updateActividadDto: UpdateActividadDto) {
    await this.findOne(id);
    await this.actividadRepository.update(id, updateActividadDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.actividadRepository.delete(id);
  }
}