import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
import { PjesEscalaComentarioDto } from './return-pjes-escala-comentario.dto';
import { OmeEntity } from 'src/ome/entities/ome.entity';

export class ReturnPjesEscalaDto {
  id: number;
  pjesEventoId: number;
  codVerba: number;
  pjesOperacaoId: number;
  omeId: number;
  pgSgp: string;
  matSgp: number;
  nomeGuerraSgp: string;
  nomeCompletoSgp: string;
  omeSgp: string;
  tipoSgp: string;
  nunfuncSgp: number;
  nunvincSgp: number;
  situacaoSgp: string;
  dataInicio: Date;
  dataFinal: Date;
  horaInicio: string;
  horaFinal: string;
  phone?: string;
  localApresentacaoSgp?: string;
  funcao: string;
  anotacaoEscala: string;
  ttCota: number;
  userId: number;
  statusEscala: string;
  obs: string;
  userIdObs: number;
  updatedObsAt: Date;

  ome?: OmeEntity;

  pjesevento?: PjesEventoEntity;
  pjesoperacao?: PjesOperacaoEntity;

  mes?: number;
  ano?: number;

  tetoStatusTeto?: string;
  tetoCreatedAtStatusTeto?: Date;
  tetoStatusPg?: string;
  tetoCreatedAtStatusPg?: Date;

  ultimoStatusLog?: {
    novoStatus: string;
    dataAlteracao: Date;
    pg: string;
    imagemUrl: string;
    nomeGuerra: string;
    nomeOme: string;
  };

  comentarios?: PjesEscalaComentarioDto[];

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: any) {
    this.id = entity.id;
    this.pjesEventoId = entity.pjesEventoId;
    this.codVerba = entity.codVerba;
    this.pjesOperacaoId = entity.pjesOperacaoId;
    this.omeId = entity.omeId;
    this.pgSgp = entity.pgSgp;
    this.matSgp = entity.matSgp;
    this.nomeGuerraSgp = entity.nomeGuerraSgp;
    this.nomeCompletoSgp = entity.nomeCompletoSgp;
    this.omeSgp = entity.omeSgp;
    this.tipoSgp = entity.tipoSgp;
    this.nunfuncSgp = entity.nunfuncSgp;
    this.nunvincSgp = entity.nunvincSgp;
    this.situacaoSgp = entity.situacaoSgp;
    this.dataInicio = entity.dataInicio;
    this.dataFinal = entity.dataFinal;
    this.horaInicio = entity.horaInicio;
    this.horaFinal = entity.horaFinal;
    this.phone = entity.phone;
    this.localApresentacaoSgp = entity.localApresentacaoSgp;
    this.funcao = entity.funcao;
    this.anotacaoEscala = entity.anotacaoEscala;
    this.ttCota = entity.ttCota;
    this.userId = entity.userId;
    this.statusEscala = entity.statusEscala;
    this.obs = entity.obs;
    this.userIdObs = entity.userIdObs;
    this.updatedObsAt = entity.updatedObsAt;

    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;

    // Relacionamentos completos (aninhados)
    this.ome = entity.ome;
    this.pjesevento = entity.pjesevento;
    this.pjesoperacao = entity.pjesoperacao;

    // Dados derivados (caso queira simplificar o consumo no frontend)
    this.mes = entity.pjesevento?.mes ?? undefined;
    this.ano = entity.pjesevento?.ano ?? undefined;

    this.tetoStatusTeto = entity.teto?.statusTeto ?? entity.tetoStatusTeto;
    this.tetoCreatedAtStatusTeto =
      entity.teto?.createdAtStatusTeto ?? entity.tetoCreatedAtStatusTeto;
    this.tetoStatusPg = entity.teto?.statusPg ?? entity.tetoStatusPg;
    this.tetoCreatedAtStatusPg =
      entity.teto?.createdAtStatusPg ?? entity.tetoCreatedAtStatusPg;

    if (entity.comentarios) {
      this.comentarios = entity.comentarios.map(
        (c) => new PjesEscalaComentarioDto(c),
      );
    }

    // Último log de status (se existir)
    if (entity.statusLogs?.length > 0) {
      const ultimoLog = entity.statusLogs.sort(
        (a, b) =>
          new Date(b.dataAlteracao).getTime() -
          new Date(a.dataAlteracao).getTime(),
      )[0];

      this.ultimoStatusLog = {
        novoStatus: ultimoLog.novoStatus,
        dataAlteracao: ultimoLog.dataAlteracao,
        pg: ultimoLog.pg,
        imagemUrl: ultimoLog.imagemUrl,
        nomeGuerra: ultimoLog.nomeGuerra,
        nomeOme: ultimoLog.nomeOme,
      };
    }
  }
}
