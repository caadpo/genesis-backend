export class MinhasEscalasDto {
  dia: string;
  nomeOperacao: string;
  nomeOme: string;
  localApresentacaoSgp: string;
  situacaoSgp: string;
  horaInicio: string;
  horaFinal: string;
  funcao: string;
  anotacaoEscala: string;
  statusEscala: string;
  ttCota: number;
  codOp: string;

  tetoStatusTeto?: string;
  tetoCreatedAtStatusTeto?: Date;
  tetoStatusPg?: string;
  tetoCreatedAtStatusPg?: Date;
}
