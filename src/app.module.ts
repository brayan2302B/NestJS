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
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        const isProduction = config.get<string>('NODE_ENV') === 'production';
        const sync = config.get<string>('DB_SYNCHRONIZE') === 'true' || (!isProduction && config.get<string>('DB_SYNCHRONIZE') !== 'false');

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USERNAME', 'postgres'),
            password: config.get<string>('DB_PASSWORD', 'postgres'),
            database: config.get<string>('DB_NAME', 'sena'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: sync,
          };
        }

        return {
          type: 'sqljs' as const,
          autoSave: true,
          location: config.get<string>('DB_NAME', 'sena.db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: sync,
        };
      },
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
