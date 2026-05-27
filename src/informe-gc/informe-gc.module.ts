import { Module } from '@nestjs/common';
import { InformeGcService } from './informe-gc.service';
import { InformeGcController } from './informe-gc.controller';

@Module({
  controllers: [InformeGcController],
  providers: [InformeGcService],
})
export class InformeGcModule {}
