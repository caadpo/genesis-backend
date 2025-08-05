import { DpoEntity } from '../entities/dpo.entity';

export class ReturnDpoDto {
  id: number;
  nomeDpo: string;

  constructor(dpo: DpoEntity) {
    this.id = dpo.id;
    this.nomeDpo = dpo.nomeDpo;
  }
}
