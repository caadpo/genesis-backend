import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DpoService } from './dpo.service';
import { DpoController } from './dpo.controller';
import { DpoEntity } from './entities/dpo.entity';
import { DiretoriaModule } from 'src/diretoria/diretoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([DpoEntity]), DiretoriaModule],
  providers: [DpoService],
  controllers: [DpoController],
  exports: [TypeOrmModule, DiretoriaModule],
})
export class DpoModule {}
