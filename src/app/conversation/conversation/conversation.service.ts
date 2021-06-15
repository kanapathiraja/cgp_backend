import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CgpTeams } from 'src/app/cgp/entities/cgp-teams.entity';
import { Users } from 'src/app/users/entities/users.entity';
import { constant } from 'src/shared/constant/constant';
import { ResponseDto } from 'src/shared/dto/response.dto';
import { CommonService } from 'src/shared/services/common.service';
import { Repository } from 'typeorm';
import { createConversationDto } from '../dto/create-conversation.dto';
import { ChatInfoDto, MessageDto, MessageUpdateDto } from '../dto/message.dto';
import { Chats } from '../entities/chats.entity';
import { Conversation } from '../entities/conversation.entity';

@Injectable()
export class ConversationService {

    constructor(
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(CgpTeams)
        private readonly cgpTeamRepository: Repository<CgpTeams>,
        @InjectRepository(Conversation)
        private readonly ConversationRepository: Repository<Conversation>,
        private readonly commonService: CommonService,
        @InjectRepository(Chats)
        private readonly ChatsRepository: Repository<Chats>,
    ){}


          async sendMessage(messageDto: MessageDto): Promise<ResponseDto> {
                 const {  message, fromUserId , createdBy, teamUserId } = messageDto;
                 const user = await this.usersRepository.findOne({ id: fromUserId });
                 if(!user) {
                    const errors = { name: 'User is not found.' };
                    throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                 }
                 const team = await this.cgpTeamRepository.findOne({ id: teamUserId });
                 if(!team) {
                  const errors = { name: 'Team user is not found.' };
                  throw new HttpException(errors, HttpStatus.BAD_REQUEST);
               }
                 const conversationInfo = await this.ConversationRepository.find({ where: {
                    users: fromUserId,
                    cgpTeams: teamUserId
                }})
                let response;
                if(!conversationInfo.length) {
                    const conversation = new Conversation();
                    conversation.users = user;
                    conversation.cgpTeams = team;
                    conversation.createdAt = new Date();
                    conversation.updatedAt = new Date();
                    response =  await this.ConversationRepository.save(conversation);
                } else {
                    response = conversationInfo[0];
                }
                const conversationResponse = await this.ConversationRepository.findOne({ id: response.id });
                if (!conversationResponse) {
                    const errors = { name: 'Conversation is not found.' };
                    throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                  }
                const chats = new Chats();
                chats.conversation = conversationResponse;
                chats.message = message;
                chats.isReadTeam = messageDto.isReadTeam;
                chats.isReadUser = messageDto.isReadUser;
                chats.fromUserId = createdBy;
                chats.createdAt = new Date();
                chats.updatedAt = new Date();
                const chatResponse = this.ChatsRepository.save(chats);
                return this.commonService.buildCustomResponse(
                chatResponse,
                  constant.notification.cgpRequestSuccess,
                  HttpStatus.CREATED.toString(),
                );
              }

              async getAllConversationForTeam(teamId: any): Promise<ResponseDto> {
                const teamConversationList = await this.ConversationRepository.find({ where: { 'cgpTeams': teamId }, relations: ['users', 'cgpTeams']});
                if (!teamConversationList.length) {
                  const errors = { users: 'conversation not found.' };
                  throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                } 
                return this.commonService.buildCustomResponse(
                  teamConversationList,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }

              async getAllUserConversation(userId: any): Promise<ResponseDto> {
                const userConversationList = await this.ConversationRepository.find({ where: { 'users': userId }, relations: ['users', 'cgpTeams']});
                if (!userConversationList.length) {
                  const errors = { users: 'conversation not found.' };
                  throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                }
                return this.commonService.buildCustomResponse(
                    userConversationList,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }


              async getAllConversation(conversationId: any): Promise<ResponseDto> {
                const conversationList = await this.ChatsRepository.findAndCount({ where: { 'conversation': conversationId }, relations: ['conversation']})
                if (!conversationList.length) {
                  const errors = { users: 'conversation not found.' };
                  throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                }
                return this.commonService.buildCustomResponse(
                  conversationList,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }


              async getAllNewTeamConversationCount(): Promise<ResponseDto> {
                const conversationCount = await this.ChatsRepository.createQueryBuilder("chats").select("chats.conversation").addSelect("COUNT(chats)", "count").where("chats.isReadUser = :val", { val: false })
                .groupBy("chats.conversation")
                .getRawMany();
                return this.commonService.buildCustomResponse(
                  conversationCount,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }

              async getAllNewUserConversationCount(): Promise<ResponseDto> {
                const conversationCount = await this.ChatsRepository.createQueryBuilder("chats").select("chats.conversation").addSelect("COUNT(chats)", "count").where("chats.isReadTeam = :val", { val: false })
                .groupBy("chats.conversation")
                .getRawMany();
                return this.commonService.buildCustomResponse(
                  conversationCount,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }


              async updateTeamMessageView(messageUpdateDto: MessageUpdateDto): Promise<ResponseDto> {
                const messageUpdate = new MessageUpdateDto();
                await this.ChatsRepository.createQueryBuilder("chats")
                .update(Chats)
                .set({ isReadTeam : true })
                .where("conversation = :id", { id: messageUpdateDto.conversationId })
                .andWhere("fromUserId = :userId", { userId: messageUpdateDto.fromUserId})
                .execute();
                return this.commonService.buildCustomResponse(
                  [],
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }

              async updateUserMessageView(messageUpdateDto: MessageUpdateDto): Promise<ResponseDto> {
                const messageUpdate = new MessageUpdateDto();
                await this.ChatsRepository.createQueryBuilder("chats")
                .update(Chats)
                .set({ isReadUser : true })
                .where("conversation = :id", { id: messageUpdateDto.conversationId })
                .andWhere("fromUserId = :userId", { userId: messageUpdateDto.fromUserId})
                .execute();
                return this.commonService.buildCustomResponse(
                  [],
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }

              async getTeamUserDetail(emailId: any): Promise<ResponseDto> {
                 const cgpTeam =  await this.cgpTeamRepository.findOne({
                  email: emailId,
                });

                if (!cgpTeam) {
                  const errors = { username: 'CgpTeam is not found.' };
                  throw new HttpException(errors, HttpStatus.BAD_REQUEST);
                }
                return this.commonService.buildCustomResponse(
                  cgpTeam,
                  constant.notification.isSuccessFul,
                  HttpStatus.CREATED.toString(),
                );
              }
        }
