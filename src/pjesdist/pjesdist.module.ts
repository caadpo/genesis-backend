import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjesDistService } from './pjesdist.service';
import { PjesDistController } from './pjesdist.controller';
import { PjesDistEntity } from './entities/pjesdist.entity';
import { PjesTetoEntity } from 'src/pjesteto/entities/pjesteto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PjesDistEntity, PjesTetoEntity])],
  providers: [PjesDistService],
  controllers: [PjesDistController],
  exports: [TypeOrmModule],
})
export class PjesDistModule {}
