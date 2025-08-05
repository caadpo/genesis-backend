import { AddressEntity } from '../../address/entities/address.entity';
import { StateEntity } from '../../state/entities/state.entity';
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

@Entity({ name: 'city' })
export class CityEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'state_id', nullable: false })
  stateId: number;

  @Column({ name: 'name', nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //OneToMany indica que é 1 cidade para varios endereços
  @OneToMany(() => AddressEntity, (address) => address.city)
  addresses?: AddressEntity[];

  //ManyToOne indica que são varios cidades para apenas 1 estado
  @ManyToOne(() => StateEntity, (state) => state.cities)
  //JoinColumn indidca nome da coluna da tabela CITY que irá fazer referencia na outra tabela
  // referencedColumnName indica qual coluna da tabela STATE ira se relacionar
  @JoinColumn({ name: 'state_id', referencedColumnName: 'id' })
  state?: StateEntity;
}
