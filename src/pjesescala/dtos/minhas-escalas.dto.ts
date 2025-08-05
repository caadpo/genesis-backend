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

  ultimoStatusLog?: {
    novoStatus: string;
    dataAlteracao: string;
    pg: string;
    imagemUrl: string;
    nomeGuerra: string;
    nomeOme: string;
  };

  comentarios?: {
    id: number;
    comentario: string;
    createdAt: Date;
    autor: {
      nomeGuerra: string;
      nomeOme: string;
      imagemUrl: string;
    };
  }[];
}
