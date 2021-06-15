import { ApiProperty } from "@nestjs/swagger";
import { uuid } from "aws-sdk/clients/customerprofiles";



export class createConversationDto {

    @ApiProperty()
    teamUserId: uuid;

    @ApiProperty()
    userId: uuid;

    @ApiProperty()
    createdBy: uuid;


}