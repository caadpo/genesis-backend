// returnDiretoria.dto.ts
import { ReturnOmeDto } from 'src/ome/dtos/returnOme.dto';
import { DiretoriaEntity } from '../entities/diretoria.entity';

export class ReturnDiretoriaDto {
  id: number;
  nomeDiretoria: string;
  dpoId: number;
  omes?: ReturnOmeDto[];

  constructor(diretoria: DiretoriaEntity) {
    this.id = diretoria.id;
    this.nomeDiretoria = diretoria.nomeDiretoria;
    this.dpoId = diretoria.dpoId;

    if (diretoria.omes) {
      this.omes = diretoria.omes.map((ome) => new ReturnOmeDto(ome));
    }
  }
}
