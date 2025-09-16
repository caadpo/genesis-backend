import { ReturnPjesEventoDto } from 'src/pjesevento/dtos/return-pjesevento.dto';
import { PjesDistEntity } from '../entities/pjesdist.entity';
import { StatusDistEnum } from 'src/utils/status-dist.enum';

export class ReturnPjesDistDto {
  id: number;
  nomeDist: string;
  diretoriaId: number;
  pjesTetoId: number;
  codVerba: number;
  ttCtOfDist: number;
  ttCtPrcDist: number;
  userId: number;
  statusDist: StatusDistEnum;
  mes: number;
  ano: number;
  createdAt: Date;
  updatedAt: Date;

  nomeDiretoria: string;
  nomeVerba?: string;

  eventos?: ReturnPjesEventoDto[];

  ttCotaOfEscala = 0;
  ttCotaPrcEscala = 0;
  ttCotaOfSaldo = 0;
  ttCotaPrcSaldo = 0;
  ttPmsImpedidos = 0;
  ttEventosAutorizados = 0;

  ttOfDistMenosEvento = 0;
  ttPrcDistMenosEvento = 0;

  constructor(
    dist: PjesDistEntity,
    escalaMap?: Map<number, { totalCotaOf: number; totalCotaPrc: number }>
  ) {
    this.id = dist.id;
    this.nomeDist = dist.nomeDist;
    this.pjesTetoId = dist.pjesTetoId;
    this.diretoriaId = dist.diretoriaId;
    this.codVerba = dist.codVerba;
    this.ttCtOfDist = dist.ttCtOfDist;
    this.ttCtPrcDist = dist.ttCtPrcDist;
    this.userId = dist.userId;
    this.statusDist = dist.statusDist;
    this.mes = dist.mes;
    this.ano = dist.ano;
    this.createdAt = dist.createdAt;
    this.updatedAt = dist.updatedAt;

    this.nomeDiretoria = dist.diretoria?.nomeDiretoria ?? '';
    this.nomeVerba = dist.pjesteto?.nomeVerba ?? '';

    let somaTtCtOfEvento = 0;
    let somaTtCtPrcEvento = 0;

    if (Array.isArray(dist.pjeseventos)) {
      this.eventos = dist.pjeseventos.map((ev) => {
        // Obtém somas da escala (já agregadas)
        const escalaSums = escalaMap?.get(ev.id);

        // Incrementa totais com base nos valores agregados
        this.ttCotaOfEscala += escalaSums?.totalCotaOf ?? 0;
        this.ttCotaPrcEscala += escalaSums?.totalCotaPrc ?? 0;

        // Contador de eventos autorizados
        if (ev.statusEvento === 'AUTORIZADA') {
          this.ttEventosAutorizados++;
        }

        // Soma os totais de evento (para cálculo de diferença)
        somaTtCtOfEvento += ev.ttCtOfEvento ?? 0;
        somaTtCtPrcEvento += ev.ttCtPrcEvento ?? 0;

        return new ReturnPjesEventoDto(ev, undefined, { escalaSums });
      });
    }

    // Saldo de cotas (distribuído - executado)
    this.ttCotaOfSaldo = this.ttCtOfDist - this.ttCotaOfEscala;
    this.ttCotaPrcSaldo = this.ttCtPrcDist - this.ttCotaPrcEscala;

    // Diferença entre total da distribuição e dos eventos
    this.ttOfDistMenosEvento = this.ttCtOfDist - somaTtCtOfEvento;
    this.ttPrcDistMenosEvento = this.ttCtPrcDist - somaTtCtPrcEvento;
  }
}
