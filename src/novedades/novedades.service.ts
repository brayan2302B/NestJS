import { Injectable } from '@nestjs/common';
import { CreateNovedadeDto } from './dto/create-novedade.dto';
import { UpdateNovedadeDto } from './dto/update-novedade.dto';

@Injectable()
export class NovedadesService {
  create(createNovedadeDto: CreateNovedadeDto) {
    return 'This action adds a new novedade';
  }

  findAll() {
    return `This action returns all novedades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} novedade`;
  }

  update(id: number, updateNovedadeDto: UpdateNovedadeDto) {
    return `This action updates a #${id} novedade`;
  }

  remove(id: number) {
    return `This action removes a #${id} novedade`;
  }
}
