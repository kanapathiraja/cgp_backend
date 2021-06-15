import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { HttpExceptionFilter } from '../../../shared/exception-filters/http-exception.filter';
import { ResponseDto } from '../../../shared/dto/response.dto';
import {
  AppointmentStatusUpdateDto,
  CreateAppointmentDto,
} from '../dto/appointment.dto';
import { CGPStatusUpdateDto } from '../../cgp/dto/cgp.dto';

@Controller('appointment')
@ApiTags('appointment')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Post('bookAppointment')
  @ApiBody({ type: CreateAppointmentDto })
  async bookAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<ResponseDto> {
    return await this.appointmentService.bookAppointment(createAppointmentDto);
  }

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('slots/list/:cgpId/:teamId/:day/:slot')
  @ApiParam({ name: 'cgpId' })
  @ApiParam({ name: 'teamId' })
  @ApiParam({ name: 'day' })
  @ApiParam({ name: 'slot' })
  @ApiBody({ type: CreateAppointmentDto })
  async slotsList(
    @Param() params: any,
  ): Promise<ResponseDto> {
    return await this.appointmentService.getAvailableSlot(params);
  }

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('list/teams/:teamId')
  @ApiParam({ name: 'teamId' })
  @ApiQuery({ name: 'status', required: false })
  async appointmentListByTeamId(
    @Param() params: any,
    @Query('status') status: string,
  ): Promise<ResponseDto> {
    return await this.appointmentService.apppointmentListByTeams(
      params.teamId,
      status,
    );
  }

  // User rquest to register
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Get('list/users/:userId')
  @ApiParam({ name: 'userId' })
  @ApiQuery({ name: 'status', required: false })
  async appointmentListByUserId(
    @Param() params: any,
    @Query('status') status: string,
  ): Promise<ResponseDto> {
    return await this.appointmentService.appointmentListByUserId(
      params.userId,
      status,
    );
  }

  // Appointment status update
  @UseFilters(new HttpExceptionFilter())
  @UsePipes(new ValidationPipe())
  @Put('status/update/:appointmentId')
  @ApiParam({ name: 'appointmentId' })
  async appointmentStatusUpdate(
    @Body() appointmentStatusUpdateDto: AppointmentStatusUpdateDto,
    @Param() params: any,
  ): Promise<ResponseDto> {
    console.log(params);
    return await this.appointmentService.appointmentStatusUpdate(
      appointmentStatusUpdateDto,
      params.appointmentId,
    );
  }
}
