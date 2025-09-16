import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatePjesTetoDto } from './dtos/create-pjesteto.dto';
import { ReturnPjesTetoDto } from './dtos/return-pjesteto.dto';
import { PjesTetoService } from './pjesteto.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UserType } from 'src/user/enum/user-type.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { DataSource } from 'typeorm';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { User } from 'src/decorators/user.decorator';

@Controller('pjesteto')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PjesTetoController {
  constructor(
    private readonly pjestetoService: PjesTetoService,
    private readonly dataSource: DataSource,
  ) {}

  @Roles(UserType.Master)
  @Post()
  async create(@Body() dto: CreatePjesTetoDto): Promise<ReturnPjesTetoDto> {
    return this.pjestetoService.create(dto);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get()
  async findAll(
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
    @User() user?: LoginPayload, // ← adicionar isso
  ): Promise<ReturnPjesTetoDto[]> {
    return this.pjestetoService.findAll(ano, mes, user); // ← passar o user
  }


  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Get(':id')
async findOne(
  @Param('id') id: number,
  @User() user: LoginPayload,
): Promise<ReturnPjesTetoDto> {
  return this.pjestetoService.findOne(id, user);
}

  @Roles(UserType.Master)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: CreatePjesTetoDto,
  ): Promise<ReturnPjesTetoDto> {
    return this.pjestetoService.update(id, dto);
  }

  @Roles(UserType.Master)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.pjestetoService.remove(id);
  }
}
