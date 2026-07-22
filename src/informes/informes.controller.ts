import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';

type AuthenticatedRequest = Request & { user?: any };
import { InformesService } from './informes.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Controller('api/informes')
@UseGuards(AuthGuard('jwt'))
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  @Post()
  create(@Body() createInformeDto: CreateInformeDto) {
    return this.informesService.create(createInformeDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const user = req.user as any;
    return this.informesService.findAllForInstructor(user.sub);
  }

  @Get('historial')
  historial(@Req() req: AuthenticatedRequest) {
    const user = req.user as any;
    return this.informesService.findHistorial(user.sub);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'informes'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body('periodo') periodo: string,
    @Body('tipo') tipo: 'GC' | 'GF',
    @Body('titulo') titulo?: string,
  ) {
    const user = req.user as any;
    if (!file) throw new BadRequestException('Archivo requerido');
    return this.informesService.uploadFile(user.sub, periodo, tipo, file, titulo);
  }

  @Get(':periodo/:tipo')
  findOne(@Param('periodo') periodo: string, @Param('tipo') tipo: 'GC' | 'GF', @Req() req: AuthenticatedRequest) {
    const user = req.user as any;
    return this.informesService.findOne(periodo, tipo, user.sub);
  }

  @Post(':periodo/:tipo/version')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'informes'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Solo se permiten archivos PDF'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  addVersion(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Param('periodo') periodo: string,
    @Param('tipo') tipo: 'GC' | 'GF',
    @Body('titulo') titulo?: string,
  ) {
    const user = req.user as any;
    if (!file) throw new BadRequestException('Archivo requerido');
    return this.informesService.addVersion(user.sub, periodo, tipo, file, titulo);
  }

  @Patch(':periodo/:tipo/estado')
  @UseGuards(RolesGuard)
  @Roles('coordinador')
  updateEstado(@Param('periodo') periodo: string, @Param('tipo') tipo: 'GC' | 'GF', @Body() dto: UpdateEstadoDto) {
    return this.informesService.updateEstadoByPeriodoTipo(periodo, tipo, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) {
    return this.informesService.update(+id, updateInformeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informesService.remove(+id);
  }
}