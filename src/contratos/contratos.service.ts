import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private contratosRepository: Repository<Contrato>,
  ) {}

  create(createContratoDto: CreateContratoDto) {
    const contrato = this.contratosRepository.create(createContratoDto);
    return this.contratosRepository.save(contrato);
  }

  findAll() {
    return this.contratosRepository.find();
  }

  findOne(id: number) {
    return this.contratosRepository.findOneBy({ id_contrato: id });
  }

  update(id: number, updateContratoDto: Partial<CreateContratoDto>) {
    return this.contratosRepository.update(id, updateContratoDto);
  }

  remove(id: number) {
    return this.contratosRepository.delete(id);
  }
}
