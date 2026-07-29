import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PersonasService } from '../personas/personas.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly personasService: PersonasService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ─── LOGIN ───────────────────────────────────────────────────────────────────

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
      throw new UnauthorizedException(
        'Su cuenta está pendiente de aprobación por el coordinador',
      );
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

  // ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    // Always return a generic message to avoid leaking user existence
    const user = await this.personasService.findByEmail(email);

    if (user) {
      // Generate a secure random token (64 hex chars = 32 bytes)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Token expires in 1 hour
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      user.reset_token = resetToken;
      user.reset_token_expiry = expiry;
      await this.personasService.savePersona(user);

      // Send token exclusively via email — never exposed in the API response
      try {
        await this.mailService.sendPasswordReset(email, resetToken);
      } catch (mailErr) {
        this.logger.error(`Failed to send reset email to ${email}`, mailErr);
      }
    }

    // Generic response regardless of whether the user was found
    return {
      message:
        'Si el correo está registrado, recibirás las instrucciones de recuperación.',
    };
  }

  // ─── RESET PASSWORD ──────────────────────────────────────────────────────────

  async resetPassword(token: string, newPassword: string) {
    const cleanToken = token.trim();

    const user = await this.personasService.findByResetToken(cleanToken);

    if (!user) {
      throw new BadRequestException('Token inválido o no encontrado');
    }

    if (!user.reset_token_expiry || user.reset_token_expiry < new Date()) {
      // Clear the expired token
      user.reset_token = null;
      user.reset_token_expiry = null;
      await this.personasService.savePersona(user);
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
    }

    // Hash the new password
    user.contrasena_hash = await bcrypt.hash(newPassword, 10);

    // Clear the reset token after use (one-time use)
    user.reset_token = null;
    user.reset_token_expiry = null;

    await this.personasService.savePersona(user);

    return { message: 'Contraseña actualizada correctamente' };
  }

  // ─── CHANGE PASSWORD (authenticated user) ───────────────────────────────────

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.personasService.findOne(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const matches = await bcrypt.compare(currentPassword, user.contrasena_hash);
    if (!matches) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    user.contrasena_hash = await bcrypt.hash(newPassword, 10);
    await this.personasService.savePersona(user);

    return { message: 'Contraseña cambiada correctamente' };
  }
}
