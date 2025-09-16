import { StatusOperacaoEnum } from 'src/utils/status-operacao.enum';
import { PjesOperacaoEntity } from '../entities/pjesoperacao.entity';

export class ReturnPjesOperacaoResumoDto {
  id: number;
  nomeOperacao: string;
  codVerba: number;
  omeId: number;
  pjesEventoId: number;
  ttCtOfOper: number;
  ttCtPrcOper: number;
  userId: number;
  statusOperacao: StatusOperacaoEnum;
  mes: number;
  ano: number;
  codOp: string;
  createdAt: Date;
  updatedAt: Date;
  nomeOme?: string;

  ttCtOfExeOper: number;
  ttCtPrcExeOper: number; 

  constructor(
    entity: PjesOperacaoEntity,
    extras?: { ttCtOfExeOper?: number; ttCtPrcExeOper?: number },
  ) {
    this.id = entity.id;
    this.nomeOperacao = entity.nomeOperacao;
    this.codVerba = entity.codVerba;
    this.omeId = entity.omeId;
    this.pjesEventoId = entity.pjesEventoId;
    this.ttCtOfOper = entity.ttCtOfOper;
    this.ttCtPrcOper = entity.ttCtPrcOper;
    this.userId = entity.userId;
    this.statusOperacao = entity.statusOperacao;
    this.mes = entity.mes;
    this.ano = entity.ano;
    this.codOp = entity.CodOp;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.nomeOme = entity.ome?.nomeOme;

    this.ttCtOfExeOper = extras?.ttCtOfExeOper ?? 0;
    this.ttCtPrcExeOper = extras?.ttCtPrcExeOper ?? 0;
  }
}

