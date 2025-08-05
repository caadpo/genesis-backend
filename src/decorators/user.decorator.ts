import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LoginPayload } from 'src/auth/dtos/loginPayload.dto';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): LoginPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as LoginPayload;
  },
);
