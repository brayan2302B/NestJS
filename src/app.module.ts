import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionesModule } from './versiones/versiones.module';
import { InformesModule } from './informes/informes.module';
import { NovedadesModule } from './novedades/novedades.module';

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
    }),
    VersionesModule,
    InformesModule,
    NovedadesModule,
  ],
})
export class AppModule {}