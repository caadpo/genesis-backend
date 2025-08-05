import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PjesEscalaEntity } from './pjesescala.entity';

@Entity({ name: 'pjesescalastatuslog' })
export class PjesEscalaStatusLogEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => PjesEscalaEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'escala_id' })
  escala: PjesEscalaEntity;

  @Column({ name: 'novo_status' })
  novoStatus: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'imagem_url', nullable: true })
  imagemUrl: string;

  @Column({ name: 'pg', length: 10 })
  pg: string;

  @Column({ name: 'nome_guerra', length: 100 })
  nomeGuerra: string;

  @Column({ name: 'nome_ome', length: 255 })
  nomeOme: string;

  @CreateDateColumn({ name: 'data_alteracao' })
  dataAlteracao: Date;
}
