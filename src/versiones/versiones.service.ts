import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Version } from './entities/version.entity';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';

@Injectable()
export class VersionesService {
  constructor(
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
  ) {}

  create(createVersionDto: CreateVersionDto) {
    const version = this.versionRepository.create(createVersionDto);
    return this.versionRepository.save(version);
  }
  findAll() { return this.versionRepository.find(); }
  findOne(id: number) { return this.versionRepository.findOneBy({ id_version: id }); }
  update(id: number, updateVersionDto: UpdateVersionDto) { return this.versionRepository.update(id, updateVersionDto); }
  remove(id: number) { return this.versionRepository.delete(id); }
}