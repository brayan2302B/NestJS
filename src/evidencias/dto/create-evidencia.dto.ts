import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEvidenciaDto {

  @IsString()
  descripcion: string;

  @IsString()
  @MaxLength(255)
  carpeta_obligacion: string;

  @IsString()
  @MaxLength(215)
  fotografia: string;

  @IsInt()
  @IsOptional()
  fk_actividades?: number;
}