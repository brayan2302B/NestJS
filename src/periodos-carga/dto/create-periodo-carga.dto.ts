import { IsBoolean, IsInt, IsOptional } from 'class-validator';

export class CreatePeriodoCargaDto {
  @IsInt()
  anio!: number;

  @IsInt()
  mes!: number;

  @IsInt()
  fecha_limite!: number;

  @IsOptional()
  @IsBoolean()
  habilitado?: boolean;
}
