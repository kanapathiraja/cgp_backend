import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth-strategy/local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './auth-strategy/jwt.strategy';
import { UsersService } from '../users/users/users.service';
import { AuthService } from './auth/auth.service';
import { Users } from '../users/entities/users.entity';
import config from 'src/config/config';
import { CommonService } from 'src/shared/services/common.service';
import { JwtCustomService } from 'src/shared/services/jwt-custom.service';
import { MailServiceTemplateService } from 'src/shared/services/mail-service-template.service';
import { MailServiceService } from 'src/shared/services/mail-service.service';
import { UserDetails } from '../users/entities/users-details.entity';
import { MailTemplateCustomService } from 'src/shared/services/mail-template-custom.service';
import { MailTemplateService } from '../mail-template/mail-template/mail-template.service';
import { MailTemplate } from '../mail-template/entities/mail-template.entity';
import { CgpTeams } from "../cgp/entities/cgp-teams.entity";
import { Cgp } from "../cgp/entities/cgp.entity";

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.register({
      secret: config.jwt.secretOrKey,
        signOptions: {expiresIn:  config.jwt.expiresIn}
    }),
    TypeOrmModule.forFeature([Users, UserDetails, MailTemplate, Cgp, CgpTeams])
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    UsersService,
    CommonService,
    JwtCustomService,
    MailServiceService,
    MailTemplateCustomService,
    MailTemplateService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
