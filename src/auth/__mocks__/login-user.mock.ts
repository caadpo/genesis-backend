import { userEntityMock } from '../../user/__mocks__/user.mock';
import { LoginDto } from '../dtos/login.dto';

export const loginUserMock: LoginDto = {
  loginSei: userEntityMock.loginSei,
  password: 'genesispmpe',
};
