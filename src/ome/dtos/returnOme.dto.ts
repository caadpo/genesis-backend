export class ReturnOmeDto {
  id: number;
  nomeOme: string;
  diretoriaId: number;

  SomattCtOfEvento?: number;
  SomattCtPrcEvento?: number;
  SomattCtOfEscala?: number;
  SomattCtPrcEscala?: number;

  constructor(ome: any) {
    this.id = ome.id;
    this.nomeOme = ome.nomeOme;
    this.diretoriaId = ome.diretoriaId;

    this.SomattCtOfEvento = ome.SomattCtOfEvento ?? 0;
    this.SomattCtPrcEvento = ome.SomattCtPrcEvento ?? 0;
    this.SomattCtOfEscala = ome.SomattCtOfEscala ?? 0;
    this.SomattCtPrcEscala = ome.SomattCtPrcEscala ?? 0;
  }
}
