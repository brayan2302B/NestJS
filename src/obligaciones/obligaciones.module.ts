import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObligacionesService } from './obligaciones.service';
import { ObligacionesController } from './obligaciones.controller';
import { Obligacione } from './entities/obligacione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Obligacione])],
  controllers: [ObligacionesController],
  providers: [ObligacionesService],
})
export class ObligacionesModule {}
