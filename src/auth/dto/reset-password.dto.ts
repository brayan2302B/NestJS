import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperación recibido por correo', example: 'a1b2c3d4...' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'Nueva contraseña (mínimo 6 caracteres)', example: 'nueva123' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}
