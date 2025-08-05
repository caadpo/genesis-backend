import { OmeEntity } from '../entities/ome.entity';

export class ReturnOmeDto {
  id: number;
  nomeOme: string;
  diretoriaId: number;
  diretoria?: {
    id: number;
    nomeDiretoria: string;
    dpo?: {
      id: number;
      nomeDpo: string;
    };
  };

  constructor(ome: OmeEntity) {
    this.id = ome.id;
    this.nomeOme = ome.nomeOme;
    this.diretoriaId = ome.diretoriaId;

    if (ome.diretoria) {
      this.diretoria = {
        id: ome.diretoria.id,
        nomeDiretoria: ome.diretoria.nomeDiretoria,
        dpo: ome.diretoria.dpo
          ? {
              id: ome.diretoria.dpo.id,
              nomeDpo: ome.diretoria.dpo.nomeDpo,
            }
          : undefined,
      };
    }
  }
}
