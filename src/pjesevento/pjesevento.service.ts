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
import { ReturnPjesOperacaoResumoDto } from 'src/pjesoperacao/dtos/return-pjesoperacao-resumo.dto';

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

  async contarImpedidosPorEventoMesAno(): Promise<
    { eventoId: number; mes: number; ano: number; totalImpedidos: number }[]
  > {
    const resultados = await this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .select('escala.pjesEventoId', 'eventoId')
      .addSelect('EXTRACT(MONTH FROM escala.dataInicio)', 'mes')
      .addSelect('EXTRACT(YEAR FROM escala.dataInicio)', 'ano')
      .addSelect('COUNT(*)', 'totalImpedidos')
      .where('escala.situacaoSgp LIKE :impedido', { impedido: 'IMPEDIDO -%' })
      .groupBy('escala.pjesEventoId')
      .addGroupBy('EXTRACT(MONTH FROM escala.dataInicio)')
      .addGroupBy('EXTRACT(YEAR FROM escala.dataInicio)')
      .getRawMany();

    return resultados.map((r) => ({
      eventoId: parseInt(r.eventoId),
      mes: parseInt(r.mes),
      ano: parseInt(r.ano),
      totalImpedidos: parseInt(r.totalImpedidos),
    }));
  }

  async findAll(
    mes?: number,
    ano?: number,
    user?: LoginPayload,
  ): Promise<ReturnPjesEventoDto[]> {
  
    // 1. Consulta as somas agrupadas por operação
    const somasPorOperacao = await this.pjesEscalaRepository
      .createQueryBuilder('escala')
      .select('escala.pjesOperacaoId', 'operacaoId')
      .addSelect("SUM(CASE WHEN escala.tipoSgp = 'O' THEN escala.ttCota ELSE 0 END)", 'ttCtOfExeOper')
      .addSelect("SUM(CASE WHEN escala.tipoSgp = 'P' THEN escala.ttCota ELSE 0 END)", 'ttCtPrcExeOper')
      .groupBy('escala.pjesOperacaoId')
      .getRawMany();
  
    // 2. Consulta eventos com operações e relações
    const query = this.pjeseventoRepository
  .createQueryBuilder('evento')
  .leftJoinAndSelect('evento.ome', 'ome')
  .leftJoinAndSelect('ome.diretoria', 'omeDiretoria') // <== isso
  .leftJoinAndSelect('evento.pjesdist', 'pjesdist')
  .leftJoinAndSelect('pjesdist.diretoria', 'diretoria')
  .leftJoinAndSelect('evento.pjesoperacoes', 'operacao')
  .leftJoinAndSelect('operacao.ome', 'operacaoOme');
  
    if (mes) query.andWhere('pjesdist.mes = :mes', { mes });
    if (ano) query.andWhere('pjesdist.ano = :ano', { ano });
  
    let eventos = await query.orderBy('evento.omeId', 'DESC').getMany();
  
    // 3. Filtra eventos conforme tipo de usuário
    if (user?.typeUser === 1) {
      eventos = eventos.filter((evento) => evento.omeId === user.omeId);
    } else if (user?.typeUser === 3) {
      eventos = eventos.filter((evento) => {
        if (evento.codVerba !== 247) {
          return evento.pjesdist?.diretoriaId === user.ome?.diretoriaId;
        }
        return evento.ome?.diretoriaId === user.ome?.diretoriaId;
      });
    }
  
    // 4. Mapeia as operações de cada evento adicionando as somas
    return eventos.map((evento) => {
      // Para cada operação do evento, encontra a soma agregada e cria o DTO com essa info
      const operacoesResumoDTO = evento.pjesoperacoes?.map((op) => {
        const soma = somasPorOperacao.find((s) => s.operacaoId === op.id);
        const ttCtOfExeOper = soma ? parseInt(soma.ttCtOfExeOper, 10) : 0;
        const ttCtPrcExeOper = soma ? parseInt(soma.ttCtPrcExeOper, 10) : 0;
  
        return new ReturnPjesOperacaoResumoDto(op, {
          ttCtOfExeOper,
          ttCtPrcExeOper,
        });
      });
  
      // Retorna o evento já com operações resumidas preenchidas
      return new ReturnPjesEventoDto(evento, operacoesResumoDTO, { reduzir: true });
    });
  }
  
  async findOne(id: number): Promise<ReturnPjesEventoDto> {
    const evento = await this.pjeseventoRepository
      .createQueryBuilder('evento')
      .leftJoinAndSelect('evento.ome', 'ome')
      .leftJoinAndSelect('evento.pjesoperacoes', 'operacao')
      .leftJoinAndSelect('operacao.ome', 'omeOperacao')
      .leftJoinAndSelect('operacao.pjesescalas', 'escalas') // traz escalas para detalhe
      .where('evento.id = :id', { id })
      .getOne();
  
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }
  
    // Aqui uso o DTO completo que inclui escalas
    const operacoesDTO = evento.pjesoperacoes?.map(
      (op) => new ReturnPjesOperacaoDto(op),
    );
  
    // Reduzido = false para detalhe completo
    return new ReturnPjesEventoDto(evento, operacoesDTO, { reduzir: false });
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
        `Atualização inválida: oficiais excedem limite da distribuição`,
      );
    }

    if (novaSomaPrc > dist.ttCtPrcDist) {
      throw new BadRequestException(
        `Atualização inválida: praças excedem limite da distribuição`,
      );
    }

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
  
    // 👇 Verifica se o status atual já está HOMOLOGADO
    const statusAtual = evento.statusEvento;
    const novoStatus = dto.statusEvento;
  
    // 👮 Lógica de permissão
    if (![5, 10].includes(user.typeUser)) {
      // ✅ Só pode alterar se for evento da sua própria OME
      if (evento.ome?.id !== user.omeId) {
        throw new BadRequestException(
          'Você só pode alterar o status de eventos da sua própria OME.',
        );
      }
  
      // ✅ Só pode alterar para HOMOLOGADA
      if (novoStatus !== 'HOMOLOGADA') {
        throw new BadRequestException(
          'Você só pode homologar (e não des-homologar) eventos da sua OME.',
        );
      }
  
      // ❌ Se já está homologado, não pode alterar novamente
      if (statusAtual === 'HOMOLOGADA') {
        throw new BadRequestException(
          'Evento já está homologado. Alterações não são permitidas.',
        );
      }
    }
  
    // 👇 Para usuários 5 e 10, ou se passou nas validações acima
    evento.statusEvento = novoStatus;
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

  async homologarTodosEventoDoMes(
    mes: number,
    ano: number,
    user: LoginPayload,
  ): Promise<{ qtdAtualizada: number }> {
    let eventos;
  
    if (user.typeUser === 1) {
      // 🔒 Auxiliares só podem acessar eventos da sua própria OME
      eventos = await this.pjeseventoRepository.find({
        where: {
          mes,
          ano,
          statusEvento: Not(StatusEventoEnum.HOMOLOGADA),
          ome: { id: user.omeId },
        },
        relations: ['ome'], // necessário para garantir que ome.id seja carregado
      });
    } else {
      // 👑 Técnicos e Masters podem acessar todos
      eventos = await this.pjeseventoRepository.find({
        where: {
          mes,
          ano,
          statusEvento: Not(StatusEventoEnum.HOMOLOGADA),
        },
      });
    }
  
    if (eventos.length === 0) {
      return { qtdAtualizada: 0 };
    }
  
    eventos.forEach((evento) => {
      evento.statusEvento = StatusEventoEnum.HOMOLOGADA;
    });
  
    await this.pjeseventoRepository.save(eventos);
  
    return { qtdAtualizada: eventos.length };
  }
  
}
