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
import { In, DataSource } from 'typeorm';
import { OmeEntity } from 'src/ome/entities/ome.entity';

import { Req } from '@nestjs/common';
import { Request } from 'express';

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
  ): Promise<ReturnPjesTetoDto[]> {
    return this.pjestetoService.findAll(ano, mes);
  }

  @Get('resumo-por-ome')
  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Diretor,
    UserType.Superintendente,
    UserType.Auxiliar,
    UserType.Comum,
  )
  async getResumoPorOme(
    @Req() req: Request,
    @Query('ano') ano?: number,
    @Query('mes') mes?: number,
  ): Promise<any[]> {
    const user = req.user as any;
    const userType = user.typeUser;
    const userDiretoriaId = user.ome?.diretoriaId ?? user.diretoriaId;
    const userOmeId = user.omeId;

    const tetos = await this.pjestetoService.findAll(ano, mes);

    const omeMap = new Map<string, any>();

    for (const teto of tetos) {
      for (const dist of teto.dists ?? []) {
        for (const evento of dist.eventos ?? []) {
          const ome = evento.ome;
          if (!ome) continue;

          const omeId = ome.id;
          const omeNome = ome.nomeOme;
          const codVerba = teto.codVerba;

          const key = `${omeId}-${codVerba}`;

          if (!omeMap.has(key)) {
            omeMap.set(key, {
              omeId,
              ome: omeNome,
              pjesOfEvento: 0,
              pjesPrcEvento: 0,
              ttCotaOf: 0,
              ttCotaPrc: 0,
              autorizadas: 0,
              homologadas: 0,
              pendentes: 0,
              codVerba,
            });
          }

          const item = omeMap.get(key);
          item.pjesOfEvento += evento.ttCtOfEvento ?? 0;
          item.pjesPrcEvento += evento.ttCtPrcEvento ?? 0;

          for (const operacao of evento.pjesoperacoes ?? []) {
            for (const escala of operacao.pjesescalas ?? []) {
              if (escala.ome?.id !== omeId) continue;

              if (escala.tipoSgp === 'O') {
                item.ttCotaOf += escala.ttCota ?? 0;
              } else if (escala.tipoSgp === 'P') {
                item.ttCotaPrc += escala.ttCota ?? 0;
              }

              switch (escala.statusEscala) {
                case 'AUTORIZADA':
                  item.autorizadas++;
                  break;
                case 'HOMOLOGADA':
                  item.homologadas++;
                  break;
                case 'PENDENTE':
                  item.pendentes++;
                  break;
              }
            }
          }
        }
      }
    }

    // Coletar apenas os omeIds únicos
    const omeIds = Array.from(
      new Set(Array.from(omeMap.values()).map((item) => item.omeId)),
    );

    const omeRepository = this.dataSource.getRepository(OmeEntity);
    const omes = await omeRepository.find({
      where: { id: In(omeIds) },
      relations: ['diretoria'],
    });

    const diretoriaMap = new Map<number, any>();

    for (const ome of omes) {
      const diretoriaId = ome.diretoria?.id;
      const itensDoOme = Array.from(omeMap.values()).filter(
        (i) => i.omeId === ome.id,
      );

      for (const omeResumo of itensDoOme) {
        // Filtro por tipo de usuário
        if (userType === UserType.Diretor && diretoriaId !== userDiretoriaId) {
          continue;
        }

        if (
          [UserType.Auxiliar, UserType.Comum].includes(userType) &&
          ome.id !== userOmeId
        ) {
          continue;
        }

        if (!diretoriaMap.has(diretoriaId)) {
          diretoriaMap.set(diretoriaId, {
            diretoriaId,
            nomeDiretoria: ome.diretoria?.nomeDiretoria ?? 'Sem Diretoria',
            omes: [],
          });
        }

        diretoriaMap.get(diretoriaId).omes.push(omeResumo);
      }
    }

    return Array.from(diretoriaMap.values());
  }

  @Roles(
    UserType.Master,
    UserType.Tecnico,
    UserType.Superintendente,
    UserType.Diretor,
    UserType.Auxiliar,
  )
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ReturnPjesTetoDto> {
    return this.pjestetoService.findOne(id);
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
