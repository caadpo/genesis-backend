import { DiretoriaEntity } from 'src/diretoria/entities/diretoria.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { PjesTetoEntity } from 'src/pjesteto/entities/pjesteto.entity';
import { StatusDistEnum } from 'src/utils/status-dist.enum';
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

@Entity({ name: 'pjesdist' })
export class PjesDistEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'nomedist', nullable: false })
  nomeDist: string;

  @Column({ name: 'pjestetoid', nullable: false })
  pjesTetoId: number;

  @Column({ name: 'codverba', nullable: false })
  codVerba: number;

  @Column({ name: 'diretoriaid', nullable: false })
  diretoriaId: number;

  @Column({ name: 'ttctofdist', nullable: false })
  ttCtOfDist: number;

  @Column({ name: 'ttctprcdist', nullable: false })
  ttCtPrcDist: number;

  @Column({ name: 'userid', nullable: false })
  userId: number;

  @Column({
    name: 'statusdist',
    type: 'enum',
    enum: StatusDistEnum,
    default: StatusDistEnum.AUTORIZADA,
  })
  statusDist: StatusDistEnum;

  @Column({ name: 'mes', nullable: false })
  mes: number;

  @Column({ name: 'ano', nullable: false })
  ano: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PjesEventoEntity, (pjesevento) => pjesevento.pjesdist)
  pjeseventos?: PjesEventoEntity[];

  @ManyToOne(() => PjesTetoEntity, (pjesteto) => pjesteto.pjesdists)
  @JoinColumn({ name: 'pjestetoid', referencedColumnName: 'id' })
  pjesteto?: PjesTetoEntity;

  @ManyToOne(() => DiretoriaEntity)
  @JoinColumn({ name: 'diretoriaid', referencedColumnName: 'id' })
  diretoria: DiretoriaEntity;
}
