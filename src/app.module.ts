import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './app/auth/auth.module';
import { UsersModule } from './app/users/users.module';
import { CgpModule } from './app/cgp/cgp.module';
import { ClientModule } from './app/client/client.module';
import { MailServiceTemplateService } from './shared/services/mail-service-template.service';
import { MailServiceService } from './shared/services/mail-service.service';
import { EasyconfigModule } from 'nestjs-easyconfig';
import { MailTemplateModule } from './app/mail-template/mail-template.module';
import { EasyConfiguration } from './shared/services/easyconfig.service';
import { AppointmentModule } from './app/appointment/appointment.module';
import { ConversationModule } from './app/conversation/conversation.module';
require('dotenv').config();

@Module({
  imports: [ 
    // database configuration 
    TypeOrmModule.forRoot(),
    AuthModule,
    UsersModule,
    CgpModule,
    ClientModule,
    AppointmentModule,
    MailTemplateModule,
    ConversationModule,
    EasyconfigModule.register({path: `environment/.env.${process.env.NODE_ENV}`, safe: true})
  ],
  controllers: [AppController],
  providers: [AppService, MailServiceService, MailServiceTemplateService, EasyConfiguration],
})
export class AppModule {}
