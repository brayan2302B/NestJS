import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContratosModule } from './contratos/contratos.module';
import { ObligacionesModule } from './obligaciones/obligaciones.module';

@Module({
  imports: [ContratosModule, ObligacionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
