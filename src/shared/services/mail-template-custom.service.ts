import { Injectable } from '@nestjs/common';
import { Cgp } from 'src/app/cgp/entities/cgp.entity';
import { MailTemplateService } from 'src/app/mail-template/mail-template/mail-template.service';
import config from 'src/config/config';
import { constant } from '../constant/constant';
import { MailServiceService } from './mail-service.service';
const ejs = require('ejs');

@Injectable()
export class MailTemplateCustomService {
  constructor(
    private mailService: MailServiceService,
    private readonly mailTemplateService: MailTemplateService
  ) {}

  async mailUserRegister(users: any, password: string) {
    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      password: password,
      appUrl: config.appUrl,
    };

    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td> <p>Dear <%= firstName %><%= lastName %></p> <p> Welcome to CGP! </p> <p> Thank you for registering with us. Find your account details as below</p> <p> Email:  <%= email %></p> <p> Password:  <%= password %></p> <p>Regards</p> <p>Admin</p></td></tr></table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
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

    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td> <p>Dear <%= firstName %> <%= lastName %></p> <p>You have recently requested to reset password for your CGP account. Click the button below to reset it. </p> <p><a target="_blank" href="<%= appUrl %>/#/auth/password/reset/<%= token %>"><button  style=" font-size: 16px;cursor: pointer;margin: 4px 2px;  text-align: center; color: white; padding: 10px 24px; cursor: pointer;color: #242222; ">Reset Password</button></a></p> <p>If you did not request a password reset, please ignore this email.</p> <p>Regards</p> <p>Admin</p> </td></tr></table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
      constant.mailTemplate.forgotPasswordTemplate,
    );
    this.mailService.sendEmail(
      users.email,
      'Forgotten Password reset',
      '',
      ejs.render(mailTemplate.content, data),
    );
  }

  async userResetPassword(users: any) {
    const data = {
      firstName: users.firstName,
      lastName: users.lastName,
      appUrl: config.appUrl,
    };

    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td> <p>Dear <%= firstName %><%= lastName %></p> <p> Your password has been reset successfully.</p> <p> Login to application via this url <a target="_blank" href="">click<a></p> <p>Regards</p> <p>Admin</p> </td></tr></table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
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

    const template =
    '<table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td> <p> Dear <%= firstName %><%= lastName %> </p> <p> We have received your request to reference your company <%= companyName %> as CGP.. </p> <br> <p> Company Email:<%= companyEmail %> </p> <p> Contact Person: <%= firstName %> <%= lastName %> </p> <p> Contact: <%= contact %> </p> <p> Company Address: <%= companyAddress %> </p> <br> <p> Your request is under verification and we will intimate you via email/call once the verification process is complete.</p> <br> <p> Regards </p> <p> Admin </p> </td> </tr> </table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
      constant.mailTemplate.cgpRequestTemplate,
    );

    this.mailService.sendEmail(
      cgp.contactEmail,
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

    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td> <p>Dear <%= firstName %><%= lastName %></p> <p>We have verified and activated your CGP profile </p> <p>CompanyName: <%= companyName %> </p> <p>Company Email:<%= companyEmail %></p> <p>Contact Person:<%= firstName %> <%= lastName %></p> <p>Contact:<%= contact %></p> <p>Click this link below to login and modify your profile as needed.</p> <p><a target="_blank" href="<%= appUrl %>/#/auth/password/set?id=<%= userId %>"><button  style=" font-size: 16px;cursor: pointer;margin: 4px 2px;  text-align: center; color: black; padding: 10px 24px;">Go to your CGP Profile </button></a></p> <p>Invite team members and create your appointment schedules to complete this profile.</p> <p>Regards</p> <p>Admin</p> </td></tr></table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
      constant.mailTemplate.adminCGPProfileVerifiedTemplate,
    );

    this.mailService.sendEmail(
      cgpApproved.contactEmail,
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

    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td> <p>Dear <%= firstName %> <%= lastName %></p><br> <p> You have set your password to your below account.</p><br> <p> Click this link below to login and complete your profile to start using our services.</p> <p><a target="_blank" href="<%= appUrl %>/#/auth/login">Login<a></p><br> <p> You will be able to,</p> <p> Add team members</p> <p> Set schedules / calendar </p> <p> Accept appointments </p><br> <p>Regards</p> <p>Admin</p> </td></tr></table>';

    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
      constant.mailTemplate.cgpSetPasswordTemplate,
    );
    this.mailService.sendEmail(
      users.email,
      mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }


  async mailTeamsInvite(payload: any, cgp: any): Promise<any> {
    const token = {
      email: payload,
      cgpId: cgp.id
    }
    const data = {
      appUrl: config.appUrl,
      token: Buffer.from(JSON.stringify(token)).toString('base64'),
      email: payload,
      cgpname: cgp.establishmentName
    };
    const template =
      '<table role="presentation" border="0" cellpadding="0" cellspacing="0"> <tr> <td> <p> Dear <%= firstName %><%= lastName %> </p> <p> We have received your request to reference your company <%= companyName %> as CGP.. </p> <br> <p> Company Email:<%= companyEmail %> </p> <p> Contact Person: <%= firstName %> <%= lastName %> </p> <p> Contact: <%= contact %> </p> <p> Company Address: <%= companyAddress %> </p> <br> <p> Your request is under verification and we will intimate you via email/call once the verification process is complete.</p> <br> <p> Regards </p> <p> Admin </p> </td> </tr> </table>';
    const mailTemplate = await this.mailTemplateService.findByTemplateCode(
      constant.mailTemplate.teamUserRegisteredTemplate,
    );
    this.mailService.sendEmail(
      payload,
      cgp.establishmentName + mailTemplate.subject,
      '',
      ejs.render(mailTemplate.content, data),
    );
  }
}
