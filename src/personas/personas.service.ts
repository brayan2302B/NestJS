import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
  ) {}

  async create(createPersonaDto: CreatePersonaDto) {
    const email = createPersonaDto.email.trim().toLowerCase();
    const numeroDocumento = createPersonaDto.numeroDocumento.trim();
    const tipoDocumento = createPersonaDto.tipoDocumento.trim().toUpperCase();

    const emailExistente = await this.personaRepository.findOne({
      where: { correo: email },
    });

    if (emailExistente) {
      throw new ConflictException('Ya existe una cuenta registrada con este email.');
    }

    const documentoExistente = await this.personaRepository.findOne({
      where: { numero_documento: numeroDocumento },
    });

    if (documentoExistente) {
      throw new ConflictException(
        'Ya existe una persona registrada con este número de documento.',
      );
    }

    const contrasenaHash = await bcrypt.hash(createPersonaDto.contrasena, 10);

    const persona = this.personaRepository.create({
      nombre_completo: createPersonaDto.nombreCompleto.trim(),
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      correo: email,
      contrasena_hash: contrasenaHash,
      rol: null,
      area: null,
      estado_cuenta: 'pendiente',
    });

    await this.personaRepository.save(persona);

    return persona;
  }

  async findByEmailOrDocument(identifier: string): Promise<Persona | null> {
    const trimmed = identifier.trim().toLowerCase();
    return this.personaRepository.findOne({
      where: [
        { correo: trimmed },
        { numero_documento: identifier.trim() }
      ],
      relations: { area: true, rol: true },
    });
  }

  findAll() {
    return this.personaRepository.find({ relations: { area: true, rol: true } });
  }

  async findOne(id: number) {
    const persona = await this.personaRepository.findOne({
      where: { id_usuario: id },
      relations: { area: true, rol: true },
    });
    if (!persona) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.findOne(id);

    if (updatePersonaDto.nombreCompleto !== undefined) {
      persona.nombre_completo = updatePersonaDto.nombreCompleto.trim();
    }
    if (updatePersonaDto.email !== undefined) {
      persona.correo = updatePersonaDto.email.trim().toLowerCase();
    }
    if (updatePersonaDto.tipoDocumento !== undefined) {
      persona.tipo_documento = updatePersonaDto.tipoDocumento.trim().toUpperCase();
    }
    if (updatePersonaDto.numeroDocumento !== undefined) {
      persona.numero_documento = updatePersonaDto.numeroDocumento.trim();
    }
    if (updatePersonaDto.contrasena !== undefined) {
      persona.contrasena_hash = await bcrypt.hash(updatePersonaDto.contrasena, 10);
    }
    if (updatePersonaDto.estado_cuenta !== undefined) {
      persona.estado_cuenta = updatePersonaDto.estado_cuenta;
      if (updatePersonaDto.estado_cuenta === 'aprobado') {
        persona.fecha_aprobacion = new Date();
      }
    }
    if (updatePersonaDto.motivo_rechazo !== undefined) {
      persona.motivo_rechazo = updatePersonaDto.motivo_rechazo;
    }
    if (updatePersonaDto.id_rol !== undefined) {
      persona.rol = updatePersonaDto.id_rol ? ({ id_rol: updatePersonaDto.id_rol } as any) : null;
    }
    if (updatePersonaDto.id_area !== undefined) {
      persona.area = updatePersonaDto.id_area ? ({ id_area: updatePersonaDto.id_area } as any) : null;
    }

    return this.personaRepository.save(persona);
  }

  remove(id: number) {
    return this.personaRepository.softDelete(id);
  }
}