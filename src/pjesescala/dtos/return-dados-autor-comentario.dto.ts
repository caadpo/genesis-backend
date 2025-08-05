export class ReturnDadosAutorComentarioDto {
  imagemUrl: string;
  pg: string;
  nomeGuerra: string;
  nomeOme: string;

  constructor(autor: any) {
    this.imagemUrl = autor?.imagemUrl ?? '';
    this.pg = autor?.pg ?? '';
    this.nomeGuerra = autor?.nomeGuerra ?? '';
    this.nomeOme = autor?.ome?.nomeOme ?? '';
  }
}
