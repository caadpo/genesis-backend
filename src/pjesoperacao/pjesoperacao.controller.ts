import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { PjesOperacaoService } from './pjesoperacao.service';
import { ReturnPjesOperacaoDto } from './dtos/return-pjesoperacao.dto';
import { CreatePjesOperacaoDto } from './dtos/create-pjesoperacao.dto';
import { User } from 'src/decorators/user.decorator';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateStatusPjesOperacaoDto } from './dtos/update-status-pjesoperacao.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserType } from 'src/user/enum/user-type.enum';

import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('pjesoperacao')
export class PjesOperacaoController {
  constructor(private readonly pjesOperacaoService: PjesOperacaoService) {}

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() dto: CreatePjesOperacaoDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    return this.pjesOperacaoService.create(dto, user);
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
  async findAll(): Promise<ReturnPjesOperacaoDto[]> {
    return this.pjesOperacaoService.findAll();
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReturnPjesOperacaoDto> {
    return this.pjesOperacaoService.findOne(id);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get('by-codop/:codOp*')
async findByCodOp(
  @Param('codOp') codOp: string | string[],
): Promise<ReturnPjesOperacaoDto> {
  const codOpStr = Array.isArray(codOp) ? codOp.join('/') : codOp;
  return this.pjesOperacaoService.findByCodOp(codOpStr);
}

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePjesOperacaoDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    return this.pjesOperacaoService.update(id, dto, user); // <-- passa para o service
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Put(':id/status')
  async updateStatusOperacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusPjesOperacaoDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesOperacaoDto> {
    return this.pjesOperacaoService.updateStatusOperacao(id, dto, user);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: LoginPayload, // <-- adiciona isso
  ): Promise<void> {
    return this.pjesOperacaoService.remove(id, user); // <-- passa para o service
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Get('pdf/:codOp')
  async exportPdf(
    @Param('codOp') codOp: string,
    @Res() res: Response,
    @User() user: LoginPayload,
  ): Promise<void> {
    return this.pjesOperacaoService.exportPdfByCodOp(codOp, res, user);
  }
}
