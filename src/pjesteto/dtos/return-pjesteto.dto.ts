import { ReturnPjesDistDto } from 'src/pjesdist/dtos/return-pjesdist.dto';
import { PjesTetoEntity } from '../entities/pjesteto.entity';

export class ReturnPjesTetoDto {
  id: number;
  imagemUrl?: string;
  nomeVerba: string;
  codVerba: number;
  tetoOf: number;
  tetoPrc: number;
  mes: number;
  ano: number;

  statusTeto: string;
  createdAtStatusTeto?: Date;
  statusPg: string;
  createdAtStatusPg?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Cotas totais usadas em escalas
  ttCotaOfEscala = 0;
  ttCotaPrcEscala = 0;

  // Saldos após escalas
  ttCotaOfSaldo = 0;
  ttCotaPrcSaldo = 0;

  ttCotaOfDisponivelDistribuir = 0;
  ttCotaPrcDisponivelDistribuir = 0;

  dists?: ReturnPjesDistDto[];

  constructor(pjesteto: PjesTetoEntity) {
    this.id = pjesteto.id;
    this.imagemUrl = pjesteto.imagemUrl;
    this.nomeVerba = pjesteto.nomeVerba;
    this.codVerba = pjesteto.codVerba;
    this.tetoOf = pjesteto.tetoOf;
    this.tetoPrc = pjesteto.tetoPrc;
    this.mes = pjesteto.mes;
    this.ano = pjesteto.ano;

    this.statusTeto = pjesteto.statusTeto;
    this.createdAtStatusTeto = pjesteto.createdAtStatusTeto;
    this.statusPg = pjesteto.statusPg;
    this.createdAtStatusPg = pjesteto.createdAtStatusPg;

    this.createdAt = pjesteto.createdAt;
    this.updatedAt = pjesteto.updatedAt;

    let totalOfDist = 0;
    let totalPrcDist = 0;

    if (Array.isArray(pjesteto.pjesdists)) {
      for (const dist of pjesteto.pjesdists) {
        totalOfDist += dist.ttCtOfDist ?? 0;
        totalPrcDist += dist.ttCtPrcDist ?? 0;

        for (const ev of dist.pjeseventos ?? []) {
          for (const op of ev.pjesoperacoes ?? []) {
            for (const escala of op.pjesescalas ?? []) {
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

      // ✅ Preenche o array de dists com nomeDiretoria, etc.
      this.dists = pjesteto.pjesdists.map(
        (dist) => new ReturnPjesDistDto(dist),
      );
    }

    this.ttCotaOfSaldo = this.tetoOf - this.ttCotaOfEscala;
    this.ttCotaPrcSaldo = this.tetoPrc - this.ttCotaPrcEscala;

    this.ttCotaOfDisponivelDistribuir = this.tetoOf - totalOfDist;
    this.ttCotaPrcDisponivelDistribuir = this.tetoPrc - totalPrcDist;
  }
}
