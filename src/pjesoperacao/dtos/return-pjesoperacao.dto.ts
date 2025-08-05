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
  pjesevento?: {
    id: number;
    nomeEvento: string;
  };

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

    if (pjesOperacaoEntity.pjesevento) {
      this.pjesevento = {
        id: pjesOperacaoEntity.pjesevento.id,
        nomeEvento: pjesOperacaoEntity.pjesevento.nomeEvento,
      };
    }

    let consumoOf = 0;
    let consumoPrc = 0;

    if (pjesOperacaoEntity.pjesescalas) {
      for (const escala of pjesOperacaoEntity.pjesescalas) {
        const tipo = escala.tipoSgp.toUpperCase();
        const isOf = ['O'].includes(tipo);
        const isPrc = ['P'].includes(tipo);

        if (isOf) consumoOf += escala.ttCota;
        else if (isPrc) consumoPrc += escala.ttCota;
      }
    }

    this.nomeOme = pjesOperacaoEntity.ome?.nomeOme;
    //this.pjesescalas = pjesOperacaoEntity.pjesescalas;
    this.pjesescalas = pjesOperacaoEntity.pjesescalas?.map(
      (escala) => new ReturnPjesEscalaDto(escala),
    );

    this.ttCtOfExeOper = consumoOf;
    this.ttCtPrcExeOper = consumoPrc;
  }
}
