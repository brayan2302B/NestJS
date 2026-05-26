import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @MaxLength(18)
  telefono!: string;

  @IsString()
  @MaxLength(100)
  correo!: string;

  @IsString()
  @MaxLength(20)
  documento!: string;

  @IsNumber()
  fk_area!: number;

  @IsNumber()
  fk_rol!: number;
}