import { Injectable } from '@nestjs/common';
import { CreateInformeGcDto } from './dto/create-informe-gc.dto';
import { UpdateInformeGcDto } from './dto/update-informe-gc.dto';

@Injectable()
export class InformeGcService {
  create(createInformeGcDto: CreateInformeGcDto) {
    return 'This action adds a new informeGc';
  }

  findAll() {
    return `This action returns all informeGc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} informeGc`;
  }

  update(id: number, updateInformeGcDto: UpdateInformeGcDto) {
    return `This action updates a #${id} informeGc`;
  }

  remove(id: number) {
    return `This action removes a #${id} informeGc`;
  }
}
