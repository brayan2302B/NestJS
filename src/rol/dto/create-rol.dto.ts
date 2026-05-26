import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MaxLength(50)
  estado!: string;

  @IsBoolean()
  @IsOptional()
  inactivo?: boolean;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}