import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from './personas/personas.module';
import { AreasModule } from './areas/areas.module';
import { RolModule } from './rol/rol.module';
import { ContratosModule } from './contratos/contratos.module';
import { ObligacionesModule } from './obligaciones/obligaciones.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'Clave123',
      database: 'proyecto_formativo',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    PersonasModule,
    AreasModule,
    RolModule,
    ContratosModule,
    ObligacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
