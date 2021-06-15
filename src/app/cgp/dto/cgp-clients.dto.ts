import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";


export class ClienntsListDto {

    @ApiProperty()
    @Expose()
    clientId: string;
    
}


export class CreateClientsDto {

    @ApiProperty()
    @IsNotEmpty()
    clients: [];
}


