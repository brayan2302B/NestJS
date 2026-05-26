import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersonasModule } from './personas/personas.module';
import { AreasModule } from './areas/areas.module';
import { RolModule } from './rol/rol.module';

@Module({
  imports: [PersonasModule, AreasModule, RolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
