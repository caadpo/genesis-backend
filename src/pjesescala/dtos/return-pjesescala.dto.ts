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

  mes?: number;
  ano?: number;

  tetoStatusTeto?: string;
  tetoCreatedAtStatusTeto?: Date;
  tetoStatusPg?: string;
  tetoCreatedAtStatusPg?: Date;

  
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


    // Dados derivados (caso queira simplificar o consumo no frontend)
    this.mes = entity.pjesevento?.mes ?? undefined;
    this.ano = entity.pjesevento?.ano ?? undefined;

    this.tetoStatusTeto = entity.teto?.statusTeto ?? entity.tetoStatusTeto;
    this.tetoCreatedAtStatusTeto =
      entity.teto?.createdAtStatusTeto ?? entity.tetoCreatedAtStatusTeto;
    this.tetoStatusPg = entity.teto?.statusPg ?? entity.tetoStatusPg;
    this.tetoCreatedAtStatusPg =
      entity.teto?.createdAtStatusPg ?? entity.tetoCreatedAtStatusPg;

  }
}
