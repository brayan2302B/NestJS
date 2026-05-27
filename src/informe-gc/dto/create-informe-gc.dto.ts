import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInformeGcDto {

  @IsString()
  @MaxLength(50)
  version_gc: string;

  @IsInt()
  @IsOptional()
  fk_informe?: number;
}