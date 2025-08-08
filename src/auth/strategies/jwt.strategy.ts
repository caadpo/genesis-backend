// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoginPayload } from '../dtos/loginPayload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // src/auth/strategies/jwt.strategy.ts
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken,
      ]),

      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: LoginPayload) {
    return payload;
  }
}
