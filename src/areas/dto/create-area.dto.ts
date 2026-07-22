import { IsString, MaxLength } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @MaxLength(100)
  nombre_area!: string;
}