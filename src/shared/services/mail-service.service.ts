import { Injectable,  HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import config from 'src/config/config';

@Injectable()
export class MailServiceService {

    public sendEmail = async (email: string, subject: string, text: string, html: any) => {
        // create reusable transporter object using the default SMTP transport
        try{
            
            const transporter = nodemailer.createTransport({
              host: config.mail.host,
              port: config.mail.port,
              secure: config.mail.secure, // true for 465, false for other ports
              auth: {
                user: config.mail.user, // generated ethereal user
                pass: config.mail.pass, // generated ethereal password
              },
            });
            // send mail with defined transport object
            const info = await transporter.sendMail({
                                from:  config.mail.senderMail, // sender address
                                to: email, // list of receivers
                                subject: subject, // Subject line
                                text: text, // plain text body
                                html: html, // html body
                        }).then((response) => {
                            return response;
                        }).catch((error) => {
                            throw new HttpException('Email not sent', HttpStatus.OK);
                        });
       } catch(error) {
            console.error(error);
       }
    }
}
