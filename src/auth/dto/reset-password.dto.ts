import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperación recibido', example: 'abc123xyz' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Nueva contraseña', example: 'nueva456', minLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  newPassword: string;
}
