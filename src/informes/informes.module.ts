import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { Informe } from './entities/informe.entity';
import { InformeGc } from '../informe-gc/entities/informe-gc.entity';
import { Actividad } from '../actividades/entities/actividade.entity';
import { Evidencia } from '../evidencias/entities/evidencia.entity';
import { Persona } from '../personas/entities/persona.entity';
import { Contrato } from '../contratos/entities/contrato.entity';
import { PeriodoCarga } from '../periodos-carga/entities/periodo-carga.entity';
import { InformeGcValidationService } from './informe-gc-validation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Informe, InformeGc, Actividad, Evidencia, Persona, Contrato, PeriodoCarga])],
  controllers: [InformesController],
  providers: [InformesService, InformeGcValidationService],
  exports: [TypeOrmModule, InformesService, InformeGcValidationService],
})
export class InformesModule {}