import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesDistEntity } from 'src/pjesdist/entities/pjesdist.entity';
import { ReturnPjesOperacaoDto } from 'src/pjesoperacao/dtos/return-pjesoperacao.dto';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
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

  // Relacionamentos aninhados
  pjesdist?: PjesDistEntity;
  //pjesoperacoes?: PjesOperacaoEntity[];
  pjesoperacoes?: ReturnPjesOperacaoDto[];

  somaCtOfOper?: number;
  somaCtPrcOper?: number;
  somaCotaOfEscala?: number;
  somaCotaPrcEscala?: number;
  totalImpedidos?: number;

  //parte de cima da resumo
  somattCtOfEvento: number;
  somattCotaOfEscala: number;

  somattCtPrcEvento: number;
  somattCotaPrcEscala: number;

  //parte de baixo da resumo

  valorCtOfEvento?: number;
  valorSomaGeralCotaOfEscala?: number;
  valorCtPrcEvento?: number;
  valorSomaGeralCotaPrcEscala?: number;
  valorTtPlanejado?: number;
  valorTtExecutado?: number;
  saldoFinal?: number;

  // Dados derivados
  mes?: number;
  ano?: number;

  ome?: OmeEntity;

  nomeOme?: string;
  nomeDiretoria?: string;

  createdAt: Date;
  updatedAt: Date;

  constructor(entity: any, operacoesDTO?: ReturnPjesOperacaoDto[]) {
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
    this.mes = entity.mes;
    this.ano = entity.ano;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.pjesdist = entity.pjesdist;
    this.nomeOme = entity.ome?.nomeOme;
    this.nomeDiretoria = entity.pjesdist?.diretoria?.nomeDiretoria;
    this.pjesoperacoes = operacoesDTO || entity.pjesoperacoes;

    this.ome = entity.ome;

    // Soma cotas de operações
    this.somaCtOfOper = entity.pjesoperacoes?.reduce(
      (sum, op) => sum + (op.ttCtOfOper || 0),
      0,
    );

    this.somaCtPrcOper = entity.pjesoperacoes?.reduce(
      (sum, op) => sum + (op.ttCtPrcOper || 0),
      0,
    );

    // Soma real de cotas por tipo de escala
    let totalOf = 0;
    let totalPrc = 0;
    let totalImpedidos = 0;

    for (const operacao of entity.pjesoperacoes || []) {
      for (const escala of operacao.pjesescalas || []) {
        if (escala.tipoSgp === 'O') {
          totalOf += escala.ttCota || 0;
        } else if (escala.tipoSgp === 'P') {
          totalPrc += escala.ttCota || 0;
        }

        // Contagem de impedidos
        if (
          escala.situacaoSgp &&
          escala.situacaoSgp.toUpperCase().startsWith('IMPEDIDO -')
        ) {
          totalImpedidos += 1;
        }
      }
    }

    this.somaCotaOfEscala = totalOf;
    this.somaCotaPrcEscala = totalPrc;
    this.totalImpedidos = totalImpedidos;

    this.valorCtOfEvento = this.ttCtOfEvento * 300;
    this.valorSomaGeralCotaOfEscala = this.somaCotaOfEscala * 300;

    this.valorCtPrcEvento = this.ttCtPrcEvento * 200;
    this.valorSomaGeralCotaPrcEscala = this.somaCotaPrcEscala * 200;

    //Parte de cima do resumo
    this.somattCtOfEvento = this.ttCtOfEvento;
    this.somattCotaOfEscala = this.somaCotaOfEscala;
    this.somattCtPrcEvento = this.ttCtPrcEvento;
    this.somattCotaPrcEscala = this.somaCotaPrcEscala;

    //Parte de baixo do resumo
    this.valorTtPlanejado = this.valorCtOfEvento + this.valorCtPrcEvento;
    this.valorTtExecutado =
      this.valorSomaGeralCotaOfEscala + this.valorSomaGeralCotaPrcEscala;
    this.saldoFinal = this.valorTtPlanejado - this.valorTtExecutado;
  }
}
