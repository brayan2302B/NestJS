import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Informe } from './entities/informe.entity';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { Persona } from '../personas/entities/persona.entity';
import { Version } from '../versiones/entities/version.entity';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class InformesService {
  constructor(
    @InjectRepository(Informe)
    private readonly informeRepository: Repository<Informe>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Version)
    private readonly versionRepository: Repository<Version>,
  ) {}

  create(createInformeDto: CreateInformeDto) {
    const informe = this.informeRepository.create(createInformeDto);
    return this.informeRepository.save(informe);
  }

  async findAllForInstructor(instructorId: number) {
    return this.informeRepository.find({
      where: { instructor: { id_persona: instructorId } },
      relations: { version: true, instructor: true },
      order: { id_informe: 'DESC' },
    });
  }

  async findHistorial(instructorId: number) {
    return this.informeRepository.find({
      where: { instructor: { id_persona: instructorId }, estado: 'Validado' },
      relations: { version: true, instructor: true },
      order: { periodo: 'DESC' },
    });
  }

  async findOne(periodo: string, tipo: 'GC' | 'GF', instructorId?: number) {
    const where: any = { periodo, tipo };
    if (instructorId) where.instructor = { id_persona: instructorId };

    const informe = await this.informeRepository.findOne({
      where,
      relations: { version: true, instructor: true, versiones: true },
    });

    if (!informe) throw new NotFoundException('Informe no encontrado');

    return informe;
  }

  async uploadFile(instructorId: number, periodo: string, tipo: 'GC' | 'GF', file: Express.Multer.File, titulo?: string) {
    const instructor = await this.personaRepository.findOne({ where: { id_persona: instructorId } });
    if (!instructor) throw new NotFoundException('Instructor no encontrado');

    const existing = await this.informeRepository.findOne({
      where: { periodo, tipo, instructor: { id_persona: instructorId } },
    });

    const versionNumber = existing ? (existing.version?.numero_version ?? 1) + 1 : 1;
    const version = this.versionRepository.create({
      numero_version: versionNumber,
      fecha_version: new Date(),
      descripcion: 'Nueva versión',
      estado: 'activo',
    });
    const savedVersion = await this.versionRepository.save(version);

    const informe = this.informeRepository.create({
      periodo,
      tipo,
      titulo: titulo ?? `${tipo} ${periodo}`,
      estado: 'Pendiente',
      archivoUrl: `/uploads/informes/${file.filename}`,
      archivoNombre: file.originalname,
      fechaUltimaActualizacion: new Date(),
      instructor,
      version: savedVersion,
      padre: existing,
    });

    return this.informeRepository.save(informe);
  }

  async addVersion(instructorId: number, periodo: string, tipo: 'GC' | 'GF', file: Express.Multer.File, titulo?: string) {
    return this.uploadFile(instructorId, periodo, tipo, file, titulo);
  }

  async updateEstado(id: number, dto: UpdateEstadoDto) {
    const informe = await this.informeRepository.findOne({ where: { id_informe: id }, relations: { instructor: true } });
    if (!informe) throw new NotFoundException('Informe no encontrado');

    informe.estado = dto.estado;
    informe.observacion = dto.observacion;
    informe.fechaUltimaActualizacion = new Date();

    return this.informeRepository.save(informe);
  }

  async updateEstadoByPeriodoTipo(periodo: string, tipo: 'GC' | 'GF', dto: UpdateEstadoDto) {
    const informe = await this.informeRepository.findOne({ where: { periodo, tipo }, relations: { instructor: true } });
    if (!informe) throw new NotFoundException('Informe no encontrado');

    informe.estado = dto.estado;
    informe.observacion = dto.observacion;
    informe.fechaUltimaActualizacion = new Date();

    return this.informeRepository.save(informe);
  }

  update(id: number, updateInformeDto: UpdateInformeDto) {
    return this.informeRepository.update(id, updateInformeDto);
  }

  async remove(id: number) {
    const informe = await this.informeRepository.findOne({ where: { id_informe: id } });
    if (!informe) throw new NotFoundException('Informe no encontrado');

    return this.informeRepository.remove(informe);
  }
}