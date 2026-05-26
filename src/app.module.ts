import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasModule } from './personas/personas.module';
import { AreasModule } from './areas/areas.module';
import { RolModule } from './rol/rol.module';

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
  ],
})
export class AppModule {}