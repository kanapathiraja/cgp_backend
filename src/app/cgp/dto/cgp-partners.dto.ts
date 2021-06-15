import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty } from "class-validator";


export class PartnersListDto {

    @ApiProperty()
    @Expose()
    partnerId: string;
    
}


export class CreatePartnersDto {

    @ApiProperty()
    @IsNotEmpty()
    partners: [];
}


