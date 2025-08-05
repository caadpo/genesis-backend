import { DiretoriaEntity } from '../entities/diretoria.entity';

export class ReturnDiretoriaDto {
  id: number;
  nomeDiretoria: string;
  dpoId: number;

  constructor(diretoria: DiretoriaEntity) {
    this.id = diretoria.id;
    this.nomeDiretoria = diretoria.nomeDiretoria;
    this.dpoId = diretoria.dpoId;
  }
}
