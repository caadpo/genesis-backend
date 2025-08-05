import { CityEntity } from '../../city/entities/city.entity';
import { UserEntity } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'address' })
export class AddressEntity {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'complement', nullable: true })
  complement: string;

  @Column({ name: 'number', nullable: false })
  numberAddress: number;

  @Column({ name: 'cep', nullable: false })
  cep: string;

  @Column({ name: 'city_id', nullable: false })
  cityId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  //ManyToOne indica que são varios endereços para apenas 1 usuario
  @ManyToOne(() => UserEntity, (user) => user.addresses)
  //JoinColumn indidca nome da coluna da tabela ADDRESS e o referencedColumnName indica qual coluna da tabela USER ira se relacionar
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: UserEntity;

  //ManyToOne indica que são varios endereços para apenas 1 cidade
  @ManyToOne(() => CityEntity, (city) => city.addresses)
  //JoinColumn indidca nome da coluna da tabela ADDRESS e o referencedColumnName indica qual coluna da tabela CITY ira se relacionar
  @JoinColumn({ name: 'city_id', referencedColumnName: 'id' })
  city?: CityEntity;
}
