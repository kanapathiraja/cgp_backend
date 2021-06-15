import { Injectable, HttpException, HttpStatus  } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../entities/client.entity';
import { CreateClientDto, ViewClientDto} from '../dto/client.dto';
import { validate } from 'class-validator';
import { CommonService } from 'src/shared/services/common.service';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { plainToClass } from 'class-transformer';
import { constant } from 'src/shared/constant/constant';

@Injectable()
export class ClientService {

    constructor(
        @InjectRepository(Client)
        private readonly clientRepository: Repository<Client>,
        private readonly commonService: CommonService,      
    ) { }


    async createClient(createClientData: CreateClientDto): Promise<ResponseDto> {
        const errors = await validate(createClientData);
        if (errors.length > 0) {
            const _errors = { username: 'Userinput is not valid.' };
            throw new HttpException({ message: 'Input data validation failed', _errors }, HttpStatus.BAD_REQUEST);
        } else {
            const client = await this.clientRepository.save(createClientData);
            return this.commonService.buildCustomResponse(client, constant.notification.cgpRequestSuccess, HttpStatus.OK.toString());
        }
    }

    async findAll(): Promise<ResponseDto> {

        const queryBuilder = await this.clientRepository.createQueryBuilder('client');
        queryBuilder.select(["client.id", "client.clientName", "client.activeFlag"]);
        queryBuilder.where("client.status = :status", { status: 1 });
        queryBuilder.orderBy('client.id', 'DESC'); 

        const client = await queryBuilder.getMany();
        const clientData = plainToClass(ViewClientDto, client);
        return this.commonService.buildCustomResponse(clientData, "Successfully received", HttpStatus.OK.toString());

    }


}
 