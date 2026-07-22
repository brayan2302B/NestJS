import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsIn(['Instructor', 'Coordinacion'])
  @MaxLength(30)
  nombre_rol!: string;
}