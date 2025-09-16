import { StatusOperacaoEnum } from 'src/utils/status-operacao.enum';
import { PjesOperacaoEntity } from '../entities/pjesoperacao.entity';
import { PjesEscalaEntity } from 'src/pjesescala/entities/pjesescala.entity';
import { ReturnPjesEscalaDto } from 'src/pjesescala/dtos/return-pjesescala.dto';

export class ReturnPjesOperacaoDto {
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

  pjesescalas?: ReturnPjesEscalaDto[];

  nomeOme?: string;

  ttCtOfExeOper: number;
  ttCtPrcExeOper: number;

  constructor(pjesOperacaoEntity: PjesOperacaoEntity) {
    this.id = pjesOperacaoEntity.id;
    this.nomeOperacao = pjesOperacaoEntity.nomeOperacao;
    this.codVerba = pjesOperacaoEntity.codVerba;
    this.omeId = pjesOperacaoEntity.omeId;
    this.pjesEventoId = pjesOperacaoEntity.pjesEventoId;
    this.ttCtOfOper = pjesOperacaoEntity.ttCtOfOper;
    this.ttCtPrcOper = pjesOperacaoEntity.ttCtPrcOper;
    this.userId = pjesOperacaoEntity.userId;
    this.statusOperacao = pjesOperacaoEntity.statusOperacao;
    this.mes = pjesOperacaoEntity.mes;
    this.ano = pjesOperacaoEntity.ano;
    this.codOp = pjesOperacaoEntity.CodOp;
  
    this.nomeOme = pjesOperacaoEntity.ome?.nomeOme;
  
    // Só mapeia as escalas se elas existirem
    if (pjesOperacaoEntity.pjesescalas) {
      this.pjesescalas = pjesOperacaoEntity.pjesescalas.map(
        (escala) => new ReturnPjesEscalaDto(escala),
      );
    }
  
    // FLEXÍVEL: Usa agregados, se vieram via query
    if (
      typeof (pjesOperacaoEntity as any).ttCtOfExeOper === 'number' &&
      typeof (pjesOperacaoEntity as any).ttCtPrcExeOper === 'number'
    ) {
      this.ttCtOfExeOper = (pjesOperacaoEntity as any).ttCtOfExeOper;
      this.ttCtPrcExeOper = (pjesOperacaoEntity as any).ttCtPrcExeOper;
    } else if (pjesOperacaoEntity.pjesescalas) {
      // Caso contrário, calcula manualmente
      let consumoOf = 0;
      let consumoPrc = 0;
  
      for (const escala of pjesOperacaoEntity.pjesescalas) {
        const tipo = escala.tipoSgp.toUpperCase();
        if (tipo === 'O') consumoOf += escala.ttCota;
        else if (tipo === 'P') consumoPrc += escala.ttCota;
      }
  
      this.ttCtOfExeOper = consumoOf;
      this.ttCtPrcExeOper = consumoPrc;
    } else {
      // Nenhum dado disponível
      this.ttCtOfExeOper = 0;
      this.ttCtPrcExeOper = 0;
    }
  }
  
}
