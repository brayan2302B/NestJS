import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';

@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly evidenciasService: EvidenciasService) {}

  @Post()
  create(@Body() createEvidenciaDto: CreateEvidenciaDto) {
    return this.evidenciasService.create(createEvidenciaDto);
  }

  @Get()
  findAll() {
    return this.evidenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evidenciasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvidenciaDto: UpdateEvidenciaDto) {
    return this.evidenciasService.update(+id, updateEvidenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.evidenciasService.remove(+id);
  }
}
