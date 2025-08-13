// src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { LoginPayload } from '../dtos/loginPayload.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken, // Cookies
        ExtractJwt.fromAuthHeaderAsBearerToken(),    // Header Authorization: Bearer
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: LoginPayload) {
    return payload;
  }
}
