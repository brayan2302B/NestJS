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
import { Version } from '../versiones/entities/version.entity';
import { AuthModule } from '../auth/auth.module';
import { PersonasModule } from '../personas/personas.module';
import { InformeGf } from '../informe-gf/entities/informe-gf.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Informe, InformeGc, InformeGf, Actividad, Evidencia, Persona, Contrato, PeriodoCarga, Version]),
    AuthModule,
    PersonasModule,
  ],
  controllers: [InformesController],
  providers: [InformesService, InformeGcValidationService],
  exports: [TypeOrmModule, InformesService, InformeGcValidationService],
})
export class InformesModule {}