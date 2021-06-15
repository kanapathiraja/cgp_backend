import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users/users.service';
import { Users } from './entities/users.entity';
import { UserDetails } from './entities/users-details.entity';
import { CgpService } from '../cgp/cgp/cgp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users, UserDetails])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
