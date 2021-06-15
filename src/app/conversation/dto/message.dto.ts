import { ApiProperty } from "@nestjs/swagger";
import { uuid } from "aws-sdk/clients/customerprofiles";
import { Exclude, Expose } from "class-transformer";
import { Conversation } from "../entities/conversation.entity";

export class MessageDto {


    @ApiProperty()
    message: string;

    @ApiProperty()
    fromUserId: uuid;

    @ApiProperty()
    teamUserId: uuid;

    @ApiProperty()
    createdBy: uuid;

    @ApiProperty()
    isReadTeam: boolean;
    
    @ApiProperty()
    isReadUser: boolean;

}


export  class MessageUpdateDto {
    @ApiProperty()
    conversationId: uuid;

    @ApiProperty()
    fromUserId: uuid;

}


@Exclude()
export class ChatInfoDto {

    @ApiProperty()
    @Expose()
    message: string;

    @ApiProperty()
    @Expose()
    conversation: Conversation;

    @ApiProperty()
    @Expose()
    isRead: boolean;

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;

    @ApiProperty()
    @Expose()
    fromUserId: uuid;
}