import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from './personas/personas.module';
import { AreasModule } from './areas/areas.module';
import { RolModule } from './rol/rol.module';
import { ContratosModule } from './contratos/contratos.module';
import { ObligacionesModule } from './obligaciones/obligaciones.module';
import { InformeGcModule } from './informe-gc/informe-gc.module';
import { InformeGfModule } from './informe-gf/informe-gf.module';
import { ActividadesModule } from './actividades/actividades.module';
import { EvidenciasModule } from './evidencias/evidencias.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      port: 5433,
      username: 'postgres',
      password: 'Clave123',
      database: 'proyecto_formativo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    VersionesModule,
    InformesModule,
    NovedadesModule,
  ],
    PersonasModule,
    AreasModule,
    RolModule,
    InformeGcModule,
    InformeGfModule,
    ActividadesModule,
    EvidenciasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}