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
    const informe = this.informeGfRepository.create({
      version_formato: createInformeGfDto.version_formato,
      valor_total: createInformeGfDto.valor_total,
      observaciones: createInformeGfDto.observaciones,
      informe: { id_informe: createInformeGfDto.id_informe } as any,
    });
    return this.informeGfRepository.save(informe);
  }

  findAll() {
    return this.informeGfRepository.find({ relations: { informe: true } });
  }

  async findOne(id: number) {
    const informe = await this.informeGfRepository.findOne({
      where: { id_informe_gf: id },
      relations: { informe: true },
    });
    if (!informe) throw new NotFoundException(`InformeGf #${id} no encontrado`);
    return informe;
  }

  async update(id: number, updateInformeGfDto: UpdateInformeGfDto) {
    await this.findOne(id);
    await this.informeGfRepository.update(id, {
      version_formato: updateInformeGfDto.version_formato,
      valor_total: updateInformeGfDto.valor_total,
      observaciones: updateInformeGfDto.observaciones,
      informe: updateInformeGfDto.id_informe ? ({ id_informe: updateInformeGfDto.id_informe } as any) : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.informeGfRepository.softDelete(id);
  }
}