import { Module } from '@nestjs/common';
import { NovedadesService } from './novedades.service';
import { NovedadesController } from './novedades.controller';

@Module({
  controllers: [NovedadesController],
  providers: [NovedadesService],
})
export class NovedadesModule {}
