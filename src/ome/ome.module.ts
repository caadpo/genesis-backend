import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OmeEntity } from './entities/ome.entity';
import { DiretoriaEntity } from 'src/diretoria/entities/diretoria.entity';
import { OmeService } from './ome.service';
import { OmeController } from './ome.controller';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OmeEntity,
      PjesEventoEntity, // ✅ Adiciona aqui também
      DiretoriaEntity,
    ]),
  ],
  providers: [OmeService],
  controllers: [OmeController],
  exports: [TypeOrmModule],
})
export class OmeModule {}
