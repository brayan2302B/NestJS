import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInformeGfDto {

  @IsString()
  @MaxLength(50)
  version_gf: string;

  @IsInt()
  @IsOptional()
  fk_informe?: number;
}