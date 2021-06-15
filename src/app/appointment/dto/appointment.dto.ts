import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { AppointmentStatus } from '../entities/appointment.entity';

// Request DTO
export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  appointmentType: string;

  @ApiProperty()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsNotEmpty()
  date: string;

  @ApiProperty()
  @IsNotEmpty()
  slotStartTime: string;

  @ApiProperty()
  @IsNotEmpty()
  slotEndTime: string;

  @ApiProperty()
  @IsNotEmpty()
  cgpId: string;

  @ApiProperty()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}

// Request DTO
export class AppointmentStatusUpdateDto {
  @ApiProperty()
  @IsNotEmpty()
  status: AppointmentStatus;
}

@Exclude()
export class AppointmentInfoDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  appointmentType: string;

  @ApiProperty()
  @Expose()
  reason: string;

  @ApiProperty()
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  slotStartTime: string;

  @ApiProperty()
  @Expose()
  slotEndTime: string;

  @ApiProperty()
  @Expose()
  status: string;

  @Expose()
  @Type(() => CgpTeamsInfoForAppointment)
  cgpTeams: CgpTeamsInfoForAppointment[];

  @Expose()
  @Type(() => UsersInfoForAppointment)
  users: UsersInfoForAppointment[];
}

@Exclude()
export class CgpTeamsInfoForAppointment {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstname: string;

  @ApiProperty()
  @Expose()
  lastname: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  designation: string;
}

@Exclude()
export class UsersInfoForAppointment {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  role: string;
}
