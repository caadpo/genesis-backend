import { userEntityMock } from 'src/user/__mocks__/user.mock';
import { UpdateMasterDTO } from '../dtos/update-master.dto';

export const updateMasterMock: UpdateMasterDTO = {
  userId: userEntityMock.id,
};
