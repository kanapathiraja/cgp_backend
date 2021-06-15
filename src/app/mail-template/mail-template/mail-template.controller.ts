import { Body, Controller, Post, UseFilters, UseGuards, UsePipes, ValidationPipe, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';
import { CreateMailTemplateDto } from '../dto/mail-template.dto';
import { MailTemplateService } from './mail-template.service';

@Controller('mail-template')
export class MailTemplateController {

    constructor(private readonly mailTemplateService: MailTemplateService) {}

     // To create a new mail template
    //  @UseGuards(AuthGuard('jwt'))
     @UseFilters(new HttpExceptionFilter())
     @UsePipes(new ValidationPipe())
     @Post('/create')
     @ApiBody({ type: CreateMailTemplateDto })
     async createTemplate(@Body() createMailTemplateData: CreateMailTemplateDto, @Request() req: any) {
       return await this.mailTemplateService.createTemplate(createMailTemplateData, req.user);
     }
}
