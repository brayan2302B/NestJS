import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { signatureMulterOptions } from './multer-config';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente (pendiente de aprobación).' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'Email o Documento ya registrado.' })
  async create(@Body() createPersonaDto: CreatePersonaDto) {
    await this.personasService.create(createPersonaDto);
    return {
      success: true,
      message: 'Registro exitoso. Su cuenta está pendiente de aprobación por el coordinador.',
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('coordinador')
  @ApiOperation({ summary: 'Obtener lista de todos los usuarios (Solo Coordinadores)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios devuelta.' })
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Obtener información de un usuario específico' })
  @ApiResponse({ status: 200, description: 'Datos del usuario.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.rol !== 'coordinador' && user.sub !== +id) {
      throw new ForbiddenException('No tiene permisos para ver esta información');
    }
    return this.personasService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Actualizar información de un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado.' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes.' })
  update(
    @Param('id') id: string,
    @Body() updatePersonaDto: UpdatePersonaDto,
    @CurrentUser() user: any,
  ) {
    if (user.rol !== 'coordinador') {
      if (user.sub !== +id) {
        throw new ForbiddenException('No tiene permisos para modificar este perfil');
      }
      const { estado_cuenta, id_rol, id_area, motivo_rechazo } = updatePersonaDto;
      if (estado_cuenta !== undefined || id_rol !== undefined || id_area !== undefined || motivo_rechazo !== undefined) {
        throw new ForbiddenException('No tiene permisos para modificar roles, áreas o estado de cuenta');
      }
    }
    return this.personasService.update(+id, updatePersonaDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('coordinador')
  @ApiOperation({ summary: 'Eliminar usuario (Solo Coordinadores)' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado.' })
  remove(@Param('id') id: string) {
    return this.personasService.remove(+id);
  }

  @Post('me/firma')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('firma', signatureMulterOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir o actualizar la firma digital del usuario autenticado' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firma: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la firma (.png, .jpg, .jpeg)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Firma subida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Archivo requerido o formato inválido.' })
  async uploadFirma(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo de firma requerido');
    }
    const signaturePath = file.path.replace(/\\/g, '/');
    const persona = await this.personasService.findOne(user.sub);
    persona.firma_digital_ruta = signaturePath;
    persona.firma_digital_actualizada_at = new Date();
    
    // Save directly to repository
    const repo = (this.personasService as any).personaRepository;
    await repo.save(persona);

    return {
      success: true,
      firma_digital_ruta: signaturePath,
    };
  }
}