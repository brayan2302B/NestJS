import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformeGcService } from './informe-gc.service';
import { CreateInformeGcDto } from './dto/create-informe-gc.dto';
import { UpdateInformeGcDto } from './dto/update-informe-gc.dto';

@Controller('informe-gc')
export class InformeGcController {

  constructor(private readonly informeGcService: InformeGcService) {}

  @Post()
  create(@Body() createInformeGcDto: CreateInformeGcDto) {
    return this.informeGcService.create(createInformeGcDto);
  }

  @Get()
  findAll() {
    return this.informeGcService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informeGcService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeGcDto: UpdateInformeGcDto) {
    return this.informeGcService.update(+id, updateInformeGcDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informeGcService.remove(+id);
  }
}