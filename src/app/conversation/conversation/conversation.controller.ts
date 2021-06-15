import { Body, Controller, Get, Param, Post, Put, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { HttpExceptionFilter } from 'src/shared/exception-filters/http-exception.filter';
import { createConversationDto } from '../dto/create-conversation.dto';
import { MessageDto, MessageUpdateDto } from '../dto/message.dto';
import { ConversationService } from './conversation.service'

@Controller('conversation')
@ApiTags('conversation')
export class ConversationController {
    constructor(
        private conversationService: ConversationService
      ) {}
      

        // conversation creation
        @UseFilters(new HttpExceptionFilter())
        @UsePipes(new ValidationPipe())
        @Post('send')
        @ApiBody({ type: MessageDto })
        async sendMessage(@Body() messageDto: MessageDto): Promise<ResponseDto> {
        return await this.conversationService.sendMessage(messageDto);
        }


         //  @UseGuards(AuthGuard('jwt'))
         @UseFilters(new HttpExceptionFilter())
         @UsePipes(new ValidationPipe())
         @Get('getAllTeamConversation/:teamId')
         @ApiParam({ name: 'teamId' })
         async getAllConversationForTeam(@Param() params: any): Promise<ResponseDto> {
           return await this.conversationService.getAllConversationForTeam(params.teamId);
         }

          //  @UseGuards(AuthGuard('jwt'))
          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Get('getAllUserConversation/:userId')
          @ApiParam({ name: 'userId' })
          async getAllUserConversation(@Param() params: any): Promise<ResponseDto> {
            return await this.conversationService.getAllUserConversation(params.userId);
          }
         
          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Get('getAllConversation/:conversationId')
          @ApiParam({ name: 'conversationId' })
          async getAllTeamConversation(@Param() params: any): Promise<ResponseDto> {
            return await this.conversationService.getAllConversation(params.conversationId);
          }

          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Get('getAllNewTeamConversationCount')
          async getAllNewConversationCount(): Promise<ResponseDto> {
            return await this.conversationService.getAllNewTeamConversationCount();
          }

          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Get('getAllNewUserConversationCount')
          async getAllNewUserConversationCount(): Promise<ResponseDto> {
            return await this.conversationService.getAllNewUserConversationCount();
          }

            // Update CGP Team Specfic team id
           // update CGP CLient info based on CGPId
          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Put('messageUserViewUpdate')
          @ApiBody({ type: MessageUpdateDto })
          async updateMessageView( @Body() messageUpdateDto: MessageUpdateDto): Promise<ResponseDto> {
            console.log(messageUpdateDto);
            return await this.conversationService.updateTeamMessageView(messageUpdateDto);
          }

          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Put('messageTeamViewUpdate')
          @ApiBody({ type: MessageUpdateDto })
          async updateUserMessageView( @Body() messageUpdateDto: MessageUpdateDto): Promise<ResponseDto> {
            console.log(messageUpdateDto);
            return await this.conversationService.updateUserMessageView(messageUpdateDto);
          }

          @UseFilters(new HttpExceptionFilter())
          @UsePipes(new ValidationPipe())
          @Get('getTeamUser/:emailId')
          @ApiParam({ name: 'emailId' })
          async getTeamUserDetail(@Param() params: any): Promise<ResponseDto> {
            return await this.conversationService.getTeamUserDetail(params.emailId);
          }

}
