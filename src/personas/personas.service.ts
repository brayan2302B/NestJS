import { ConflictException, Injectable } from '@nestjs/common';
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

  findAll() {
    return this.personaRepository.find({ relations: { area: true, rol: true } });
  }

  findOne(id: number) {
    return this.personaRepository.findOne({
      where: { id_usuario: id },
      relations: { area: true, rol: true },
    });
  }

  update(id: number, updatePersonaDto: UpdatePersonaDto) {
    return this.personaRepository.update(id, updatePersonaDto as any);
  }

  remove(id: number) {
    return this.personaRepository.softDelete(id);
  }
}