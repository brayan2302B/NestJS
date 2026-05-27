import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
  ) {}

  create(createInformeDto: CreateInformeDto) {
    const informe = this.informeRepository.create(createInformeDto);
    return this.informeRepository.save(informe);
  }
  findAll() { return this.informeRepository.find({ relations: { version: true } }); }
  findOne(id: number) { return this.informeRepository.findOne({ where: { id_informe: id }, relations: { version: true } }); }
  update(id: number, updateInformeDto: UpdateInformeDto) { return this.informeRepository.update(id, updateInformeDto); }
  remove(id: number) { return this.informeRepository.delete(id); }
}