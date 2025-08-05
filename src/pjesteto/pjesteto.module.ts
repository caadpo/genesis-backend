import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjesTetoEntity } from './entities/pjesteto.entity';
import { PjesTetoService } from './pjesteto.service';
import { PjesTetoController } from './pjesteto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PjesTetoEntity])],
  providers: [PjesTetoService],
  controllers: [PjesTetoController],
})
export class PjestetoModule {}
