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

  // Distribuições agrupadas por diretoria
  distribuições?: {
    diretoriaId: number;
    nomeDiretoria: string;
    SomattCtOfDist: number;
    SomattCtPrcDist: number;
    SomaCtOfExec?: number;  // <- Novo campo
    SomaCtPrcExec?: number; // <- Novo campo
  }[];


  constructor(
    pjesteto: PjesTetoEntity,
    totaisExec?: {
      diretoriaId: number;
      nomeDiretoria: string;
      SomaCtOfExec: number;
      SomaCtPrcExec: number;
    }[],
    showDistribuicoes: boolean = true,
    userDiretoriaId?: number, // <- novo argumento
  ) {
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
  
    if (showDistribuicoes && pjesteto.pjesdists) {
      const agrupado = new Map<number, {
        diretoriaId: number;
        nomeDiretoria: string;
        SomattCtOfDist: number;
        SomattCtPrcDist: number;
        SomaCtOfExec?: number;
        SomaCtPrcExec?: number;
      }>();
  
      for (const dist of pjesteto.pjesdists) {
        const diretoriaId = dist.diretoria?.id ?? 0;
  
        // 👉 Filtro para diretores: só vê a própria diretoria
        if (userDiretoriaId && diretoriaId !== userDiretoriaId) {
          continue;
        }
  
        const nomeDiretoria = dist.diretoria?.nomeDiretoria ?? 'Sem Diretoria';
  
        if (!agrupado.has(diretoriaId)) {
          agrupado.set(diretoriaId, {
            diretoriaId,
            nomeDiretoria,
            SomattCtOfDist: dist.ttCtOfDist,
            SomattCtPrcDist: dist.ttCtPrcDist,
          });
        } else {
          const acumulado = agrupado.get(diretoriaId)!;
          acumulado.SomattCtOfDist += dist.ttCtOfDist;
          acumulado.SomattCtPrcDist += dist.ttCtPrcDist;
        }
      }
  
      if (totaisExec?.length) {
        for (const exec of totaisExec) {
          const item = agrupado.get(exec.diretoriaId);
          if (item) {
            item.SomaCtOfExec = exec.SomaCtOfExec;
            item.SomaCtPrcExec = exec.SomaCtPrcExec;
          }
        }
      }
  
      this.distribuições = Array.from(agrupado.values());
    }
  }
  
  
}