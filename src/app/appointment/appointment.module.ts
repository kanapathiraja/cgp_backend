import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/shared/services/common.service';
import { AuthModule } from '../auth/auth.module';
import { AppointmentController } from './appointment/appointment.controller';
import { AppointmentService } from './appointment/appointment.service';
import { Appointments } from './entities/appointment.entity';
import { Cgp } from '../cgp/entities/cgp.entity';
import { CgpTeams } from '../cgp/entities/cgp-teams.entity';
import { Users } from '../users/entities/users.entity';
import { CgpPracticalInfo } from "../cgp/entities/cgp-practicalInfo.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointments,
      Cgp,
      CgpTeams,
      CgpPracticalInfo,
      Users]),
    AuthModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, CommonService],
})
export class AppointmentModule {}
