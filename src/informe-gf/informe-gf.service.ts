import { Injectable } from '@nestjs/common';
import { CreateInformeGfDto } from './dto/create-informe-gf.dto';
import { UpdateInformeGfDto } from './dto/update-informe-gf.dto';

@Injectable()
export class InformeGfService {
  create(createInformeGfDto: CreateInformeGfDto) {
    return 'This action adds a new informeGf';
  }

  findAll() {
    return `This action returns all informeGf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} informeGf`;
  }

  update(id: number, updateInformeGfDto: UpdateInformeGfDto) {
    return `This action updates a #${id} informeGf`;
  }

  remove(id: number) {
    return `This action removes a #${id} informeGf`;
  }
}
