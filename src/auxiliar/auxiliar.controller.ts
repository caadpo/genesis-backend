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
import { ReturnAuxiliarDTO } from './dtos/return-auxiliar.dto';
import { AuxiliarService } from './auxiliar.service';
import { AuxiliarEntity } from './entities/auxiliar.entity';
import { UpdateAuxiliarDTO } from './dtos/update-auxiliar.dto';
import { CreateAuxiliarDTO } from './dtos/create-auxiliar.dto';

@Roles(
  UserType.Master,
  UserType.Superintendente,
  UserType.Auxiliar,
  UserType.Comum,
)
@UsePipes(ValidationPipe)
@Controller('auxilar')
export class AuxiliarController {
  constructor(private readonly auxilarService: AuxiliarService) {}

  @Get()
  async findAll(): Promise<ReturnAuxiliarDTO[]> {
    return (await this.auxilarService.findAll()).map(
      (auxilar) => new ReturnAuxiliarDTO(auxilar),
    );
  }

  @Post()
  async createAuxilar(
    @Body() createAuxiliar: CreateAuxiliarDTO,
  ): Promise<AuxiliarEntity> {
    return this.auxilarService.createAuxiliar(createAuxiliar);
  }

  @Delete('/:auxilarId')
  async deleteAuxiliar(
    @Param('auxilarId') auxilarId: number,
  ): Promise<DeleteResult> {
    return this.auxilarService.deleteAuxiliar(auxilarId);
  }

  @Put('/:auxilarId')
  async updateAuxiliar(
    @Body() updateAuxiliar: UpdateAuxiliarDTO,
    @Param('auxilarId') auxilarId: number,
  ): Promise<AuxiliarEntity> {
    return this.auxilarService.updateAuxiliar(updateAuxiliar, auxilarId);
  }
}
