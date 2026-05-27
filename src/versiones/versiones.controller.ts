import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VersionesService } from './versiones.service';
import { CreateVersioneDto } from './dto/create-versione.dto';
import { UpdateVersioneDto } from './dto/update-versione.dto';

@Controller('versiones')
export class VersionesController {
  constructor(private readonly versionesService: VersionesService) {}

  @Post()
  create(@Body() createVersioneDto: CreateVersioneDto) {
    return this.versionesService.create(createVersioneDto);
  }

  @Get()
  findAll() {
    return this.versionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVersioneDto: UpdateVersioneDto) {
    return this.versionesService.update(+id, updateVersioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionesService.remove(+id);
  }
}
