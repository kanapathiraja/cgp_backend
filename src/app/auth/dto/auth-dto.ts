import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserRegisterDto {

    
    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    mobileNumber: string;
    
    @ApiProperty()
    role: string;

}
export class TokenVerifyDto {

    @ApiProperty()
    @IsNotEmpty()
    token: string;

    @ApiProperty()
    email: string; 
}
