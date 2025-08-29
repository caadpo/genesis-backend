import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Not, Raw, Repository } from 'typeorm';
import { PjesEscalaEntity } from './entities/pjesescala.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { CreatePjesEscalaDto } from './dtos/create-pjesescala.dto';
import { UpdatePjesEscalaDto } from './dtos/update-pjesescala.dto';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { OmeEntity } from 'src/ome/entities/ome.entity';
import { DataSource } from 'typeorm';
import { ReturnPjesEscalaDto } from './dtos/return-pjesescala.dto';
import { UpdateStatusPjesEscalaDto } from './dtos/update-status-pjesescala.dto';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { Response } from 'express';
import { PjesEscalaStatusLogEntity } from './entities/pjesescala-status-log.entity';
import { CreateComentarioDto } from './dtos/create-comentario.dto';
import { PjesEscalaComentarioEntity } from './entities/pjesescala-comentario.entity';
import { MinhasEscalasDto } from './dtos/minhas-escalas.dto';

@Injectable()
export class PjesEscalaService {
  constructor(
    @InjectRepository(PjesEscalaEntity)
    private readonly pjesEscalaRepository: Repository<PjesEscalaEntity>,

    @InjectRepository(PjesEventoEntity)
    private readonly pjesEventoRepository: Repository<PjesEventoEntity>,

    @InjectRepository(OmeEntity)
    private readonly omeRepository: Repository<OmeEntity>,

    @InjectRepository(PjesEscalaStatusLogEntity)
    private readonly escalaStatusLogRepository: Repository<PjesEscalaStatusLogEntity>,

    @InjectRepository(PjesEscalaComentarioEntity)
    private readonly escalaComentarioRepository: Repository<PjesEscalaComentarioEntity>,

    private readonly dataSource: DataSource,
  ) {}

  private verificarPermissaoDeAcesso(
    evento: PjesEventoEntity,
    user: LoginPayload,
  ): void {
    const { typeUser, omeId: userOmeId } = user;

    if (typeUser !== 10 && typeUser !== 5 && evento.omeId !== userOmeId) {
      throw new BadRequestException(
        'Você não tem permissão para modificar escalas de um Evento de outra UNIDADE.',
      );
    }
  }

  private async verificarLimiteCotasPorMatricula(
    matSgp: number,
    dataInicio: Date,
    novaCota: number,
    manager: EntityManager,
    escalaIdParaIgnorar?: number,
  ): Promise<void> {
    const mes = dataInicio.getMonth() + 1;
    const ano = dataInicio.getFullYear();

    const queryBuilder = manager
      .getRepository(PjesEscalaEntity)
      .createQueryBuilder('escala')
      .setLock('pessimistic_write') // <-- LOCK que evita concorrência
      .where('escala.matSgp = :matSgp', { matSgp })
      .andWhere('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes })
      .andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano });

    if (escalaIdParaIgnorar) {
      queryBuilder.andWhere('escala.id != :id', { id: escalaIdParaIgnorar });
    }

    const totalCotas = await manager
    .getRepository(PjesEscalaEntity)
    .createQueryBuilder('escala')
    .setLock('pessimistic_write')
    .select('SUM(escala.ttCota)', 'total')
    .where('escala.matSgp = :matSgp', { matSgp })
    .andWhere('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes })
    .andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano })
    .andWhere(escalaIdParaIgnorar ? 'escala.id != :id' : '1=1', { id: escalaIdParaIgnorar })
    .getRawOne()
    .then(res => Number(res.total) || 0);


    if (totalCotas + novaCota > 12) {
      throw new BadRequestException(
        'Usuário não pode ultrapassar o limite de cotas mensais (12).',
      );
    }
  }

  async getCotasDetalhadasPorMatricula(
    matSgp: number,
    ano: number,
    mes: number,
  ): Promise<{ dia: string; nomeOme: string; ttCota: number }[]> {
    const escalas = await this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .leftJoinAndSelect('escala.ome', 'ome')
      .where('escala.matSgp = :matSgp', { matSgp })
      .andWhere('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes })
      .andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano })
      .orderBy('escala.dataInicio', 'ASC')
      .getMany();

    return escalas.map((escala) => ({
      dia: new Date(escala.dataInicio).toISOString().split('T')[0],
      nomeOme: escala.ome?.nomeOme || escala.omeSgp,
      ttCota: escala.ttCota,
    }));
  }

  async getMinhasEscalas(
    matSgp: number,
    ano?: number,
    mes?: number,
    page = 1,
    limit = 50,
  ): Promise<MinhasEscalasDto[]> {
    const query = this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .leftJoinAndSelect('escala.ome', 'ome')
      .leftJoinAndSelect('escala.pjesoperacao', 'pjesoperacao')
      .leftJoinAndSelect('escala.statusLogs', 'statusLogs')
      .where('escala.matSgp = :matSgp', { matSgp });
  
    if (ano) query.andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano });
    if (mes) query.andWhere('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes });
  
    query.orderBy('escala.dataInicio', 'ASC');
    query.skip((page - 1) * limit);
    query.take(limit);
  
    const escalas = await query.getMany();
  
    return escalas.map(escala => {
      const ultimoLog = escala.statusLogs.reduce((prev, curr) =>
        curr.dataAlteracao > prev.dataAlteracao ? curr : prev
      , escala.statusLogs[0]);
  
      return {
        dia: new Date(escala.dataInicio).toISOString().split('T')[0],
        nomeOperacao: escala.pjesoperacao?.nomeOperacao ?? '',
        nomeOme: escala.ome?.nomeOme ?? escala.omeSgp,
        localApresentacaoSgp: escala.localApresentacaoSgp,
        situacaoSgp: escala.situacaoSgp,
        horaInicio: escala.horaInicio,
        horaFinal: escala.horaFinal,
        funcao: escala.funcao,
        statusEscala: escala.statusEscala,
        anotacaoEscala: escala.anotacaoEscala,
        ttCota: escala.ttCota,
        codOp: escala.pjesoperacao?.CodOp,
        ultimoStatusLog: ultimoLog ? {
          novoStatus: ultimoLog.novoStatus,
          dataAlteracao: ultimoLog.dataAlteracao.toISOString(),
          pg: ultimoLog.pg,
          imagemUrl: ultimoLog.imagemUrl,
          nomeGuerra: ultimoLog.nomeGuerra,
          nomeOme: ultimoLog.nomeOme,
        } : undefined,
        comentarios: escala.comentarios?.map(comentario => ({
          id: comentario.id,
          comentario: comentario.comentario,
          createdAt: comentario.createdAt,
          autor: {
            nomeGuerra: comentario.autor?.nomeGuerra,
            nomeOme: comentario.autor?.ome?.nomeOme,
            imagemUrl: comentario.autor?.imagemUrl,
          },
        })),
      };
    });
  }
  
  async getQuantidadePorMatriculaAnoMes(
    matSgp: number,
    ano: number | string,
    mes: number | string,
  ): Promise<number> {
    const parsedAno = parseInt(ano as string, 10);
    const parsedMes = parseInt(mes as string, 10);

    if (isNaN(parsedAno) || isNaN(parsedMes)) {
      throw new BadRequestException('Ano ou mês inválido');
    }

    const inicio = new Date(parsedAno, parsedMes - 1, 1);
    const fim = new Date(parsedAno, parsedMes, 0, 23, 59, 59, 999); // fim do mês

    const resultado = await this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .select('SUM(escala.ttCota)', 'total')
      .where('escala.matSgp = :matSgp', { matSgp })
      .andWhere('escala.dataInicio BETWEEN :inicio AND :fim', {
        inicio,
        fim,
      })
      .getRawOne();

    return Number(resultado.total) || 0;
  }

  async create(
    dto: CreatePjesEscalaDto,
    user: LoginPayload,
  ): Promise<PjesEscalaEntity> {
    return this.dataSource.transaction(async (manager) => {
      const evento = await manager.findOne(PjesEventoEntity, {
        where: { id: dto.pjesEventoId },
        relations: ['pjesdist'],
      });

      if (!evento) throw new NotFoundException('Evento não encontrado');

      /*VERIFICAÇÃO SE O USER LOGADO É O MESMO PARA O QUAL FOI DESTINADO O EVENTO */
      /*EXCETO PARA: USUARIO MASTER E TECNICO*/
      this.verificarPermissaoDeAcesso(evento, user);

      if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
        throw new BadRequestException(
          'Evento homologado. Contate o Administrador.',
        );
      }

      const operacao = await manager.findOne(PjesOperacaoEntity, {
        where: { id: dto.pjesOperacaoId },
        relations: ['pjesescalas'],
      });

      if (!operacao) throw new NotFoundException('Operação não encontrada');

      // Conversão segura da dataInicio, sem interferência de timezone
      const [anoStr, mesStr, diaStr] = dto.dataInicio.split('-');
      const dataInicio = new Date(
        Number(anoStr),
        Number(mesStr) - 1,
        Number(diaStr),
      );

      const mes = dataInicio.getMonth() + 1;
      const ano = dataInicio.getFullYear();

      if (mes !== evento.mes || ano !== evento.ano) {
        throw new BadRequestException(
          'A data de início não corresponde ao mês/ano do evento.',
        );
      }

      const ttCotaCalculado = dto.horaInicio === dto.horaFinal ? 2 : 1;
      const tipo = dto.tipoSgp?.toUpperCase();

      if (tipo === 'O') {
        const totalCotasOf = await manager
          .getRepository(PjesEscalaEntity)
          .createQueryBuilder('escala')
          .where('escala.pjesOperacaoId = :operacaoId', {
            operacaoId: dto.pjesOperacaoId,
          })
          .andWhere('UPPER(escala.tipoSgp) = :tipo', { tipo: 'O' })
          .select('SUM(escala.ttCota)', 'total')
          .getRawOne()
          .then((res) => Number(res.total) || 0);

        if (totalCotasOf + ttCotaCalculado > operacao.ttCtOfOper) {
          throw new BadRequestException(
            `Não há mais cotas de Oficiais para esse Evento ou Operação`,
          );
        }
      } else if (tipo === 'P') {
        const totalCotasPrc = await manager
          .getRepository(PjesEscalaEntity)
          .createQueryBuilder('escala')
          .where('escala.pjesOperacaoId = :operacaoId', {
            operacaoId: dto.pjesOperacaoId,
          })
          .andWhere('UPPER(escala.tipoSgp) = :tipo', { tipo: 'P' })
          .select('SUM(escala.ttCota)', 'total')
          .getRawOne()
          .then((res) => Number(res.total) || 0);

        if (totalCotasPrc + ttCotaCalculado > operacao.ttCtPrcOper) {
          throw new BadRequestException(
            `Não há mais cotas de Praças para esse Evento ou Operação`,
          );
        }
      } else {
        throw new BadRequestException(`tipoSgp inválido. Use 'O' ou 'P'.`);
      }

      const ome = await manager.findOne(OmeEntity, {
        where: { id: dto.omeId },
      });

      if (!ome) {
        throw new NotFoundException(`OME não encontrada com id: ${dto.omeId}`);
      }

      const escalaExistente = await manager
        .getRepository(PjesEscalaEntity)
        .createQueryBuilder('escala')
        .where('escala.matSgp = :matSgp', { matSgp: dto.matSgp })
        .andWhere('escala.dataInicio = :dataInicio', {
          dataInicio: dto.dataInicio,
        })
        .getOne();

      if (escalaExistente) {
        // Busca a OME da escala existente
        const omeDaEscalaExistente = await manager.findOne(OmeEntity, {
          where: { id: escalaExistente.omeId },
        });

        throw new BadRequestException(
          `Já existe uma escala para o militar ${dto.matSgp} na data ${
            dto.dataInicio
          } na OME: ${omeDaEscalaExistente?.nomeOme || 'desconhecida'}.`,
        );
      }

      await this.verificarLimiteCotasPorMatricula(
        dto.matSgp,
        dataInicio,
        ttCotaCalculado,
        manager,
      );

      const escala = manager.create(PjesEscalaEntity, {
        ...dto,
        ttCota: ttCotaCalculado,
        dataFinal: dto.dataInicio,
        codVerba: operacao.codVerba,
      });

      const saved = await manager.save(escala);

      return manager.findOne(PjesEscalaEntity, {
        where: { id: saved.id },
        relations: ['pjesoperacao', 'pjesevento'],
      });
    });
  }

  async findAll(
    operacaoId?: number,
    ano?: number,
    mes?: number,
    page = 1,
    limit = 50,
  ): Promise<PjesEscalaEntity[]> {
    const query = this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .leftJoinAndSelect('escala.pjesoperacao', 'pjesoperacao')
      .leftJoinAndSelect('escala.pjesevento', 'pjesevento');
  
    if (operacaoId) query.andWhere('escala.pjesOperacaoId = :operacaoId', { operacaoId });
    if (ano) query.andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano });
    if (mes) query.andWhere('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes });
  
    query
      .orderBy('escala.dataInicio', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
  
    return await query.getMany();
  }
  

  async findOne(id: number): Promise<PjesEscalaEntity> {
    const escala = await this.pjesEscalaRepository.findOne({
      where: { id },
      relations: ['pjesoperacao', 'pjesevento', 'pjesevento.pjesdist'],
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    return escala;
  }

  async update(
    id: number,
    dto: UpdatePjesEscalaDto,
    user: LoginPayload,
  ): Promise<PjesEscalaEntity> {
    return this.dataSource.transaction(async (manager) => {
      const escalaAtual = await manager.findOne(PjesEscalaEntity, {
        where: { id },
        relations: ['pjesoperacao'],
      });

      if (!escalaAtual) {
        throw new NotFoundException('Escala não encontrada');
      }

      if (
        dto.pjesOperacaoId &&
        dto.pjesOperacaoId !== escalaAtual.pjesOperacaoId
      ) {
        throw new BadRequestException(
          'Não é permitido alterar o tipo da verba já criada.',
        );
      }

      const ome = await manager.findOne(OmeEntity, {
        where: { id: dto.omeId },
      });

      if (!ome) {
        throw new NotFoundException(`OME não encontrada com id: ${dto.omeId}`);
      }

      const eventoId = dto.pjesEventoId ?? escalaAtual.pjesEventoId;
      const evento = await manager.findOne(PjesEventoEntity, {
        where: { id: eventoId },
        relations: ['pjesdist'],
      });

      if (!evento) throw new NotFoundException('Evento não encontrado');

      this.verificarPermissaoDeAcesso(evento, user);

      if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
        throw new BadRequestException(
          'Evento homologado. Contate o Administrador.',
        );
      }

      const dataInicio = new Date(dto.dataInicio ?? escalaAtual.dataInicio);
      if (isNaN(dataInicio.getTime())) {
        throw new BadRequestException('Data de início inválida');
      }

      if (
        dataInicio.getMonth() + 1 !== evento.mes ||
        dataInicio.getFullYear() !== evento.ano
      ) {
        throw new BadRequestException(
          'A nova data de início não corresponde ao mês/ano do evento.',
        );
      }

      const matSgp = dto.matSgp ?? escalaAtual.matSgp;

      const existeoutra = await manager
        .getRepository(PjesEscalaEntity)
        .createQueryBuilder('escala')
        .where('escala.matSgp = :matSgp', { matSgp: dto.matSgp })
        .andWhere('escala.dataInicio = :dataInicio', {
          dataInicio: dto.dataInicio,
        })
        .andWhere('escala.id != :id', { id }) // evitar pegar a própria
        .getOne();

      if (existeoutra) {
        const omeDaEscala = await manager.findOne(OmeEntity, {
          where: { id: existeoutra.omeId },
        });

        throw new BadRequestException(
          `Já existe uma escala para o militar ${dto.matSgp} na data ${
            dto.dataInicio
          } na OME: ${omeDaEscala?.nomeOme || 'desconhecida'}.`,
        );
      }

      const horaInicio = dto.horaInicio ?? escalaAtual.horaInicio;
      const horaFinal = dto.horaFinal ?? escalaAtual.horaFinal;
      const novoTtCota = horaInicio === horaFinal ? 2 : 1;

      const tipoNovo = (dto.tipoSgp ?? escalaAtual.tipoSgp)?.toUpperCase();
      if (tipoNovo !== 'O' && tipoNovo !== 'P') {
        throw new BadRequestException(`tipoSgp inválido. Use 'O' ou 'P'.`);
      }

      const operacaoId = dto.pjesOperacaoId ?? escalaAtual.pjesOperacaoId;
      const operacao = await manager.findOne(PjesOperacaoEntity, {
        where: { id: operacaoId },
      });

      if (!operacao) throw new NotFoundException('Operação não encontrada');

      const totalCotasTipo = await manager
        .getRepository(PjesEscalaEntity)
        .createQueryBuilder('escala')
        .where('escala.pjesOperacaoId = :operacaoId', { operacaoId })
        .andWhere('UPPER(escala.tipoSgp) = :tipo', { tipo: tipoNovo })
        .select('SUM(escala.ttCota)', 'total')
        .getRawOne()
        .then((res) => Number(res.total) || 0);

      const totalFuturo = totalCotasTipo - escalaAtual.ttCota + novoTtCota;

      if (
        (tipoNovo === 'O' && totalFuturo > operacao.ttCtOfOper) ||
        (tipoNovo === 'P' && totalFuturo > operacao.ttCtPrcOper)
      ) {
        throw new BadRequestException(
          `Atualização inválida: cotas para ${
            tipoNovo === 'O' ? 'oficiais' : 'praças'
          } excederiam o limite (${totalFuturo} > ${
            tipoNovo === 'O' ? operacao.ttCtOfOper : operacao.ttCtPrcOper
          }).`,
        );
      }

      await this.verificarLimiteCotasPorMatricula(
        matSgp,
        dataInicio,
        novoTtCota,
        manager,
        id,
      );

      delete dto.pjesOperacaoId;

      await manager.update(PjesEscalaEntity, id, {
        ...dto,
        ttCota: novoTtCota,
      });

      return manager.findOne(PjesEscalaEntity, {
        where: { id },
        relations: ['pjesoperacao', 'pjesevento'],
      });
    });
  }

  async updateStatusEscala(
    id: number,
    dto: UpdateStatusPjesEscalaDto,
    user: LoginPayload,
  ): Promise<ReturnPjesEscalaDto> {
    const escala = await this.pjesEscalaRepository.findOne({
      where: { id },
      relations: ['pjesevento', 'pjesoperacao', 'pjesoperacao.pjesescalas'],
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    // Impede alteração se evento está homologado e usuário não é admin
    if (
      escala.pjesevento?.statusEvento === 'HOMOLOGADA' &&
      user.typeUser !== 1
    ) {
      throw new BadRequestException(
        'O Evento está homologado. Escala não pode ser modificada.',
      );
    }

    // 🔒 VERIFICA SE USUÁRIO ESTÁ ESCALADO COMO FISCAL OU AUX
    const escalasDaOperacao = escala.pjesoperacao?.pjesescalas ?? [];

    const autorizado = escalasDaOperacao.some(
      (e) =>
        e.userId === user.id && (e.funcao === 'FISCAL' || e.funcao === 'AUX'),
    );

    const temPermissaoExtra = user.omeId === 1 || user.tipo === 'O';

    if (!autorizado && !temPermissaoExtra) {
      throw new BadRequestException(
        'Apenas Oficiais, FISCAL ou AUX, Policiais da DPO podem realizar a checagem da escala.',
      );
    }

    // Atualiza status
    escala.statusEscala = dto.statusEscala;
    const saved = await this.pjesEscalaRepository.save(escala);

    // Salva log de alteração
    const log = this.escalaStatusLogRepository.create({
      escala: { id: escala.id } as any,
      novoStatus: dto.statusEscala,
      userId: user.id,
      pg: user.pg,
      imagemUrl: user.imagemUrl,
      nomeGuerra: user.nomeGuerra,
      nomeOme: user?.ome?.nomeOme ?? '',
    });

    await this.escalaStatusLogRepository.save(log);

    return new ReturnPjesEscalaDto(saved);
  }

  async registrarObs(
    id: number,
    dto: CreateComentarioDto,
    user: LoginPayload,
  ): Promise<void> {
    const escala = await this.pjesEscalaRepository.findOne({
      where: { id },
      relations: ['pjesevento', 'pjesoperacao', 'comentarios'],
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    const evento = escala.pjesevento;

    if (evento?.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Evento homologado. Não é possível comentar.',
      );
    }

    // 🔐 Verificar permissão
    const autorizado =
      escala.funcao === 'FISCAL' ||
      escala.funcao === 'AUX' ||
      escala.matSgp === user.mat ||
      user.omeId === 1 ||
      user.tipo === 'O';

    if (!autorizado) {
      throw new BadRequestException(
        'Você não tem permissão para comentar nesta escala.',
      );
    }

    // Criar comentário
    const comentario = this.escalaComentarioRepository.create({
      comentario: dto.comentario,
      escala: { id: escala.id },
      autor: { id: user.id },
    });

    await this.escalaComentarioRepository.save(comentario);
  }

  async removerObs(comentarioId: number, user: LoginPayload): Promise<void> {
    const comentario = await this.escalaComentarioRepository.findOne({
      where: { id: comentarioId },
      relations: ['autor'],
    });

    if (!comentario) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Só o autor ou usuários tipo 'O' ou da omeId 1 podem remover
    const podeRemover =
      comentario.autor.id === user.id || user.omeId === 1 || user.tipo === 'O';

    if (!podeRemover) {
      throw new BadRequestException(
        'Você não tem permissão para remover este comentário.',
      );
    }

    await this.escalaComentarioRepository.delete({ id: comentarioId });
  }

  async listarComentarios(
    escalaId: number,
  ): Promise<PjesEscalaComentarioEntity[]> {
    const escala = await this.pjesEscalaRepository.findOne({
      where: { id: escalaId },
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    return this.escalaComentarioRepository.find({
      where: { escala: { id: escalaId } },
      relations: ['autor'],
      order: { createdAt: 'DESC' }, // mais recentes primeiro
    });
  }

  async remove(id: number, user: LoginPayload): Promise<void> {
    const escala = await this.pjesEscalaRepository.findOne({
      where: { id },
      relations: ['pjesoperacao'],
    });

    if (!escala) {
      throw new NotFoundException('Escala não encontrada');
    }

    const operacao = escala.pjesoperacao;

    const evento = await this.pjesEventoRepository.findOne({
      where: { id: operacao.pjesEventoId },
      relations: ['pjesdist'],
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    this.verificarPermissaoDeAcesso(evento, user);

    if (evento.statusEvento === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Evento homologado. Voce não pode excluir esse registro.',
      );
    }

    /*VERIFICAÇÃO SE O USER LOGADO É O MESMO PARA O QUAL FOI DESTINADO O EVENTO */
    /*EXCETO PARA: USUARIO MASTER E TECNICO*/
    this.verificarPermissaoDeAcesso(evento, user);

    await this.pjesEscalaRepository.delete(id);
  }

  async exportarParaExcel(
    mes: number,
    ano: number,
    user: LoginPayload,
    res: Response,
  ): Promise<void> {
    const query = this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .leftJoin('escala.pjesoperacao', 'pjesoperacao') // JOIN com a operação
      .leftJoin('pjesoperacao.ome', 'ome') // JOIN com a OME
      .where('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes })
      .andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano });

    // 🔐 Restrição por OME se for auxiliar
    if (user.typeUser === 1) {
      query.andWhere('escala.omeId = :omeId', { omeId: user.omeId });
    }

    const dados = await query
      .select([
        'ome.nomeOme AS nomeome',
        'escala.pgSgp AS escala_pgsgp',
        'escala.matSgp AS escala_matsgp',
        'escala.nomeCompletoSgp AS escala_nomecompletosgp',
        'escala.omeSgp AS escala_omesgp',
        'escala.tipoSgp AS escala_tiposgp',
        'escala.nunfuncSgp AS escala_nunfuncsgp',
        'escala.nunvincSgp AS escala_nunvincsgp',
        'escala.dataInicio AS escala_datainicio',
        'escala.dataFinal AS escala_datafinal',
        'escala.codVerba AS escala_codverba',
        'escala.ttCota AS escala_ttcota',
      ])

      .getRawMany();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Escalas');

    // Cabeçalho
    worksheet.addRow([
      'OME',
      'pgSgp',
      'matSgp',
      'nomeCompletoSgp',
      'omeSgp',
      'tipoSgp',
      'nunfuncSgp',
      'nunvincSgp',
      'dataInicio',
      'dataFinal',
      'codVerba',
      'ttCota',
    ]);

    // Linhas
    for (const d of dados) {
      worksheet.addRow([
        d.nomeOme,
        d.escala_pgsgp,
        d.escala_matsgp,
        d.escala_nomecompletosgp,
        d.escala_omesgp,
        d.escala_tiposgp,
        d.escala_nunfuncsgp,
        d.escala_nunvincsgp,
        new Date(d.escala_datainicio),
        new Date(d.escala_datafinal),
        d.escala_codverba,
        d.escala_ttcota,
      ]);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=escala_${mes}_${ano}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private nomeMes(mes: number): string {
    const nomes = [
      'JAN',
      'FEV',
      'MAR',
      'ABR',
      'MAI',
      'JUN',
      'JUL',
      'AGO',
      'SET',
      'OUT',
      'NOV',
      'DEZ',
    ];
    return nomes[mes - 1] || '';
  }

  async gerarExcel(
    mes: number,
    ano: number,
    regularOuAtrasado: string, // 👈 Adicionado aqui
    user: LoginPayload,
    res: Response,
  ): Promise<void> {
    const query = this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .leftJoin('escala.pjesoperacao', 'pjesoperacao')
      .leftJoin('escala.pjesevento', 'pjesevento') // 👈 JOIN para acessar o evento
      .leftJoin('pjesoperacao.ome', 'ome')
      .where('EXTRACT(MONTH FROM escala.dataInicio) = :mes', { mes })
      .andWhere('EXTRACT(YEAR FROM escala.dataInicio) = :ano', { ano });

    if (user?.typeUser === 1) {
      query.andWhere('escala.omeId = :omeId', { omeId: user.omeId });
    }

    if (regularOuAtrasado) {
      query.andWhere(
        'TRIM(UPPER(pjesevento.regularOuAtrasado)) = :regularOuAtrasado',
        {
          regularOuAtrasado: regularOuAtrasado.trim().toUpperCase(),
        },
      );
    }

    const dados = await query
      .select([
        'ome.nomeOme AS nomeome',
        'escala.pgSgp',
        'escala.matSgp',
        'escala.nomeCompletoSgp',
        'escala.omeSgp',
        'escala.tipoSgp',
        'escala.nunfuncSgp',
        'escala.nunvincSgp',
        'escala.dataInicio',
        'escala.dataFinal',
        'escala.codVerba',
        'escala.ttCota',
      ])
      .getRawMany();

    const verbaMap = {
      247: 'GOVERNO',
      263: 'PATRULHA ESCOLAR',
      255: 'CTM BRT',
      251: 'ALEPE',
      253: 'MPPE',
      252: 'TJPE',
      260: 'CAMIL',
      250: 'FEDERAL',
      999: 'OE',
      266: 'TCE',
      257: 'CPRH',
    };

    const resumo: Record<string, number> = {};

    for (const item of dados) {
      const cod = item.escala_codverba;
      const tipo = item.escala_tiposgp;
      const key = `${cod}_${tipo}`;
      resumo[key] = (resumo[key] || 0) + (item.escala_ttcota ?? 0);
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Escalas');

    // 🔻 Desabilita as linhas de grade
    worksheet.views = [{ showGridLines: false }];

    // Imagens
    const imgPolicia = fs.readFileSync('src/assets/govpe.png');

    worksheet.mergeCells('A2:R3');

    const imageIdPolicia = workbook.addImage({
      buffer: imgPolicia,
      extension: 'png',
    });

    worksheet.addImage(imageIdPolicia, {
      tl: { col: 9, row: 1 },
      ext: { width: 150, height: 60 },
    });

    // Cabeçalho principal
    worksheet.mergeCells('B5:R5');
    worksheet.getCell('B5').value = `QUARTEL DO COMANDO GERAL`;
    worksheet.getCell('B5').font = { bold: true, size: 14 };
    worksheet.getCell('B5').alignment = { horizontal: 'center' };

    worksheet.mergeCells('B6:R6');
    worksheet.getCell('B6').value = `DIRETORIA DE PLANEJAMENTO OPERACIONAL`;
    worksheet.getCell('B6').font = { bold: true, size: 14 };
    worksheet.getCell('B6').alignment = { horizontal: 'center' };

    worksheet.mergeCells('B7:R7');
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, '0');
    const mesNome = this.nomeMes(agora.getMonth() + 1);
    const anoAtual = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const situacaoFormatada = `Situação: ${
      regularOuAtrasado?.toUpperCase() ?? ''
    }`;

    worksheet.getCell(
      'B7',
    ).value = `Recife, ${dia} de ${mesNome} de ${anoAtual} às ${hora}h${minuto}`;
    worksheet.getCell('B7').font = { bold: true, italic: true };
    worksheet.getCell('B7').alignment = { horizontal: 'right' };

    worksheet.getCell('B7').font = { bold: true, italic: true };
    worksheet.getCell('B7').alignment = { horizontal: 'right' };

    // 🔷 Título da Tabela de Resumo
    // Célula B8 com texto completo
    worksheet.mergeCells('B8:R8');
    const cellB8 = worksheet.getCell('B8');
    cellB8.value = `ASSUNTO: PRESTAÇÃO DE CONTAS - ${this.nomeMes(
      mes,
    )} - ${ano} - ${
      user?.ome?.nomeOme ?? 'NOME DA OME'
    } (${situacaoFormatada})`;

    cellB8.font = { bold: true };
    cellB8.alignment = { horizontal: 'left' };

    // Aplica cor ao trecho "Situação: ..."
    const startText = cellB8.value as string;
    const startIndex = startText.indexOf(situacaoFormatada);

    // Aplica rich text apenas se o trecho foi encontrado
    if (startIndex !== -1) {
      cellB8.value = {
        richText: [
          {
            text: startText.substring(0, startIndex),
            font: { bold: true },
          },
          {
            text: situacaoFormatada,
            font: {
              color: {
                argb:
                  regularOuAtrasado?.toUpperCase() === 'REGULAR'
                    ? '008000'
                    : 'FF0000', // Verde ou vermelho
              },
              bold: true,
            },
          },
        ],
      };
    }

    worksheet.getCell('B8').font = { bold: true };
    worksheet.getCell('B8').alignment = { horizontal: 'left' };

    worksheet.mergeCells('B9:R9');
    worksheet.getCell('B9').value = `Usuário gerador: ${user?.pg ?? ''} ${
      user?.mat ?? ''
    } ${user?.nomeGuerra ?? ''}`;
    worksheet.getCell('B9').font = { italic: true, bold: true };
    worksheet.getCell('B9').alignment = { horizontal: 'left' };

    worksheet.getCell('G11').value = `PLANILHA DE PRESTAÇÃO DE COTAS PJES`;
    worksheet.getCell('G11').font = { bold: true };
    worksheet.getCell('G11').alignment = { horizontal: 'left' };

    // 🔷 Título da Tabela de Resumo
    worksheet.getCell('B11').value = 'RESUMO DO USO DAS COTAS';
    worksheet.getCell('B11').font = { bold: true };
    worksheet.getCell('B11').alignment = { horizontal: 'left' };

    // 🔷 Cabeçalho da Tabela (linha 6)
    const resumoHeaderRow = 12;
    const resumoHeaders = ['COD', 'OPERAÇÃO', 'OFICIAIS', 'PRAÇAS'];

    resumoHeaders.forEach((header, i) => {
      const cell = worksheet.getCell(resumoHeaderRow, 2 + i); // colunas A, B, C, D
      cell.value = header;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 🔷 Dados do resumo a partir da linha 7
    let resumoRow = resumoHeaderRow + 1;
    const verbaCodes = Object.keys(verbaMap).map(Number);

    verbaCodes.forEach((codVerba, idx) => {
      const values = [
        codVerba,
        verbaMap[codVerba],
        resumo[`${codVerba}_O`] ?? 0,
        resumo[`${codVerba}_P`] ?? 0,
      ];

      const isEven = idx % 2 === 0;

      values.forEach((val, i) => {
        const cell = worksheet.getCell(resumoRow, 2 + i); // colunas A, B, C, D

        cell.value = val;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFF' : 'F2F2F2' },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'CCCCCC' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } },
        };
      });

      resumoRow++;
    });

    // Largura adequada das colunas A–D
    worksheet.getColumn(2).width = 10; // codVerba
    worksheet.getColumn(3).width = 25; // nomeVerba
    worksheet.getColumn(4).width = 10; // Oficiais
    worksheet.getColumn(5).width = 10; // Praças

    // 🔹 Cabeçalho da tabela da direita (linha 6)
    const startRow = 12;
    const startCol = 7; // Coluna G

    const headers = [
      'UNIDADE',
      'PG',
      'MATRICULA',
      'NOME COMPLETO',
      'OME',
      'TIPO',
      'NUNFUNC',
      'NUVINC',
      'DATA INICIO',
      'DATA FINAL',
      'COD',
      'COTA',
    ];

    // Cabeçalho na linha 6
    headers.forEach((header, i) => {
      const cell = worksheet.getCell(startRow, startCol + i);
      cell.value = header;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Largura personalizada das colunas da tabela da direita (colunas G → R)
    worksheet.getColumn(7).width = 12; // OME
    worksheet.getColumn(8).width = 6; // PG
    worksheet.getColumn(9).width = 14; // MATRÍCULA
    worksheet.getColumn(10).width = 40; // NOME COMPLETO
    worksheet.getColumn(11).width = 12; // OME (militar)
    worksheet.getColumn(12).width = 6; // TIPO
    worksheet.getColumn(13).width = 14; // NUNFUNC
    worksheet.getColumn(14).width = 8; // NUVINC
    worksheet.getColumn(15).width = 12; // DATA INICIO
    worksheet.getColumn(16).width = 12; // DATA FINAL
    worksheet.getColumn(17).width = 6; // COD
    worksheet.getColumn(18).width = 8; // COTA


    // 1️⃣ Ordem customizada das verbas
    const ordemCodVerba = [247, 255, 251, 253, 252, 250, 263, 260, 266, 257, 999]; // ou outra ordem desejada

    // 2️⃣ Ordenação do array 'dados'
    dados.sort((a, b) => {
      const posA = ordemCodVerba.indexOf(a.escala_codverba);
      const posB = ordemCodVerba.indexOf(b.escala_codverba);

      const prioridadeA = posA !== -1 ? posA : 99;
      const prioridadeB = posB !== -1 ? posB : 99;

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      // Se for a mesma verba, ordena por dataInicio
      const dataA = new Date(a.escala_datainicio);
      const dataB = new Date(b.escala_datainicio);

      return dataA.getTime() - dataB.getTime();
    });


    // 🔹 Dados a partir da linha 7
    dados.forEach((d, i) => {
      const row = startRow + 1 + i; // linha 7 em diante
      const isEven = i % 2 === 0;
      const values = [
        d.nomeome,
        d.escala_pgsgp,
        d.escala_matsgp,
        d.escala_nomecompletosgp,
        d.escala_omesgp,
        d.escala_tiposgp,
        d.escala_nunfuncsgp,
        d.escala_nunvincsgp,
        new Date(d.escala_datainicio),
        new Date(d.escala_datafinal),
        d.escala_codverba,
        d.escala_ttcota,
      ];

      values.forEach((val, j) => {
        const cell = worksheet.getCell(row, startCol + j);
        cell.value = val;

        // Datas com formatação
        if (j === 8 || j === 9) {
          cell.numFmt = 'dd/mm/yyyy';
        }

        // Centralizado
        cell.alignment = { horizontal: 'center', vertical: 'middle' };

        // Zebra
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFF' : 'F2F2F2' },
        };

        // Bordas
        cell.border = {
          top: { style: 'thin', color: { argb: 'CCCCCC' } },
          left: { style: 'thin', color: { argb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
          right: { style: 'thin', color: { argb: 'CCCCCC' } },
        };
      });
    });

    const ultimaLinha = worksheet.lastRow.number;
    const primeiraCol = 1; // Coluna A
    const ultimaCol = 19; // Coluna S (A = 1, S = 19)

    for (let col = primeiraCol; col <= ultimaCol; col++) {
      // 🔹 Topo
      worksheet.getCell(1, col).border = {
        ...worksheet.getCell(1, col).border,
        top: { style: 'thin' },
      };

      // 🔹 Base
      worksheet.getCell(ultimaLinha, col).border = {
        ...worksheet.getCell(ultimaLinha, col).border,
        bottom: { style: 'thin' },
      };
    }

    // 🔹 Laterais
    for (let row = 1; row <= ultimaLinha; row++) {
      // Esquerda (coluna A)
      worksheet.getCell(row, primeiraCol).border = {
        ...worksheet.getCell(row, primeiraCol).border,
        left: { style: 'thin' },
      };

      // Direita (coluna S)
      worksheet.getCell(row, ultimaCol).border = {
        ...worksheet.getCell(row, ultimaCol).border,
        right: { style: 'thin' },
      };
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=escala_${mes}_${ano}.xlsx`,
    );

    await worksheet.protect('genesispmpe', {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      pivotTables: false,
    });
    

    await workbook.xlsx.write(res);
    res.end();
  }
}
