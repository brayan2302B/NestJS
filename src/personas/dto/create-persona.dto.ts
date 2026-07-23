import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(150)
  nombreCompleto!: string;

  @ApiProperty({ description: 'Correo electrónico institucional o personal', example: 'juan.perez@sena.edu.co' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @ApiProperty({ description: 'Tipo de documento de identidad', enum: ['CC', 'CE', 'TI'], example: 'CC' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @IsIn(['CC', 'CE', 'TI'])
  tipoDocumento!: string;

  @ApiProperty({ description: 'Número de documento de identidad', example: '123456789' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(20)
  numeroDocumento!: string;

  @ApiProperty({ description: 'Contraseña para la cuenta', minLength: 6, example: 'instructor123' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  contrasena!: string;

  @ApiProperty({ description: 'Confirmación de la contraseña', required: false, example: 'instructor123' })
  @IsOptional()
  @IsString()
  confirmarContrasena?: string;
}