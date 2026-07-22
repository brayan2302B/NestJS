import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PersonasModule } from './personas/personas.module';
import { AuthModule } from './auth/auth.module';
import { AreasModule } from './areas/areas.module';
import { RolModule } from './rol/rol.module';
import { ContratosModule } from './contratos/contratos.module';
import { ObligacionesModule } from './obligaciones/obligaciones.module';
import { VersionesModule } from './versiones/versiones.module';
import { InformesModule } from './informes/informes.module';
import { NovedadesModule } from './novedades/novedades.module';
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
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get('DB_PORT')),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PersonasModule,
    AuthModule,
    AreasModule,
    RolModule,
    ContratosModule,
    ObligacionesModule,
    VersionesModule,
    InformesModule,
    NovedadesModule,
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
