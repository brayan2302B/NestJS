import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenciasService } from './evidencias.service';
import { EvidenciasController } from './evidencias.controller';
import { Evidencia } from './entities/evidencia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evidencia])],
  controllers: [EvidenciasController],
  providers: [EvidenciasService],
  exports: [EvidenciasService],
})
export class EvidenciasModule {}