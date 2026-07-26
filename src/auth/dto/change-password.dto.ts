import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual del usuario', example: 'actual123' })
  @IsString()
  @MinLength(4)
  currentPassword: string;

  @ApiProperty({ description: 'Nueva contraseña', example: 'nueva456', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  newPassword: string;
}
