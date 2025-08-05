import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { PjesEscalaEntity } from './pjesescala.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity({ name: 'pjesescalacomentario' })
export class PjesEscalaComentarioEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column()
  comentario: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => PjesEscalaEntity, (escala) => escala.comentarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pjesescalaid' })
  escala: PjesEscalaEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'userid' })
  autor: UserEntity;
}
