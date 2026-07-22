import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreasModule } from './areas/areas.module';
import { AuthModule } from './auth/auth.module';
import { ContratosModule } from './contratos/contratos.module';
import { InformesModule } from './informes/informes.module';
import { NovedadesModule } from './novedades/novedades.module';
import { ObligacionesModule } from './obligaciones/obligaciones.module';
import { PersonasModule } from './personas/personas.module';
import { RolModule } from './rol/rol.module';
import { VersionesModule } from './versiones/versiones.module';
import { InformeGcModule } from './informe-gc/informe-gc.module';
import { InformeGfModule } from './informe-gf/informe-gf.module';
import { ActividadesModule } from './actividades/actividades.module';
import { EvidenciasModule } from './evidencias/evidencias.module';
import { PeriodosCargaModule } from './periodos-carga/periodos-carga.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'sqljs' as const,
        autoSave: true,
        location: config.get('DB_NAME') ?? 'sena.db',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AreasModule,
    AuthModule,
    ContratosModule,
    InformesModule,
    NovedadesModule,
    ObligacionesModule,
    PersonasModule,
    RolModule,
    VersionesModule,
    InformeGcModule,
    InformeGfModule,
    ActividadesModule,
    EvidenciasModule,
    PeriodosCargaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
