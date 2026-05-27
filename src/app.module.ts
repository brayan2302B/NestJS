import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VersionesModule } from './versiones/versiones.module';
import { InformesModule } from './informes/informes.module';
import { NovedadesModule } from './novedades/novedades.module';

@Module({
  imports: [VersionesModule, InformesModule, NovedadesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
