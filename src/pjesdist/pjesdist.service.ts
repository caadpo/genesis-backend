import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PjesDistEntity } from './entities/pjesdist.entity';
import { CreatePjesDistDto } from './dtos/create-pjesdist.dto';
import { ReturnPjesDistDto } from './dtos/return-pjesdist.dto';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { PjesTetoEntity } from 'src/pjesteto/entities/pjesteto.entity';

@Injectable()
export class PjesDistService {
  constructor(
    @InjectRepository(PjesDistEntity)
    private readonly pjesDistRepository: Repository<PjesDistEntity>,

    @InjectRepository(PjesTetoEntity)
    private readonly pjesTetoRepository: Repository<PjesTetoEntity>,
  ) {}

  async create(
    data: CreatePjesDistDto,
    user: LoginPayload,
  ): Promise<ReturnPjesDistDto> {
    const teto = await this.pjesTetoRepository.findOne({
      where: {
        id: data.pjesTetoId,
        mes: data.mes,
        ano: data.ano,
      },
      relations: ['pjesdists'],
    });

    if (!teto) {
      throw new BadRequestException(`É necessário escolher um tipo de Verba`);
    }

    // Soma as distribuições já existentes (caso queira considerar isso)
    const totalOficiaisDistribuidos =
      teto.pjesdists?.reduce((sum, d) => sum + d.ttCtOfDist, 0) ?? 0;
    const totalPracasDistribuidos =
      teto.pjesdists?.reduce((sum, d) => sum + d.ttCtPrcDist, 0) ?? 0;

    const novaSomaOf = totalOficiaisDistribuidos + data.ttCtOfDist;
    const novaSomaPrc = totalPracasDistribuidos + data.ttCtPrcDist;

    if (novaSomaOf > teto.tetoOf) {
      throw new BadRequestException(
        `Distribuição inválida: cotas de oficiais excedem o teto permitido (${novaSomaOf} > ${teto.tetoOf})`,
      );
    }

    if (novaSomaPrc > teto.tetoPrc) {
      throw new BadRequestException(
        `Distribuição inválida: cotas de praças excedem o teto permitido (${novaSomaPrc} > ${teto.tetoPrc})`,
      );
    }

    const dist = this.pjesDistRepository.create({
      ...data,
      codVerba: teto.codVerba,
    });

    const saved = await this.pjesDistRepository.save(dist);

    const full = await this.pjesDistRepository.findOne({
      where: { id: saved.id },
      relations: ['pjeseventos', 'diretoria'],
    });

    return new ReturnPjesDistDto(full);
  }

  async update(
    id: number,
    data: Partial<CreatePjesDistDto>,
    user: LoginPayload,
  ): Promise<ReturnPjesDistDto> {
    const existing = await this.pjesDistRepository.findOne({
      where: { id },
      relations: ['pjeseventos', 'pjesteto'],
    });

    if (!existing) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    if (data.pjesTetoId && data.pjesTetoId !== existing.pjesTetoId) {
      throw new BadRequestException(
        'Não é permitido alterar o tipo da verba já criada.',
      );
    }

    const teto = await this.pjesTetoRepository.findOne({
      where: { id: existing.pjesTetoId },
      relations: ['pjesdists'],
    });

    if (!teto) {
      throw new NotFoundException('Teto vinculado não encontrado');
    }

    // Soma todas as distribuições do teto, exceto a atual
    const outrasDistribuicoes = (teto.pjesdists || []).filter(
      (d) => d.id !== id,
    );

    const totalOficiaisDistribuidos = outrasDistribuicoes.reduce(
      (sum, d) => sum + d.ttCtOfDist,
      0,
    );

    const totalPracasDistribuidos = outrasDistribuicoes.reduce(
      (sum, d) => sum + d.ttCtPrcDist,
      0,
    );

    const novaOfDist =
      data.ttCtOfDist !== undefined ? data.ttCtOfDist : existing.ttCtOfDist;
    const novaPrcDist =
      data.ttCtPrcDist !== undefined ? data.ttCtPrcDist : existing.ttCtPrcDist;

    const novaSomaOf = totalOficiaisDistribuidos + novaOfDist;
    const novaSomaPrc = totalPracasDistribuidos + novaPrcDist;
    let alerta = null;

    if (novaSomaOf > teto.tetoOf) {
      alerta = 'Cuidado. Você está usando cotas Remanescentes para oficiais.';
    }

    if (novaSomaPrc > teto.tetoPrc) {
      alerta = 'Cuidado. Você está usando cotas Remanescentes para praças.';
    }

    // Impede valores menores do que já foi distribuído em eventos
    const totalOfDistribuido =
      existing.pjeseventos?.reduce((sum, ev) => sum + ev.ttCtOfEvento, 0) ?? 0;

    const totalPrcDistribuido =
      existing.pjeseventos?.reduce((sum, ev) => sum + ev.ttCtPrcEvento, 0) ?? 0;

    if (data.ttCtOfDist !== undefined && data.ttCtOfDist < totalOfDistribuido) {
      throw new BadRequestException(
        `Nova cota de oficiais (${data.ttCtOfDist}) é menor que o total já distribuído (${totalOfDistribuido}).`,
      );
    }

    if (
      data.ttCtPrcDist !== undefined &&
      data.ttCtPrcDist < totalPrcDistribuido
    ) {
      throw new BadRequestException(
        `Nova cota de praças (${data.ttCtPrcDist}) é menor que o total já distribuído (${totalPrcDistribuido}).`,
      );
    }

    delete data.pjesTetoId;

    const updated = this.pjesDistRepository.merge(existing, data);
    const saved = await this.pjesDistRepository.save(updated);

    const full = await this.pjesDistRepository.findOne({
      where: { id: saved.id },
      relations: ['pjeseventos', 'diretoria'],
    });

    return new ReturnPjesDistDto(full);
  }

  async findAll(
    user: LoginPayload,
    mes?: number,
    ano?: number,
    codVerba?: number,
  ): Promise<ReturnPjesDistDto[]> {
    // 1. Consulta principal, SEM as escalas
    const query = this.pjesDistRepository
      .createQueryBuilder('dist')
      .leftJoinAndSelect('dist.diretoria', 'diretoria')
      .leftJoinAndSelect('dist.pjeseventos', 'pjeseventos')
      .leftJoinAndSelect('pjeseventos.ome', 'ome')
      .leftJoinAndSelect('ome.diretoria', 'ome_diretoria')
      .leftJoinAndSelect('dist.pjesteto', 'pjesteto')
      .leftJoinAndSelect('pjeseventos.pjesoperacoes', 'pjesoperacoes');
  
    if (mes) query.andWhere('dist.mes = :mes', { mes });
    if (ano) query.andWhere('dist.ano = :ano', { ano });
    if (codVerba) query.andWhere('dist.codVerba = :codVerba', { codVerba });
  
    if (![5, 10].includes(user.typeUser)) {
      query.andWhere('dist.diretoriaId = :diretoriaId', {
        diretoriaId: user.ome.diretoriaId,
      });
    }
  
    query.orderBy('dist.ano', 'DESC').addOrderBy('dist.mes', 'DESC');
  
    const dists = await query.getMany();
  
    // 2. Consulta agregada apenas com somas de cotas por evento
    const rawSums = await this.pjesDistRepository.manager
      .createQueryBuilder()
      .select('op.pjeseventoId', 'eventoId')
      .addSelect("SUM(CASE WHEN esc.tipoSgp = 'O' THEN esc.ttCota ELSE 0 END)", 'totalCotaOf')
      .addSelect("SUM(CASE WHEN esc.tipoSgp = 'P' THEN esc.ttCota ELSE 0 END)", 'totalCotaPrc')
      .from('pjesoperacao', 'op')
      .leftJoin('pjesescala', 'esc', 'esc.pjesoperacaoId = op.id')
      .groupBy('op.pjeseventoId')
      .getRawMany();
  
    // 3. Mapeia os resultados por ID de evento
    const escalaMap = new Map<number, { totalCotaOf: number; totalCotaPrc: number }>();
    rawSums.forEach((row) => {
      escalaMap.set(Number(row.eventoId), {
        totalCotaOf: Number(row.totalCotaOf),
        totalCotaPrc: Number(row.totalCotaPrc),
      });
    });
  
    // 4. Retorna os DTOs, repassando o mapa para calcular os totais nos eventos
    return dists.map((dist) => new ReturnPjesDistDto(dist, escalaMap));
  }
  
  async findOne(id: number, user: LoginPayload): Promise<ReturnPjesDistDto> {
    const query = this.pjesDistRepository.createQueryBuilder('dist')
      .leftJoinAndSelect('dist.diretoria', 'diretoria')
      .leftJoinAndSelect('dist.pjeseventos', 'pjeseventos')
      .where('dist.id = :id', { id });
  
    const dist = await query.getOne();
  
    if (!dist) {
      throw new NotFoundException('Distribuição não encontrada');
    }
  
    if (![5, 10].includes(user.typeUser)) {
      const userDiretoriaId = user.ome?.diretoriaId;
      if (dist.diretoriaId !== userDiretoriaId) {
        throw new BadRequestException('Acesso negado a esta distribuição.');
      }
    }
  
    return new ReturnPjesDistDto(dist);
  }
  
  async remove(id: number, user: LoginPayload): Promise<void> {
    const dist = await this.pjesDistRepository.findOne({
      where: { id },
      relations: ['pjeseventos'],
    });

    if (!dist) {
      throw new NotFoundException('Distribuição não encontrada');
    }

    if (dist.pjeseventos && dist.pjeseventos.length > 0) {
      throw new BadRequestException(
        'Não é possível remover: existem eventos associados.',
      );
    }

    await this.pjesDistRepository.remove(dist);
  }
}
