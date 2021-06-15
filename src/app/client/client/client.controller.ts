import { Body, Controller, Post, UseFilters, UsePipes, ValidationPipe, Request, Put, Param, Get } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { ClientService } from './client.service';
import { CreateClientDto } from '../dto/client.dto';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';

@Controller('client')
@ApiTags('client')
export class ClientController {

    constructor(private clientService: ClientService) {}  

    @UseFilters(new HttpExceptionFilter())
    @Post('create')
    @ApiBody({ type: CreateClientDto})
    async createClient(@Body() createClientData: CreateClientDto): Promise<ResponseDto>{
      return await this.clientService.createClient(createClientData);
    }

    @UseFilters(new HttpExceptionFilter())
    @Get('getClient')
    async getClient(@Request() req: any): Promise<ResponseDto>{
      return null; //await this.cgpService.getCGPInformation(req.query.cgpId);
    }

    @UseFilters(new HttpExceptionFilter())
    @Get('getAllClient')
    async findAll(): Promise<ResponseDto> {
      return await this.clientService.findAll();
    }
}
 