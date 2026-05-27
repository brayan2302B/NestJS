import { Module } from '@nestjs/common';
import { InformeGfService } from './informe-gf.service';
import { InformeGfController } from './informe-gf.controller';

@Module({
  controllers: [InformeGfController],
  providers: [InformeGfService],
})
export class InformeGfModule {}
