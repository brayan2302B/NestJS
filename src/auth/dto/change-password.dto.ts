import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual del usuario', example: 'instructor123' })
  @IsNotEmpty({ message: 'La contraseña actual es obligatoria' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ description: 'Nueva contraseña (mínimo 6 caracteres)', example: 'nueva456' })
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}
