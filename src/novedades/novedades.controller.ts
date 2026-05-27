import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NovedadesService } from './novedades.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { UpdateNovedadDto } from './dto/update-novedad.dto';

@Controller('novedades')
export class NovedadesController {
  constructor(private readonly novedadesService: NovedadesService) {}

  @Post()
  create(@Body() createNovedadDto: CreateNovedadDto) { return this.novedadesService.create(createNovedadDto); }

  @Get()
  findAll() { return this.novedadesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.novedadesService.findOne(+id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNovedadDto: UpdateNovedadDto) { return this.novedadesService.update(+id, updateNovedadDto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.novedadesService.remove(+id); }
}