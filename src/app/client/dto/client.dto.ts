import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateClientDto {

    @ApiProperty()
    @IsNotEmpty()
    clientName: string;

    @ApiProperty()
    @IsNotEmpty()
    activeFlag: boolean;
 
}

export class ViewClientDto {

    @ApiProperty()
    id: number;

    @ApiProperty()
    clientName: string;

    @ApiProperty()
    activeFlag: boolean;
 
}

