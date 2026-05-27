import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InformeGf } from './entities/informe-gf.entity';
import { CreateInformeGfDto } from './dto/create-informe-gf.dto';
import { UpdateInformeGfDto } from './dto/update-informe-gf.dto';

@Injectable()
export class InformeGfService {

  constructor(
    @InjectRepository(InformeGf)
    private readonly informeGfRepository: Repository<InformeGf>,
  ) {}

  create(createInformeGfDto: CreateInformeGfDto) {
    const informe = this.informeGfRepository.create(createInformeGfDto);
    return this.informeGfRepository.save(informe);
  }

  findAll() {
    return this.informeGfRepository.find();
  }

  async findOne(id: number) {
    const informe = await this.informeGfRepository.findOneBy({ id_gf: id });
    if (!informe) throw new NotFoundException(`InformeGf #${id} no encontrado`);
    return informe;
  }

  async update(id: number, updateInformeGfDto: UpdateInformeGfDto) {
    await this.findOne(id);
    await this.informeGfRepository.update(id, updateInformeGfDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.informeGfRepository.delete(id);
  }
}