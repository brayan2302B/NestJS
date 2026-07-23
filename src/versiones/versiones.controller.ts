import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VersionesService } from './versiones.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('versiones')
@ApiBearerAuth()
@Controller('versiones')
@UseGuards(JwtGuard)
export class VersionesController {
  constructor(private readonly versionesService: VersionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una versión de informe manualmente' })
  @ApiResponse({ status: 201, description: 'Versión creada exitosamente.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido para este informe.' })
  create(@Body() createVersionDto: CreateVersionDto, @CurrentUser() user: any) {
    return this.versionesService.create(createVersionDto, user.sub, user.rol);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de versiones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista de versiones.' })
  findAll(@CurrentUser() user: any) {
    if (user.rol === 'coordinador') {
      return this.versionesService.findAll();
    }
    return this.versionesService.findByUserId(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una versión' })
  @ApiResponse({ status: 200, description: 'Datos de la versión.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido.' })
  @ApiResponse({ status: 404, description: 'Versión no encontrada.' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    await this.versionesService.checkOwnership(+id, user.sub, user.rol);
    return this.versionesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar detalles de una versión' })
  @ApiResponse({ status: 200, description: 'Versión actualizada.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido.' })
  update(
    @Param('id') id: string,
    @Body() updateVersionDto: UpdateVersionDto,
    @CurrentUser() user: any,
  ) {
    return this.versionesService.update(+id, updateVersionDto, user.sub, user.rol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una versión' })
  @ApiResponse({ status: 200, description: 'Versión eliminada.' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido.' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.versionesService.remove(+id, user.sub, user.rol);
  }
}