import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ObligacionesService } from './obligaciones.service';
import { CreateObligacioneDto } from './dto/create-obligacione.dto';
import { UpdateObligacioneDto } from './dto/update-obligacione.dto';

@Controller('obligaciones')
export class ObligacionesController {
  constructor(private readonly obligacionesService: ObligacionesService) {}

  @Post()
  create(@Body() createObligacioneDto: CreateObligacioneDto) {
    return this.obligacionesService.create(createObligacioneDto);
  }

  @Get()
  findAll() {
    return this.obligacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.obligacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObligacioneDto: UpdateObligacioneDto) {
    return this.obligacionesService.update(+id, updateObligacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.obligacionesService.remove(+id);
  }
}
