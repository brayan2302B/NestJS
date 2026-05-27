import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionesService } from './versiones.service';
import { VersionesController } from './versiones.controller';
import { Version } from './entities/version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Version])],
  controllers: [VersionesController],
  providers: [VersionesService],
  exports: [TypeOrmModule],
})
export class VersionesModule {}