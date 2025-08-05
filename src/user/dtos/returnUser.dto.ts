import { ReturnOmeDto } from 'src/ome/dtos/returnOme.dto';
import { ReturnAddressDto } from '../../address/dtos/returnAddress.dto';
import { UserType } from '../enum/user-type.enum';
import { ReturnMasterDTO } from 'src/master/dtos/return-master.dto';

export class ReturnUserDto {
  id: number;
  imagemUrl?: string;
  loginSei: string;
  email: string;
  phone: string;
  omeId: number;
  pg: string;
  mat: number;
  nomeGuerra: string;
  tipo: string;
  funcao: string;
  typeUser: UserType;
  addresses?: ReturnAddressDto[];
  master?: ReturnMasterDTO;
  ome?: ReturnOmeDto;

  constructor(userEntity: any) {
    this.id = userEntity.id;
    this.imagemUrl = userEntity.imagemUrl;
    this.loginSei = userEntity.loginSei;
    this.email = userEntity.email;
    this.phone = userEntity.phone;
    this.omeId = userEntity.omeId;
    this.pg = userEntity.pg;
    this.mat = userEntity.mat;
    this.nomeGuerra = userEntity.nomeGuerra;
    this.tipo = userEntity.tipo;
    this.funcao = userEntity.funcao;
    this.typeUser = userEntity.typeUser;

    this.addresses = userEntity.addresses
      ? userEntity.addresses.map((address) => new ReturnAddressDto(address))
      : undefined;

    this.master = userEntity.master
      ? new ReturnMasterDTO(userEntity.master)
      : undefined;

    this.ome = userEntity.ome ? new ReturnOmeDto(userEntity.ome) : undefined;
  }
}
