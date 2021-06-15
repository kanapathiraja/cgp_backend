import { Injectable } from '@nestjs/common';
import { Cgp } from 'src/app/cgp/entities/cgp.entity';
import config from 'src/config/config';
import { MailServiceService } from './mail-service.service';
var ejs = require('ejs');

@Injectable()
export class MailServiceTemplateService {

    constructor(
        private mailService: MailServiceService,
    ) { }

    capitalizeFirstLetter(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }


    userRegistered(users: any, password: string){

        const data = {
            firstName: this.capitalizeFirstLetter(users.firstName),
            lastName: this.capitalizeFirstLetter(users.lastName),
            email: users.email,
            password: password
        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'
        +'<p>Dear  <%= firstName %> <%= lastName %></p>'
        +'<p> Welcome to CGP! </p>'
        +'<p> Thank you for registering with us. Find your account details as below</p>'
        +'<p> Email:  <%= email %></p>'
        +'<p> Password:  <%= password %></p>'
        +'<p>Regards</p> <p>Admin</p>';
        +'</td></tr></table>';

        this.mailService.sendEmail(users.email, 'Thank you for registering with CGP', '', ejs.render(template, data))
    }


    sendForgotPassword(users: any, token: string){
    console.log("file: mail-service-template.service.ts - line 38 - MailServiceTemplateService - token", token);

        const data = {
            firstName: this.capitalizeFirstLetter(users.firstName),
            lastName: this.capitalizeFirstLetter(users.lastName),
            userId: users.id
        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'
            +'<p>Dear  <%= firstName %> <%= lastName %></p>'
            +'<p>You have recently requested to reset password for your CGP account. Click the button below to reset it. </p>'
            +'<p><a target="_blank" href="'+config.appUrl+'/#/auth/password/reset/'+ token +'"><button  style=" font-size: 16px;cursor: pointer;margin: 4px 2px;  text-align: center; color: white; padding: 10px 24px; cursor: pointer;color: #242222; ">Reset Password</button></a></p>'
            +'<p>If you did not request a password reset, please ignore this email.</p>'
            +'<p>Regards</p> <p>Admin</p>'
            +'</td></tr></table>';

        this.mailService.sendEmail(users.email, 'Forgotten Password reset', '', ejs.render(template, data))
    }


    userResetPassword(users: any){

        const data = {
            firstName: this.capitalizeFirstLetter(users.firstName),
            lastName: this.capitalizeFirstLetter(users.lastName),
        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'
        +'<p>Dear  <%= firstName %> <%= lastName %></p>'
        +'<p> Your password has been reset successfully.</p>'
        +'<p> Login to application via this url <a target="_blank" href="">click<a></p>'
        +'<p>Regards</p> <p>Admin</p>';
        +'</td></tr></table>';

        this.mailService.sendEmail(users.email, 'Password Reset successfully', '', ejs.render(template, data))
    }



    async sendCGPRequestUser(cgp: any):Promise<any>{

        const data = {
            firstName: this.capitalizeFirstLetter(cgp.firstName),
            lastName:  this.capitalizeFirstLetter(cgp.lastName),
            companyName: this.capitalizeFirstLetter(cgp.establishmentName),
            companyEmail: cgp.email,
            contact: cgp.contactNumber,
            companyAddress: cgp.companyAddress
        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'
        +'<p>Dear  <%= firstName %> <%= lastName %></p>'

        +'<p>We have received your	 request to reference your company "<%= companyName %>" as CGP.. </p><br>'

        +'<p>Company Email:<%= companyEmail %></p>'
        +'<p>Contact Person: <%= firstName %> <%= lastName %></p>'
        +'<p>Contact: <%= contact %></p>'
        +'<p>Company Address: <%= companyAddress %></p><br>'

        +'<p>Your request is under verification and we will intimate you via email/call once the verification process is complete.</p><br>'

        +'<p>Regards</p>'
        +'<p>Admin</p>'
        +'</td></tr></table>';

        this.mailService.sendEmail(cgp.email, 'Thank you for showing interest in CGP ', '', ejs.render(template, data))
    }

    sendCGPUserApproved(cgpApproved: any, user?: any){
        console.log("file: mail-service-template.service.ts - line 103 - MailServiceTemplateService - cgpApproved", cgpApproved);
        const data = {
            firstName: this.capitalizeFirstLetter(cgpApproved.firstName),
            lastName:  this.capitalizeFirstLetter(cgpApproved.lastName),
            companyName: this.capitalizeFirstLetter(cgpApproved.establishmentName),
            companyEmail: cgpApproved.email,
            contact: cgpApproved.contactNumber,
            cgpId: cgpApproved.id,
            userId: user.id

        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'
        +'<p>Dear  <%= firstName %> <%= lastName %></p>'
        +'<p>We have verified and activated your CGP profile </p>'
        +'<p>CompanyName: <%= companyName %> </p>'
        +'<p>Company Email:<%= companyEmail %></p>'
        +'<p>Contact Person:<%= firstName %> <%= lastName %></p>'
        +'<p>Contact:<%= contact %></p>'
        +'<p>Click this link below to login and modify your profile as needed.</p>'
        +'<p><a target="_blank" href="'+config.appUrl+'/#/auth/password/set?id=<%= userId %>"><button  style=" font-size: 16px;cursor: pointer;margin: 4px 2px;  text-align: center; color: black; padding: 10px 24px;">Go to your CGP Profile </button></a></p>'
        +'<p>Invite team members and create your appointment schedules to complete this profile.</p>'
        +'<p>Regards</p>'
        +'<p>Admin</p>'
        +'</td></tr></table>';

        this.mailService.sendEmail(cgpApproved.email, 'Your CGP profile is Approved', '', ejs.render(template, data))

    }


    CGPSetPassword(users: any, cgp: Cgp){
    console.log("file: mail-service-template.service.ts - line 136 - MailServiceTemplateService - cgp", cgp);

        const data = {
            firstName: this.capitalizeFirstLetter(users.firstName),
            lastName: this.capitalizeFirstLetter(users.lastName),
            companyName: cgp ? this.capitalizeFirstLetter(cgp.establishmentName) : '',
            companyEmail: cgp ? cgp.email : '',
            companyAddress: cgp ? cgp.companyAddress : '',
            contactNumber: cgp ? cgp.contactNumber : ''
        }

        let template = '<table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td>'

        +'<p>Dear  <%= firstName %> <%= lastName %></p><br>'

        +'<p> You have set your password to your below account.</p><br>'

        +'<p> Click this link below to login and complete your profile to start using our services.</p>'
        +'<p><a target="_blank" href="'+config.appUrl+'/#/auth/login">Login<a></p><br>'

        +'<p> You will be able to,</p>'
        +'<p> Add team members</p>'
        +'<p> Set schedules / calendar </p>'
        +'<p> Accept appointments </p><br>'

        +'<p>Regards</p> <p>Admin</p>';
        +'</td></tr></table>';

        this.mailService.sendEmail(users.email, 'Your password has been set', '', ejs.render(template, data))
    }

}
