import { Module } from '@nestjs/common';
import { ObligacionesService } from './obligaciones.service';
import { ObligacionesController } from './obligaciones.controller';

@Module({
  controllers: [ObligacionesController],
  providers: [ObligacionesService],
})
export class ObligacionesModule {}
