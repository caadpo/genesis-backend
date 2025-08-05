import { MasterEntity } from '../entities/master.entity';

export class ReturnMasterDTO {
  id: number;
  userId: number;

  constructor(masterEntity: MasterEntity) {
    this.id = masterEntity.id;
    this.userId = masterEntity.userId;
  }
}
