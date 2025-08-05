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

  eventos?: ReturnPjesEventoDto[];

  ttCotaOfEscala = 0;
  ttCotaPrcEscala = 0;
  ttCotaOfSaldo = 0;
  ttCotaPrcSaldo = 0;
  ttPmsImpedidos = 0;
  ttEventosAutorizados = 0;

  ttOfDistMenosEvento = 0;
  ttPrcDistMenosEvento = 0;

  constructor(dist: PjesDistEntity) {
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

    let somaTtCtOfEvento = 0;
    let somaTtCtPrcEvento = 0;

    if (Array.isArray(dist.pjeseventos)) {
      this.eventos = dist.pjeseventos.map((ev) => new ReturnPjesEventoDto(ev));

      for (const ev of dist.pjeseventos) {
        // Contador de eventos autorizados
        if (ev.statusEvento === 'AUTORIZADA') {
          this.ttEventosAutorizados++;
        }

        // Acumula totais de evento
        somaTtCtOfEvento += ev.ttCtOfEvento ?? 0;
        somaTtCtPrcEvento += ev.ttCtPrcEvento ?? 0;

        for (const op of ev.pjesoperacoes ?? []) {
          for (const escala of op.pjesescalas ?? []) {
            // Contador de impedidos
            if (escala.situacaoSgp?.toUpperCase().startsWith('IMPEDIDO -')) {
              this.ttPmsImpedidos++;
            }

            // Cálculo da escala autorizada
            if (escala.statusEscala === 'AUTORIZADA') {
              if (escala.tipoSgp === 'O') {
                this.ttCotaOfEscala += escala.ttCota ?? 0;
              } else if (escala.tipoSgp === 'P') {
                this.ttCotaPrcEscala += escala.ttCota ?? 0;
              }
            }
          }
        }
      }
    }

    // Calcula os saldos:
    this.ttCotaOfSaldo = this.ttCtOfDist - this.ttCotaOfEscala;
    this.ttCotaPrcSaldo = this.ttCtPrcDist - this.ttCotaPrcEscala;

    // Calcula a diferença entre Dist e Evento:
    this.ttOfDistMenosEvento = this.ttCtOfDist - somaTtCtOfEvento;
    this.ttPrcDistMenosEvento = this.ttCtPrcDist - somaTtCtPrcEvento;
  }
}
