import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { PjesOperacaoEntity } from 'src/pjesoperacao/entities/pjesoperacao.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PjesEscalaStatusLogEntity } from './pjesescala-status-log.entity';
import { PjesEscalaComentarioEntity } from './pjesescala-comentario.entity';

@Entity({ name: 'pjesescala' })
@Index(['matSgp', 'dataInicio'], { unique: true })
export class PjesEscalaEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'pjeseventoid', nullable: false })
  pjesEventoId: number;

  @Column({ name: 'codverba', nullable: false })
  codVerba: number;

  @Column({ name: 'pjesoperacaoid', nullable: false })
  pjesOperacaoId: number;

  @Column({ name: 'omeid', nullable: false })
  omeId: number;

  @Column({ name: 'pgsgp', nullable: false })
  pgSgp: string;

  @Column({ name: 'matsgp', nullable: false })
  matSgp: number;

  @Column({ name: 'ngsgp', nullable: false })
  nomeGuerraSgp: string;

  @Column({ name: 'nomecompletosgp', nullable: false })
  nomeCompletoSgp: string;

  @Column({ name: 'omesgp', nullable: false })
  omeSgp: string;

  @Column({ name: 'tiposgp', nullable: false })
  tipoSgp: string;

  @Column({ name: 'nunfuncsgp', nullable: false })
  nunfuncSgp: number;

  @Column({ name: 'nunvincsgp', nullable: false })
  nunvincSgp: number;

  @Column({ name: 'situacaosgp', nullable: false })
  situacaoSgp: string;

  @Column({ name: 'datainicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'datafinal', type: 'date' })
  dataFinal: Date;

  @Column({ name: 'horainicio', length: 5 })
  horaInicio: string;

  @Column({ name: 'horafinal', length: 5 })
  horaFinal: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'localapresentacaosgp' })
  localApresentacaoSgp: string;

  @Column({ name: 'funcao', nullable: false })
  funcao: string;

  @Column({ name: 'anotacaoescala', nullable: false })
  anotacaoEscala: string;

  @Column({ name: 'ttcota', nullable: false })
  ttCota: number;

  @Column({ name: 'userid', nullable: false })
  userId: number;

  @Column({ name: 'statusescala', nullable: false })
  statusEscala: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // RELACIONAMENTOS

  @ManyToOne(() => PjesEventoEntity, (pjesevento) => pjesevento.pjesoperacoes)
  @JoinColumn({ name: 'pjeseventoid', referencedColumnName: 'id' })
  pjesevento?: PjesEventoEntity;

  @ManyToOne(() => PjesOperacaoEntity)
  @JoinColumn({ name: 'pjesoperacaoid', referencedColumnName: 'id' })
  pjesoperacao?: PjesOperacaoEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userid', referencedColumnName: 'id' })
  user?: UserEntity;

  @OneToMany(
    () => PjesEscalaComentarioEntity,
    (comentario) => comentario.escala,
  )
  comentarios?: PjesEscalaComentarioEntity[];

  @ManyToOne(() => OmeEntity)
  @JoinColumn({ name: 'omeid', referencedColumnName: 'id' })
  ome?: OmeEntity;

  @OneToMany(() => PjesEscalaStatusLogEntity, (log) => log.escala)
  statusLogs?: PjesEscalaStatusLogEntity[];

  teto?: {
    statusTeto?: string;
    createdAtStatusTeto?: Date;
    statusPg?: string;
    createdAtStatusPg?: Date;
  };
}
