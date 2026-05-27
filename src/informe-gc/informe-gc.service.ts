import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGc } from './entities/informe-gc.entity';
import { CreateInformeGcDto } from './dto/create-informe-gc.dto';
import { UpdateInformeGcDto } from './dto/update-informe-gc.dto';

@Injectable()
export class InformeGcService {

  constructor(
    @InjectRepository(InformeGc)
    private readonly informeGcRepository: Repository<InformeGc>,
  ) {}

  create(createInformeGcDto: CreateInformeGcDto) {
    const informe = this.informeGcRepository.create(createInformeGcDto);
    return this.informeGcRepository.save(informe);
  }

  findAll() {
    return this.informeGcRepository.find();
  }

  async findOne(id: number) {
    const informe = await this.informeGcRepository.findOneBy({ id_gc: id });
    if (!informe) throw new NotFoundException(`InformeGc #${id} no encontrado`);
    return informe;
  }

  async update(id: number, updateInformeGcDto: UpdateInformeGcDto) {
    await this.findOne(id);
    await this.informeGcRepository.update(id, updateInformeGcDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.informeGcRepository.delete(id);
  }
}