import { UserEntity } from '../../user/entities/user.entity';
import { ReturnOmeLoginDto } from 'src/ome/dtos/returnOmeLogin.dto';

//Esses são os dados do TOKEN
export class LoginPayload {
  id: number;
  imagemUrl: string;
  loginSei: string;
  email: string;
  phone: string;
  pg: string;
  tipo: string;
  omeId: number;
  mat: number;
  nomeGuerra: string;
  funcao: string;
  typeUser: number;
  ome?: ReturnOmeLoginDto;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.imagemUrl = user.imagemUrl;
    this.loginSei = user.loginSei;
    this.email = user.email;
    this.phone = user.phone;
    this.pg = user.pg;
    this.tipo = user.tipo;
    this.omeId = user.omeId;
    this.mat = user.mat;
    this.nomeGuerra = user.nomeGuerra;
    this.funcao = user.funcao;
    this.typeUser = user.typeUser;
    this.ome = user.ome ? new ReturnOmeLoginDto(user.ome) : undefined;
  }
}
