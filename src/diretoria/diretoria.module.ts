import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiretoriaService } from './diretoria.service';
import { DiretoriaController } from './diretoria.controller';
import { DiretoriaEntity } from './entities/diretoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiretoriaEntity])],
  providers: [DiretoriaService],
  controllers: [DiretoriaController],
  exports: [TypeOrmModule],
})
export class DiretoriaModule {}
