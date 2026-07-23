import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovedadesService } from './novedades.service';
import { NovedadesController } from './novedades.controller';
import { Novedad } from './entities/novedad.entity';
import { Version } from '../versiones/entities/version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad, Version])],
  controllers: [NovedadesController],
  providers: [NovedadesService],
  exports: [NovedadesService],
})
export class NovedadesModule {}