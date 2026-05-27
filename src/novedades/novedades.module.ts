import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovedadesService } from './novedades.service';
import { NovedadesController } from './novedades.controller';
import { Novedad } from './entities/novedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Novedad])],
  controllers: [NovedadesController],
  providers: [NovedadesService],
  exports: [TypeOrmModule],
})
export class NovedadesModule {}