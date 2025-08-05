import { DiretoriaEntity } from 'src/diretoria/entities/diretoria.entity';
import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'dpo' })
export class DpoEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'nomedpo', nullable: false })
  nomeDpo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DiretoriaEntity, (diretoria) => diretoria.dpo)
  diretorias?: DiretoriaEntity[];
}
