import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { PjesEscalaService } from './pjesescala.service';
import { CreatePjesEscalaDto } from './dtos/create-pjesescala.dto';
import { ReturnPjesEscalaDto } from './dtos/return-pjesescala.dto';
import { UpdatePjesEscalaDto } from './dtos/update-pjesescala.dto';
import { User } from 'src/decorators/user.decorator';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserType } from 'src/user/enum/user-type.enum';
import { UpdateStatusPjesEscalaDto } from './dtos/update-status-pjesescala.dto';
import { Response } from 'express';
import { CreateComentarioDto } from './dtos/create-comentario.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pjesescala')
export class PjesEscalaController {
  constructor(private readonly service: PjesEscalaService) {}

  //PESQUISAR ESCALA DO USUARIO LOGADO
  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get('minhas-escalas')
  async getMinhasEscalas(
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
    @User() user?: LoginPayload,
  ): Promise<any> {
    return this.service.getMinhasEscalas(user.mat, ano, mes);
  }

  //PESQUISAR QUALQUER ESCALA PELO INPUT
  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get('escalas-por-matricula')
  async getEscalasPorMatricula(
    @Query('mat') matSgp: number,
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
  ): Promise<any> {
    return this.service.getMinhasEscalas(matSgp, ano, mes);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get('cotas')
  async getCotasPorMatricula(
    @Query('matSgp') matSgp: number,
    @Query('ano') ano: number,
    @Query('mes') mes: number,
  ) {
    return this.service.getCotasDetalhadasPorMatricula(matSgp, ano, mes);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get('quantidade')
  async getQuantidadePorMatriculaAnoMes(
  @Query('matSgp') matSgp: number,
  @Query('ano') ano: number,
  @Query('mes') mes: number,
): Promise<number> {
  // Usa o método otimizado passando uma lista com uma matrícula só
  const resultados = await this.service.getQuantidadePorVariosMatriculas([matSgp], ano, mes);
  const resultado = resultados.find((r) => r.matSgp === matSgp);
  return resultado?.total ?? 0;
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
    @Query('operacaoId') operacaoId?: number,
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
    @Query('page') page = 1,
    @Query('limit') limit = 100,
  ): Promise<ReturnPjesEscalaDto[]> {
    const escalas = await this.service.findAll(
      operacaoId,
      ano,
      mes,
      Number(page),
      Number(limit),
    );
    return escalas.map((e) => new ReturnPjesEscalaDto(e));
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
  ): Promise<ReturnPjesEscalaDto> {
    const escala = await this.service.findOne(id);
    return new ReturnPjesEscalaDto(escala);
  }

  @Roles(UserType.Master, UserType.Tecnico, UserType.Auxiliar)
  @Post()
  async create(
    @Body() dto: CreatePjesEscalaDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesEscalaDto> {
    const created = await this.service.create(dto, user);
    return new ReturnPjesEscalaDto(created);
  }

  @Roles(UserType.Master, UserType.Auxiliar,)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePjesEscalaDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesEscalaDto> {
    const updated = await this.service.update(id, dto, user);
    return new ReturnPjesEscalaDto(updated);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Put(':id/status')
  async updateStatusEscala(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusPjesEscalaDto,
    @User() user: LoginPayload,
  ): Promise<ReturnPjesEscalaDto> {
    return this.service.updateStatusEscala(id, dto, user);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Post(':id/comentario')
  async registrarObs(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateComentarioDto,
    @User() user: LoginPayload,
  ): Promise<void> {
    return this.service.registrarObs(id, dto, user);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Delete('comentario/:comentarioId')
  async removerObs(
    @Param('comentarioId', ParseIntPipe) comentarioId: number,
    @User() user: LoginPayload,
  ): Promise<void> {
    return this.service.removerObs(comentarioId, user);
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
    UserType.Comum,
  )
  @Get(':id/comentario')
  async listarComentarios(@Param('id', ParseIntPipe) id: number) {
    return this.service.listarComentarios(id);
  }

  @Roles(UserType.Master, UserType.Tecnico, UserType.Auxiliar)
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: LoginPayload,
  ): Promise<void> {
    return this.service.remove(id, user);
  }

  @Roles(UserType.Master, UserType.Tecnico, UserType.Auxiliar)
  @Get('exportar')
  async exportarEscala(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
    @User() user: LoginPayload,
    @Res() res: Response,
  ) {
    return this.service.exportarParaExcel(mes, ano, user, res);
  }

  @Roles(UserType.Master, UserType.Tecnico, UserType.Auxiliar)
  @Get('excel')
  async gerarExcel(
    @Query('mes', ParseIntPipe) mes: number,
    @Query('ano', ParseIntPipe) ano: number,
    @Query('regularOuAtrasado') regularOuAtrasado: string, // 👈 Novo parâmetro
    @Res() res: Response,
  ) {
    console.log(
      'mes:',
      mes,
      'ano:',
      ano,
      'regularOuAtrasado:',
      regularOuAtrasado,
    );
    return this.service.gerarExcel(mes, ano, regularOuAtrasado, null, res);
  }
}
