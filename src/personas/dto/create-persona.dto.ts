import {
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @MaxLength(150)
  nombre_completo!: string;

  @IsString()
  @IsIn(['CC', 'CE'])
  tipo_documento!: string;

  @IsString()
  @MaxLength(20)
  numero_documento!: string;

  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @IsString()
  @MinLength(6)
  contrasena_hash!: string;

  @IsOptional()
  @IsInt()
  id_rol?: number;

  @IsOptional()
  @IsInt()
  id_area?: number;

  @IsOptional()
  @IsIn(['pendiente', 'activo', 'inactivo', 'rechazado'])
  estado_cuenta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  firma_digital_ruta?: string;

  @IsOptional()
  @IsObject()
  preferencias_notificaciones?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  aprobado_por_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo_rechazo?: string;
}