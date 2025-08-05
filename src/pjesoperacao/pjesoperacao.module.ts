import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjesOperacaoEntity } from './entities/pjesoperacao.entity';
import { PjesOperacaoService } from './pjesoperacao.service';
import { PjesOperacaoController } from './pjesoperacao.controller';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PjesOperacaoEntity, PjesEventoEntity]),
    AuthModule,
  ],
  providers: [PjesOperacaoService],
  controllers: [PjesOperacaoController],
  exports: [TypeOrmModule, PjesOperacaoService],
})
export class PjesOperacaoModule {}
