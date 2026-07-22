import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PersonasService } from '../personas/personas.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly personasService: PersonasService,
    private readonly jwtService: JwtService,
  ) {}

  async login(identifier: string, contrasena: string) {
    const user = await this.personasService.findByEmailOrDocument(identifier);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const matches = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!matches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.estado_cuenta !== 'aprobado') {
      throw new UnauthorizedException('Su cuenta está pendiente de aprobación por el coordinador');
    }

    const payload = {
      sub: user.id_usuario,
      email: user.correo,
      rol: user.rol?.nombre_rol ?? 'instructor',
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre_completo: user.nombre_completo,
        correo: user.correo,
        rol: user.rol?.nombre_rol ?? 'instructor',
        area: user.area?.nombre_area ?? null,
      },
    };
  }
}
