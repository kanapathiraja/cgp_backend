import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { IsDefined, IsArray, ArrayNotEmpty, ValidateNested, isNotEmpty, IsNotEmpty } from "class-validator";

export class CgpSubtopicsListDto {
    
    @ApiProperty()
    @IsNotEmpty()
    subtopicId: string;  

    @ApiProperty()
    @IsNotEmpty()
    subtopicName: string;    
}

export class CreateCgpSubtopicsDto {
    
    // @ApiProperty({ type: CgpSubtopicsListDto })	
    // @Type(() => CgpSubtopicsListDto)
    // @IsDefined()
    // @IsArray()
    // @ArrayNotEmpty()
    // @ValidateNested()
    // subtopics: [];

    @ApiProperty()	  
    @IsDefined()
    @IsArray()
    subtopics: [];
}


