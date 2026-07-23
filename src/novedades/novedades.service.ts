import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Novedad } from './entities/novedad.entity';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { UpdateNovedadDto } from './dto/update-novedad.dto';
import { Version } from '../versiones/entities/version.entity';

@Injectable()
export class NovedadesService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepository: Repository<Novedad>,
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
  ) {}

  async create(createNovedadDto: CreateNovedadDto) {
    const version = await this.versionRepository.findOneBy({ id_version: createNovedadDto.fk_version });
    if (!version) {
      throw new NotFoundException(`Versión #${createNovedadDto.fk_version} no encontrada`);
    }

    const novedad = this.novedadRepository.create({
      descripcion: createNovedadDto.descripcion,
      fecha_novedad: new Date(createNovedadDto.fecha_novedad),
      estado: createNovedadDto.estado || 'activo',
      version,
    });
    return this.novedadRepository.save(novedad);
  }

  findAll() {
    return this.novedadRepository.find({ relations: { version: { informe: { usuario: true } } } });
  }

  async findOne(id: number) {
    const novedad = await this.novedadRepository.findOne({
      where: { id_novedad: id },
      relations: { version: { informe: { usuario: true } } },
    });
    if (!novedad) {
      throw new NotFoundException(`Novedad #${id} no encontrada`);
    }
    return novedad;
  }

  async update(id: number, updateNovedadDto: UpdateNovedadDto) {
    const novedad = await this.findOne(id);
    if (updateNovedadDto.descripcion !== undefined) {
      novedad.descripcion = updateNovedadDto.descripcion;
    }
    if (updateNovedadDto.fecha_novedad !== undefined) {
      novedad.fecha_novedad = new Date(updateNovedadDto.fecha_novedad);
    }
    if (updateNovedadDto.estado !== undefined) {
      novedad.estado = updateNovedadDto.estado;
    }
    if (updateNovedadDto.fk_version !== undefined) {
      const version = await this.versionRepository.findOneBy({ id_version: updateNovedadDto.fk_version });
      if (!version) {
        throw new NotFoundException(`Versión #${updateNovedadDto.fk_version} no encontrada`);
      }
      novedad.version = version;
    }
    return this.novedadRepository.save(novedad);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.novedadRepository.delete(id);
  }
}