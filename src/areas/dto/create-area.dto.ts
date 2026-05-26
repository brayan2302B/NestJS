import { IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsNumber()
  fk_rol!: number;
}