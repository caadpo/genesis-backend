import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { AuxiliarEntity } from './entities/auxiliar.entity';
import { AuxiliarService } from './auxiliar.service';
import { AuxiliarController } from './auxiliar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuxiliarEntity]), UserModule],
  providers: [AuxiliarService],
  controllers: [AuxiliarController],
})
export class AuxiliarModule {}
