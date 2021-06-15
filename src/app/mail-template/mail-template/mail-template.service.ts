import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Cgp } from 'src/app/cgp/entities/cgp.entity';
import config from 'src/config/config';
import { constant } from 'src/shared/constant/constant';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { CommonService } from 'src/shared/services/common.service';
import { MailServiceService } from 'src/shared/services/mail-service.service';
import { Repository } from 'typeorm';
import { CreateMailTemplateDto } from '../dto/mail-template.dto';
import { MailTemplate } from '../entities/mail-template.entity';
const ejs = require('ejs');

@Injectable()
export class MailTemplateService {
  constructor(
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
    private readonly commonService: CommonService,
    private readonly mailService: MailServiceService,
  ) {}

  async createTemplate(
    mailTemplateData: CreateMailTemplateDto,
    currentUser: any,
  ): Promise<ResponseDto> {
    const templateCode = this.commonService.generateUID();

    const newMailTemplate = new MailTemplate();
    newMailTemplate.templateName = mailTemplateData.templateName;
    newMailTemplate.subject = mailTemplateData.subject;
    newMailTemplate.content = mailTemplateData.content;
    newMailTemplate.templateCode = templateCode;

    const errors = await validate(mailTemplateData);
    if (errors.length > 0) {
      throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
    } else {
      this.mailTemplateRepository.save(newMailTemplate);
      return this.commonService.buildCustomResponse(
        [],
        constant.notification.isSuccessFul,
        HttpStatus.OK.toString(),
      );
    }
  }

  async findByTemplateCode(templateCode: string): Promise<MailTemplate> {
    const mailTemplate = await this.mailTemplateRepository.findOne({
      templateCode: templateCode,
    });

    const errors = ' MailTemplate not found';
    if (!mailTemplate)
      throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);

    return mailTemplate;
  }

  async mailUserRegister(users: any, password: string) {
    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      password: password,
      appUrl: config.appUrl,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.userRegisteredTemplate,
    );

    this.mailService.sendEmail(
      users.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async mailForgotPassword(users: any, token: string) {
    console.log(
      'file: mail-service-template.service.ts - line 38 - MailServiceTemplateService - token',
      token,
    );

    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      userId: users.id,
      appUrl: config.appUrl,
      token: token,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.forgotPasswordTemplate,
    );
    console.log(
      'file: mail-template.service.ts - line 86 - MailTemplateService - mailTemplate',
      mailTemplate,
    );
    this.mailService.sendEmail(
      users.email,
      'Reset Forgotten Password',
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async mailUserResetPassword(users: any) {
    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      appUrl: config.appUrl,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.userResetPasswordTemplate,
    );

    this.mailService.sendEmail(
      users.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async mailCGPRequest(cgp: any): Promise<any> {
    const data = {
      firstName: cgp.firstName,
      lastName: cgp.lastName,
      companyName: cgp.establishmentName,
      companyEmail: cgp.email,
      contact: cgp.contactNumber,
      companyAddress: cgp.companyAddress,
      appUrl: config.appUrl,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.cgpRequestTemplate,
    );

    this.mailService.sendEmail(
      cgp.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async mailCGPUserApproved(cgpApproved: any, user?: any) {
    console.log(
      'file: mail-service-template.service.ts - line 103 - MailServiceTemplateService - cgpApproved',
      cgpApproved,
    );
    const data = {
      firstName: cgpApproved.firstName,
      lastName: cgpApproved.lastName,
      companyName: cgpApproved.establishmentName,
      companyEmail: cgpApproved.email,
      contact: cgpApproved.contactNumber,
      cgpId: cgpApproved.id,
      userId: user.id,
      appUrl: config.appUrl,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.adminCGPProfileVerifiedTemplate,
    );

    this.mailService.sendEmail(
      cgpApproved.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async mailCGPSetPassword(users: any, cgp: Cgp) {
    console.log(
      'file: mail-service-template.service.ts - line 136 - MailServiceTemplateService - cgp',
      cgp,
    );

    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      companyName: cgp ? cgp.establishmentName : '',
      companyEmail: cgp ? cgp.email : '',
      companyAddress: cgp ? cgp.companyAddress : '',
      contactNumber: cgp ? cgp.contactNumber : '',
      appUrl: config.appUrl,
    };

    const mailTemplate = await this.findByTemplateCode(
      constant.mailTemplate.cgpSetPasswordTemplate,
    );

    this.mailService.sendEmail(
      users.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }
}
