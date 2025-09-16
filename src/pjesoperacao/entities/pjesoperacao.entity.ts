import { OmeEntity } from 'src/ome/entities/ome.entity';
import { PjesEscalaEntity } from 'src/pjesescala/entities/pjesescala.entity';
import { PjesEventoEntity } from 'src/pjesevento/entities/pjesevento.entity';
import { StatusOperacaoEnum } from 'src/utils/status-operacao.enum';
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

@Entity({ name: 'pjesoperacao' })
@Index(['CodOp'], { unique: true })
export class PjesOperacaoEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'nomeoperacao', nullable: false })
  nomeOperacao: string;

  @Column({ name: 'codverba', nullable: false })
  codVerba: number;

  @Column({ name: 'pjeseventoid', nullable: false })
  pjesEventoId: number;

  @Column({ name: 'omeid', nullable: false })
  omeId: number;

  @Column({ name: 'ttctofoper', nullable: false })
  ttCtOfOper: number;

  @Column({ name: 'ttctprcoper', nullable: false })
  ttCtPrcOper: number;

  @Column({ name: 'userid', nullable: false })
  userId: number;

  @Column({
    name: 'statusoperacao',
    type: 'enum',
    enum: StatusOperacaoEnum,
    default: StatusOperacaoEnum.AUTORIZADA,
  })
  statusOperacao: StatusOperacaoEnum;

  @Column({ name: 'mes', nullable: false })
  mes: number;

  @Column({ name: 'ano', nullable: false })
  ano: number;

  @Column({ name: 'codop', nullable: false })
  CodOp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PjesEventoEntity, (pjesevento) => pjesevento.pjesoperacoes)
  @JoinColumn({ name: 'pjeseventoid', referencedColumnName: 'id' })
  pjesevento?: PjesEventoEntity;

  @OneToMany(() => PjesEscalaEntity, (escala) => escala.pjesoperacao)
  pjesescalas?: PjesEscalaEntity[];

  @ManyToOne(() => OmeEntity)
  @JoinColumn({ name: 'omeid', referencedColumnName: 'id' })
  ome: OmeEntity;
}
