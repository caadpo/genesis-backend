import { DpoEntity } from 'src/dpo/entities/dpo.entity';
import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'diretoria' })
export class DiretoriaEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'nomediretoria', nullable: false })
  nomeDiretoria: string;

  @Column({ name: 'dpoid', nullable: false })
  dpoId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DpoEntity, (dpo) => dpo.diretorias)
  @JoinColumn({ name: 'dpoid', referencedColumnName: 'id' })
  dpo?: DpoEntity;

  @OneToMany(() => OmeEntity, (ome) => ome.diretoria)
  omes?: OmeEntity[];
}
