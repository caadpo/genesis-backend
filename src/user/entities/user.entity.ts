import { AddressEntity } from '../../address/entities/address.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../enum/user-type.enum';
import { MasterEntity } from 'src/master/entities/master.entity';
import { OmeEntity } from 'src/ome/entities/ome.entity';
import { AuxiliarEntity } from 'src/auxiliar/entities/auxiliar.entity';

@Entity({ name: 'user' })
@Index(['loginSei'], { unique: true })
@Index(['mat'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'imagem_url', nullable: true })
  imagemUrl: string;

  @Column({ name: 'loginsei', nullable: false })
  loginSei: string;

  @Column({ name: 'email', nullable: false })
  email: string;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'pg', nullable: false })
  pg: string;

  @Column({ name: 'mat', nullable: false })
  mat: number;

  @Column({ name: 'ng', nullable: false })
  nomeGuerra: string;

  @Column({ name: 'tipo', nullable: false })
  tipo: string;

  @Column({ name: 'omeid', nullable: false })
  omeId: number;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'funcao', nullable: false })
  funcao: string;

  @Column({
    name: 'type_user',
    nullable: false,
    type: 'enum',
    enum: UserType,
  })
  typeUser: UserType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // REALACIONAMENTOS COM OUTRAS TABELAS

  @OneToMany(() => AddressEntity, (address) => address.user)
  addresses?: AddressEntity[];

  @OneToOne(() => MasterEntity, (master) => master.user)
  master?: MasterEntity;

  @OneToOne(() => AuxiliarEntity, (auxiliar) => auxiliar.user)
  auxiliar?: AuxiliarEntity;

  @ManyToOne(() => OmeEntity, (ome) => ome.users)
  @JoinColumn({ name: 'omeid', referencedColumnName: 'id' })
  ome?: OmeEntity;
}
