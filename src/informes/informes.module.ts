import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { Informe } from './entities/informe.entity';
import { Persona } from '../personas/entities/persona.entity';
import { Version } from '../versiones/entities/version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Informe, Persona, Version])],
  controllers: [InformesController],
  providers: [InformesService],
  exports: [TypeOrmModule],
})
export class InformesModule {}