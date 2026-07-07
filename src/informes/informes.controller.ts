import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformesService } from './informes.service';
import { CreateInformeDto } from './dto/create-informe.dto';
import { UpdateInformeDto } from './dto/update-informe.dto';
import { InformeGcValidationService } from './informe-gc-validation.service';
import type { ValidarInformeGcDto } from './dto/informe-gc-validation-result.dto';

@Controller('informes')
export class InformesController {
  constructor(
    private readonly informesService: InformesService,
    private readonly informeGcValidationService: InformeGcValidationService,
  ) {}

  @Post()
  create(@Body() createInformeDto: CreateInformeDto) { return this.informesService.create(createInformeDto); }

  @Get()
  findAll() { return this.informesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.informesService.findOne(+id); }

  @Get(':id/pdf-gc')
  getPdfGc(@Param('id') id: string) { return this.informesService.getDatosPdfGc(+id); }

  @Post(':id/validar')
  validar(@Param('id') id: string, @Body() payload: ValidarInformeGcDto) {
    return this.informeGcValidationService.validar(+id, payload);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeDto: UpdateInformeDto) { return this.informesService.update(+id, updateInformeDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.informesService.remove(+id); }
}