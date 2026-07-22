import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateObligacioneDto {
  @IsString()
  @MaxLength(255)
  descripcion!: string;

  @IsInt()
  id_contrato!: number;
}
