import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterEntity } from './entities/master.entity';
import { UserModule } from 'src/user/user.module';
import { MasterService } from './master.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterEntity]), UserModule],
  providers: [MasterService],
  controllers: [MasterController],
})
export class MasterModule {}
