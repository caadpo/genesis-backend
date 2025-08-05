import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '../user/enum/user-type.enum';
import { MasterEntity } from './entities/master.entity';
import { ReturnMasterDTO } from './dtos/return-master.dto';
import { MasterService } from './master.service';
import { CreateMasterDTO } from './dtos/create-master.dto';
import { UpdateMasterDTO } from './dtos/update-master.dto';

@Roles(
  UserType.Master,
  UserType.Superintendente,
  UserType.Auxiliar,
  UserType.Comum,
)
@UsePipes(ValidationPipe)
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @Get()
  async findAll(): Promise<ReturnMasterDTO[]> {
    return (await this.masterService.findAll()).map(
      (master) => new ReturnMasterDTO(master),
    );
  }

  @Post()
  async createMaster(
    @Body() createMaster: CreateMasterDTO,
  ): Promise<MasterEntity> {
    return this.masterService.createMaster(createMaster);
  }

  @Delete('/:masterId')
  async deleteMaster(
    @Param('masterId') masterId: number,
  ): Promise<DeleteResult> {
    return this.masterService.deleteMaster(masterId);
  }

  @Put('/:masterId')
  async updateMaster(
    @Body() updateMaster: UpdateMasterDTO,
    @Param('masterId') masterId: number,
  ): Promise<MasterEntity> {
    return this.masterService.updateMaster(updateMaster, masterId);
  }
}
