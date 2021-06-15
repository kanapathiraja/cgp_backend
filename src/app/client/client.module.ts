import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/shared/services/common.service';
import { Client } from './entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client], )
  ],
  controllers: [ClientController],
  providers: [ClientService, CommonService]
})
export class ClientModule {}
