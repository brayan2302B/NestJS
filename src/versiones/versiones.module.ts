import { Module } from '@nestjs/common';
import { VersionesService } from './versiones.service';
import { VersionesController } from './versiones.controller';

@Module({
  controllers: [VersionesController],
  providers: [VersionesService],
})
export class VersionesModule {}
