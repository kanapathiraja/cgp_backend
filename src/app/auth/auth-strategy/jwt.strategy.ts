import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../../users/users/users.service';
import config from 'src/config/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secretOrKey
    });
  }

  async validate(payload: any) {
    console.log("file: jwt.strategy.ts - line 19 - JwtStrategy - payload", payload);
    const user = await this.usersService.findOne(payload.userData.email);
    if (!user) {
      throw new UnauthorizedException('You are not authorized to perform the operation');
    }
    return payload;
  }
}