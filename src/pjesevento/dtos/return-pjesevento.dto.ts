import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesDistEntity } from 'src/pjesdist/entities/pjesdist.entity';
import { ReturnPjesOperacaoResumoDto } from 'src/pjesoperacao/dtos/return-pjesoperacao-resumo.dto';
import { StatusEventoEnum } from 'src/utils/status-evento.enum';

export class ReturnPjesEventoDto {
  id: number;
  pjesDistId: number;
  codVerba: number;
  nomeEvento: string;
  omeId: number;
  ttCtOfEvento: number;
  ttCtPrcEvento: number;
  regularOuAtrasado: string;
  userId: number;
  statusEvento: StatusEventoEnum;
  createdAt: Date;
  updatedAt: Date;

  mes?: number;
  ano?: number;

  ome?: OmeEntity;
  pjesdist?: PjesDistEntity;

  nomeOme?: string;
  nomeDiretoria?: string;

  // Operações resumidas
  pjesoperacoes?: ReturnPjesOperacaoResumoDto[];

  // Totais
  somaCtOfOper?: number;
  somaCtPrcOper?: number;
  somaCotaOfEscala?: number;
  somaCotaPrcEscala?: number;
  totalImpedidos?: number;

  somattCtOfEvento?: number;
  somattCotaOfEscala?: number;
  somattCtPrcEvento?: number;
  somattCotaPrcEscala?: number;

  valorCtOfEvento?: number;
  valorSomaGeralCotaOfEscala?: number;
  valorCtPrcEvento?: number;
  valorSomaGeralCotaPrcEscala?: number;
  valorTtPlanejado?: number;
  valorTtExecutado?: number;
  saldoFinal?: number;

  constructor(
    entity: any,
    operacoesDTO?: ReturnPjesOperacaoResumoDto[],
    options?: {
      reduzir?: boolean;
      escalaSums?: { totalCotaOf: number; totalCotaPrc: number };
    },
  ) {
    this.id = entity.id;
    this.pjesDistId = entity.pjesDistId;
    this.codVerba = entity.codVerba;
    this.nomeEvento = entity.nomeEvento;
    this.omeId = entity.omeId;
    this.ttCtOfEvento = entity.ttCtOfEvento;
    this.ttCtPrcEvento = entity.ttCtPrcEvento;
    this.regularOuAtrasado = entity.regularOuAtrasado;
    this.userId = entity.userId;
    this.statusEvento = entity.statusEvento;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.mes = entity.mes;
    this.ano = entity.ano;
    this.ome = entity.ome;
    this.pjesdist = entity.pjesdist;
    this.nomeOme = entity.ome?.nomeOme;

    this.nomeDiretoria =
    entity.pjesdist?.diretoria?.nomeDiretoria ||
    entity.ome?.diretoria?.nomeDiretoria ||
    'Diretoria não carregada';


    if (!entity.ome?.diretoria) {
      console.warn(`OME sem diretoria: eventoId=${entity.id}, omeId=${entity.omeId}`);
    }
    




    this.pjesoperacoes = operacoesDTO || entity.pjesoperacoes;

    if (!options?.reduzir) {
      this.somaCtOfOper = entity.pjesoperacoes?.reduce(
        (sum, op) => sum + (op.ttCtOfOper || 0),
        0,
      );

      this.somaCtPrcOper = entity.pjesoperacoes?.reduce(
        (sum, op) => sum + (op.ttCtPrcOper || 0),
        0,
      );

      const totalOf = options?.escalaSums?.totalCotaOf ?? 0;
      const totalPrc = options?.escalaSums?.totalCotaPrc ?? 0;

      this.somaCotaOfEscala = totalOf;
      this.somaCotaPrcEscala = totalPrc;

      // Aqui ainda precisa vir do backend — ex: COUNT dos impedidos
      this.totalImpedidos = entity.totalImpedidos ?? 0;

      this.valorCtOfEvento = this.ttCtOfEvento * 300;
      this.valorSomaGeralCotaOfEscala = this.somaCotaOfEscala * 300;

      this.valorCtPrcEvento = this.ttCtPrcEvento * 200;
      this.valorSomaGeralCotaPrcEscala = this.somaCotaPrcEscala * 200;

      this.somattCtOfEvento = this.ttCtOfEvento;
      this.somattCotaOfEscala = this.somaCotaOfEscala;
      this.somattCtPrcEvento = this.ttCtPrcEvento;
      this.somattCotaPrcEscala = this.somaCotaPrcEscala;

      this.valorTtPlanejado = this.valorCtOfEvento + this.valorCtPrcEvento;
      this.valorTtExecutado =
        this.valorSomaGeralCotaOfEscala + this.valorSomaGeralCotaPrcEscala;

      this.saldoFinal = this.valorTtPlanejado - this.valorTtExecutado;
    }
  }
}
