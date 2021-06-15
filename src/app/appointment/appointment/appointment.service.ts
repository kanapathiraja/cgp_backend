import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointments } from '../entities/appointment.entity';
import { ResponseDto } from '../../../shared/dto/response.dto';
import { Cgp } from '../../cgp/entities/cgp.entity';
import { constant } from '../../../shared/constant/constant';
import { CgpTeams } from '../../cgp/entities/cgp-teams.entity';
const moment = require('moment-timezone');
import {
  AppointmentInfoDto,
  AppointmentStatusUpdateDto,
  CreateAppointmentDto,
} from '../dto/appointment.dto';
import { Role, Users } from '../../users/entities/users.entity';
import { CommonService } from '../../../shared/services/common.service';
import { plainToClass } from 'class-transformer';
import { ArticleInfoDto } from '../../cgp/dto/cgp-articles.dto';
import { CgpPracticalInfo } from '../../cgp/entities/cgp-practicalInfo.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointments)
    private readonly appointmentsRepository: Repository<Appointments>,
    @InjectRepository(Cgp)
    private readonly cgpRepository: Repository<Cgp>,
    @InjectRepository(CgpTeams)
    private readonly cgpTeamRepository: Repository<CgpTeams>,
    @InjectRepository(CgpPracticalInfo)
    private readonly cgpPracticalInfoRepository: Repository<CgpPracticalInfo>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly commonService: CommonService,
  ) {}

  // Book an Appointment
  async bookAppointment(
    appointmentData: CreateAppointmentDto,
  ): Promise<ResponseDto> {
    const cgp = await this.cgpRepository.findOne({ id: appointmentData.cgpId });
    const user = await this.userRepository.findOne({
      id: appointmentData.userId,
    });
    const cgpTeam = await this.cgpTeamRepository.findOne({
      id: appointmentData.teamId,
    });

    const appointments = new Appointments();
    appointments.cgp = cgp;
    appointments.users = user;
    appointments.cgpTeams = cgpTeam;
    appointments.appointmentType = appointmentData.appointmentType;
    appointments.reason = appointmentData.reason;
    appointments.date = appointmentData.date;
    appointments.slotStartTime = appointmentData.slotStartTime;
    appointments.slotEndTime = appointmentData.slotEndTime;

    this.appointmentsRepository.save(appointments);
    return this.commonService.buildCustomResponse(
      [],
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  // Book an Appointment
  async getAvailableSlot(params: any): Promise<ResponseDto> {
    const cgpPractical = await this.cgpPracticalInfoRepository.find({
      cgp: params.cgpId,
      dayName: params.day,
    });

    if (cgpPractical.length) {
      const bookedSlot = await this.appointmentsRepository.find({
        date: params.date,
        cgpTeams: params.teamId,
      });

      let fromTime = cgpPractical[0].startTime;
      const toTime = cgpPractical[0].endTime;

      let lastBookedTime;
      let isBooked = false;

      const availableSlots = [];
      const currentDate = new Date();

      for (let start = fromTime; start < toTime; ) {
        fromTime = start;
        isBooked = false;
        const end = moment(fromTime)
          .add(params.slot, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss');

        if (end < toTime) {
          if (bookedSlot.length > 0) {
            bookedSlot.forEach((list) => {
              list.date = moment(list.date).format('YYYY-MM-DD');
              let bookedStartTime;
              let bookedEndTime;
              let bookTime;
              bookTime = list.date + ' ' + list.slotStartTime;
              bookedStartTime = moment(list.date + ' ' + list.slotStartTime);
              bookedEndTime = moment(list.date + ' ' + list.slotEndTime);

              const checkedTime = moment(start);

              if (
                bookedStartTime <= checkedTime &&
                bookedEndTime > checkedTime
              ) {
                const length = availableSlots.length;
                length !== 0
                  ? (availableSlots[length - 1].to = list.slotStartTime)
                  : '';
                const splitedDate = currentDate.toString().split('T');
                const time = splitedDate[1].split('.');
                const dateAndTime = splitedDate[0] + ' ' + time[0];

                if (new Date(currentDate) > new Date(bookTime)) {
                  availableSlots.push({
                    from: moment(bookedStartTime).format('HH:mm:ss'),
                    to: moment(bookedEndTime).format('HH:mm:ss'),
                    isBooked: true,
                    isExist: true,
                  });
                } else {
                  availableSlots.push({
                    from: moment(bookedStartTime).format('HH:mm:ss'),
                    to: moment(bookedEndTime).format('HH:mm:ss'),
                    isBooked: true,
                    isExist: false,
                  });
                }
                lastBookedTime = moment(bookedEndTime).format(
                  'YYYY-MM-DD HH:mm:ss',
                );
                isBooked = true;
              }
            });
          }

          if (!isBooked) {
            const date = moment(currentDate).format('YYYY-MM-DD');
            const time = moment(currentDate).format('HH:mm:ss');
            if (moment(date + ' ' + time) > moment(fromTime)) {
              availableSlots.push({
                from: moment(fromTime).format('HH:mm:ss'),
                to: moment(end).format('HH:mm:ss'),
                isBooked: false,
                isExist: true,
              });
            } else {
              availableSlots.push({
                from: moment(fromTime).format('HH:mm:ss'),
                to: moment(end).format('HH:mm:ss'),
                isBooked: false,
                isExist: false,
              });
            }
          }
        } else {
          break;
        }

        start = isBooked ? lastBookedTime : end;
      }

      return this.commonService.buildCustomResponse(
        availableSlots,
        constant.notification.isSuccessFul,
        HttpStatus.CREATED.toString(),
      );
    } else {
      return this.commonService.buildCustomResponse(
        [],
        constant.notification.isSuccessFul,
        HttpStatus.CREATED.toString(),
      );
    }
  }

  // Appointment list by teams
  async apppointmentListByTeams(
    teamId: any,
    status: any,
  ): Promise<ResponseDto> {
    const qbcgp = await this.appointmentsRepository.createQueryBuilder(
      'appointments',
    );
    qbcgp.leftJoinAndSelect('appointments.cgpTeams', 'cgpTeams');
    qbcgp.leftJoinAndSelect('appointments.users', 'users');

    let appointmentList = [];
    if (status) {
      qbcgp.where(
        ' cgpTeams.id = (:teamId) and appointments.status = (:status)',
        {
          teamId: teamId,
          status: status,
        },
      );
    } else {
      qbcgp.where(' cgpTeams.id = (:teamId)', {
        teamId: teamId,
      });
    }
    appointmentList = await qbcgp.getManyAndCount();

    const appointments = plainToClass(AppointmentInfoDto, appointmentList);
    return this.commonService.buildCustomResponse(
      appointments,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  // Appointment list by users
  async appointmentListByUserId(
    userId: any,
    status: any,
  ): Promise<ResponseDto> {
    const qbcgp = await this.appointmentsRepository.createQueryBuilder(
      'appointments',
    );
    qbcgp.leftJoinAndSelect('appointments.cgpTeams', 'cgpTeams');
    qbcgp.leftJoinAndSelect('appointments.users', 'users');

    let appointmentList = [];
    if (status) {
      qbcgp.where(' users.id = (:userId) and appointments.status = (:status)', {
        userId: userId,
        status: status,
      });
    } else {
      qbcgp.where(' users.id = (:userId)', {
        userId: userId,
      });
    }
    appointmentList = await qbcgp.getManyAndCount();

    const appointments = plainToClass(AppointmentInfoDto, appointmentList);
    return this.commonService.buildCustomResponse(
      appointments,
      constant.notification.isSuccessFul,
      HttpStatus.CREATED.toString(),
    );
  }

  async appointmentStatusUpdate(
    appointmentStatusUpdateDto: AppointmentStatusUpdateDto,
    appointmentId: string,
  ): Promise<ResponseDto> {
    const appointments = await this.appointmentsRepository.findOne({
      id: appointmentId,
    });
    if (!appointments) {
      const errors = { username: 'Appointment is not found.' };
      throw new HttpException(errors, HttpStatus.BAD_REQUEST);
    }

    console.log(appointments);
    appointments['status'] = appointmentStatusUpdateDto.status;

    this.appointmentsRepository.update(appointments.id, appointments);

    return this.commonService.buildCustomResponse(
      [],
      status,
      HttpStatus.CREATED.toString(),
    );
  }
}
