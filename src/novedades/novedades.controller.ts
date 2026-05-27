import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NovedadesService } from './novedades.service';
import { CreateNovedadeDto } from './dto/create-novedade.dto';
import { UpdateNovedadeDto } from './dto/update-novedade.dto';

@Controller('novedades')
export class NovedadesController {
  constructor(private readonly novedadesService: NovedadesService) {}

  @Post()
  create(@Body() createNovedadeDto: CreateNovedadeDto) {
    return this.novedadesService.create(createNovedadeDto);
  }

  @Get()
  findAll() {
    return this.novedadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.novedadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNovedadeDto: UpdateNovedadeDto) {
    return this.novedadesService.update(+id, updateNovedadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.novedadesService.remove(+id);
  }
}
