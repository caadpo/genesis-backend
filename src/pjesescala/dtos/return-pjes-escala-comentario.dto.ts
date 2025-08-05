import { ReturnDadosAutorComentarioDto } from './return-dados-autor-comentario.dto';

export class PjesEscalaComentarioDto {
  id: number;
  comentario: string;
  createdAt: Date;
  autor: ReturnDadosAutorComentarioDto;

  constructor(entity: any) {
    this.id = entity.id;
    this.comentario = entity.comentario;
    this.createdAt = entity.createdAt;
    this.autor = new ReturnDadosAutorComentarioDto(entity.autor);
  }
}
