import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjesEventoService } from './pjesevento.service';
import { PjesEventoController } from './pjesevento.controller';
import { PjesEventoEntity } from './entities/pjesevento.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PjesDistEntity } from 'src/pjesdist/entities/pjesdist.entity';
import { PjesEscalaEntity } from 'src/pjesescala/entities/pjesescala.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PjesEventoEntity,
      PjesDistEntity,
      PjesEscalaEntity,
    ]),
    AuthModule,
  ],
  providers: [PjesEventoService],
  controllers: [PjesEventoController],
  exports: [TypeOrmModule, PjesEventoService],
})
export class PjesEventoModule {}
