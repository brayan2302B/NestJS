import { Injectable } from '@nestjs/common';
import { CreateObligacioneDto } from './dto/create-obligacione.dto';
import { UpdateObligacioneDto } from './dto/update-obligacione.dto';

@Injectable()
export class ObligacionesService {
  create(createObligacioneDto: CreateObligacioneDto) {
    return 'This action adds a new obligacione';
  }

  findAll() {
    return `This action returns all obligaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} obligacione`;
  }

  update(id: number, updateObligacioneDto: UpdateObligacioneDto) {
    return `This action updates a #${id} obligacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} obligacione`;
  }
}
