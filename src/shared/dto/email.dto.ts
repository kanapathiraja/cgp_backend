import { IsNotEmpty } from "class-validator";

// Request DTO
export class UserVerificationDto {
   
    @IsNotEmpty()
    customerName: string;

    @IsNotEmpty()
    customerEmail: string;    

    @IsNotEmpty()
    verifyLink: string;    
}