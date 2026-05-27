import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
  ) {}

  create(createAreaDto: CreateAreaDto) {
    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  findAll() {
    return this.areaRepository.find({ relations: { rol: true } });
  }

  findOne(id: number) {
    return this.areaRepository.findOne({
      where: { id_area: id },
      relations: { rol: true },
    });
  }

  update(id: number, updateAreaDto: UpdateAreaDto) {
    return this.areaRepository.update(id, updateAreaDto);
  }

  remove(id: number) {
    return this.areaRepository.delete(id);
  }
}