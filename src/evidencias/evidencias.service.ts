import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidencia } from './entities/evidencia.entity';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';

@Injectable()
export class EvidenciasService {

  constructor(
    @InjectRepository(Evidencia)
    private readonly evidenciaRepository: Repository<Evidencia>,
  ) {}

  create(createEvidenciaDto: CreateEvidenciaDto) {
    const evidencia = this.evidenciaRepository.create(createEvidenciaDto);
    return this.evidenciaRepository.save(evidencia);
  }

  findAll() {
    return this.evidenciaRepository.find();
  }

  async findOne(id: number) {
    const evidencia = await this.evidenciaRepository.findOneBy({ id_evidencia: id });
    if (!evidencia) throw new NotFoundException(`Evidencia #${id} no encontrada`);
    return evidencia;
  }

  async update(id: number, updateEvidenciaDto: UpdateEvidenciaDto) {
    await this.findOne(id);
    await this.evidenciaRepository.update(id, updateEvidenciaDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.evidenciaRepository.delete(id);
  }
}