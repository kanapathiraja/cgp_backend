import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonService } from 'src/shared/services/common.service';
import { MailServiceService } from 'src/shared/services/mail-service.service';
import { MailTemplate } from './entities/mail-template.entity';
import { MailTemplateController } from './mail-template/mail-template.controller';
import { MailTemplateService } from './mail-template/mail-template.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MailTemplate])
  ],
  controllers: [MailTemplateController],
  providers: [MailTemplateService, CommonService, MailServiceService],
  exports: [
    MailTemplateService
  ]
})
export class MailTemplateModule {}
