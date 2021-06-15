import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

// Request DTO
export class CreateMailTemplateDto {

    @ApiProperty()
    @IsNotEmpty()
    templateName: string;

    @ApiProperty()
    @IsNotEmpty()
    subject: string;

    @ApiProperty()
    @IsNotEmpty()
    content: string;

}

export class UpdateMailTemplateDto extends CreateMailTemplateDto{

    @ApiProperty()
    @IsNotEmpty()
    id: string;
    
}