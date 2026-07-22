import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionesModule } from './versiones/versiones.module';
import { InformesModule } from './informes/informes.module';
import { NovedadesModule } from './novedades/novedades.module';
<<<<<<< Updated upstream

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'proyecto_formativo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
=======
import { InformeGcModule } from './informe-gc/informe-gc.module';
import { InformeGfModule } from './informe-gf/informe-gf.module';
import { ActividadesModule } from './actividades/actividades.module';
import { EvidenciasModule } from './evidencias/evidencias.module';
import { AuthModule } from './auth/auth.module';

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
>>>>>>> Stashed changes
    }),
    VersionesModule,
    InformesModule,
    NovedadesModule,
<<<<<<< Updated upstream
=======
    InformeGcModule,
    InformeGfModule,
    ActividadesModule,
    EvidenciasModule,
    AuthModule,
>>>>>>> Stashed changes
  ],
})
export class AppModule {}