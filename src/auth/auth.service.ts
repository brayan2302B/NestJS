import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Persona } from '../personas/entities/persona.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const persona = await this.personaRepository.findOne({
      where: { correo: dto.email },
    });

    if (!persona || !bcrypt.compareSync(dto.password, persona.passwordHash ?? '')) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: persona.id_persona,
      email: persona.correo,
      role: 'instructor',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: persona.id_persona,
        nombre: persona.nombre,
        correo: persona.correo,
        role: 'instructor',
      },
    };
  }
}
