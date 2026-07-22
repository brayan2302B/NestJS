import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PeriodosCargaService } from './periodos-carga.service';
import { CreatePeriodoCargaDto } from './dto/create-periodo-carga.dto';
import { UpdatePeriodoCargaDto } from './dto/update-periodo-carga.dto';

@Controller('periodos-carga')
export class PeriodosCargaController {
  constructor(private readonly periodosCargaService: PeriodosCargaService) {}

  @Post()
  create(@Body() createPeriodoCargaDto: CreatePeriodoCargaDto) {
    return this.periodosCargaService.create(createPeriodoCargaDto);
  }

  @Get()
  findAll() {
    return this.periodosCargaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.periodosCargaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePeriodoCargaDto: UpdatePeriodoCargaDto) {
    return this.periodosCargaService.update(+id, updatePeriodoCargaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.periodosCargaService.remove(+id);
  }
}
