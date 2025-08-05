import { PjesDistEntity } from 'src/pjesdist/entities/pjesdist.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'pjesteto' })
export class PjesTetoEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'imagem_url', nullable: true })
  imagemUrl: string;

  @Column({ name: 'nomeverba', nullable: false })
  nomeVerba: string;

  @Column({ name: 'codverba', nullable: false })
  codVerba: number;

  @Column({ name: 'tetoof', nullable: false })
  tetoOf: number;

  @Column({ name: 'tetoprc', nullable: false })
  tetoPrc: number;

  @Column({ name: 'mes', nullable: false })
  mes: number;

  @Column({ name: 'ano', nullable: false })
  ano: number;

  @Column({
    name: 'status_teto',
    type: 'varchar',
    default: 'NAO ENVIADO',
  })
  statusTeto: 'ENVIADO' | 'NAO ENVIADO';

  @Column({
    name: 'created_at_status_teto',
    type: 'timestamp',
    nullable: true,
  })
  createdAtStatusTeto: Date;

  @Column({
    name: 'status_pg',
    type: 'varchar',
    default: 'PENDENTE',
  })
  statusPg: 'PAGO' | 'PENDENTE';

  @Column({
    name: 'created_at_status_pg',
    type: 'timestamp',
    nullable: true,
  })
  createdAtStatusPg: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PjesDistEntity, (pjesdist) => pjesdist.pjesteto)
  pjesdists?: PjesDistEntity[];
}
