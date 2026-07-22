import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import * as express from 'express';
import { InformesService } from './informes.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InformeGcValidationService } from './informe-gc-validation.service';
import type { ValidarInformeGcDto } from './dto/informe-gc-validation-result.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer-config';

@Controller('informes')
@UseGuards(JwtGuard)
export class InformesController {
  constructor(
    private readonly informesService: InformesService,
    private readonly informeGcValidationService: InformeGcValidationService,
  ) {}

  // ── NUEVOS ENDPOINTS DE INTEGRACIÓN CON EL FRONTEND ──

  @Get()
  async getInformes(@CurrentUser() user: any) {
    if (user.rol === 'coordinador') {
      // Coordinadores ven los informes de su área o todos si no tienen
      const fullUser = await this.informesService.getUserWithArea(user.sub);
      return this.informesService.findCoordinatorReports(fullUser.area?.id_area);
    }
    // Instructores ven sólo sus propios informes
    return this.informesService.findInstructorReports(user.sub);
  }

  @Get('historial')
  async getHistorial(@CurrentUser() user: any) {
    const isCoordinator = user.rol === 'coordinador';
    let areaId = undefined;
    if (isCoordinator) {
      const fullUser = await this.informesService.getUserWithArea(user.sub);
      areaId = fullUser.area?.id_area;
    }
    return this.informesService.findHistorial(user.sub, isCoordinator, areaId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('archivo', multerOptions))
  async uploadInforme(
    @UploadedFile() file: any,
    @Body('periodo') periodo: string,
    @Body('tipo') tipo: string,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }
    if (!periodo || !tipo) {
      throw new BadRequestException('Los campos "periodo" y "tipo" (GC o GF) son obligatorios');
    }
    return this.informesService.uploadReport(user.sub, file, periodo, tipo);
  }

  @Get(':periodo/:tipo')
  async getDetalle(
    @Param('periodo') periodo: string,
    @Param('tipo') tipo: string,
    @CurrentUser() user: any,
  ) {
    const isCoordinator = user.rol === 'coordinador';
    return this.informesService.getDetalleReporte(user.sub, periodo, tipo, isCoordinator);
  }

  @Post(':periodo/:tipo/version')
  @UseInterceptors(FileInterceptor('archivo', multerOptions))
  async uploadNuevaVersion(
    @Param('periodo') periodo: string,
    @Param('tipo') tipo: string,
    @UploadedFile() file: any,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('Archivo PDF requerido');
    }
    return this.informesService.uploadNuevaVersion(user.sub, file, periodo, tipo);
  }

  @Patch(':periodo/:tipo/estado')
  @Roles('coordinador', 'instructor')
  @UseGuards(RolesGuard)
  async cambiarEstado(
    @Param('periodo') periodo: string,
    @Param('tipo') tipo: string,
    @Body() body: any,
  ) {
    const estado = body.estado;
    const observacion = body.observacion;
    const idUsuario = body.id_usuario || body.usuarioId || body.instructorId || body.userId;

    if (!estado) {
      throw new BadRequestException('El campo "estado" es obligatorio');
    }
    return this.informesService.cambiarEstadoReporte(periodo, tipo, estado, observacion, idUsuario);
  }

  @Get(':id/download')
  async downloadReport(
    @Param('id') id: number,
    @Res() res: express.Response,
  ) {
    const fileData = await this.informesService.getReportFile(id);
    return res.download(fileData.path, fileData.name);
  }

  // ── ENDPOINTS ORIGINALES (MANTENIDOS PARA COMPATIBILIDAD) ──

  @Post()
  create(@Body() createInformeDto: CreateInformeDto) {
    return this.informesService.create(createInformeDto);
  }

  @Get(':id/buscar')
  findOne(@Param('id') id: string) {
    return this.informesService.findOne(+id);
  }

  @Get(':id/pdf-gc')
  getPdfGc(@Param('id') id: string) {
    return this.informesService.getDatosPdfGc(+id);
  }

  @Post(':id/validar')
  validar(@Param('id') id: string, @Body() payload: ValidarInformeGcDto) {
    return this.informeGcValidationService.validar(+id, payload);
  }

  @Patch(':id/actualizar')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    return this.informesService.update(+id, updateInformeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesService.remove(+id);
  }
}