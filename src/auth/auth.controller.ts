import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión de usuario' })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa y retorno del JWT token.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta pendiente de aprobación.' })
  async login(@Body() body: LoginDto) {
    // Standardize credentials identifiers for the login method
    const identifier = body.username;
    const password = body.password;
    return this.authService.login(identifier, password);
  }
}
