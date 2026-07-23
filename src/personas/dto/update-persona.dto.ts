import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonaDto {
  @ApiProperty({ description: 'Nombre completo del usuario', required: false, example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombreCompleto?: string;

  @ApiProperty({ description: 'Correo electrónico', required: false, example: 'juan.perez@sena.edu.co' })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiProperty({ description: 'Tipo de documento', enum: ['CC', 'CE', 'TI'], required: false, example: 'CC' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  tipoDocumento?: string;

  @ApiProperty({ description: 'Número de documento', required: false, example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDocumento?: string;

  @ApiProperty({ description: 'Contraseña para la cuenta', minLength: 6, required: false, example: 'instructor123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  contrasena?: string;

  @ApiProperty({ description: 'Estado de la cuenta (Solo Coordinador)', enum: ['pendiente', 'aprobado', 'rechazado'], required: false, example: 'aprobado' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado_cuenta?: string;

  @ApiProperty({ description: 'ID del Rol asignado (Solo Coordinador)', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  id_rol?: number;

  @ApiProperty({ description: 'ID del Área asignada (Solo Coordinador)', required: false, example: 1 })
  @IsOptional()
  @IsInt()
  id_area?: number;

  @ApiProperty({ description: 'Motivo de rechazo de la cuenta (Solo Coordinador)', required: false, example: 'Documentación incompleta' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo_rechazo?: string;
}
