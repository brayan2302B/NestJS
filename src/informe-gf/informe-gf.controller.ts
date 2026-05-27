import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InformeGfService } from './informe-gf.service';
import { CreateInformeGfDto } from './dto/create-informe-gf.dto';
import { UpdateInformeGfDto } from './dto/update-informe-gf.dto';

@Controller('informe-gf')
export class InformeGfController {
  constructor(private readonly informeGfService: InformeGfService) {}

  @Post()
  create(@Body() createInformeGfDto: CreateInformeGfDto) {
    return this.informeGfService.create(createInformeGfDto);
  }

  @Get()
  findAll() {
    return this.informeGfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.informeGfService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInformeGfDto: UpdateInformeGfDto) {
    return this.informeGfService.update(+id, updateInformeGfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.informeGfService.remove(+id);
  }
}
