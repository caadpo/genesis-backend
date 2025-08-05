import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjesEscalaService } from './pjesescala.service';
import { PjesEscalaController } from './pjesescala.controller';
import { PjesEscalaEntity } from './entities/pjesescala.entity';
import { PjesEventoModule } from 'src/pjesevento/pjesevento.module';
import { PjesOperacaoModule } from 'src/pjesoperacao/pjesoperacao.module';
import { UserModule } from 'src/user/user.module';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
import { AuthModule } from 'src/auth/auth.module';
import { OmeEntity } from 'src/ome/entities/ome.entity';
import { OmeModule } from 'src/ome/ome.module';
import { prestarContaController } from './prestarContaController';
import { PjesEscalaStatusLogEntity } from './entities/pjesescala-status-log.entity';
import { PjesEscalaComentarioEntity } from './entities/pjesescala-comentario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PjesEscalaEntity,
      PjesEventoEntity,
      PjesOperacaoEntity,
      OmeEntity,
      PjesEscalaStatusLogEntity,
      PjesEscalaComentarioEntity,
    ]),
    PjesEventoModule,
    PjesOperacaoModule,
    UserModule,
    AuthModule,
    OmeModule,
  ],
  controllers: [PjesEscalaController, prestarContaController],
  providers: [PjesEscalaService],
})
export class PjesescalaModule {}
