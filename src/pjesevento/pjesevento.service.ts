import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { PjesEventoEntity } from './entities/pjesevento.entity';
import { ReturnPjesEventoDto } from './dtos/return-pjesevento.dto';
import { CreatePjesEventoDto } from './dtos/create-pjesevento.dto';
import { PjesDistEntity } from 'src/pjesdist/entities/pjesdist.entity';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { UpdateStatusPjesEventoDto } from './dtos/update-status-pjesevento.dto';
import { ReturnPjesOperacaoDto } from 'src/pjesoperacao/dtos/return-pjesoperacao.dto';
import { PjesEscalaEntity } from 'src/pjesescala/entities/pjesescala.entity';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
import { StatusEventoEnum } from 'src/utils/status-evento.enum';

@Injectable()
export class PjesEventoService {
  private readonly logger = new Logger(PjesEventoService.name);
  constructor(
    @InjectRepository(PjesEventoEntity)
    private readonly pjeseventoRepository: Repository<PjesEventoEntity>,

    @InjectRepository(PjesDistEntity)
    private readonly pjesDistRepository: Repository<PjesDistEntity>,

    @InjectRepository(PjesEscalaEntity)
    private readonly pjesEscalaRepository: Repository<PjesEscalaEntity>,
  ) {}

  async create(
    createDto: CreatePjesEventoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesEventoDto> {
    const { pjesDistId, ttCtOfEvento, ttCtPrcEvento } = createDto;

    // Busca a distribuição com seus eventos relacionados
    const dist = await this.pjeseventoRepository.manager
      .getRepository(PjesDistEntity)
      .findOne({
        where: { id: createDto.pjesDistId },
        relations: ['pjeseventos'],
      });

    if (!dist) {
      throw new NotFoundException('Distribuição base não encontrada');
    }

    const isHomologada = dist.statusDist === 'HOMOLOGADA';
    const isUserAutorizado = user.typeUser === 10 || user.typeUser === 5;
    if (isHomologada && !isUserAutorizado) {
      throw new BadRequestException(
        'Distribuição homologada. Contate o Administrador.',
      );
    }

    const isAtrasado = createDto.regularOuAtrasado === 'ATRASADO';
    if (isAtrasado && !isUserAutorizado) {
      throw new BadRequestException(
        'Você não tem permissão para criar eventos atrasados. Contate o Administrador.',
      );
    }

    // Soma os totais já distribuídos em eventos
    const totalOficiaisDistribuidos =
      dist.pjeseventos?.reduce((sum, ev) => sum + ev.ttCtOfEvento, 0) ?? 0;
    const totalPracasDistribuidos =
      dist.pjeseventos?.reduce((sum, ev) => sum + ev.ttCtPrcEvento, 0) ?? 0;

    // Soma com a nova requisição
    const novaSomaOf = totalOficiaisDistribuidos + ttCtOfEvento;
    const novaSomaPrc = totalPracasDistribuidos + ttCtPrcEvento;

    // Regras de validação
    if (novaSomaOf > dist.ttCtOfDist) {
      throw new BadRequestException(
        `Erro: Uso das cotas de oficiais excede o estabelecido pela distribuição`,
      );
    }

    if (novaSomaPrc > dist.ttCtPrcDist) {
      throw new BadRequestException(
        `Erro: Uso das cotas das praças excede o estabelecido pela distribuição`,
      );
    }

    if (dist.diretoriaId !== user.ome.diretoriaId) {
      throw new BadRequestException(
        `Voce não pode criar eventos de outra diretoria`,
      );
    }

    // Criação do evento
    const pjesevento = this.pjeseventoRepository.create({
      ...createDto,
      codVerba: dist.codVerba,
    });
    const saved = await this.pjeseventoRepository.save(pjesevento);

    // Recarrega com relação `ome` incluída
    const withRelations = await this.pjeseventoRepository.findOne({
      where: { id: saved.id },
      relations: ['ome'],
    });

    return new ReturnPjesEventoDto(withRelations);
  }

  async findAll(
    mes?: number,
    ano?: number,
    user?: LoginPayload,
  ): Promise<ReturnPjesEventoDto[]> {
    const where: any = {};

    if (mes) where.pjesdist = { mes };
    if (ano) where.pjesdist = { ...where.pjesdist, ano };

    const items = await this.pjeseventoRepository.find({
      where,
      relations: [
        'ome',
        'ome.diretoria',
        'pjesoperacoes',
        'pjesoperacoes.ome',
        'pjesoperacoes.pjesescalas',
        'pjesoperacoes.pjesescalas.comentarios', // ✅ necessário!
        'pjesoperacoes.pjesescalas.comentarios.autor', // ✅ opcional (se quiser detalhes do autor)
        'pjesdist',
        'pjesdist.diretoria',
      ],
      order: { omeId: 'DESC' },
    });

    let filtrados = items;

    if (user?.typeUser === 1) {
      filtrados = items.filter((evento) => evento.omeId === user.omeId);
    } else if (user?.typeUser === 3) {
      filtrados = items.filter((evento) => {
        if (evento.codVerba !== 247) {
          return evento.pjesdist?.diretoriaId === user.ome?.diretoriaId;
        }
        return evento.ome?.diretoriaId === user.ome?.diretoriaId;
      });
    }

    return filtrados.map((evento) => {
      const operacoesComDTO = evento.pjesoperacoes?.map(
        (op) => new ReturnPjesOperacaoDto(op),
      );

      const eventoDTO = new ReturnPjesEventoDto(evento, operacoesComDTO);

      return eventoDTO;
    });
  }

  async findAllResumoPorDiretoria(
    mes?: number,
    ano?: number,
    omeMin?: number,
    omeMax?: number,
    user?: LoginPayload,
    codVerba?: number,
  ): Promise<{
    eventos: ReturnPjesEventoDto[];
    resumo: {
      somattCtOfEvento: number;
      somattCotaOfEscala: number;
      somattCtPrcEvento: number;
      somattCotaPrcEscala: number;
      valorTtPlanejado: number;
      valorTtExecutado: number;
      saldoFinal: number;
    };
  }> {
    const where: any = {};

    if (mes) where.pjesdist = { mes };
    if (ano) where.pjesdist = { ...where.pjesdist, ano };
    if (omeMin !== undefined && omeMax !== undefined) {
      where.omeId = Between(omeMin, omeMax);
    }
    if (codVerba !== undefined) {
      where.codVerba = codVerba;
    }

    const items = await this.pjeseventoRepository.find({
      where,
      relations: [
        'ome',
        'ome.diretoria',
        'pjesoperacoes.pjesescalas',
        'pjesdist',
      ],
      order: { omeId: 'ASC' },
    });

    let filtrados = items;

    if (user?.typeUser === 1) {
      filtrados = items.filter((evento) => evento.omeId === user.omeId);
    } else if (user?.typeUser === 3) {
      filtrados = items.filter((evento) => {
        if (evento.codVerba !== 247) {
          return evento.pjesdist?.diretoriaId === user.ome?.diretoriaId;
        } else {
          return evento.ome?.diretoriaId === user.ome?.diretoriaId;
        }
      });
    }

    const dtos = filtrados.map((item) => new ReturnPjesEventoDto(item));

    // 👇 Agrupamento por omeId e codVerba
    const eventosAgrupados = this.agruparEventoComTotais(dtos);

    const resumo = {
      somattCtOfEvento: 0,
      somattCotaOfEscala: 0,
      somattCtPrcEvento: 0,
      somattCotaPrcEscala: 0,
      valorTtPlanejado: 0,
      valorTtExecutado: 0,
      saldoFinal: 0,
    };

    for (const dto of eventosAgrupados) {
      resumo.somattCtOfEvento += dto.somattCtOfEvento;
      resumo.somattCotaOfEscala += dto.somattCotaOfEscala;
      resumo.somattCtPrcEvento += dto.somattCtPrcEvento;
      resumo.somattCotaPrcEscala += dto.somattCotaPrcEscala;
      resumo.valorTtPlanejado += dto.valorTtPlanejado || 0;
      resumo.valorTtExecutado += dto.valorTtExecutado || 0;
      resumo.saldoFinal += dto.saldoFinal || 0;
    }

    return { eventos: eventosAgrupados, resumo };
  }

  async findOne(id: number): Promise<ReturnPjesEventoDto> {
    const pjesevento = await this.pjeseventoRepository.findOneBy({ id });
    if (!pjesevento) {
      throw new NotFoundException('Evento não encontrado');
    }
    return new ReturnPjesEventoDto(pjesevento);
  }

  async update(
    id: number,
    updateDto: CreatePjesEventoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesEventoDto> {
    // Busca o evento existente com suas relações
    const existing = await this.pjeseventoRepository.findOne({
      where: { id },
      relations: ['pjesdist'],
    });

    if (!existing) {
      throw new NotFoundException('Evento não encontrado');
    }

    // ✅ Impede troca de teto
    if (updateDto.pjesDistId && updateDto.pjesDistId !== existing.pjesDistId) {
      throw new BadRequestException(
        'Não é permitido alterar o tipo da verba já criada.',
      );
    }

    // Busca a distribuição base
    const dist = await this.pjeseventoRepository.manager
      .getRepository(PjesDistEntity)
      .findOne({
        where: { id: existing.pjesDistId },
        relations: ['pjeseventos'],
      });

    if (!dist) {
      throw new NotFoundException('Distribuição base não encontrada');
    }

    const isHomologada = dist.statusDist === 'HOMOLOGADA';
    const isUserAutorizado = user.typeUser === 10 || user.typeUser === 5;

    if (isHomologada && !isUserAutorizado) {
      throw new BadRequestException(
        'Distribuição homologada. Contate o Administrador.',
      );
    }

    const isAtrasado = updateDto.regularOuAtrasado === 'ATRASADO';
    if (isAtrasado && !isUserAutorizado) {
      throw new BadRequestException(
        'Você não tem permissão para criar eventos atrasados. Contate o Administrador.',
      );
    }

    // 🔍 Soma cotas já utilizadas em escalas do evento, agrupadas por tipoSgp
    const usadasEscalas = await this.pjeseventoRepository.manager
      .getRepository(PjesEscalaEntity)
      .createQueryBuilder('escala')
      .select('escala.tipoSgp', 'tipoSgp')
      .addSelect('SUM(escala.ttCota)', 'total')
      .where('escala.pjesEventoId = :eventoId', { eventoId: id })
      .groupBy('escala.tipoSgp')
      .getRawMany();

    const omeAlterado = updateDto.omeId && updateDto.omeId !== existing.omeId;

    // 🔍 Verifica se existem operações vinculadas ao evento
    const operacoesVinculadas = await this.pjeseventoRepository.manager
      .getRepository(PjesOperacaoEntity)
      .count({
        where: { pjesEventoId: id },
      });

    // 🚫 Impede alterar o omeId se houver operações vinculadas
    if (omeAlterado && operacoesVinculadas > 0) {
      throw new BadRequestException(
        'Não é permitido alterar a UNIDADE. Já existem OPERAÇÕES CADASTRADAS.',
      );
    }

    // 🚫 Impede alterar o omeId se houver escalas vinculadas
    if (omeAlterado && usadasEscalas.length > 0) {
      throw new BadRequestException(
        'Não é permitido alterar a UNIDADE. Já existem POLICIAIS ESCALADOS.',
      );
    }

    const somaUsadaOficiais = usadasEscalas
      .filter((e) => e.tipoSgp === 'O')
      .reduce((sum, e) => sum + Number(e.total), 0);

    const somaUsadaPracas = usadasEscalas
      .filter((e) => e.tipoSgp === 'P')
      .reduce((sum, e) => sum + Number(e.total), 0);

    // ❌ Impede redução abaixo do que já foi usado
    if (updateDto.ttCtOfEvento < somaUsadaOficiais) {
      throw new BadRequestException(
        `Não é possível definir menos de ${somaUsadaOficiais} cotas de oficiais, pois JA FORAM CONSUMIDAS.`,
      );
    }

    if (updateDto.ttCtPrcEvento < somaUsadaPracas) {
      throw new BadRequestException(
        `Não é possível definir menos de ${somaUsadaPracas} cotas de praças, pois JA FORAM CONSUMIDAS.`,
      );
    }

    // Soma atual total (inclui o evento atual)
    const somaAtualOficiais = dist.pjeseventos.reduce(
      (sum, ev) => sum + ev.ttCtOfEvento,
      0,
    );

    const somaAtualPracas = dist.pjeseventos.reduce(
      (sum, ev) => sum + ev.ttCtPrcEvento,
      0,
    );

    // ✅ Soma as cotas já distribuídas em operações vinculadas a este evento
    const operacoesDistribuidas = await this.pjeseventoRepository.manager
      .getRepository(PjesOperacaoEntity)
      .find({
        where: { pjesEventoId: id },
        select: ['ttCtOfOper', 'ttCtPrcOper'],
      });

    const somaOperacoesOf = operacoesDistribuidas.reduce(
      (acc, curr) => acc + (curr.ttCtOfOper || 0),
      0,
    );

    const somaOperacoesPrc = operacoesDistribuidas.reduce(
      (acc, curr) => acc + (curr.ttCtPrcOper || 0),
      0,
    );

    // ❌ Impede redução abaixo do que já foi distribuído em operações
    if (updateDto.ttCtOfEvento < somaOperacoesOf) {
      throw new BadRequestException(
        `Não é possível definir menos de ${somaOperacoesOf} cotas de oficiais, pois já foram DISTRIBUÍDAS em operações.`,
      );
    }

    if (updateDto.ttCtPrcEvento < somaOperacoesPrc) {
      throw new BadRequestException(
        `Não é possível definir menos de ${somaOperacoesPrc} cotas de praças, pois já foram DISTRIBUÍDAS em operações.`,
      );
    }

    // Subtrai os valores antigos do evento atual e adiciona os novos
    const novaSomaOf =
      somaAtualOficiais - existing.ttCtOfEvento + updateDto.ttCtOfEvento;

    const novaSomaPrc =
      somaAtualPracas - existing.ttCtPrcEvento + updateDto.ttCtPrcEvento;

    // Validação dos limites da distribuição
    if (novaSomaOf > dist.ttCtOfDist) {
      throw new BadRequestException(
        `Atualização inválida: oficiais excedem limite da distribuição (${novaSomaOf} > ${dist.ttCtOfDist})`,
      );
    }

    if (novaSomaPrc > dist.ttCtPrcDist) {
      throw new BadRequestException(
        `Atualização inválida: praças excedem limite da distribuição (${novaSomaPrc} > ${dist.ttCtPrcDist})`,
      );
    }

    // 🔒 Remove pjesDistId do DTO para não permitir alteração
    delete updateDto.pjesDistId;

    // Atualiza e salva
    const updated = this.pjeseventoRepository.merge(existing, updateDto);
    await this.pjeseventoRepository.save(updated);

    const withRelations = await this.pjeseventoRepository.findOne({
      where: { id },
      relations: ['ome'],
    });

    return new ReturnPjesEventoDto(withRelations);
  }

  async updateStatusEvento(
    id: number,
    dto: UpdateStatusPjesEventoDto,
    user: LoginPayload,
  ): Promise<ReturnPjesEventoDto> {
    const evento = await this.pjeseventoRepository.findOne({
      where: { id },
      relations: ['pjesdist', 'ome'],
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    const dist = evento.pjesdist;

    if (!dist) {
      throw new NotFoundException('Distribuição do evento não encontrada');
    }

    // 🚫 Restringe alteração de status apenas a usuários do tipo 5 ou 10
    if (![5, 10].includes(user.typeUser)) {
      throw new BadRequestException(
        'Usuário sem permissão para alterar o status do evento.',
      );
    }

    // Verifica se a distribuição está homologada
    if (dist.statusDist === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Evento pertencente a uma distribuição homologada. Alteração não permitida.',
      );
    }

    evento.statusEvento = dto.statusEvento;
    const saved = await this.pjeseventoRepository.save(evento);

    return new ReturnPjesEventoDto(saved);
  }

  async remove(id: number, user: LoginPayload): Promise<void> {
    const evento = await this.pjeseventoRepository.findOne({
      where: { id },
      relations: ['pjesdist', 'pjesoperacoes', 'pjesoperacoes.pjesescalas'],
    });

    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    const dist = await this.pjesDistRepository.findOne({
      where: { id: evento.pjesDistId },
    });

    if (!dist) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    // 🚫 Impede exclusão se distribuição estiver homologada
    if (dist.statusDist === 'HOMOLOGADA' && user.typeUser !== 10) {
      throw new BadRequestException(
        'Evento homologado. Exclusão não permitida.',
      );
    }

    // 🚫 Impede exclusão se houver escalas associadas e usuário não for 5 ou 10
    const hasEscalas = evento.pjesoperacoes?.some(
      (op) => op.pjesescalas && op.pjesescalas.length > 0,
    );

    if (hasEscalas && ![5, 10].includes(user.typeUser)) {
      throw new BadRequestException(
        'Não é permitido excluir eventos com policiais escalados.',
      );
    }

    await this.pjeseventoRepository.remove(evento);
  }

  private agruparEventoComTotais(
    eventos: ReturnPjesEventoDto[],
  ): ReturnPjesEventoDto[] {
    const mapa = new Map<string, ReturnPjesEventoDto>();

    for (const evento of eventos) {
      const chave = `${evento.omeId}-${evento.codVerba}`;

      if (!mapa.has(chave)) {
        mapa.set(chave, { ...evento });
      } else {
        const acumulado = mapa.get(chave);

        acumulado.somattCtOfEvento += evento.somattCtOfEvento;
        acumulado.somattCtPrcEvento += evento.somattCtPrcEvento;
        acumulado.somattCotaOfEscala += evento.somattCotaOfEscala;
        acumulado.somattCotaPrcEscala += evento.somattCotaPrcEscala;
        acumulado.valorTtPlanejado += evento.valorTtPlanejado || 0;
        acumulado.valorTtExecutado += evento.valorTtExecutado || 0;
        acumulado.saldoFinal += evento.saldoFinal || 0;
      }
    }

    return Array.from(mapa.values()).sort((a, b) => a.omeId - b.omeId);
  }

  async homologarTodosEventoDoMes(
    mes: number,
    ano: number,
  ): Promise<{ qtdAtualizada: number }> {
    // Busca eventos do mês e ano passados que não estejam homologados
    const eventos = await this.pjeseventoRepository.find({
      where: {
        mes,
        ano,
        statusEvento: Not(StatusEventoEnum.HOMOLOGADA),
      },
    });

    if (eventos.length === 0) {
      return { qtdAtualizada: 0 };
    }

    // Atualiza status para HOMOLOGADA
    eventos.forEach((evento) => {
      evento.statusEvento = StatusEventoEnum.HOMOLOGADA;
    });

    await this.pjeseventoRepository.save(eventos);

    return { qtdAtualizada: eventos.length };
  }
}
