import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PjesTetoEntity } from './entities/pjesteto.entity';
import { ReturnPjesTetoDto } from './dtos/return-pjesteto.dto';
import { CreatePjesTetoDto } from './dtos/create-pjesteto.dto';
import { DataSource } from 'typeorm';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';
import { UserType } from 'src/user/enum/user-type.enum';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';


@Injectable()
export class PjesTetoService {
  constructor(
    @InjectRepository(PjesTetoEntity)
    private readonly pjestetoRepository: Repository<PjesTetoEntity>,
    private readonly dataSource: DataSource
  ) {}

  async create(dto: CreatePjesTetoDto): Promise<ReturnPjesTetoDto> {
    const entity = this.pjestetoRepository.create(dto);
    const saved = await this.pjestetoRepository.save(entity);
    return new ReturnPjesTetoDto(saved);
  }

  async findAll(ano?: number, mes?: number, user?: LoginPayload): Promise<ReturnPjesTetoDto[]> {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth() + 1;
  
    const where = {
      ano: ano ?? anoAtual,
      mes: mes ?? mesAtual,
    };
  
    // Se NÃO for Auxiliar ou não tiver OME associada, retorna todos os tetos normalmente
    if (user?.typeUser !== 1 || !user?.ome?.id) {
      const items = await this.pjestetoRepository.find({
        where,
        order: {
          ano: 'ASC',
          mes: 'ASC',
        },
      });
  
      return items.map((item) => new ReturnPjesTetoDto(item));
    }
  
    // Se for AUXILIAR (typeUser === 1) e tiver OME associada
    // Buscar os codVerba permitidos pela OME do usuário logado
    const codVerbas = await this.dataSource
      .getRepository(PjesEventoEntity)
      .createQueryBuilder('evento')
      .select('DISTINCT CAST(evento.codVerba AS INTEGER)', 'codVerba')
      .where('evento.omeId = :omeId', { omeId: user.ome.id })
      .andWhere('evento.ano = :ano', { ano: where.ano })
      .andWhere('evento.mes = :mes', { mes: where.mes })
      .getRawMany();
  
    const codVerbaList = codVerbas.map((v) => Number(v.codVerba));
  
    // Se não houver nenhum codVerba vinculado, retorna lista vazia
    if (codVerbaList.length === 0) return [];
  
    // Buscar os tetos com os codVerba encontrados
    const items = await this.pjestetoRepository
      .createQueryBuilder('pjesteto')
      .where('pjesteto.ano = :ano', { ano: where.ano })
      .andWhere('pjesteto.mes = :mes', { mes: where.mes })
      .andWhere('pjesteto.codVerba IN (:...codVerbaList)', { codVerbaList })
      .orderBy('pjesteto.ano', 'ASC')
      .addOrderBy('pjesteto.mes', 'ASC')
      .getMany();
  
    return items.map((item) => new ReturnPjesTetoDto(item));
  }
  
  async findOne(id: number, user?: LoginPayload): Promise<ReturnPjesTetoDto> {
    const entity = await this.pjestetoRepository.findOne({
      where: { id },
      relations: ['pjesdists', 'pjesdists.diretoria'],
    });
  
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }
  
    let totaisExec = [];
  
    let userDiretoriaId: number | undefined;
  
    if (user?.typeUser !== UserType.Auxiliar) {
      const todosTotais = await this.getTotaisExecutadosPorDiretoria(
        entity.codVerba,
        entity.mes,
        entity.ano
      );
  
      if (user?.typeUser === UserType.Diretor && user.ome?.diretoriaId) {
        totaisExec = todosTotais.filter(
          (item) => item.diretoriaId === user.ome.diretoriaId
        );
        userDiretoriaId = user.ome.diretoriaId;
      } else {
        totaisExec = todosTotais;
      }
    }
  
    const showDistribuicoes = user?.typeUser !== UserType.Auxiliar;
  
    return new ReturnPjesTetoDto(entity, totaisExec, showDistribuicoes, userDiretoriaId);
  }
  
  async getTotaisExecutadosPorDiretoria(codVerba: number, mes: number, ano: number) {
    const result = await this.dataSource.query(
      `
      SELECT
        d.id AS "diretoriaId",
        d.nomediretoria AS "nomeDiretoria",
        SUM(CASE WHEN e.tiposgp = 'O' THEN e.ttcota ELSE 0 END) AS "SomaCtOfExec",
        SUM(CASE WHEN e.tiposgp = 'P' THEN e.ttcota ELSE 0 END) AS "SomaCtPrcExec"
      FROM pjesescala e
      JOIN pjesoperacao o ON o.id = e.pjesoperacaoid
      JOIN pjesevento ev ON ev.id = o.pjeseventoid
      JOIN pjesdist dist ON dist.id = ev.pjesdistid
      JOIN diretoria d ON d.id = dist.diretoriaid
      WHERE e.statusescala = 'AUTORIZADA'
        AND dist.codverba = $1
        AND dist.mes = $2
        AND dist.ano = $3
      GROUP BY d.id, d.nomediretoria
      `,
      [codVerba, mes, ano]
    );
  
    return result;
  }
  
  async update(id: number, dto: CreatePjesTetoDto): Promise<ReturnPjesTetoDto> {
    const entity = await this.pjestetoRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }

    const now = new Date();

    const updatedEntity: Partial<PjesTetoEntity> = {
      ...entity,
      ...dto,
      updatedAt: now,
    };

    if (dto.statusTeto && dto.statusTeto !== entity.statusTeto) {
      updatedEntity.createdAtStatusTeto = now;
    }

    if (dto.statusPg && dto.statusPg !== entity.statusPg) {
      updatedEntity.createdAtStatusPg = now;
    }

    const saved = await this.pjestetoRepository.save(updatedEntity);
    return new ReturnPjesTetoDto(saved);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.pjestetoRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException('Pjesteto não encontrado');
    }
    await this.pjestetoRepository.remove(entity);
  }
}
