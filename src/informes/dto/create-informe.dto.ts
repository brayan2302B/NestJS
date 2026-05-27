import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInformeDto {
  @IsString()
  @MaxLength(150)
  titulo!: string;

  @IsDateString()
  fecha_informe!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  estado?: string;

  @IsInt()
  fk_version!: number;
}

export class CreateInformeDto {}
