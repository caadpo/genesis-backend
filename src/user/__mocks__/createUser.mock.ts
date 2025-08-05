import { CreateUserDto } from '../dtos/createUser.dto';
import { UserType } from '../enum/user-type.enum';

export const createUserMock: CreateUserDto = {
  loginSei: 'emerson.francisco1',
  email: 'emailMockTest@email.com',
  password: 'password',
  pg: 'Cb',
  mat: 1157590,
  nomeGuerra: 'Francisco',
  tipo: 'P',
  omeId: 1,
  phone: '325632634',
  funcao: 'Master',
  typeUser: UserType.Master,
};
