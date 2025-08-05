import { AuxiliarEntity } from '../entities/auxiliar.entity';

export class ReturnAuxiliarDTO {
  id: number;
  userId: number;

  constructor(auxiliarEntity: AuxiliarEntity) {
    this.id = auxiliarEntity.id;
    this.userId = auxiliarEntity.userId;
  }
}
