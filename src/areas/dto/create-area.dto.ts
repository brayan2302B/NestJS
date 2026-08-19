import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAreaDto {
  @ApiProperty({
    description: 'Nombre del área de formación profesional',
    example: 'Tecnologías de la Información',
  })
  @IsString()
  @MaxLength(100)
  nombre_area!: string;
}
