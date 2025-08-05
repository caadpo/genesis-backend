import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';

export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as LoginPayload;

  return user?.id;
});
