import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { Informe } from './entities/informe.entity';
import { InformeGc } from '../informe-gc/entities/informe-gc.entity';
import { Actividad } from '../actividades/entities/actividade.entity';
import { Evidencia } from '../evidencias/entities/evidencia.entity';
import { Persona } from '../personas/entities/persona.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Informe, InformeGc, Actividad, Evidencia, Persona])],
  controllers: [InformesController],
  providers: [InformesService],
  exports: [TypeOrmModule, InformesService],
})
export class InformesModule {}