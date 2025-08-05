import { userEntityMock } from 'src/user/__mocks__/user.mock';
import { CreateMasterDTO } from '../dtos/create-master.dto';

export const createMasterMock: CreateMasterDTO = {
  userId: userEntityMock.id,
};
