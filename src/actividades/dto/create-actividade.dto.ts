import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateActividadDto {

  @IsDateString()
  fecha: string;

  @IsString()
  @MaxLength(100)
  competencia: string;

  @IsString()
  @MaxLength(3)
  estado: string;

  @IsDateString()
  fecha_fin: string;

  @IsDateString()
  fecha_inicio: string;

  @IsString()
  resultado: string;

  @IsInt()
  @IsOptional()
  fk_gc?: number;
}